// src/services/thumbnailGenerator.ts
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import cloudinary from "../config/cloudinary.js";
import { ISlide } from "../models/presentationDraft.js";
import { ITheme } from "../models/theme.js";

export class ThumbnailGenerator {
  async generateThumbnail(
    slide: ISlide,
    theme: ITheme,
    draftId: string
  ): Promise<string> {
    let browser;

    try {
      const executablePath = await chromium.executablePath();

      console.log(
        "Chromium executable path:",
        executablePath || "Default path"
      );

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
        executablePath: executablePath || undefined,
        headless: "shell",
      });

      console.log("Browser launched successfully");

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      const html = this.generateSlideHTML(slide, theme);
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const screenshotBase64 = (await page.screenshot({
        type: "png",
        quality: 80,
        encoding: "base64",
      })) as string;

      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${screenshotBase64}`,
        {
          folder: "presentation-thumbnails",
          public_id: `thumbnail-${draftId}`,
          overwrite: true,
          resource_type: "image",
          timeout: 60000,
        }
      );

      console.log("Thumbnail uploaded successfully:", uploadResult.secure_url);
      return uploadResult.secure_url;
    } catch (err) {
      console.error("Thumbnail generation error:", err);
      throw err;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private generateSlideHTML(slide: ISlide, theme: ITheme): string {
    const bgColor =
      slide.type === "title" ? theme.colors.primary : theme.colors.background;

    let slideContent = "";

    switch (slide.type) {
      case "title":
        slideContent = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px;">
            <h1 style="font-size:72px;font-weight:bold;color:white;margin-bottom:30px;font-family:${
              theme.fonts.heading
            };">
              ${slide.title}
            </h1>
            ${
              slide.content[0]
                ? `<p style="font-size:36px;color:rgba(255,255,255,0.9);font-family:${theme.fonts.body};">
                    ${slide.content[0]}
                  </p>`
                : ""
            }
          </div>`;
        break;

      case "content":
        slideContent = `
          <div style="height:100%;padding:80px;">
            <h2 style="font-size:56px;font-weight:bold;color:${
              theme.colors.text
            };margin-bottom:60px;font-family:${theme.fonts.heading};">
              ${slide.title}
            </h2>
            <ul style="list-style:none;padding:0;font-size:32px;line-height:1.8;font-family:${
              theme.fonts.body
            };">
              ${slide.content
                .map(
                  (item) => `
                  <li style="margin-bottom:30px;display:flex;align-items:start;">
                    <span style="color:${theme.colors.primary};font-size:40px;margin-right:20px;">•</span>
                    <span style="color:${theme.colors.text};">${item}</span>
                  </li>`
                )
                .join("")}
            </ul>
          </div>`;
        break;

      case "stats":
        slideContent = `
          <div style="height:100%;padding:80px;">
            <h2 style="font-size:56px;font-weight:bold;color:${
              theme.colors.text
            };margin-bottom:60px;font-family:${theme.fonts.heading};">
              ${slide.title}
            </h2>
            <div style="display:flex;flex-direction:column;gap:50px;">
              ${(slide.stats || [])
                .map(
                  (stat) => `
                <div style="display:flex;align-items:center;gap:40px;">
                  <div style="font-size:80px;font-weight:bold;color:${theme.colors.primary};font-family:${theme.fonts.heading};">
                    ${stat.value}
                  </div>
                  <div>
                    <div style="font-size:32px;font-weight:bold;color:${theme.colors.text};margin-bottom:10px;font-family:${theme.fonts.heading};">
                      ${stat.label}
                    </div>
                    <div style="font-size:24px;color:${theme.colors.textLight};font-family:${theme.fonts.body};">
                      ${stat.description}
                    </div>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </div>`;
        break;

      default:
        slideContent = `
          <div style="height:100%;display:flex;justify-content:center;align-items:center;">
            <p style="font-size:48px;color:${theme.colors.text};">Slide Preview</p>
          </div>`;
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body {
              width:1920px;
              height:1080px;
              margin:0;
              padding:0;
              overflow:hidden;
              background:${bgColor};
            }
          </style>
        </head>
        <body>${slideContent}</body>
      </html>`;
  }
}
