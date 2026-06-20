// app/[locale]/doctors-near-me/DoctorsNearMeClient.tsx

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import DoctorCards, {
  type CardTranslations,
  type DoctorCardData,
  type SpecialtyTranslations,
} from "@/components/public/UI/DoctorCards";
import { Loader2, LocateFixed, MapPin, RefreshCw } from "lucide-react";

type DoctorCardDto = {
  id: string;
  slug: string;
  name: string;
  avatar: string | null;
  clinicName: string;
  city: string | null;
  country: string | null;
  specialtyIds: string[];
  procedureIds: string[];
  topThree: string[];
  yearsOfExperience: number | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  stripeConnectOnboardingComplete?: boolean;
  onlineActive?: boolean;
  currency: string;
  distanceKm: number | null;
};

type DoctorsNearMeResponse = {
  city: string | null;
  country: string | null;
  matchMode: "city" | "radius";
  radiusKm: number;
  doctors: DoctorCardDto[];
};

type LoadState =
  | "idle"
  | "loading-location"
  | "loading-doctors"
  | "success"
  | "error"
  | "denied";

const COPY = {
  en: {
    eyebrow: "Location-based matching",
    title: "Aesthetic doctors near you",
    description:
      "Allow location access and we’ll show qualified practitioners in your city first.",
    permissionCardTitle: "Use your current location",
    permissionCardText:
      "Your browser will ask for permission. We only use your coordinates to find nearby doctors and do not store them from this page.",
    useLocation: "Find doctors near me",
    loadingLocation: "Checking your browser location...",
    loadingDoctors: "Matching you with doctors in your area...",
    deniedTitle: "Location permission was not granted",
    deniedText:
      "Please enable location access in your browser settings, then try again.",
    errorTitle: "Could not load doctors near you",
    errorText:
      "Please try again, or use the main doctor search page to choose your city manually.",
    tryAgain: "Try again",
    foundIn: "Doctors found in",
    foundNearby: "Doctors found nearby",
    noDoctorsTitle: "No doctors found in your area yet",
    noDoctorsText:
      "We could not find matching doctors in your current city. Try the full search page to browse all available practitioners.",
    viewProfile: "View profile",
    from: "From",
    inClinic: "In clinic",
    online: "Online",
    years: "years",
    experience: "experience",
    verifiedProfile: "Verified profile",
    nearby: "nearby",
    searchAll: "Search all doctors",
    reviews: "reviews",
    free: "Free",
  },
  fr: {
    eyebrow: "Matching par localisation",
    title: "Médecins esthétiques près de vous",
    description:
      "Autorisez l’accès à votre localisation et nous afficherons d’abord les praticiens qualifiés dans votre ville.",
    permissionCardTitle: "Utiliser votre position actuelle",
    permissionCardText:
      "Votre navigateur demandera votre autorisation. Nous utilisons uniquement vos coordonnées pour trouver des médecins proches et ne les stockons pas depuis cette page.",
    useLocation: "Trouver des médecins près de moi",
    loadingLocation: "Vérification de votre localisation...",
    loadingDoctors: "Recherche de médecins dans votre zone...",
    deniedTitle: "L’accès à la localisation n’a pas été autorisé",
    deniedText:
      "Veuillez activer l’accès à la localisation dans les paramètres de votre navigateur, puis réessayer.",
    errorTitle: "Impossible de charger les médecins près de vous",
    errorText:
      "Veuillez réessayer ou utiliser la page de recherche principale pour choisir votre ville manuellement.",
    tryAgain: "Réessayer",
    foundIn: "Médecins trouvés à",
    foundNearby: "Médecins trouvés à proximité",
    noDoctorsTitle: "Aucun médecin trouvé dans votre zone pour le moment",
    noDoctorsText:
      "Nous n’avons pas trouvé de médecins correspondants dans votre ville actuelle. Essayez la recherche complète pour parcourir les praticiens disponibles.",
    viewProfile: "Voir le profil",
    from: "À partir de",
    inClinic: "En clinique",
    online: "En ligne",
    years: "ans",
    experience: "d’expérience",
    verifiedProfile: "Profil vérifié",
    nearby: "à proximité",
    searchAll: "Rechercher tous les médecins",
    reviews: "avis",
    free: "Gratuit",
  },
};

