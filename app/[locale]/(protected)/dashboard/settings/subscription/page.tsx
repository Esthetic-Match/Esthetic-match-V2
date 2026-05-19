import { CheckCircle2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import SubscriptionPlans from "@/components/settings/SubscriptionPlans";

type SubscriptionPageProps = {
  searchParams: Promise<{
    success?: string;
    session_id?: string;
    canceled?: string;
  }>;
};

export default async function SubscriptionPage({
  searchParams,
}: SubscriptionPageProps) {
  const params = await searchParams;

  if (params.success === "true") {
    return <SubscriptionSuccess />;
  }

  return <SubscriptionPlans />;
}

async function SubscriptionSuccess() {
  const t = await getTranslations("settings.subscriptionSuccess");

  return (
    <section className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-[#FAF9F7] px-4 py-10">
      <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#283C5D]/10 bg-white shadow-xl">
        <div className="relative bg-[#283C5D] px-8 py-10 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#d8bd8d55,transparent_45%)]" />

          <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <CheckCircle2 className="h-9 w-9 text-[#f4e4c6]" />
          </div>

          <h1 className="relative mt-6 text-3xl font-semibold">
            {t("title")}
          </h1>

          <p className="relative mt-3 text-sm leading-6 text-white/75">
            {t("description")}
          </p>
        </div>

        <div className="px-8 py-8 text-center">
          <p className="mx-auto max-w-sm text-sm leading-6 text-[#283C5D]/70">
            {t("body")}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]"
            >
              {t("dashboardButton")}
            </Link>

            <Link
              href="/dashboard/settings"
              className="inline-flex items-center justify-center rounded-full border border-[#283C5D]/20 px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5 active:scale-[0.98]"
            >
              {t("settingsButton")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}