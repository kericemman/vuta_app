import { spacing } from "../constants/theme";

const SCREEN_HORIZONTAL_PADDING = spacing.sm * 2;
const PERCENT_WIDTH_BY_COLUMNS = {
  1: "100%",
  2: "48.5%",
  3: "31%",
  4: "23%",
} as const;

export const getGridItemWidth = (
  screenWidth: number,
  columns: number,
  gap = spacing.sm
) => {
  const contentWidth = Math.max(0, screenWidth - SCREEN_HORIZONTAL_PADDING);
  const totalGap = gap * Math.max(columns - 1, 0);

  return Math.floor((contentWidth - totalGap) / columns);
};

export const getGridItemPercentWidth = (
  columns: keyof typeof PERCENT_WIDTH_BY_COLUMNS
) => PERCENT_WIDTH_BY_COLUMNS[columns];
