// components/MermaidDiagram.js
import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

const MermaidDiagram = ({ chart }) => {
  const ref = useRef(null);

  useEffect(() => {
    // Themed to the refined "civic editorial" palette (navy/terracotta on warm
    // paper) so the diagrams sit calmly inside the .ohx-card frames instead of
    // the stock mermaid purple. This init also styles the raw `.mermaid` gantt
    // on /about/process via contentLoaded().
    mermaid.initialize({
      startOnLoad: true,
      theme: "base",
      securityLevel: "loose",
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif",
      themeVariables: {
        primaryColor: "#F4F1E9",
        primaryBorderColor: "#1B3A6B",
        primaryTextColor: "#16181D",
        lineColor: "#1B3A6B",
        secondaryColor: "#FBFAF6",
        tertiaryColor: "#FBFAF6",
        fontSize: "15px",
        // Gantt-specific
        taskBkgColor: "#1B3A6B",
        taskTextColor: "#FFFFFF",
        taskTextOutsideColor: "#16181D",
        taskTextLightColor: "#FFFFFF",
        activeTaskBkgColor: "#E2552E",
        activeTaskBorderColor: "#E2552E",
        gridColor: "#E7E1D4",
        doneTaskBkgColor: "#9AA6BC",
        critBkgColor: "#E2552E",
        sectionBkgColor: "rgba(27,58,107,0.06)",
        sectionBkgColor2: "rgba(226,85,46,0.06)",
        altSectionBkgColor: "#FBFAF6",
      },
    });
    mermaid.contentLoaded();
  }, []);

  return (
    <div className="mermaid" ref={ref}>
      {chart}
    </div>
  );
};

export default MermaidDiagram;
