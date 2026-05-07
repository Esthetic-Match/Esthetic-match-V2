"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Edit3,
  Lock,
  Globe,
  AlertCircle,
  ShieldCheck,
  Trash2,
  Gem,
} from "lucide-react";
import TermsAndConditions from "./TermsAndCondition";
import LanguageSelector from "./LanguageSelector";
import ReportProblem from "./ReportProblem";
import ChangePassword from "./ChangePassword";
import PatientEditProfile from "./PatientEditProfile";
import DoctorEditProfile from "./DoctorEditProfile";
import SubscriptionPlans from "./SubscriptionPlans";


type SettingsPage =
  | "Edit Profile"
  | "Change Password"
  | "Language"
  | "Report a Problem"
  | "Terms & Conditions"
  | "Subscription"
  | "Delete Account";

  type SettingsProps = {
  user: any;
};

const settingsGroups = [
  [
    { label: "Edit Profile", icon: Edit3, danger: false },
    { label: "Change Password", icon: Lock, danger: false },
    { label: "Subscription", icon: Gem, danger: false },
  ],
  [
    { label: "Language", icon: Globe, danger: false },
    { label: "Report a Problem", icon: AlertCircle, danger: false },
    { label: "Terms & Conditions", icon: ShieldCheck, danger: false },
  ],
  [
    { label: "Delete Account", icon: Trash2, danger: true },
  ]
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
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-full bg-white 
      px-4 py-3 text-left text-sm text-black transition hover:bg-gray-300 active:scale-[0.99]
      cursor-pointer"
    >
      <span className="flex items-center gap-3">
        <Icon size={16} className={danger ? "text-red-500" : "text-black"} />
        <span className={danger ? "text-red-500" : "text-black"}>{label}</span>
      </span>

      <ChevronRight size={16} className={danger ? "text-red-500" : "text-black"} />
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
  };
}) {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <aside className="h-full w-full bg-[#283c5d] p-4 md:w-80">
      <h1 className="mb-6 text-center text-lg font-semibold text-white">
        Profile
      </h1>

      <div className="mb-8 flex flex-col items-center">
        {user.image ? (
          <img
            src={user.image}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-2xl font-semibold text-white">
            {initials}
          </div>
        )}

        <p className="mt-3 text-base font-medium text-white">
          {user.name ?? "Unnamed User"}
        </p>

        <p className="text-xs text-white/60">{user.email}</p>
      </div>

      <p className="mb-3 text-sm font-medium text-white">Settings</p>

      <div className="space-y-5 mb-5">
        {settingsGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="space-y-3 border-b border-white/10 pb-5 last:border-b-0"
          >
            {group.map((item) => (
              <SettingsRow
                key={item.label}
                label={item.label}
                icon={item.icon}
                danger={item.danger}
                onClick={() => setActivePage(item.label)}
              />
            ))}
          </div>
        ))}
      </div>
    </aside>
  );
}
function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[400px] flex-col justify-center rounded-2xl bg-white p-8">
      <p className="text-sm uppercase tracking-wide text-[#283C5D]/60">
        Settings
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[#283C5D]">{title}</h2>
      <p className="mt-4 text-gray-500">
        Placeholder component for {title} untill everything else is ready.
      </p>
    </div>
  );
}

export default function Settings({ user }: SettingsProps) {
  const [activePage, setActivePage] = useState<SettingsPage>("Edit Profile");

  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState<number | null>(null);

  useEffect(() => {
    if (!sidebarRef.current) return;

    const updateHeight = () => {
      if (!sidebarRef.current) return;
      setSidebarHeight(sidebarRef.current.offsetHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(sidebarRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen w-full pl-2 pt-2">
      <div className="mx-auto flex h-full w-full max-w-8xl overflow-hidden rounded-t-xl rounded-tr-xl rounded-br-xl bg-white shadow-xl max-md:flex-col">

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
              <PatientEditProfile
                user={user}
                patientProfile={user.patientProfile}
              />
            ))}
          {activePage === "Change Password" && <ChangePassword />}
          {activePage === "Subscription" && <SubscriptionPlans />}
          {activePage === "Language" && <LanguageSelector />}
          {activePage === "Report a Problem" && <ReportProblem />}
          {activePage === "Terms & Conditions" && <TermsAndConditions />}
          {activePage === "Delete Account" && <PlaceholderPanel title="Delete Account" />}
        </main>

      </div>
    </div>
  );
}