import { SectionTitle } from "./pdf-checklist";

interface PdfObservationsProps {
  title: string;
  text: string | null;
  noObservationsLabel: string;
}

export function PdfObservations({
  title,
  text,
  noObservationsLabel,
}: PdfObservationsProps) {
  const hasObs = !!text;

  return (
    <div>
      <SectionTitle title={title} />
      <div
        className="rounded-sm border border-[#e8e8e8] bg-white px-5 py-3"
        style={hasObs ? { borderLeftWidth: 3, borderLeftColor: "#679436" } : {}}
      >
        <p
          className={`text-[9px] leading-relaxed ${hasObs ? "text-[#424242]" : "text-[#bdbdbd] italic"}`}
        >
          {text || noObservationsLabel}
        </p>
      </div>
    </div>
  );
}
