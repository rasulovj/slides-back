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
  chartData?: any;
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

    slide.addText("LOGO", {
      x: 4.8,
      y: 0.9,
      w: 1.5,
      h: 0.3,
      fontSize: 18,
      bold: true,
      color: this.theme.colors.secondary,
      fontFace: this.theme.fonts.heading,
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

    slide.addText(subtitle, {
      x: 4.3,
      y: 3.9,
      w: 5.2,
      h: 0.6,
      fontSize: 16,
      color: "E5E7EB",
      fontFace: this.theme.fonts.body,
    });

    // Author info (bottom right on white section)
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

    // Avatar placeholder
    slide.addShape(this.pptx.ShapeType.ellipse, {
      x: 3.2,
      y: 5.5,
      w: 0.6,
      h: 0.6,
      fill: { color: "D1D5DB" },
    });

    this.slideIndex++;
  }

  // Layout 2: Stats/Metrics Slide (Left Image + Right Stats)
  createStatsSlide(
    title: string,
    stats: { label: string; value: string; description: string }[],
    imageUrl?: string
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

    // Image on left
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

    // Title
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

    // Stats items
    let yPosition = 2.4;
    stats.forEach((stat, index) => {
      // Stat value and percentage
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

      // Label
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

      // Description
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

  // Layout 3: Chart/Data Visualization Slide
  createChartSlide(title: string, chartData: any[], subtitle?: string) {
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

    // Chart data
    const chartDataFormatted = chartData.map((item) => ({
      name: item.label,
      labels: [item?.label],
      values: [item.value],
    }));

    slide.addChart(this.pptx.ChartType.bar, chartDataFormatted, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 4,
      chartColors: [
        this.theme.colors.primary,
        this.theme.colors.primary + "CC",
        this.theme.colors.primary + "99",
        this.theme.colors.primary + "77",
        this.theme.colors.primary + "55",
        this.theme.colors.primary + "44",
      ],
      barDir: "col",
      showValue: true,
      valAxisMaxVal: 100,
      catAxisLabelColor: this.theme.colors.text,
      catAxisLabelFontSize: 11,
      showCatAxisTitle: false,
      valAxisLabelColor: this.theme.colors.textLight,
      showLegend: false,
      dataLabelFormatCode: '#0"%"',
      dataLabelPosition: "inEnd",
      dataLabelColor: "FFFFFF",
      dataLabelFontBold: true,
      dataLabelFontSize: 14,
    });

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

  // Layout 4: Timeline/Process Flow Slide
  createTimelineSlide(
    title: string,
    subtitle: string,
    steps: { number: string; title: string; description: string }[]
  ) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

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
      y: 0.8,
      w: 9,
      h: 0.6,
      fontSize: 32,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    // Subtitle
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

    // Timeline arrows
    const colors = [this.theme.colors.primary, "#775D94", "#FF6B6B", "#FFB84D"];

    let xPosition = 0.5;
    const arrowWidth = 2.2;

    steps.forEach((step, index) => {
      // Arrow shape
      slide.addShape(this.pptx.ShapeType.chevron, {
        x: xPosition,
        y: 2.8,
        w: arrowWidth,
        h: 1,
        fill: { color: colors[index % colors.length] },
      });

      // Step number
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

      // Step title
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

      // Step description
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

  // Layout 5: Closing/Call to Action Slide
  createClosingSlide(
    title: string,
    subtitle: string,
    contactInfo: { email?: string; website?: string },
    imageUrl?: string
  ) {
    const slide = this.pptx.addSlide();

    // Purple background
    slide.background = { color: this.theme.colors.primary };

    // Logo
    slide.addShape(this.pptx.ShapeType.ellipse, {
      x: 0.8,
      y: 1.2,
      w: 0.5,
      h: 0.5,
      fill: { color: this.theme.colors.secondary },
    });

    slide.addText("LOGO", {
      x: 1.4,
      y: 1.35,
      w: 1.5,
      h: 0.3,
      fontSize: 20,
      bold: true,
      color: this.theme.colors.secondary,
      fontFace: this.theme.fonts.heading,
    });

    // Main title
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

    // Subtitle
    slide.addText(subtitle, {
      x: 0.8,
      y: 3.6,
      w: 4.5,
      h: 0.8,
      fontSize: 16,
      color: "E5E7EB",
      fontFace: this.theme.fonts.body,
      lineSpacing: 24,
    });

    // Contact info boxes
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

    // Image (right side)
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

  // Main generation method with intelligent layout selection
  async generateFromContent(slides: SlideContent[]): Promise<Buffer> {
    for (let i = 0; i < slides.length; i++) {
      const slideData = slides[i];

      switch (slideData.type) {
        case "title":
          this.createTitleSlide(
            slideData.title,
            slideData.content[0],
            slideData.imageUrl
          );
          break;

        case "stats":
          if (slideData.stats) {
            this.createStatsSlide(
              slideData.title,
              slideData.stats,
              slideData.imageUrl
            );
          }
          break;

        case "content":
          if (slideData.chartData) {
            this.createChartSlide(
              slideData.title,
              slideData.chartData,
              slideData.content[0]
            );
          } else {
            // Default content slide
            this.createContentSlide(slideData.title, slideData.content);
          }
          break;

        case "timeline":
          const steps = slideData.content.map((item, idx) => ({
            number: (idx + 1).toString(),
            title: item.split(":")[0],
            description: item.split(":")[1] || "",
          }));
          this.createTimelineSlide(slideData.title, "", steps);
          break;

        case "closing":
          this.createClosingSlide(
            slideData.title,
            slideData.content[0],
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
    }

    const buffer = await this.pptx.write({ outputType: "nodebuffer" });
    return buffer as Buffer;
  }

  // Helper method for standard content slides
  private createContentSlide(title: string, bulletPoints: string[]) {
    const slide = this.pptx.addSlide();

    slide.background = { color: "F9FAFB" };

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
      y: 0.8,
      w: 9,
      h: 0.7,
      fontSize: 32,
      bold: true,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.heading,
    });

    // Content
    slide.addText(bulletPoints.join("\n"), {
      x: 1,
      y: 2,
      w: 8.5,
      h: 3.5,
      fontSize: 18,
      color: this.theme.colors.text,
      fontFace: this.theme.fonts.body,
      bullet: { type: "bullet" },
      lineSpacing: 28,
    });
  }
}
