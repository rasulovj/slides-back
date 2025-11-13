export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    mainText?: string;
    defaultText?: string;
    textLight?: string;
    textDark?: string;
    border?: string;
  };
  fonts: {
    heading: { family: string; weight?: { bold?: string; medium?: string } };
    body: { family: string; weight?: { regular?: string } };
  };
}

export interface SlideData {
  type: string;
  title?: string;
  subtitle?: string;
  content?: any[];
  quote?: { text: string; author?: string };
  stats?: { label: string; value: string; description?: string }[];
}
