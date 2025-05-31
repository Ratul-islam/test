"use client";
import React, { useState, useRef } from "react";

interface TattooTooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "right" | "bottom" | "left";
  offset?: { x: number; y: number }; 
}

const TattooTooltip: React.FC<TattooTooltipProps> = ({
  children,
  content,
  position = "top",
  offset = { x: 0, y: 0 },
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const childRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getTooltipStyle = () => {
    if (!childRef.current || !tooltipRef.current) return {};

    const margin = 10; // Default margin

    // Custom position adjustments with offsets
    const xOffset = offset.x || 0;
    const yOffset = offset.y || 0;

    switch (position) {
      case "top":
        return {
          bottom: `calc(100% + ${margin}px + ${yOffset}px)`,
          left: `calc(50% + ${xOffset}px)`,
          transform: "translateX(-50%)",
        };
      case "right":
        return {
          left: `calc(100% + ${margin}px + ${xOffset}px)`,
          top: `calc(50% + ${yOffset}px)`,
          transform: "translateY(-50%)",
        };
      case "bottom":
        return {
          top: `calc(100% + ${margin}px + ${yOffset}px)`,
          left: `calc(50% + ${xOffset}px)`,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          right: `calc(100% + ${margin}px + ${xOffset}px)`,
          top: `calc(50% + ${yOffset}px)`,
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <div
      ref={childRef}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 bg-black text-white text-xs rounded p-2 max-w-lg whitespace-normal shadow-lg"
          style={getTooltipStyle()}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-black transform rotate-45"
            style={{
              [position === "top"
                ? "bottom"
                : position === "bottom"
                ? "top"
                : position === "left"
                ? "right"
                : "left"]: "-4px",
              [position === "top" || position === "bottom"
                ? "left"
                : "top"]: "50%",
              transform: `translate(${
                position === "top" || position === "bottom" ? "-50%" : "0"
              }, ${
                position === "left" || position === "right" ? "-50%" : "0"
              })`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default TattooTooltip;