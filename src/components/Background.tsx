// src/components/DotGridSection.tsx
import React from "react";
import DotGrid from "./ui/DotGrid";

const DotGridSection: React.FC = () => {
  return (
    <div style={{ width: "100%", height: "600px", position: "relative" }}>
      <DotGrid
        dotSize={10}
        gap={15}
        baseColor="#5227FF"
        activeColor="#5227FF"
        proximity={120}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      />
    </div>
  );
};

export default DotGridSection;
