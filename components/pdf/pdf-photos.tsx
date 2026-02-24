import { SectionTitle } from "./pdf-checklist";

interface PdfPhotosProps {
  title: string;
  photos: { label: string; url: string }[];
}

export function PdfPhotos({ title, photos }: PdfPhotosProps) {
  return (
    <div>
      <SectionTitle title={title} />
      <div className="grid grid-cols-2 gap-2.5">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="rounded-sm border border-[#e8e8e8] overflow-hidden bg-white"
            style={{ breakInside: "avoid" }}
          >
            <div
              style={{ height: "140px" }}
              className="bg-[#f5f5f5] relative overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.label}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div className="px-3 py-1.5 border-t border-[#f0f0f0]">
              <span className="text-[8px] font-semibold uppercase tracking-[0.06em] text-[#616161]">
                {photo.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
