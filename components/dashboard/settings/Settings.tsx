"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ChevronRight,
  Edit3,
  Lock,
  Globe,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Landmark,
  X,
  ClipboardList,
} from "lucide-react";
import TermsAndConditions from "./TermsAndCondition";
import LanguageSelector from "./LanguageSelector";
import ReportProblem from "./ReportProblem";
import ChangePassword from "./ChangePassword";
import PatientEditProfile from "./PatientEditProfile";
import DoctorEditProfile from "./DoctorEditProfile";
import PaymentDetails from "./PaymentDetails";
import DeleteAccount from "./DeleteAccount";
import { useSearchParams } from "next/navigation";

type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

type PatientProfile = {
  id: string;
  userId: string;
  avatar: string | null;
  gender: string | null;
  phoneNumber: string | null;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  googlePlaceId: string | null;
  favorite: string[];
  preferredConsultationType: string | null;
  preferredLanguage: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type DoctorProfile = {
  id: string;
  userId: string;
  slug: string | null;

  avatar: string | null;
  yearsOfExperience: number | null;
  clinicName: string;
  clinicBanner: string | null;

  specialtyIds: string[];
  subcategoryIds: string[];
  procedureIds: string[];
  subzoneIds: string[];
  topThree: string[];

  workAddress: string;
  city: string | null;
  country: string | null;
  zipCode: string | null;
  workLatitude: number | null;
  workLongitude: number | null;
  googlePlaceId: string | null;


  currency: string;
  RPPS: string | null;

  inClinicPrice: number | null;
  onlineConsulPrice: number | null;
  onlineActive: boolean;
  inClinicLink: string | null;

  stripeCustomerId: string | null;

  stripeConnectAccountId: string | null;
  stripeConnectOnboardingComplete: boolean;
  stripeConnectChargesEnabled: boolean;
  stripeConnectPayoutsEnabled: boolean;

  socialMediaLink: string | null;
  bookingLinks: string[];
  googleRating: number | null;
  googleReviewCount: number | null;
  googleMapsUri: string | null;

  otherSpecialtyText: string | null;

  createdAt: Date;
  updatedAt: Date;
};

type SettingsUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  dateOfBirth: string | null;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  image: string | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
};

type SettingsProps = {
  user: SettingsUser;
};

type SettingsPage =
  | "Edit Profile"
  | "Change Password"
  | "Payment Details"
  | "Language"
  | "Report a Problem"
  | "Terms & Conditions"
  | "Delete Account";

const settingsGroups = [
  [
    { label: "Edit Profile", icon: Edit3, danger: false },
    { label: "Change Password", icon: Lock, danger: false },
    { label: "Payment Details", icon: Landmark, danger: false },
  ],
  [
    { label: "Language", icon: Globe, danger: false },
    { label: "Report a Problem", icon: AlertCircle, danger: false },
    { label: "Terms & Conditions", icon: ShieldCheck, danger: false },
  ],
  [{ label: "Delete Account", icon: Trash2, danger: true }],
] as const;

function SettingsRow({
  label,
  icon: Icon,
  danger,
  onClick,
}: {
  label: SettingsPage;
  icon: React.ElementType;
  danger?: boolean;
  onClick: () => void;
}) {
  const t = useTranslations("settings.settings");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center justify-between rounded-full bg-white 
      px-4 py-3 text-left text-sm text-black transition hover:bg-gray-300 active:scale-[0.99]"
    >
      <span className="flex items-center gap-3">
        <Icon size={16} className={danger ? "text-red-500" : "text-black"} />
        <span className={danger ? "text-red-500" : "text-black"}>
          {t(`pages.${label}`)}
        </span>
      </span>

      <ChevronRight
        size={16}
        className={danger ? "text-red-500" : "text-black"}
      />
    </button>
  );
}

