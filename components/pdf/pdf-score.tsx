interface PdfScoreProps {
  title: string;
  passed: number;
  failed: number;
  total: number;
  passedLabel: string;
  failedLabel: string;
}

export function PdfScore({
  title,
  passed,
  failed,
  total,
  passedLabel,
  failedLabel,
}: PdfScoreProps) {
  const percent = Math.round((passed / total) * 100);
  const isGood = percent >= 80;
  const isMedium = percent >= 50 && percent < 80;

  const barColor = isGood ? "#4caf50" : isMedium ? "#ff9800" : "#ef5350";
  const textColor = isGood ? "#1b5e20" : isMedium ? "#e65100" : "#c62828";
  const bgColor = isGood ? "#e8f5e9" : isMedium ? "#fff8e1" : "#ffebee";

  return (
    <div className="rounded-sm border border-[#e8e8e8] overflow-hidden">
      <div className="flex items-stretch">
        {/* Score Display */}
        <div
          className="flex flex-col items-center justify-center px-5 py-3 border-r border-[#e8e8e8]"
          style={{ minWidth: 100 }}
        >
          <span
            className="text-[24px] font-bold leading-none tracking-tight"
            style={{ color: textColor }}
          >
            {percent}%
          </span>
          <span className="mt-0.5 text-[7px] uppercase tracking-widest text-[#9e9e9e] font-medium">
            {title}
          </span>
        </div>

        {/* Details */}
        <div className="flex-1 px-4 py-3 space-y-2">
          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7.5px] uppercase tracking-wider text-[#757575] font-medium">
                {passed}/{total}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#f0f0f0] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: barColor }}
              />
            </div>
          </div>

          {/* Legend + badge inline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: "#4caf50" }}
                />
                <span className="text-[7.5px] text-[#616161]">
                  {passedLabel}:{" "}
                  <strong className="text-[#212121]">{passed}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: "#ef5350" }}
                />
                <span className="text-[7.5px] text-[#616161]">
                  {failedLabel}:{" "}
                  <strong className="text-[#212121]">{failed}</strong>
                </span>
              </div>
            </div>
            <div
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: bgColor }}
            >
              <span
                className="text-[7px] font-semibold uppercase tracking-wider"
                style={{ color: textColor }}
              >
                {isGood ? "Passing" : isMedium ? "Needs Attention" : "Critical"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
