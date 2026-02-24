import { SectionTitle } from "./pdf-checklist";

interface PdfApprovalProps {
  title: string;
  isApproved: boolean;
  statusLabel: string;
  reviewedByLabel: string;
  reviewerName: string;
  dateLabel: string;
  dateValue: string;
  commentsLabel: string;
  comments: string | null;
  decisionLabel: string;
}

export function PdfApproval({
  title,
  isApproved,
  statusLabel,
  reviewedByLabel,
  reviewerName,
  dateLabel,
  dateValue,
  commentsLabel,
  comments,
  decisionLabel,
}: PdfApprovalProps) {
  const accent = isApproved ? "#4caf50" : "#ef5350";
  const textColor = isApproved ? "#1b5e20" : "#c62828";
  const bgColor = isApproved ? "#f1f8e9" : "#fff5f5";
  const badgeBg = isApproved ? "#e8f5e9" : "#ffebee";

  return (
    <div>
      <SectionTitle title={title} />
      <div
        className="rounded-sm overflow-hidden border border-[#e8e8e8]"
        style={{ borderLeftWidth: 3, borderLeftColor: accent }}
      >
        <div
          className="px-4 py-3 space-y-2"
          style={{ backgroundColor: bgColor }}
        >
          {/* Decision + Reviewer + Date — single row */}
          <div className="flex items-center flex-wrap gap-x-5 gap-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-[#757575] uppercase tracking-wider font-medium">
                {decisionLabel}:
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[7.5px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: badgeBg,
                  color: textColor,
                  borderColor: accent,
                }}
              >
                {isApproved ? (
                  <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                    <path
                      d="M1.5 4.5L3.5 6.5L7.5 2.5"
                      stroke={textColor}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg width="8" height="8" viewBox="0 0 9 9" fill="none">
                    <path
                      d="M2.5 2.5L6.5 6.5M6.5 2.5L2.5 6.5"
                      stroke={textColor}
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                {statusLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] text-[#9e9e9e] uppercase tracking-wider">
                {reviewedByLabel}:
              </span>
              <span className="text-[8.5px] font-semibold text-[#212121]">
                {reviewerName}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[8px] text-[#9e9e9e] uppercase tracking-wider">
                {dateLabel}:
              </span>
              <span className="text-[8.5px] text-[#424242]">{dateValue}</span>
            </div>
          </div>

          {/* Comments */}
          {comments && (
            <div className="rounded-sm bg-white/80 border border-[#e0e0e0] px-3 py-2">
              <span className="text-[7px] text-[#9e9e9e] uppercase tracking-widest font-semibold">
                {commentsLabel}
              </span>
              <p className="mt-0.5 text-[8.5px] text-[#424242] italic leading-snug">
                {comments}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
