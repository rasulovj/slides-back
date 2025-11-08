// src/services/thumbnailGenerator.ts
import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";
export class ThumbnailGenerator {
    async generateThumbnail(slide, theme, draftId) {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            const html = this.generateSlideHTML(slide, theme);
            await page.setContent(html, { waitUntil: "networkidle0" });
            // Take screenshot
            const filename = `thumbnail-${draftId}.png`;
            const thumbnailDir = path.join(__dirname, "../../uploads/thumbnails");
            await fs.mkdir(thumbnailDir, { recursive: true });
            const filepath = path.join(thumbnailDir, filename);
            await page.screenshot({
                path: filepath,
                type: "png",
            });
            return `/uploads/thumbnails/${filename}`;
        }
        finally {
            await browser.close();
        }
    }
    generateSlideHTML(slide, theme) {
        const styles = this.getThemeStyles(theme);
        let slideContent = "";
        switch (slide.type) {
            case "title":
                slideContent = `
          <div style="height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 80px;">
            <h1 style="font-size: 72px; font-weight: bold; color: white; margin-bottom: 30px; font-family: ${theme.fonts.heading};">
              ${slide.title}
            </h1>
            ${slide.content[0]
                    ? `
              <p style="font-size: 36px; color: rgba(255,255,255,0.9); font-family: ${theme.fonts.body};">
                ${slide.content[0]}
              </p>
            `
                    : ""}
          </div>
        `;
                break;
            case "content":
                slideContent = `
          <div style="height: 100%; padding: 80px;">
            <h2 style="font-size: 56px; font-weight: bold; color: ${theme.colors.text}; margin-bottom: 60px; font-family: ${theme.fonts.heading};">
              ${slide.title}
            </h2>
            <ul style="list-style: none; padding: 0; font-size: 32px; line-height: 1.8; font-family: ${theme.fonts.body};">
              ${slide.content
                    .map((item) => `
                <li style="margin-bottom: 30px; display: flex; align-items: start;">
                  <span style="color: ${theme.colors.primary}; font-size: 40px; margin-right: 20px;">•</span>
                  <span style="color: ${theme.colors.text};">${item}</span>
                </li>
              `)
                    .join("")}
            </ul>
          </div>
        `;
                break;
            case "stats":
                slideContent = `
          <div style="height: 100%; padding: 80px;">
            <h2 style="font-size: 56px; font-weight: bold; color: ${theme.colors.text}; margin-bottom: 60px; font-family: ${theme.fonts.heading};">
              ${slide.title}
            </h2>
            <div style="display: flex; flex-direction: column; gap: 50px;">
              ${(slide.stats || [])
                    .map((stat) => `
                <div style="display: flex; align-items: center; gap: 40px;">
                  <div style="font-size: 80px; font-weight: bold; color: ${theme.colors.primary}; font-family: ${theme.fonts.heading};">
                    ${stat.value}
                  </div>
                  <div>
                    <div style="font-size: 32px; font-weight: bold; color: ${theme.colors.text}; margin-bottom: 10px; font-family: ${theme.fonts.heading};">
                      ${stat.label}
                    </div>
                    <div style="font-size: 24px; color: ${theme.colors.textLight}; font-family: ${theme.fonts.body};">
                      ${stat.description}
                    </div>
                  </div>
                </div>
              `)
                    .join("")}
            </div>
          </div>
        `;
                break;
            default:
                slideContent = `
          <div style="height: 100%; display: flex; justify-content: center; align-items: center;">
            <p style="font-size: 48px; color: ${theme.colors.text};">Slide Preview</p>
          </div>
        `;
        }
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              width: 1920px;
              height: 1080px;
              margin: 0;
              padding: 0;
              overflow: hidden;
            }
            .slide {
              width: 100%;
              height: 100%;
              background: ${slide.type === "title"
            ? theme.colors.primary
            : theme.colors.background};
            }
          </style>
        </head>
        <body>
          <div class="slide">
            ${slideContent}
          </div>
        </body>
      </html>
    `;
    }
    getThemeStyles(theme) {
        return {
            backgroundColor: theme.colors.background,
            primaryColor: theme.colors.primary,
            secondaryColor: theme.colors.secondary,
            accentColor: theme.colors.accent,
            textColor: theme.colors.text,
            textLightColor: theme.colors.textLight,
            headingFont: theme.fonts.heading,
            bodyFont: theme.fonts.body,
        };
    }
}
