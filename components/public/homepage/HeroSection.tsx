import { getTranslations } from "next-intl/server";

import HomeChatExperience from "../Emi/HomeChatExperience";

export default async function HomeSection() {
  const t = await getTranslations(
    "home.Home",
  );

  return (
    <HomeChatExperience
      eyebrow={t("heroEyebrow")}
      line1={t("heroTitleLine1")}
      line2={t("heroTitleLine2")}
      line3={t("heroTitleLine3")}
    />
  );
}