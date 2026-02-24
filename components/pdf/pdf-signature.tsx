import { SectionTitle } from "./pdf-checklist";

interface PdfSignatureProps {
  title: string;
  signatureUrl: string;
  name: string;
  role: string;
  date: string;
  signedByLabel: string;
}

export function PdfSignature({
  title,
  signatureUrl,
  name,
  role,
  date,
  signedByLabel,
}: PdfSignatureProps) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="rounded-sm border border-[#e8e8e8] bg-white py-0 px-6">
        <div className="flex flex-col items-center">
          {/* Signature image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={signatureUrl}
            alt="Digital signature"
            style={{
              maxWidth: 280,
              maxHeight: 100,
              objectFit: "contain",
              display: "block",
            }}
            className="m-0 p-0"
          />

          {/* Name */}
          <span className="text-sm font-bold text-[#212121] tracking-wide">
            {name}
          </span>

          {/* Role */}
          <span className="text-xs text-[#9e9e9e] uppercase tracking-widest mt-0.5">
            {role}
          </span>

          {/* Date + Signed label inline */}
          <div className="flex items-center gap-2 mt-1.5 pb-3">
            <span className="text-xs text-[#bdbdbd] font-mono">
              {date} — {signedByLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
