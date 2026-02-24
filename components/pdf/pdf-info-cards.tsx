interface InfoField {
  label: string;
  value: string;
}

interface PdfInfoCardsProps {
  generalInfo: {
    title: string;
    fields: InfoField[];
  };
  vehicleInfo: {
    title: string;
    fields: InfoField[];
  };
  inspectorInfo: {
    title: string;
    fields: InfoField[];
  };
}

function InfoCard({
  title,
  fields,
  accent = false,
}: {
  title: string;
  fields: InfoField[];
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-sm ${accent ? "border-l-[3px] border-l-[#679436]" : ""} border border-[#e8e8e8]`}
    >
      <div className="border-b border-[#e8e8e8] px-4 py-2">
        <h3 className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#679436]">
          {title}
        </h3>
      </div>
      <div className="px-4 py-3 space-y-2">
        {fields.map((field, i) => (
          <div key={i} className="flex items-baseline gap-2">
            <span className="text-[8.5px] text-[#9e9e9e] uppercase tracking-wide min-w-20 shrink-0">
              {field.label}
            </span>
            <span className="text-[9px] font-medium text-[#212121]">
              {field.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PdfInfoCards({
  generalInfo,
  vehicleInfo,
  inspectorInfo,
}: PdfInfoCardsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <InfoCard title={generalInfo.title} fields={generalInfo.fields} />
        <InfoCard title={vehicleInfo.title} fields={vehicleInfo.fields} />
      </div>
      <InfoCard
        title={inspectorInfo.title}
        fields={inspectorInfo.fields}
        accent
      />
    </div>
  );
}
