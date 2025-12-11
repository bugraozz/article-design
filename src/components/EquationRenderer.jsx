import { useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";

export default function EquationRenderer({ latex, mode = "inline", className = "" }) {
  try {
    return mode === "inline" ? (
      <InlineMath math={latex} />
    ) : (
      <BlockMath math={latex} />
    );
  } catch (error) {
    // LaTeX error varsa fallback olarak text göster
    return <span className={className}>{latex}</span>;
  }
}
