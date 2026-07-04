"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import AdminDoctorMediaManager from "@/components/dashboard/admin/AdminDoctorMediaManager";
import AdminStatsCards from "@/components/dashboard/admin/AdminStatsCards";
import AdminUsersTable from "@/components/dashboard/admin/AdminUsersTable";
import CatalogueAdminManager from "@/components/dashboard/admin/CatalogueAdminManager";
import ConsultationBookingsAnalytics from "@/components/dashboard/admin/ConsultationBookingsAnalytics";
import ConsultationBookingsTable from "@/components/dashboard/admin/ConsultationBookingsTable";
import DoctorPlansCard from "@/components/dashboard/admin/DoctorPlansCard";
import DoctorProfilesPlanTable from "@/components/dashboard/admin/DoctorProfilesPlanTable";
import RefundRequestsManager from "@/components/dashboard/admin/RefundRequestsManager";
import InstagramReelsAdmin from "@/components/dashboard/admin/InstagramReelsAdmin";

const ADMIN_TAB_IDS = [
  "overview",
  "doctors",
  "bookings",
  "users",
  "catalogue",
] as const;

type AdminTabId = (typeof ADMIN_TAB_IDS)[number];

type AdminTab = {
  id: AdminTabId;
  label: string;
  description: string;
};

const ADMIN_TABS: AdminTab[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Monitor platform activity and key user metrics.",
  },
  {
    id: "doctors",
    label: "Doctors",
    description: "Manage doctor plans, profiles, and media.",
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Review consultation bookings, analytics, and refund requests.",
  },
  {
    id: "users",
    label: "Users",
    description: "Manage platform users and account access.",
  },
  {
    id: "catalogue",
    label: "Catalogue",
    description: "Manage catalogue content used across the platform.",
  },
];

function getTabClassName(isActive: boolean): string {
  const baseClassName =
    "rounded-full px-4 py-2 text-sm font-semibold transition";

  if (isActive) {
    return `${baseClassName} bg-[#283C5D] text-white shadow-sm`;
  }

  return `${baseClassName} text-[#283C5D]/60 hover:bg-[#283C5D]/5 hover:text-[#283C5D]`;
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-[#283C5D]">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
        {description}
      </p>
    </div>
  );
}

function TabPanel({
  activeTab,
}: {
  activeTab: AdminTabId;
}): ReactNode {
  if (activeTab === "overview") {
    return (
      <section className="mt-8">
        <SectionHeader
          title="Overview"
          description="Monitor platform activity and key user metrics."
        />

        <div className="grid gap-5 md:grid-cols-3">
          <AdminStatsCards />
        </div>
        <InstagramReelsAdmin/>
      </section>
    );
  }

  if (activeTab === "doctors") {
    return (
      <section className="mt-8">
        <SectionHeader
          title="Doctors"
          description="Manage doctor subscriptions, profile plans, and doctor media."
        />

        <div className="space-y-8">
          <DoctorPlansCard />
          <DoctorProfilesPlanTable />
          <AdminDoctorMediaManager />
        </div>
      </section>
    );
  }

  if (activeTab === "bookings") {
    return (
      <section className="mt-8">
        <SectionHeader
          title="Bookings"
          description="Track consultation booking performance and manage refund requests."
        />

        <div className="space-y-8">
          <ConsultationBookingsAnalytics />
          <ConsultationBookingsTable />
          <RefundRequestsManager />
        </div>
      </section>
    );
  }

  if (activeTab === "users") {
    return (
      <section className="mt-8">
        <SectionHeader
          title="Users"
          description="Review and manage all platform user accounts."
        />

        <AdminUsersTable />
      </section>
    );
  }

  return (
    <section className="mt-8">
      <SectionHeader
        title="Catalogue"
        description="Manage specialties, procedures, categories, and catalogue data."
      />

      <CatalogueAdminManager />
    </section>
  );
}

export default function AdminPanelPage() {
  const [activeTab, setActiveTab] = useState<AdminTabId>("overview");

  const activeTabDetails =
    ADMIN_TABS.find((tab: AdminTab) => tab.id === activeTab) ?? ADMIN_TABS[0];

  return (
    <main className="min-h-screen bg-[#FAF9F7] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8bd8d]">
          Admin
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#283C5D]">
          Admin Panel
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
          {activeTabDetails.description}
        </p>

        <div className="mt-8 overflow-x-auto rounded-full border border-[#283C5D]/10 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {ADMIN_TABS.map((tab: AdminTab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={getTabClassName(activeTab === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <TabPanel activeTab={activeTab} />
      </div>
    </main>
  );
}