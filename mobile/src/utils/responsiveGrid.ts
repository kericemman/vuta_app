import { spacing } from "../constants/theme";

const SCREEN_HORIZONTAL_PADDING = spacing.sm * 2;

export const getGridItemWidth = (
  screenWidth: number,
  columns: number,
  gap = spacing.sm
) => {
  const contentWidth = Math.max(0, screenWidth - SCREEN_HORIZONTAL_PADDING);
  const totalGap = gap * Math.max(columns - 1, 0);

  return Math.floor((contentWidth - totalGap) / columns);
};
