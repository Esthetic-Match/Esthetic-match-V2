import { CalendarDays, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

type BookingLinksSectionProps = {
  bookingLinks?: string[] | null;
};

function formatBookingLink(link: string) {
  try {
    const url = new URL(link);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return link;
  }
}

export default function BookingLinksSection({
  bookingLinks,
}: BookingLinksSectionProps) {
  const t = useTranslations("doctor.doctor.profile.bookingLinks");

  const validLinks = (bookingLinks ?? []).filter((link) => link.trim());

  if (validLinks.length === 0) return null;

  return (
    <section
      aria-labelledby="booking-links-title"
      className="mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF9F7] text-[#d8bd8d]">
          <CalendarDays size={22} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d8bd8d]">
            {t("eyebrow")}
          </p>

          <h2
            id="booking-links-title"
            className="text-lg font-semibold text-[#283C5D]"
          >
            {t("title")}
          </h2>
        </div>
      </div>

      <div className="grid w-full gap-3 md:grid-cols-3">
        {validLinks.map((link, index) => (
          <a
            key={`${link}-${index}`}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("openLink", {
              link: formatBookingLink(link),
            })}
            className="group flex min-h-14 items-center justify-between gap-3 rounded-full border border-black/10 bg-[#FAF9F7] px-5 py-3 text-sm font-semibold 
            text-[#283C5D] transition hover:border-[#d8bd8d]/60 hover:bg-white hover:shadow-sm active:scale-[0.98]"
          >
            <span className="truncate">{formatBookingLink(link)}</span>

            <ExternalLink
              size={17}
              className="shrink-0 text-[#d8bd8d] transition group-hover:translate-x-0.5"
            />
          </a>
        ))}
      </div>
    </section>
  );
}