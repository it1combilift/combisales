interface PdfHeaderProps {
  title: string;
  subtitle: string;
  status: string;
  statusType: "approved" | "rejected" | "pending";
  inspectionId: string;
  logoUrl?: string;
}

export function PdfHeader({
  title,
  subtitle,
  status,
  statusType,
  inspectionId,
  logoUrl,
}: PdfHeaderProps) {
  const statusStyles = {
    approved: "bg-[#1b5e20]/10 text-[#1b5e20] border-[#4caf50]",
    rejected: "bg-[#c62828]/10 text-[#c62828] border-[#ef5350]",
    pending: "bg-[#e65100]/10 text-[#e65100] border-[#ff9800]",
  };

  return (
    <header
      className="flex items-center justify-between rounded-sm overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #5a8528 0%, #679436 40%, #4e7c14 100%)",
      }}
    >
      <div className="flex items-center gap-4 py-3 pl-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/95 shadow-sm p-1">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt="Logo"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-[12px] font-bold text-[#4e7c14]">C</span>
          )}
        </div>
        <div>
          <h1 className="text-[15px] font-bold tracking-tight text-white leading-tight">
            {title}
          </h1>
          <p className="mt-0.5 text-[10px] font-normal tracking-wide text-white/75 uppercase">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 pr-5 py-3">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wider ${statusStyles[statusType]}`}
          style={{ backgroundColor: "rgba(255,255,255,0.95)" }}
        >
          <span
            className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusType === "approved" ? "bg-[#4caf50]" : statusType === "rejected" ? "bg-[#ef5350]" : "bg-[#ff9800]"}`}
          />
          {status}
        </span>
        <span className="text-[7px] font-mono text-white/50 tracking-wide">
          ID: {inspectionId}
        </span>
      </div>
    </header>
  );
}
