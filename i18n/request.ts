import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      home: (await import(`../messages/${locale}/home.json`)).default,
      signIn: (await import(`../messages/${locale}/signin.json`)).default,
      signUp: (await import(`../messages/${locale}/signup.json`)).default,
      onboarding: (await import(`../messages/${locale}/onboarding.json`)).default,
      payment: (await import(`../messages/${locale}/payment.json`)).default,
      doctor: (await import(`../messages/${locale}/doctor.json`)).default,
      proceduresName: (await import(`../messages/${locale}/proceduresName.json`)).default,
      dashboard: (await import(`../messages/${locale}/dashboard.json`)).default,
      settings: (await import(`../messages/${locale}/settings.json`)).default,
      specialitiesName: (await import(`../messages/${locale}/specialitiesName.json`)).default,
      categoriesName: (await import(`../messages/${locale}/categoriesName.json`)).default,
      subcategoriesName: (await import(`../messages/${locale}/subcategoriesName.json`)).default,
      categoriesPage: (await import(`../messages/${locale}/categoriesPage.json`)).default,
      messages: (await import(`../messages/${locale}/messages.json`)).default,
      faq: (await import(`../messages/${locale}/faq.json`)).default,
    },
  };
});