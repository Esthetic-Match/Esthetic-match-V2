import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { sendEmail } from "@/lib/utils/email";
import { getTranslations } from "next-intl/server";

export async function generateMetadata() {
  const t = await getTranslations("home.contact.seo");

  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      "contact esthetic match",
      "aesthetic doctors support",
      "cosmetic medicine platform",
      "esthetic match contact",
    ],
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

async function contactAction(formData: FormData) {
  "use server";

  const name = String(formData.get("name") || "");
  const email = String(formData.get("email") || "");
  const subject = String(formData.get("subject") || "New Contact Request");
  const message = String(formData.get("message") || "");

  if (!name || !email || !message) {
    throw new Error("Missing required fields");
  }

  await sendEmail({
    to: process.env.CONTACT_FORM_RECEIVER_EMAIL!,
    subject: `Esthetic Match Contact: ${subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>New Contact Form Submission</h2>
  
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
  
        <hr />
  
        <p><strong>Message:</strong></p>
  
        <p>${message.replace(/\n/g, "<br />")}</p>
      </div>
    `,
  });
}

export default async function ContactPage() {
  const t = await getTranslations("home.contact");

  return (
    <main className="min-h-screen bg-[#FAF9F7]">
      <section className="relative overflow-hidden bg-[#061A2D] px-6 py-24 text-white md:px-12 lg:px-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(216,189,141,0.22),transparent_35%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#FAF9F7]" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.45em] text-white">
            {t("hero.eyebrow")}
          </p>

          <h1 className="max-w-3xl text-4xl font-bold uppercase leading-[0.95] text-[#d8bd8d] md:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/80 md:text-base">
            {t("hero.description")}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:px-12 lg:grid-cols-[0.9fr_1.4fr] lg:px-4">
        <div className="lg:col-span-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.45em] text-[#283C5D]">
            {t("section.eyebrow")}
          </p>
          <div className="h-px w-40 bg-[#d8bd8d]" />
        </div>

        <div className="space-y-4">
          <ContactInfoCard
            icon={<Mail size={20} />}
            title={t("cards.general.title")}
            description={t("cards.general.description")}
          />

          <ContactInfoCard
            icon={<MessageCircle size={20} />}
            title={t("cards.response.title")}
            description={t("cards.response.description")}
          />

          <ContactInfoCard
            icon={<MapPin size={20} />}
            title={t("cards.coverage.title")}
            description={t("cards.coverage.description")}
          />
        </div>

        <form
          action={contactAction}
          className="flex h-full items-center justify-center rounded-3xl border border-black/10 bg-white p-5 shadow-sm md:p-8"
        >
          <div className="w-full max-w-2xl">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label={t("form.name")}
                name="name"
                placeholder={t("form.namePlaceholder")}
                required
              />

              <FormInput
                label={t("form.email")}
                name="email"
                type="email"
                placeholder={t("form.emailPlaceholder")}
                required
              />
            </div>

            <FormInput
              label={t("form.subject")}
              name="subject"
              placeholder={t("form.subjectPlaceholder")}
              className="mt-4"
            />

            <div className="mt-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]">
                {t("form.message")}
              </label>
              <textarea
                name="message"
                required
                rows={7}
                placeholder={t("form.messagePlaceholder")}
                className="w-full resize-none rounded-2xl border border-black/10 bg-[#FAF9F7] px-5 py-4 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/40 focus:border-[#d8bd8d]"
              />
            </div>

            <button
              type="submit"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#d8bd8d] px-6 py-4 text-sm font-semibold text-[#061A2D] transition hover:bg-[#f4e4c6] active:scale-[0.98]"
            >
              {t("form.submit")}
              <Send size={17} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

function ContactInfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#FAF9F7] text-[#d8bd8d]">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-[#283C5D]">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[#283C5D]/65">
        {description}
      </p>
    </div>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  required,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#283C5D]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-full border border-black/10 bg-[#FAF9F7] px-5 py-3 text-sm text-[#283C5D] outline-none transition placeholder:text-[#283C5D]/40 focus:border-[#d8bd8d]"
      />
    </div>
  );
}