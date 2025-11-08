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
    let browser = null;

    try {
      console.log("🚀 Starting thumbnail generation...");

      // Check if running on Vercel
      const isVercel = process.env.VERCEL === "1";

      if (isVercel) {
        console.log("🔧 Running on Vercel - using Chromium Lambda");

        // Vercel configuration
        browser = await puppeteer.launch({
          args: [
            ...chromium.args,
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--single-process",
            "--no-zygote",
          ],
          defaultViewport: {
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
          },
          executablePath: await chromium.executablePath(),
          headless: isVercel ? true : false,
        });
      } else {
        console.log("🔧 Running locally - using local Chromium");

        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: true,
          executablePath:
            process.platform === "win32"
              ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
              : process.platform === "darwin"
              ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
              : "/usr/bin/google-chrome",
        });
      }

      console.log("✅ Browser launched successfully");

      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      const html = this.generateSlideHTML(slide, theme);
      console.log("📝 HTML generated, setting content...");

      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      console.log("📸 Taking screenshot...");

      // Take screenshot as base64 (more reliable for serverless)
      const screenshotBase64 = (await page.screenshot({
        type: "png",
        encoding: "base64",
        quality: 90,
      })) as string;

      console.log("☁️ Uploading to Cloudinary...");

      // Upload to Cloudinary using base64
      const uploadResult = await cloudinary.uploader.upload(
        `data:image/png;base64,${screenshotBase64}`,
        {
          folder: "presentation-thumbnails",
          public_id: `thumbnail-${draftId}`,
          overwrite: true,
          resource_type: "image",
          quality: "auto:good",
          fetch_format: "auto",
        }
      );

      console.log("✅ Thumbnail uploaded:", uploadResult.secure_url);
      return uploadResult.secure_url;
    } catch (error: any) {
      console.error("❌ Thumbnail generation error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });

      // Return a placeholder URL instead of failing
      return this.getPlaceholderThumbnail(slide, theme);
    } finally {
      if (browser) {
        try {
          await browser.close();
          console.log("🔒 Browser closed");
        } catch (closeError) {
          console.error("Error closing browser:", closeError);
        }
      }
    }
  }

  private getPlaceholderThumbnail(slide: ISlide, theme: ITheme): string {
    // Generate a placeholder using Cloudinary's dynamic image generation
    const text = encodeURIComponent(slide.title);
    const bgColor = theme.colors.primary.replace("#", "");

    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/w_1920,h_1080,c_fill,b_rgb:${bgColor},co_rgb:ffffff,l_text:Arial_72_bold:${text}/placeholder.png`;
  }

  private generateSlideHTML(slide: ISlide, theme: ITheme): string {
    const bgColor =
      slide.type === "title" || slide.type === "closing"
        ? theme.colors.primary
        : theme.colors.background;

    let slideContent = "";

    switch (slide.type) {
      case "title":
        slideContent = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px;">
            <h1 style="font-size:72px;font-weight:bold;color:white;margin-bottom:30px;font-family:Arial,sans-serif;">
              ${this.escapeHtml(slide.title)}
            </h1>
            ${
              slide.content[0]
                ? `<p style="font-size:36px;color:rgba(255,255,255,0.9);font-family:Arial,sans-serif;">
                    ${this.escapeHtml(slide.content[0])}
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
            };margin-bottom:60px;font-family:Arial,sans-serif;">
              ${this.escapeHtml(slide.title)}
            </h2>
            <ul style="list-style:none;padding:0;font-size:32px;line-height:1.8;font-family:Arial,sans-serif;">
              ${slide.content
                .map(
                  (item) => `
                  <li style="margin-bottom:30px;display:flex;align-items:start;">
                    <span style="color:${
                      theme.colors.primary
                    };font-size:40px;margin-right:20px;">•</span>
                    <span style="color:${theme.colors.text};">${this.escapeHtml(
                    item
                  )}</span>
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
            };margin-bottom:60px;font-family:Arial,sans-serif;">
              ${this.escapeHtml(slide.title)}
            </h2>
            <div style="display:flex;flex-direction:column;gap:50px;">
              ${(slide.stats || [])
                .map(
                  (stat) => `
                <div style="display:flex;align-items:center;gap:40px;">
                  <div style="font-size:80px;font-weight:bold;color:${
                    theme.colors.primary
                  };font-family:Arial,sans-serif;">
                    ${this.escapeHtml(stat.value)}
                  </div>
                  <div>
                    <div style="font-size:32px;font-weight:bold;color:${
                      theme.colors.text
                    };margin-bottom:10px;font-family:Arial,sans-serif;">
                      ${this.escapeHtml(stat.label)}
                    </div>
                    <div style="font-size:24px;color:${
                      theme.colors.textLight
                    };font-family:Arial,sans-serif;">
                      ${this.escapeHtml(stat.description)}
                    </div>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </div>`;
        break;

      case "timeline":
        slideContent = `
          <div style="height:100%;padding:80px;">
            <h2 style="font-size:56px;font-weight:bold;color:${
              theme.colors.text
            };margin-bottom:60px;font-family:Arial,sans-serif;">
              ${this.escapeHtml(slide.title)}
            </h2>
            <div style="display:flex;justify-content:space-around;align-items:start;">
              ${slide.content
                .slice(0, 4)
                .map(
                  (item, idx) => `
                <div style="flex:1;text-align:center;padding:20px;">
                  <div style="width:60px;height:60px;border-radius:50%;background:${
                    theme.colors.primary
                  };color:white;display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:bold;margin:0 auto 20px;font-family:Arial,sans-serif;">
                    ${idx + 1}
                  </div>
                  <p style="font-size:20px;color:${
                    theme.colors.text
                  };font-family:Arial,sans-serif;">
                    ${this.escapeHtml(item)}
                  </p>
                </div>`
                )
                .join("")}
            </div>
          </div>`;
        break;

      case "closing":
        slideContent = `
          <div style="height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:80px;">
            <h1 style="font-size:72px;font-weight:bold;color:white;margin-bottom:30px;font-family:Arial,sans-serif;">
              ${this.escapeHtml(slide.title)}
            </h1>
            ${
              slide.content[0]
                ? `<p style="font-size:36px;color:rgba(255,255,255,0.9);font-family:Arial,sans-serif;">
                    ${this.escapeHtml(slide.content[0])}
                  </p>`
                : ""
            }
          </div>`;
        break;

      default:
        slideContent = `
          <div style="height:100%;display:flex;justify-content:center;align-items:center;">
            <p style="font-size:48px;color:${theme.colors.text};font-family:Arial,sans-serif;">Slide Preview</p>
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
              font-family:Arial,sans-serif;
            }
          </style>
        </head>
        <body>${slideContent}</body>
      </html>`;
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
