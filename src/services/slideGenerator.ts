import PptxGenJS from "pptxgenjs";

const getColorValue = (colorKey: string, colors: any): string => {
  return colors[colorKey] || colors.textDark;
};

const getShapeType = (pptx: any, shapeName: string): any => {
  const typeMap: { [key: string]: any } = {
    rect: pptx.ShapeType.rect,
    triangle: pptx.ShapeType.triangle,
    roundRect: pptx.ShapeType.roundRect,
    circle: pptx.ShapeType.ellipse,
    ellipse: pptx.ShapeType.ellipse,
    line: pptx.ShapeType.line,
    diamond: pptx.ShapeType.diamond,
    pentagon: pptx.ShapeType.pentagon,
    hexagon: pptx.ShapeType.hexagon,
    star: pptx.ShapeType.star5,
  };

  const shapeType = typeMap[shapeName];
  if (!shapeType) {
    console.warn(`⚠️  Unknown shape: ${shapeName}, using rect`);
    return pptx.ShapeType.rect;
  }
  return shapeType;
};

const renderShapes = (
  sld: any,
  shapes: any[],
  colors: any,
  pptx: any
): void => {
  shapes.forEach((shape) => {
    try {
      const shapeConfig: any = {
        x: shape.x,
        y: shape.y,
        w: shape.w,
        h: shape.h,
      };

      if (shape.fill) {
        shapeConfig.fill = {
          color: getColorValue(shape.fill, colors),
        };
      }

      if (shape.line) {
        shapeConfig.line = {
          color: getColorValue(shape.fill || "primary", colors),
          width: shape.line.width || 1,
          dashType: shape.line.dashType || "solid",
        };
      }

      if (shape.rotate) {
        shapeConfig.rotate = shape.rotate;
      }

      if (shape.radius) {
        shapeConfig.radius = shape.radius;
      }

      const shapeType = getShapeType(pptx, shape.type);
      sld.addShape(shapeType, shapeConfig);
    } catch (error: any) {
      console.error(`❌ Error rendering shape ${shape.type}:`, error.message);
    }
  });
};

const renderText = (
  sld: any,
  textConfig: any,
  slide: any,
  colors: any,
  fonts: any
): void => {
  let textContent = "";

  if (textConfig.source === "slide.title") {
    textContent = slide.title || textConfig.fallback || "";
  } else if (textConfig.source === "slide.subtitle") {
    textContent = slide.subtitle || textConfig.fallback || "";
  }

  if (!textContent) return;

  const fontFamily =
    textConfig.fontType === "heading"
      ? fonts.heading.family
      : fonts.body.family;

  sld.addText(textContent, {
    x: textConfig.x,
    y: textConfig.y,
    w: textConfig.w,
    h: textConfig.h,
    fontFace: fontFamily,
    fontSize: textConfig.fontSize,
    bold: textConfig.fontWeight === "bold",
    color: getColorValue(textConfig.color, colors),
    align: textConfig.align || "left",
    valign: textConfig.valign || "top",
  });
};

// ✅ NEW: Render styled bullets with decorations
const renderStyledBullets = (
  sld: any,
  bulletConfig: any,
  slide: any,
  colors: any,
  fonts: any,
  pptx: any
): void => {
  const items = slide.content || [];
  const fontFamily =
    bulletConfig.fontType === "heading"
      ? fonts.heading.family
      : fonts.body.family;

  const style = bulletConfig.style || { type: "bullet", prefix: "• " };
  const decoration = bulletConfig.itemDecoration;

  items.forEach((item: any, i: number) => {
    const text = typeof item === "string" ? item : JSON.stringify(item);
    const y = bulletConfig.startY + i * bulletConfig.spacingY;

    // ✅ Render background shape if enabled
    if (decoration && decoration.enabled && decoration.zIndex === "back") {
      const shapeType = getShapeType(pptx, decoration.shape);
      sld.addShape(shapeType, {
        x: bulletConfig.startX + decoration.offsetX,
        y: y + decoration.offsetY,
        w: decoration.width,
        h: decoration.height,
        fill: { color: getColorValue(decoration.fill, colors) },
        line: decoration.line?.width
          ? {
              color: getColorValue(decoration.line.color, colors),
              width: decoration.line.width,
            }
          : undefined,
        radius: decoration.radius,
      });
    }

    // Generate prefix based on style
    let prefix = "";
    if (style.type === "bullet") {
      prefix = style.prefix || "• ";
    } else if (style.type === "number") {
      prefix = style.prefix || `${i + 1}. `;
    } else if (style.type === "dash") {
      prefix = style.prefix || "- ";
    }

    const fullText = prefix + text;

    // ✅ Render text on top
    sld.addText(fullText, {
      x: bulletConfig.startX + (decoration?.padding || 0),
      y: y + (decoration?.padding || 0),
      w: bulletConfig.w,
      fontFace: fontFamily,
      fontSize: bulletConfig.fontSize,
      color: getColorValue(bulletConfig.color, colors),
    });
  });
};

