"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

import AdminDoctorMediaManager from "@/components/dashboard/admin/AdminDoctorMediaManager";
import AdminStatsCards from "@/components/dashboard/admin/AdminStatsCards";
import AdminUsersTable from "@/components/dashboard/admin/AdminUsersTable";
import CatalogueAdminManager from "@/components/dashboard/admin/CatalogueAdminManager";
import ConsultationBookingsAnalytics from "@/components/dashboard/admin/ConsultationBookingsAnalytics";
import ConsultationBookingsTable from "@/components/dashboard/admin/ConsultationBookingsTable";
import RefundRequestsManager from "@/components/dashboard/admin/RefundRequestsManager";
import InstagramReelsAdmin from "@/components/dashboard/admin/InstagramReelsAdmin";
import AdminBeforeAfterPanel from "@/components/dashboard/admin/AdminBeforeAfterPanel";
import DoctorReviewInvitationManager from "@/components/dashboard/admin/DoctorReviewInvitationManager";
import AdminDoctorProcedures from "@/components/dashboard/admin/AdminDoctorProcedures";
import TopThreeAdmin from "@/components/dashboard/admin/TopThreeAdmin";
import AdminDoctorSocialMedia from "@/components/dashboard/admin/AdminDoctorSocialMedia";

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

function getTabClassName(
  isActive: boolean
): string {
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
      <h2 className="text-xl font-bold text-[#283C5D]">
        {title}
      </h2>

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
  const t = useTranslations(
    "admin.adminPanelPage"
  );

  if (activeTab === "overview") {
    return (
      <section className="mt-8">
        <SectionHeader
          title={t("tabs.overview.label")}
          description={t(
            "tabs.overview.sectionDescription"
          )}
        />

        <div className="grid gap-5 md:grid-cols-3">
          <AdminStatsCards />
        </div>

        <InstagramReelsAdmin />
      </section>
    );
  }

  if (activeTab === "doctors") {
    return (
      <section className="mt-8">
        <SectionHeader
          title={t("tabs.doctors.label")}
          description={t(
            "tabs.doctors.sectionDescription"
          )}
        />

        <div className="space-y-8">
          <AdminDoctorMediaManager />

          <DoctorReviewInvitationManager />

          <AdminDoctorProcedures />

          <TopThreeAdmin />

          <AdminDoctorSocialMedia />

          <AdminBeforeAfterPanel />
        </div>
      </section>
    );
  }

  if (activeTab === "bookings") {
    return (
      <section className="mt-8">
        <SectionHeader
          title={t("tabs.bookings.label")}
          description={t(
            "tabs.bookings.sectionDescription"
          )}
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
          title={t("tabs.users.label")}
          description={t(
            "tabs.users.sectionDescription"
          )}
        />

        <AdminUsersTable />
      </section>
    );
  }

  return (
    <section className="mt-8">
      <SectionHeader
        title={t("tabs.catalogue.label")}
        description={t(
          "tabs.catalogue.sectionDescription"
        )}
      />

      <CatalogueAdminManager />
    </section>
  );
}

export default function AdminPanelPage() {
  const t = useTranslations(
    "admin.adminPanelPage"
  );

  const [activeTab, setActiveTab] =
    useState<AdminTabId>("overview");

  const adminTabs: AdminTab[] = [
    {
      id: "overview",
      label: t("tabs.overview.label"),
      description: t(
        "tabs.overview.description"
      ),
    },
    {
      id: "doctors",
      label: t("tabs.doctors.label"),
      description: t(
        "tabs.doctors.description"
      ),
    },
    {
      id: "bookings",
      label: t("tabs.bookings.label"),
      description: t(
        "tabs.bookings.description"
      ),
    },
    {
      id: "users",
      label: t("tabs.users.label"),
      description: t(
        "tabs.users.description"
      ),
    },
    {
      id: "catalogue",
      label: t("tabs.catalogue.label"),
      description: t(
        "tabs.catalogue.description"
      ),
    },
  ];

  const activeTabDetails =
    adminTabs.find(
      (tab: AdminTab) =>
        tab.id === activeTab
    ) ?? adminTabs[0];

  return (
    <main className="min-h-screen bg-[#FAF9F7] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d8bd8d]">
          {t("eyebrow")}
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#283C5D]">
          {t("title")}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
          {activeTabDetails.description}
        </p>

        <div className="mt-8 overflow-x-auto rounded-full border border-[#283C5D]/10 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-2">
            {adminTabs.map(
              (tab: AdminTab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={getTabClassName(
                    activeTab === tab.id
                  )}
                >
                  {tab.label}
                </button>
              )
            )}
          </div>
        </div>

        <TabPanel activeTab={activeTab} />
      </div>
    </main>
  );
}