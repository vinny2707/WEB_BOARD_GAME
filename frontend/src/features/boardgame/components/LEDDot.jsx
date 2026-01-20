import React from "react";
import { DOT_SIZE, LED_COLORS } from "../utils/constants";

/**
 * Single LED Dot component
 */
const LEDDot = React.memo(({ color }) => {
  const bgColor = color === 0 ? LED_COLORS.off : (LED_COLORS[color] || color);
  const isOn = color !== 0;

  return (
    <div
      className="rounded-full"
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        backgroundColor: bgColor,
        boxShadow: isOn
          ? `0 0 ${DOT_SIZE / 2}px ${bgColor}, 0 0 ${DOT_SIZE}px ${bgColor}50`
          : "inset 0 1px 2px rgba(0,0,0,0.5)",
      }}
    />
  );
});

LEDDot.displayName = "LEDDot";

export default LEDDot;
