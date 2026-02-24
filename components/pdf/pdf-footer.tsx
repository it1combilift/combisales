interface PdfFooterProps {
  company: string;
  generatedLabel: string;
  date: string;
  pageLabel: string;
  page: number;
  ofLabel: string;
  totalPages: number;
}

export function PdfFooter({
  company,
  generatedLabel,
  date,
  pageLabel,
  page,
  ofLabel,
  totalPages,
}: PdfFooterProps) {
  return (
    <footer className="mt-auto pt-4">
      <div className="h-px bg-linear-to-r from-[#679436] via-[#679436]/40 to-transparent mb-2" />
      <div className="flex items-center justify-between">
        <span className="text-[7px] text-[#bdbdbd] tracking-wide">
          {company}
        </span>
        <span className="text-[7px] text-[#bdbdbd]">
          {generatedLabel}: {date}
        </span>
        <span className="text-[7px] font-semibold text-[#9e9e9e]">
          {pageLabel} {page} {ofLabel} {totalPages}
        </span>
      </div>
    </footer>
  );
}
