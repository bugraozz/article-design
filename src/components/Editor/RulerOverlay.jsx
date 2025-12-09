export default function RulerOverlay({ pageWidth = 794, pageHeight = 1123 }) {
  const RULER_SIZE = 30;
  const TICK_INTERVAL = 50; // 50px'te bir
  const SMALL_TICK = 10;

  return (
    <>
      {/* Horizontal Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-b border-gray-300"
        style={{
          width: pageWidth,
          height: RULER_SIZE,
          marginLeft: RULER_SIZE,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <svg width={pageWidth} height={RULER_SIZE} style={{ display: "block" }}>
          {/* Arka plan */}
          <rect width={pageWidth} height={RULER_SIZE} fill="#f3f4f6" />

          {/* Tick işaretleri */}
          {Array.from({ length: Math.ceil(pageWidth / SMALL_TICK) }).map(
            (_, i) => {
              const position = i * SMALL_TICK;
              const isMajor = i % (TICK_INTERVAL / SMALL_TICK) === 0;

              return (
                <g key={i}>
                  {/* Tick çizgisi */}
                  <line
                    x1={position}
                    y1={isMajor ? RULER_SIZE - 12 : RULER_SIZE - 6}
                    x2={position}
                    y2={RULER_SIZE}
                    stroke="#9ca3af"
                    strokeWidth="0.5"
                  />

                  {/* Sayı etiketi (sadece major ticks) */}
                  {isMajor && (
                    <text
                      x={position}
                      y={12}
                      fontSize="10"
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {position}
                    </text>
                  )}
                </g>
              );
            }
          )}
        </svg>
      </div>

      {/* Vertical Ruler */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-r border-gray-300"
        style={{
          width: RULER_SIZE,
          height: pageHeight,
          marginTop: RULER_SIZE,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <svg width={RULER_SIZE} height={pageHeight} style={{ display: "block" }}>
          {/* Arka plan */}
          <rect width={RULER_SIZE} height={pageHeight} fill="#f3f4f6" />

          {/* Tick işaretleri */}
          {Array.from({ length: Math.ceil(pageHeight / SMALL_TICK) }).map(
            (_, i) => {
              const position = i * SMALL_TICK;
              const isMajor = i % (TICK_INTERVAL / SMALL_TICK) === 0;

              return (
                <g key={i}>
                  {/* Tick çizgisi */}
                  <line
                    x1={isMajor ? RULER_SIZE - 12 : RULER_SIZE - 6}
                    y1={position}
                    x2={RULER_SIZE}
                    y2={position}
                    stroke="#9ca3af"
                    strokeWidth="0.5"
                  />

                  {/* Sayı etiketi (sadece major ticks) */}
                  {isMajor && (
                    <text
                      x={8}
                      y={position + 4}
                      fontSize="9"
                      fill="#6b7280"
                      textAnchor="middle"
                    >
                      {position}
                    </text>
                  )}
                </g>
              );
            }
          )}
        </svg>
      </div>

      {/* Corner box */}
      <div
        className="absolute top-0 left-0 bg-gray-100 border-b border-r border-gray-300"
        style={{
          width: RULER_SIZE,
          height: RULER_SIZE,
          zIndex: 21,
        }}
      />
    </>
  );
}
