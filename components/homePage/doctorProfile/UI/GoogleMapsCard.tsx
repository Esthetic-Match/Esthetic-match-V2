import { MapPin } from "lucide-react";

type GoogleMapsCardProps = {
  clinicName: string;
  workAddress: string;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  workLatitude: number | null;
  workLongitude: number | null;
  googleMapsUri: string | null;
  googlePlaceId: string | null;
};

export default function GoogleMapsCard({
  clinicName,
  workAddress,
  city,
  country,
  zipCode,
  workLatitude,
  workLongitude,
  googleMapsUri,
}: GoogleMapsCardProps) {
  const fullAddress = [workAddress, zipCode, city, country]
    .filter(Boolean)
    .join(", ");

  const mapQuery =
    workLatitude && workLongitude
      ? `${workLatitude},${workLongitude}`
      : fullAddress;

  const mapsHref =
    googleMapsUri?.trim() ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mapQuery
    )}`;

  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    mapQuery
  )}&output=embed`;

  return (
    <article
      aria-labelledby="clinic-location-title"
      itemScope
      itemType="https://schema.org/MedicalClinic"
      className="overflow-hidden rounded-3xl border border-gray-300/10 bg-white shadow-lg"
    >
      <div className="p-6 md:py-8">
        <div className="flex items-center gap-3">
          <MapPin size={22} className="text-[#d8bd8d]" aria-hidden="true" />

          <h2
            id="clinic-location-title"
            className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
          >
            Clinic Location
          </h2>
        </div>

          {workLatitude && workLongitude ? (
            <>
              <meta itemProp="latitude" content={String(workLatitude)} />
              <meta itemProp="longitude" content={String(workLongitude)} />
            </>
          ) : null}

      </div>

      <div className="h-48 w-full border-t border-b border-[#d8bd8d]">
        <iframe
          title={`${clinicName} location on Google Maps`}
          src={embedSrc}
          className="h-full w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="p-6 pt-4 md:px-8">
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          itemProp="hasMap"
          className="inline-flex w-full items-center justify-center rounded-full border border-[#d8bd8d]/60 px-6 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#53637d] hover:text-white"
        >
          Open in Google Maps
        </a>
      </div>
    </article>
  );
}