function humanizeId(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildSpecialtyTranslations(
  doctors: DoctorCardDto[]
): SpecialtyTranslations {
  const translations: SpecialtyTranslations = {};

  doctors.forEach((doctor) => {
    doctor.specialtyIds.forEach((id) => {
      translations[id] = humanizeId(id);
    });

    doctor.topThree.forEach((id) => {
      translations[id] = humanizeId(id);
    });
  });

  return translations;
}

function toDoctorCardData(doctor: DoctorCardDto): DoctorCardData {
  return {
    id: doctor.id,
    slug: doctor.slug,
    name: doctor.name,
    specialtyIds: doctor.specialtyIds,
    avatar: doctor.avatar ?? "/images/default-doctor.png",
    city: doctor.city,
    country: doctor.country,
    googleRating: doctor.googleRating,
    googleReviewCount: doctor.googleReviewCount,
    yearsOfExperience: doctor.yearsOfExperience,
    inClinicPrice: doctor.inClinicPrice,
    onlineConsulPrice: doctor.onlineConsulPrice,
    stripeConnectOnboardingComplete: doctor.stripeConnectOnboardingComplete,
    onlineActive: doctor.onlineActive,
    currency: doctor.currency,
    clinicName: doctor.clinicName,
    topThree: doctor.topThree,
  };
}

export default function DoctorsNearMeClient() {
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale === "fr" ? "fr" : "en";
  const copy = COPY[locale];

  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [data, setData] = useState<DoctorsNearMeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isLoading =
    loadState === "loading-location" || loadState === "loading-doctors";

  const cardTranslations: CardTranslations = useMemo(() => ({
    reviews: copy.reviews,
    free: copy.free,
    viewProfile: copy.viewProfile,
    verifiedProfile: copy.verifiedProfile,
    inClinic: copy.inClinic,
    online: copy.online,
    from: copy.from,
    years: copy.years,
    experience: copy.experience,
  }), [locale]);

  const specialtyTranslations = useMemo<SpecialtyTranslations>(() => {
    if (!data) return {};

    return buildSpecialtyTranslations(data.doctors);
  }, [data]);

  const statusText = useMemo(() => {
    if (loadState === "loading-location") return copy.loadingLocation;
    if (loadState === "loading-doctors") return copy.loadingDoctors;
    return null;
  }, [locale, loadState]);

// ✅ Stable: COPY[locale] is looked up at call time, not captured as a dependency
const loadDoctorsNearMe = useCallback(() => {
  setErrorMessage(null);
  setLoadState("loading-location");

  if (!navigator.geolocation) {
    setLoadState("error");
    setErrorMessage("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        setLoadState("loading-doctors");
        const response = await fetch("/api/public-pages/doctors-near-me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locale,
          }),
        });

        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.error || "Could not load doctors.");

        setData(result as DoctorsNearMeResponse);
        setLoadState("success");
      } catch (error) {
        setLoadState("error");
        // ✅ Read from COPY directly — stable reference
        setErrorMessage(
          error instanceof Error ? error.message : COPY[locale].errorText
        );
      }
    },
    () => setLoadState("denied"),
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 1000 * 60 * 5 }
  );
}, [locale]); // ✅ Only locale — a primitive string, stable between renders


useEffect(() => {
  loadDoctorsNearMe();
}, [loadDoctorsNearMe]);


  return (
    <main className="min-h-screen bg-[#FBF7F0]">
      <section className="relative overflow-hidden border-b border-[#CEB591]/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(206,181,145,0.35),transparent_34%),linear-gradient(135deg,#ffffff_0%,#FBF7F0_48%,rgba(241,225,198,0.55)_100%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-6 py-20 md:px-10 lg:flex-row lg:items-end lg:justify-between lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CEB591]/30 bg-white/75 px-4 py-2 text-sm font-bold text-[#283C5D] shadow-sm backdrop-blur">
              <LocateFixed className="h-4 w-4 text-[#CEB591]" />
              {copy.eyebrow}
            </div>

            <h1 className="mt-7 max-w-4xl text-4xl font-bold tracking-tight text-[#283C5D] md:text-6xl">
              {copy.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-[#283C5D]/65 md:text-lg">
              {copy.description}
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white/80 p-5 shadow-[0_24px_80px_rgba(40,60,93,0.1)] backdrop-blur md:min-w-[360px]">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E1C6] text-[#283C5D]">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <MapPin className="h-5 w-5" />
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-[#283C5D]">
                  {copy.permissionCardTitle}
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#283C5D]/60">
                  {statusText ?? copy.permissionCardText}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadDoctorsNearMe}
              disabled={isLoading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#CEB591] px-5 py-3 text-sm font-bold text-[#283C5D] transition hover:bg-[#c4a77d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {loadState === "idle" ? copy.useLocation : copy.tryAgain}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        {loadState === "denied" ? (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {copy.deniedTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {copy.deniedText}
            </p>
          </div>
        ) : null}

        {loadState === "error" ? (
          <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
            <h2 className="text-2xl font-bold text-[#283C5D]">
              {copy.errorTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
              {errorMessage ?? copy.errorText}
            </p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[470px] animate-pulse rounded-[2rem] border border-[#CEB591]/20 bg-white shadow-[0_24px_70px_rgba(40,60,93,0.06)]"
              />
            ))}
          </div>
        ) : null}

        {loadState === "success" && data ? (
          <>
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#CEB591]">
                  {data.matchMode === "city"
                    ? copy.foundIn
                    : copy.foundNearby}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#283C5D]">
                  {data.city
                    ? [data.city, data.country].filter(Boolean).join(", ")
                    : copy.nearby}
                </h2>
              </div>

              <Link
                href={`/${locale}/doctors`}
                className="inline-flex items-center justify-center rounded-full border border-[#283C5D]/15 bg-white px-5 py-3 text-sm font-bold text-[#283C5D] transition hover:border-[#CEB591] hover:bg-[#F1E1C6]/35"
              >
                {copy.searchAll}
              </Link>
            </div>

            {data.doctors.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {data.doctors.map((doctor) => (
                  <DoctorCards
                    key={doctor.id}
                    doctor={toDoctorCardData(doctor)}
                    t={cardTranslations}
                    specialtyT={specialtyTranslations}
                    showDetails={true}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-[#CEB591]/25 bg-white p-8 text-center shadow-[0_24px_70px_rgba(40,60,93,0.08)]">
                <h2 className="text-2xl font-bold text-[#283C5D]">
                  {copy.noDoctorsTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[#283C5D]/60">
                  {copy.noDoctorsText}
                </p>

                <Link
                  href={`/${locale}/doctors`}
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[#283C5D] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1f2f49]"
                >
                  {copy.searchAll}
                </Link>
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}