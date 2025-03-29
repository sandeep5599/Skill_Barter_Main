const sizeValues = {
  xs: 320,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
};

export const size = {
  xs: `${sizeValues.xs}px`,
  sm: `${sizeValues.sm}px`,
  md: `${sizeValues.md}px`,
  lg: `${sizeValues.lg}px`,
  xl: `${sizeValues.xl}px`,
  xxl: `${sizeValues.xxl}px`
};

export const breakpoints = sizeValues;

export const device = {
  xs: `(min-width: ${size.xs})`,
  sm: `(min-width: ${size.sm})`,
  md: `(min-width: ${size.md})`,
  lg: `(min-width: ${size.lg})`,
  xl: `(min-width: ${size.xl})`,
  xxl: `(min-width: ${size.xxl})`
};
