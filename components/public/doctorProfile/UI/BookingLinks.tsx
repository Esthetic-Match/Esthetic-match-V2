import { CalendarCheck } from "lucide-react";
import CopyBookingLinkButton from "./CopyBookingLinkButton";

type BookingLinksProps = {
  bookingLink: string | null;
};

export default function BookingLinks({ bookingLink }: BookingLinksProps) {
  if (!bookingLink?.trim()) {
    return null;
  }

  return (
    <article
      aria-labelledby="booking-links-title"
      className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8"
    >
      <div className="flex items-center gap-3">
        <CalendarCheck size={22} className="text-[#d8bd8d]" aria-hidden="true" />

        <h2
          id="booking-links-title"
          className="text-sm font-bold uppercase tracking-[0.18em] text-[#283C5D]"
        >
          Booking Link
        </h2>
      </div>

      <div className="mt-10">
        <p className="mb-3 text-sm text-[#283C5D]/60">
          Book a consultation directly with this doctor.
        </p>

        <a
          href={bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          itemProp="url"
          className="block break-all text-sm font-medium text-[#283C5D] underline decoration-[#d8bd8d] underline-offset-4"
        >
          {bookingLink}
        </a>

        <CopyBookingLinkButton bookingLink={bookingLink} />
      </div>
    </article>
  );
}