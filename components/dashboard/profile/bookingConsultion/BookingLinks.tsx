import { CalendarDays } from "lucide-react";
import CardTitle from "../UI/CardTitle";
import PremiumLockedContent from "../UI/PremiumLockedContent"

export default function BookingLinks({ bookingLink }: { bookingLink?: string | null }) {
  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 text-center shadow-lg md:p-8">
      <CardTitle icon={<CalendarDays size={22} />} title="Booking Links" />

      {bookingLink ? (
        <a
          href={bookingLink}
          target="_blank"
          rel="noreferrer"
          className="mt-16 inline-flex rounded-full border border-[#d8bd8d]/60 px-6 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#d8bd8d]/10"
        >
          Open booking link
        </a>
      ) : (
        <PremiumLockedContent
          title="Booking links are hidden"
          description="Upgrade to Premium to display"
        />
      )}
    </div>
  );
}