// src/services/slideGenerator.ts
import PptxGenJS from "pptxgenjs";
import { ITheme } from "../models/theme.js";

interface SlideContent {
  title: string;
  content: string[];
  type:
    | "title"
    | "content"
    | "stats"
    | "timeline"
    | "image"
    | "closing"
    | "chart";
  stats?: { label: string; value: string; description: string }[];
  chartData?: { label: string; value: number }[];
  imageUrl?: string;
}

export class SlideGeneratorService {
  private pptx: any;
  private theme: ITheme;
  private slideIndex: number = 0;

  constructor(theme: ITheme) {
    this.pptx = new PptxGenJS.default();
    this.theme = theme;
    this.setupPresentation();
  }

  private setupPresentation() {
    this.pptx.author = "AI Slide Maker";
    this.pptx.layout = "LAYOUT_16x9";

    this.pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        {
          rect: {
            x: 0,
            y: 0,
            w: "100%",
            h: 0.5,
            fill: { color: this.theme.colors.primary },
          },
        },
      ],
    });
  }

  createTitleSlide(title: string, subtitle: string, imageUrl?: string) {
    const slide = this.pptx.addSlide();

    slide.addShape(this.pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: "100%",
      h: "100%",
      fill: { color: "F5F5F5" },
    });

    slide.addShape(this.pptx.ShapeType.rect, {
      x: 4,
      y: 0,
      w: 6,
      h: "100%",
      fill: { color: this.theme.colors.primary },
    });

    if (imageUrl) {
      slide.addImage({
        path: imageUrl,
        x: 0.5,
        y: 0.8,
        w: 3.2,
        h: 4.2,
        sizing: { type: "cover", w: 3.2, h: 4.2 },
      });
    } else {
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.8,
        w: 3.2,
        h: 4.2,
        fill: { color: "D1D5DB" },
      });
    }

    slide.addShape(this.pptx.ShapeType.ellipse, {
      x: 4.3,
      y: 0.8,
      w: 0.4,
      h: 0.4,
      fill: { color: this.theme.colors.secondary },
    });

    slide.addText(title, {
      x: 4.3,
      y: 2,
      w: 5.2,
      h: 1.8,
      fontSize: 44,
      bold: true,
      color: "FFFFFF",
      fontFace: this.theme.fonts.heading,
      lineSpacing: 48,
      breakLine: true,
    });

    slide.addText(subtitle || "", {
      x: 4.3,
      y: 3.9,
      w: 5.2,
      h: 0.6,
      fontSize: 16,
      color: "E5E7EB",
      fontFace: this.theme.fonts.body,
    });

    slide.addShape(this.pptx.ShapeType.rect, {
      x: 0,
      y: 5.2,
      w: 4,
      h: 1.3,
      fill: { color: "FFFFFF" },
    });

    slide.addText("Your Name Here\nYour Designation", {
      x: 1.5,
      y: 5.4,
      w: 2,
      h: 0.8,
      fontSize: 14,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.body,
      align: "right",
      valign: "middle",
      lineSpacing: 20,
    });

    slide.addShape(this.pptx.ShapeType.ellipse, {
      x: 3.2,
      y: 5.5,
      w: 0.6,
      h: 0.6,
      fill: { color: "D1D5DB" },
    });

    this.slideIndex++;
  }

  createStatsSlide(
    title: string,
    stats: { label: string; value: string; description: string }[],
    imageUrl?: string
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

    if (imageUrl) {
      slide.addImage({
        path: imageUrl,
        x: 0.5,
        y: 1.2,
        w: 3.2,
        h: 4.5,
        sizing: { type: "cover", w: 3.2, h: 4.5 },
      });
    } else {
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.2,
        w: 3.2,
        h: 4.5,
        fill: { color: "D1D5DB" },
      });
    }

    slide.addText(title, {
      x: 4.2,
      y: 1.2,
      w: 5.3,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    let yPosition = 2.4;
    stats.forEach((stat, index) => {
      slide.addText(stat.value, {
        x: 4.2,
        y: yPosition,
        w: 1.2,
        h: 0.6,
        fontSize: 48,
        bold: true,
        color: this.theme.colors.primary,
        fontFace: this.theme.fonts.heading,
      });

      slide.addText(stat.label, {
        x: 5.5,
        y: yPosition + 0.05,
        w: 4,
        h: 0.4,
        fontSize: 20,
        bold: true,
        color: this.theme.colors.text,
        fontFace: this.theme.fonts.heading,
      });

      slide.addText(stat.description, {
        x: 5.5,
        y: yPosition + 0.45,
        w: 4,
        h: 0.5,
        fontSize: 13,
        color: this.theme.colors.textLight,
        fontFace: this.theme.fonts.body,
        lineSpacing: 18,
      });

      yPosition += 1.2;
    });

    this.slideIndex++;
  }

  // FIXED: Chart/Data Visualization Slide
  createChartSlide(
    title: string,
    chartData: { label: string; value: number }[],
    subtitle?: string
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "FFFFFF" };

    // Purple accent corner
    slide.addShape(this.pptx.ShapeType.rect, {
      x: 8.5,
      y: 0,
      w: 1.5,
      h: 1.5,
      fill: { color: this.theme.colors.primary },
    });

    // Title
    slide.addText(title, {
      x: 0.5,
      y: 0.5,
      w: 7.5,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    // Validate and format chart data
    if (!chartData || chartData.length === 0) {
      slide.addText("No chart data available", {
        x: 0.5,
        y: 3,
        w: 9,
        h: 1,
        fontSize: 24,
        color: this.theme.colors.text,
        align: "center",
      });
      this.slideIndex++;
      return;
    }

    try {
      // CORRECT FORMAT: Single dataset with labels and values arrays
      const chartDataFormatted = [
        {
          name: "Data",
          labels: chartData.map((item) => String(item.label || "")),
          values: chartData.map((item) => Number(item.value) || 0),
        },
      ];

      console.log(
        "Chart data formatted:",
        JSON.stringify(chartDataFormatted, null, 2)
      );

      slide.addChart(this.pptx.ChartType.bar, chartDataFormatted, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 4,
        chartColors: [this.theme.colors.primary],
        barDir: "col",
        showValue: true,
        valAxisMaxVal: 100,
        catAxisLabelColor: this.theme.colors.text,
        catAxisLabelFontSize: 11,
        showCatAxisTitle: false,
        valAxisLabelColor: this.theme.colors.textLight,
        showLegend: false,
        dataLabelFormatCode: "#0",
        dataLabelPosition: "inEnd",
        dataLabelColor: "FFFFFF",
        dataLabelFontBold: true,
        dataLabelFontSize: 14,
      });
    } catch (error) {
      console.error("Chart creation error:", error);
      slide.addText("Error creating chart", {
        x: 0.5,
        y: 3,
        w: 9,
        h: 1,
        fontSize: 24,
        color: "FF0000",
        align: "center",
      });
    }

    // Subtitle/Source
    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.5,
        y: 5.8,
        w: 9,
        h: 0.3,
        fontSize: 10,
        color: this.theme.colors.textLight,
        fontFace: this.theme.fonts.body,
        italic: true,
      });
    }

    this.slideIndex++;
  }

  createTimelineSlide(
    title: string,
    subtitle: string,
    steps: { number: string; title: string; description: string }[]
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

    slide.addShape(this.pptx.ShapeType.rect, {
      x: 8.5,
      y: 0,
      w: 1.5,
      h: 1.5,
      fill: { color: this.theme.colors.primary },
    });

    slide.addText(title, {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    if (subtitle) {
      slide.addText(subtitle, {
        x: 0.5,
        y: 1.5,
        w: 9,
        h: 0.5,
        fontSize: 14,
        color: this.theme.colors.textLight,
        fontFace: this.theme.fonts.body,
        lineSpacing: 20,
      });
    }

    const colors = [this.theme.colors.primary, "#775D94", "#FF6B6B", "#FFB84D"];

    let xPosition = 0.5;
    const arrowWidth = 2.2;

    steps.forEach((step, index) => {
      slide.addShape(this.pptx.ShapeType.chevron, {
        x: xPosition,
        y: 2.8,
        w: arrowWidth,
        h: 1,
        fill: { color: colors[index % colors.length] },
      });

      slide.addText(step.number, {
        x: xPosition + 0.3,
        y: 3.05,
        w: 0.5,
        h: 0.5,
        fontSize: 32,
        bold: true,
        color: "FFFFFF",
        fontFace: this.theme.fonts.heading,
        align: "center",
      });

      slide.addText(step.title, {
        x: xPosition - 0.1,
        y: 4,
        w: arrowWidth + 0.2,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: this.theme.colors.text,
        fontFace: this.theme.fonts.heading,
      });

      slide.addText(step.description, {
        x: xPosition - 0.1,
        y: 4.5,
        w: arrowWidth + 0.2,
        h: 1,
        fontSize: 11,
        color: this.theme.colors.textLight,
        fontFace: this.theme.fonts.body,
        lineSpacing: 16,
      });

      xPosition += arrowWidth;
    });

    this.slideIndex++;
  }

  createClosingSlide(
    title: string,
    subtitle: string,
    contactInfo: { email?: string; website?: string },
    imageUrl?: string
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: this.theme.colors.primary };

    slide.addShape(this.pptx.ShapeType.ellipse, {
      x: 0.8,
      y: 1.2,
      w: 0.5,
      h: 0.5,
      fill: { color: this.theme.colors.secondary },
    });

    slide.addText(title, {
      x: 0.8,
      y: 2.2,
      w: 4.5,
      h: 1.2,
      fontSize: 40,
      bold: true,
      color: "FFFFFF",
      fontFace: this.theme.fonts.heading,
      lineSpacing: 48,
    });

    slide.addText(subtitle || "", {
      x: 0.8,
      y: 3.6,
      w: 4.5,
      h: 0.8,
      fontSize: 16,
      color: "E5E7EB",
      fontFace: this.theme.fonts.body,
      lineSpacing: 24,
    });

    if (contactInfo.email) {
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 0.8,
        y: 4.8,
        w: 2,
        h: 0.5,
        fill: { color: "FFFFFF", transparency: 10 },
      });

      slide.addText(`📧 ${contactInfo.email}`, {
        x: 0.9,
        y: 4.9,
        w: 1.8,
        h: 0.3,
        fontSize: 11,
        color: "FFFFFF",
        fontFace: this.theme.fonts.body,
      });
    }

    if (contactInfo.website) {
      slide.addShape(this.pptx.ShapeType.rect, {
        x: 3,
        y: 4.8,
        w: 2.3,
        h: 0.5,
        fill: { color: "FFFFFF", transparency: 10 },
      });

      slide.addText(`🌐 ${contactInfo.website}`, {
        x: 3.1,
        y: 4.9,
        w: 2.1,
        h: 0.3,
        fontSize: 11,
        color: "FFFFFF",
        fontFace: this.theme.fonts.body,
      });
    }

    if (imageUrl) {
      slide.addImage({
        path: imageUrl,
        x: 5.8,
        y: 1.5,
        w: 3.7,
        h: 3.7,
        sizing: { type: "cover", w: 3.7, h: 3.7 },
      });
    }

    this.slideIndex++;
  }

  // UPDATED: Main generation method with validation
  async generateFromContent(slides: SlideContent[]): Promise<Buffer> {
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];

      console.log(
        `Processing slide ${i + 1}: ${slideData.title} (${slideData.type})`
      );

      try {
        switch (slideData.type) {
          case "title":
            this.createTitleSlide(
              slideData.title,
              slideData.content[0] || "",
              slideData.imageUrl
            );
            break;

          case "stats":
            if (slideData.stats && slideData.stats.length > 0) {
              this.createStatsSlide(
                slideData.title,
                slideData.stats,
                slideData.imageUrl
              );
            } else {
              this.createContentSlide(slideData.title, slideData.content);
            }
            break;

          case "chart":
            if (slideData.chartData && slideData.chartData.length > 0) {
              // Validate chart data
              const validChartData = slideData.chartData.filter(
                (item) =>
                  item && item.label !== undefined && item.value !== undefined
              );

              if (validChartData.length > 0) {
                this.createChartSlide(
                  slideData.title,
                  validChartData,
                  slideData.content[0]
                );
              } else {
                console.warn(
                  `Chart slide "${slideData.title}" has no valid data, using content slide`
                );
                this.createContentSlide(slideData.title, slideData.content);
              }
            } else {
              this.createContentSlide(slideData.title, slideData.content);
            }
            break;

          case "timeline":
            const steps = slideData.content.map((item, idx) => {
              const parts = item.split(":");
              return {
                number: (idx + 1).toString(),
                title: parts[0] || item,
                description: parts[1] || "",
              };
            });
            this.createTimelineSlide(slideData.title, "", steps);
            break;

          case "closing":
            this.createClosingSlide(
              slideData.title,
              slideData.content[0] || "",
              {
                email: "hello@example.com",
                website: "www.yourwebsite.com",
              },
              slideData.imageUrl
            );
            break;

          default:
            this.createContentSlide(slideData.title, slideData.content);
        }
      } catch (error) {
        console.error(`Error creating slide "${slideData.title}":`, error);
        // Create fallback slide
        this.createContentSlide(
          slideData.title,
          slideData.content.length > 0
            ? slideData.content
            : ["Error loading slide content"]
        );
      }
    }

    const buffer = await this.pptx.write({ outputType: "nodebuffer" });
    return buffer as Buffer;
  }

  // Helper method for standard content slides
  private createContentSlide(title: string, bulletPoints: string[]) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

    slide.addShape(this.pptx.ShapeType.rect, {
      x: 8.5,
      y: 0,
      w: 1.5,
      h: 1.5,
      fill: { color: this.theme.colors.primary },
    });

    slide.addText(title, {
      x: 0.5,
      y: 0.8,
      w: 9,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    const content =
      bulletPoints.length > 0 ? bulletPoints : ["No content available"];

    slide.addText(content, {
      x: 1,
      y: 2,
      w: 8.5,
      h: 3.5,
      fontSize: 18,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.body,
      bullet: { type: "bullet", color: this.theme.colors.primary },
      lineSpacing: 28,
    });
  }
}
