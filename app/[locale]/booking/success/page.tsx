// app/[locale]/booking/success/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle2, Clock, MessageCircle, MapPin, ShieldCheck } from "lucide-react";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { useTranslations } from "next-intl";

type BookingSuccessPageProps = {
  searchParams: Promise<{
    bookingId?: string;
  }>;
  params: Promise<{
    locale: string;
  }>;
};

export default async function BookingSuccessPage({
  searchParams,
  params,
}: BookingSuccessPageProps) {
  const t = useTranslations("doctor");
  const { bookingId } = await searchParams;
  const { locale } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect({
      href: "/login",
      locale,
    });
  }

  if (!bookingId) {
    return <BookingErrorCard message="Missing booking ID." locale={locale} />;
  }

  const booking = await prisma.consultationBooking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      doctorProfile: {
        include: {
          user: true,
        },
      },
      inClinicAccess: true,
      onlineAccess: true,
    },
  });

  if (!booking) {
    return <BookingErrorCard message="Booking not found." locale={locale} />;
  }

  if (booking.patientUserId !== session?.user.id) {
    return (
      <BookingErrorCard
        message="You do not have access to this booking."
        locale={locale}
      />
    );
  }

  const isPaid = booking.status === "paid";
  const isInClinic = booking.consultationType === "IN_CLINIC";
  const isOnline = booking.consultationType === "ONLINE";

  const doctor = booking.doctorProfile;
  const price = (booking.amount / 100).toFixed(2);

return (
  <main className="min-h-screen bg-[#FAF9F7] px-4 py-10">
    <section className="mx-auto flex min-h-[80vh] max-w-3xl items-center justify-center">
      <div className="w-full rounded-[32px] border border-[#283C5D]/10 bg-white p-8 text-center shadow-lg md:p-10">
        <div
          className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${
            isPaid ? "bg-green-100" : "bg-yellow-100"
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          ) : (
            <Clock className="h-10 w-10 text-yellow-600" />
          )}
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.25em] text-[#283C5D]/50">
          {t("bookingConfirmation.eyebrow")}
        </p>

        <h1 className="mt-3 text-3xl font-semibold text-[#283C5D] md:text-4xl">
          {isPaid
            ? t("bookingConfirmation.paymentSuccessful")
            : t("bookingConfirmation.paymentPending")}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-[#283C5D]/70">
          {isPaid
            ? isInClinic
              ? t("bookingConfirmation.inClinicSuccess")
              : t("bookingConfirmation.onlineSuccess")
            : t("bookingConfirmation.pendingDescription")}
        </p>

        <div className="mt-8 rounded-3xl bg-[#FAF9F7] p-5 text-left">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#283C5D]">
              {isInClinic ? (
                <MapPin size={22} />
              ) : (
                <MessageCircle size={22} />
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-[#283C5D]">
                {isInClinic
                  ? t("bookingConfirmation.inClinicConsultation")
                  : t("bookingConfirmation.onlineConsultation")}
              </p>

              <p className="mt-1 text-sm text-[#283C5D]/60">
                {doctor.clinicName}
              </p>

              <p className="mt-1 text-sm text-[#283C5D]/60">
                {t("bookingConfirmation.paidAmount", {
                  price,
                })}
              </p>
            </div>
          </div>
        </div>

        {isPaid && isInClinic && booking.inClinicAccess?.approvedToView ? (
          <div className="mt-5 rounded-3xl border border-[#283C5D]/10 bg-white p-5 text-left">
            <p className="text-sm font-semibold text-[#283C5D]">
              {t("bookingConfirmation.contactUnlocked")}
            </p>

            <div className="mt-3 space-y-2 text-sm text-[#283C5D]/70">
              <p>
                {t("bookingConfirmation.clinic")} {doctor.clinicName}
              </p>

              <p>
                {t("bookingConfirmation.address")} {doctor.workAddress}
              </p>

              {doctor.city ? (
                <p>
                  {t("bookingConfirmation.city")} {doctor.city}
                </p>
              ) : null}

              {doctor.inClinicLink ? (
                <a
                  href={doctor.inClinicLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-[#283C5D] underline"
                >
                  {t("bookingConfirmation.openBookingLink")}
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {isPaid && isOnline && booking.onlineAccess?.activeChat ? (
          <div className="mt-5 rounded-3xl border border-[#283C5D]/10 bg-white p-5 text-left">
            <p className="text-sm font-semibold text-[#283C5D]">
              {t("bookingConfirmation.chatUnlocked")}
            </p>

            <p className="mt-2 text-sm text-[#283C5D]/70">
              {t("bookingConfirmation.chatUnlockedDescription")}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gray-100 px-4 py-3 text-sm text-[#283C5D]/60">
          <ShieldCheck size={18} className="text-[#283C5D]" />
          {t("bookingConfirmation.securePayment")}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {isPaid && isOnline ? (
            <Link
              href={`/${locale}/dashboard/messages`}
              className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              {t("bookingConfirmation.goToMessages")}
            </Link>
          ) : null}

          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center justify-center rounded-full border border-[#283C5D] px-6 py-3 text-sm font-medium text-[#283C5D] transition hover:bg-[#283C5D] hover:text-white"
          >
            {t("bookingConfirmation.goToDashboard")}
          </Link>

          <Link
            href={`/${locale}/doctor/${doctor.userId}`}
            className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-black/60 transition hover:bg-gray-100"
          >
            {t("bookingConfirmation.backToDoctor")}
          </Link>
        </div>
      </div>
    </section>
  </main>
);
}

function BookingErrorCard({
  message,
  locale,
}: {
  message: string;
  locale: string;
}) {
  const t = useTranslations("doctor");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Clock className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-[#283C5D]">
          {t("bookingConfirmation.bookingIssue")}
        </h1>

        <p className="mt-3 text-sm text-[#283C5D]/60">{message}</p>

        <Link
          href={`/${locale}/dashboard`}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
        >
          {t("bookingConfirmation.goToDashboard")}
        </Link>
      </div>
    </main>
  );
}