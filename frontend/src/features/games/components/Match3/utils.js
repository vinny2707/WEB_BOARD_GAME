// Match3 Utility Functions

// Easing functions for animations
export const easeOutBounce = (t) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
  if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
  return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
};

export const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

// Elastic clamp for drag animation
export const clampWithElastic = (val, max, elasticFactor = 0.4) => {
  if (Math.abs(val) <= max) return val;
  const sign = val > 0 ? 1 : -1;
  const excess = Math.abs(val) - max;
  return sign * (max + excess * elasticFactor);
};
