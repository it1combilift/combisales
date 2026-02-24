interface ChecklistGroup {
  name: string;
  items: { label: string; passed: boolean }[];
}

interface PdfChecklistProps {
  title: string;
  itemHeader: string;
  statusHeader: string;
  passLabel: string;
  failLabel: string;
  groups: ChecklistGroup[];
}

export function PdfChecklist({
  title,
  itemHeader,
  statusHeader,
  passLabel,
  failLabel,
  groups,
}: PdfChecklistProps) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="rounded-sm border border-[#e0e0e0] overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_90px] bg-[#616161]">
          <div className="px-3.5 py-2">
            <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
              {itemHeader}
            </span>
          </div>
          <div className="px-3.5 py-2 text-center">
            <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
              {statusHeader}
            </span>
          </div>
        </div>

        {groups.map((group, gi) => (
          <div key={gi}>
            {/* Group header */}
            <div className="grid grid-cols-[1fr_90px] border-t border-[#e0e0e0] bg-[#f7faf4]">
              <div className="px-3.5 py-1.5 col-span-2 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#679436]" />
                <span className="text-[8.5px] font-semibold uppercase tracking-[0.06em] text-[#4e7c14]">
                  {group.name}
                </span>
              </div>
            </div>

            {/* Items */}
            {group.items.map((item, ii) => (
              <div
                key={ii}
                className={`grid grid-cols-[1fr_90px] border-t border-[#f0f0f0] ${ii % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}
              >
                <div className="px-3.5 py-1.5 pl-6">
                  <span className="text-[8.5px] text-[#424242]">
                    {item.label}
                  </span>
                </div>
                <div className="px-3.5 py-1.5 flex justify-center">
                  {item.passed ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#e8f5e9] px-2 py-0.5 text-[7.5px] font-semibold text-[#2e7d32] uppercase tracking-wider">
                      <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M1.5 4L3 5.5L6.5 2"
                          stroke="#2e7d32"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {passLabel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-[#ffebee] px-2 py-0.5 text-[7.5px] font-semibold text-[#c62828] uppercase tracking-wider">
                      <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                        <path
                          d="M2 2L6 6M6 2L2 6"
                          stroke="#c62828"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {failLabel}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5 mt-0.5">
      <div className="w-[3px] h-4 rounded-full bg-[#679436]" />
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#212121]">
        {title}
      </h2>
      <div className="flex-1 h-px bg-[#e0e0e0]" />
    </div>
  );
}
