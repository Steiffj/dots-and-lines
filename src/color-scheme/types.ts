export type ColorTheme = {
  theme: "dark" | "light" | "system";
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
};

export type ColorPalette = {
  name: string;
  span: [string, string];
  edge: string;
  backgroundColor?: string;
};