// ✅ NEW: Render styled plan items
const renderStyledPlan = (
  sld: any,
  planConfig: any,
  slide: any,
  colors: any,
  fonts: any,
  pptx: any
): void => {
  const items = slide.content || [];
  const fontFamily =
    planConfig.fontType === "heading"
      ? fonts.heading.family
      : fonts.body.family;

  const style = planConfig.style || {
    type: "numbered",
    format: "${number}) ${text}",
    numberFormat: "1)",
  };

  items.forEach((item: any, i: number) => {
    const text = typeof item === "string" ? item : JSON.stringify(item);
    let formattedText = "";

    if (style.type === "numbered") {
      const numberStr = `${i + 1}${style.numberFormat.replace(/1/g, "")}`;
      formattedText = style.format
        .replace("${number}", numberStr)
        .replace("${text}", text);
    } else if (style.type === "dash") {
      formattedText = `— ${text}`;
    } else if (style.type === "icon") {
      formattedText = `◆ ${text}`;
    } else {
      formattedText = text;
    }

    sld.addText(formattedText, {
      x: planConfig.startX,
      y: planConfig.startY + i * planConfig.spacingY,
      w: planConfig.w,
      fontFace: fontFamily,
      fontSize: planConfig.fontSize,
      color: getColorValue(planConfig.color, colors),
    });
  });
};

const renderBullets = (
  sld: any,
  bulletConfig: any,
  slide: any,
  colors: any,
  fonts: any,
  pptx: any
): void => {
  renderStyledBullets(sld, bulletConfig, slide, colors, fonts, pptx);
};

const renderTwoColumns = (
  sld: any,
  leftConfig: any,
  rightConfig: any,
  slide: any,
  colors: any,
  fonts: any
): void => {
  const items = slide.content || [];
  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  const fontFamily =
    leftConfig.fontType === "heading"
      ? fonts.heading.family
      : fonts.body.family;

  const renderColumn = (items: any[], config: any) => {
    items.forEach((item: any, i: number) => {
      const text = typeof item === "string" ? item : item.title || "";
      const style = config.style || { type: "bullet", prefix: "• " };
      let prefix = "";

      if (style.type === "bullet") {
        prefix = style.prefix || "• ";
      } else if (style.type === "number") {
        prefix = style.prefix || `${i + 1}. `;
      }

      sld.addText(prefix + text, {
        x: config.startX,
        y: config.startY + i * config.spacingY,
        w: config.w,
        fontFace: fontFamily,
        fontSize: config.fontSize,
        color: getColorValue(config.color, colors),
      });
    });
  };

  renderColumn(col1, leftConfig);
  renderColumn(col2, rightConfig);
};

