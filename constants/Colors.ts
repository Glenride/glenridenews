// Glenride News brand color tokens
export const PRIMARY_ACCENT = '#E97451';
export const BACKGROUND_LIGHT = '#F2F2F7';
export const TEXT_DARK = '#1C1C1E';
export const BACKGROUND_DARK = '#1C1C1E';
export const TEXT_LIGHT = '#F2F2F7';
export const MUTED_TINT = '#8E8E93';

export default {
  light: {
    text: TEXT_DARK,
    background: BACKGROUND_LIGHT,
    tint: PRIMARY_ACCENT,
    tabIconDefault: MUTED_TINT,
    tabIconSelected: PRIMARY_ACCENT,
    card: '#FFFFFF',
    border: '#D1D1D6',
    notification: PRIMARY_ACCENT,
  },
  dark: {
    text: TEXT_LIGHT,
    background: BACKGROUND_DARK,
    tint: PRIMARY_ACCENT,
    tabIconDefault: '#636366',
    tabIconSelected: PRIMARY_ACCENT,
    card: '#2C2C2E',
    border: '#3A3A3C',
    notification: PRIMARY_ACCENT,
  },
};
