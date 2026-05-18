import { useTranslations } from "next-intl";

export default function SubscriptionPlans() {
  const t = useTranslations("settings.subscriptionPlans");

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex max-w-3xl gap-6 max-md:flex-col">
        <PlanCard
          title={t("freePlan.title")}
          price={t("freePlan.price")}
          benefits={[
            t("freePlan.benefits.0"),
            t("freePlan.benefits.1"),
            t("freePlan.benefits.2"),
            t("freePlan.benefits.3"),
            t("freePlan.benefits.4"),
          ]}
          buttonLabel={t("freePlan.button")}
        />

        <PlanCard
          title={t("proPlan.title")}
          price={t("proPlan.price")}
          suffix={t("proPlan.suffix")}
          highlighted
          benefits={[
            t("proPlan.benefits.0"),
            t("proPlan.benefits.1"),
            t("proPlan.benefits.2"),
            t("proPlan.benefits.3"),
            t("proPlan.benefits.4"),
            t("proPlan.benefits.5"),
            t("proPlan.benefits.6"),
          ]}
          buttonLabel={t("proPlan.button")}
        />
      </div>
    </div>
  );
}

function PlanCard({
  title,
  price,
  suffix,
  benefits,
  buttonLabel,
  highlighted,
}: {
  title: string;
  price: string;
  suffix?: string;
  benefits: string[];
  buttonLabel: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[330px] flex-1 flex-col rounded-xl border bg-white p-6 shadow-md ${
        highlighted ? "border-[#d8bd8d]" : "border-gray-200"
      }`}
    >
      <p
        className={`mb-5 text-md font-medium ${
          highlighted ? "text-[#d8bd8d]" : "text-black"
        }`}
      >
        {title}
      </p>

      <div className="mb-4 flex items-end gap-1">
        <h2 className="text-4xl font-bold text-black">{price}</h2>

        {suffix ? (
          <span className="mb-1 text-sm font-medium text-gray-500">
            {suffix}
          </span>
        ) : null}
      </div>

      <div className="border-t border-gray-300 my-4" />

      <ul className="mb-8 space-y-3 text-xs text-black">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <span className="mt-[2px] text-[#283C5D]">✓</span>
            <span className="font-normal">{benefit}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={`mt-auto rounded-full border px-4 py-2 text-xs font-medium transition active:scale-[0.98] ${
          highlighted
            ? "border-[#d8bd8d] bg-gradient-to-r from-[#d8bd8d] to-[#f2dbb1] text-black hover:bg-[#283C5D]/90"
            : "border-[#283C5D] text-[#283C5D] hover:bg-[#283C5D] hover:text-white"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}