const renderGrid = (
  sld: any,
  gridConfig: any,
  slide: any,
  colors: any,
  fonts: any,
  pptx: any,
  isStats: boolean = false
): void => {
  const items = isStats ? slide.stats || [] : slide.content || [];
  const fontFamily =
    gridConfig.fontType === "heading"
      ? fonts.heading.family
      : fonts.body.family;

  items.forEach((item: any, idx: number) => {
    const colX = idx % gridConfig.columns;
    const rowY = Math.floor(idx / gridConfig.columns);

    const x = gridConfig.baseX + colX * gridConfig.spacingX;
    const y = gridConfig.baseY + rowY * gridConfig.spacingY;

    const shapeType = getShapeType(pptx, gridConfig.shape);
    sld.addShape(shapeType, {
      x,
      y,
      w: gridConfig.cellW,
      h: gridConfig.cellH,
      fill: { color: getColorValue(gridConfig.shapeFill, colors) },
    });

    let textContent = "";
    if (isStats) {
      textContent =
        gridConfig.textFormat
          ?.replace("${label}", item.label)
          .replace("${value}", item.value)
          .replace("${description}", item.description) ||
        `${item.label}\n${item.value}`;
    } else {
      textContent = typeof item === "string" ? item : item.title || "";
    }

    sld.addText(textContent, {
      x: x + 0.1,
      y: y + 0.1,
      w: gridConfig.cellW - 0.2,
      h: gridConfig.cellH - 0.2,
      fontFace: fontFamily,
      fontSize: gridConfig.fontSize,
      color: getColorValue(gridConfig.color, colors),
      align: "left",
      valign: "top",
    });
  });
};

export const generatePPTXBuffer = async (
  slides: any[],
  theme: any
): Promise<Buffer> => {
  try {
    const pptx = new PptxGenJS.default();

    pptx.author = "AI Presentation Builder";
    pptx.company = "Your Company";
    pptx.layout = "LAYOUT_16x9";

    const colors = theme.config.colors;
    const fonts = theme.config.fonts;
    const layouts = theme.layouts;

    console.log(`🎨 Theme: ${theme.id}`);
    console.log(`📋 Available layouts:`, Object.keys(layouts || {}));
    console.log(`📊 Slides: ${slides.length}`);

    if (!layouts || Object.keys(layouts).length === 0) {
      throw new Error("Theme layouts are empty");
    }

    slides.forEach((slide, idx) => {
      const sld = pptx.addSlide();
      const layoutConfig = layouts[slide.type];

      if (!layoutConfig) {
        console.warn(`⚠️  Layout not found for type: ${slide.type}`);
        sld.addText(slide.title || "No Title", {
          x: 1,
          y: 1,
          fontSize: 36,
          color: colors.textDark,
        });
        return;
      }

      // Set background
      if (layoutConfig.background) {
        sld.background = {
          color: getColorValue(layoutConfig.background, colors),
        };
      }

      // Render shapes first
      if (layoutConfig.shapes) {
        renderShapes(sld, layoutConfig.shapes, colors, pptx);
      }

      if (layoutConfig.decorations) {
        renderShapes(sld, layoutConfig.decorations, colors, pptx);
      }

      // Render text
      if (layoutConfig.titleText) {
        renderText(sld, layoutConfig.titleText, slide, colors, fonts);
      }

      if (layoutConfig.subtitleText) {
        renderText(sld, layoutConfig.subtitleText, slide, colors, fonts);
      }

      if (layoutConfig.bullets) {
        renderBullets(sld, layoutConfig.bullets, slide, colors, fonts, pptx);
      }

      if (layoutConfig.plan) {
        renderStyledPlan(sld, layoutConfig.plan, slide, colors, fonts, pptx);
      }

      if (layoutConfig.leftColumn && layoutConfig.rightColumn) {
        renderTwoColumns(
          sld,
          layoutConfig.leftColumn,
          layoutConfig.rightColumn,
          slide,
          colors,
          fonts
        );
      }

      if (layoutConfig.grid && !slide.stats) {
        renderGrid(sld, layoutConfig.grid, slide, colors, fonts, pptx, false);
      }

      if (layoutConfig.grid && slide.stats) {
        renderGrid(sld, layoutConfig.grid, slide, colors, fonts, pptx, true);
      }
    });

    console.log(`✅ PPTX generated with ${slides.length} slides`);

    const pptxOutput = await pptx.write({ outputType: "nodebuffer" });
    return pptxOutput as Buffer;
  } catch (error: any) {
    console.error("❌ PPTX Generation Error:", error.message);
    throw error;
  }
};
