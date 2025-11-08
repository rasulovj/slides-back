// lib/utils/themeStyles.ts

export const generateThemeCSS = (theme: any) => {
  return `
    :root {
      --theme-primary: ${theme.colors.primary};
      --theme-secondary: ${theme.colors.secondary};
      --theme-accent: ${theme.colors.accent};
      --theme-background: ${theme.colors.background};
      --theme-text: ${theme.colors.text};
      --theme-text-light: ${theme.colors.textLight};
      --theme-heading-font: ${theme.fonts.heading}, sans-serif;
      --theme-body-font: ${theme.fonts.body}, sans-serif;
    }
  `;
};

export const getSlideBackgroundStyle = (slideType: string, theme: any) => {
  switch (slideType) {
    case "title":
    case "closing":
      return {
        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
      };
    default:
      return {
        background: theme.colors.background,
      };
  }
};