function SettingsSidebar({
  activePage,
  setActivePage,
  user,
}: {
  activePage: SettingsPage;
  setActivePage: (page: SettingsPage) => void;
  user: {
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
}) {
  const t = useTranslations("settings.settings");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  function handleSelectPage(page: SettingsPage) {
    setActivePage(page);
    setIsMobileOpen(false);
  }

  return (
    <aside className="w-full bg-[#283c5d] p-4 md:h-full md:w-80">
      {/* Mobile Header */}
      <div className="flex flex-col items-center gap-3 text-center md:hidden">
        <div>
          <p className="text-xs text-white/60">{t("title")}</p>

          <h1 className="text-lg font-semibold text-white">
            {t(`pages.${activePage}`)}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex h-9 min-w-[96px] items-center justify-center rounded-full bg-[#D8BD8D] px-6 text-[#283C5D] transition hover:bg-[#F6C467] active:scale-[0.98]"
        >
          {isMobileOpen ? (
            <X size={18} className="shrink-0" />
          ) : (
            <ClipboardList size={18} className="shrink-0" />
          )}
        </button>
      </div>

      {/* Sidebar Content */}
      <div
        className={`
          ${isMobileOpen ? "block" : "hidden"}
          max-md:max-h-[calc(100vh-90px)]
          max-md:overflow-y-auto
          md:block
        `}
      >
        <h1 className="mb-6 mt-6 text-center text-lg font-semibold text-white md:mt-0">
          {t("profile")}
        </h1>

        <div className="mb-8 flex flex-col items-center">
          {user.image ? (
            <Image
              src={user.image}
              alt={t("profileImageAlt")}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold text-white">
              {initials}
            </div>
          )}

          <p className="mt-3 text-base font-medium text-white">
            {user.name ?? t("unnamedUser")}
          </p>

          <p className="text-xs text-white/60">{user.email}</p>
        </div>

        <p className="mb-3 text-sm font-medium text-white">{t("title")}</p>

        <div className="mb-5 space-y-5">
          {settingsGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="space-y-3 border-b border-white/10 pb-5 last:border-b-0"
            >
              {group
                .filter((item) => {
                  if (item.label === "Payment Details" && user.role === "PATIENT") {
                    return false;
                  }

                  return true;
                })
                .map((item) => (
                  <SettingsRow
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    danger={item.danger}
                    onClick={() => handleSelectPage(item.label)}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}


export default function Settings({ user }: SettingsProps) {
const searchParams = useSearchParams();

const tab = searchParams.get("tab");

function getInitialPage(): SettingsPage {
  switch (tab) {
    case "payment":
      return "Payment Details";

    case "language":
      return "Language";

    case "report":
      return "Report a Problem";

    case "terms":
      return "Terms & Conditions";

    case "delete":
      return "Delete Account";

    case "password":
      return "Change Password";

    default:
      return "Edit Profile";
  }
}

const [activePage, setActivePage] =
  useState<SettingsPage>(getInitialPage);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const updateHeight = () => {
      if (!sidebarRef.current) return;
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen w-full pl-2 pt-2 pr-2">
      <div className="mx-auto flex h-full w-full max-w-8xl overflow-hidden rounded-xl bg-white shadow-xl max-md:flex-col">
        <SettingsSidebar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
        />

        <main className="flex-1 h-full overflow-y-auto bg-[#FAF9F7] p-6 md:p-10">
          {activePage === "Edit Profile" &&
            (user.role === "DOCTOR" ? (
              <DoctorEditProfile
                user={user}
                doctorProfile={user.doctorProfile}
              />
            ) : (
              <PatientEditProfile user={user} />
            ))}

          {activePage === "Change Password" && <ChangePassword />}
          {activePage === "Payment Details" && <PaymentDetails doctorProfile={user.doctorProfile!}/>}
          {activePage === "Language" && <LanguageSelector />}
          {activePage === "Report a Problem" && <ReportProblem />}
          {activePage === "Terms & Conditions" && <TermsAndConditions />}
          {activePage === "Delete Account" && <DeleteAccount />}
        </main>
      </div>
    </div>
  );
}