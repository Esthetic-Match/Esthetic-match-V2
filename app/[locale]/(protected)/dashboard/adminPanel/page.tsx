import AdminDoctorMediaManager from "@/components/dashboard/admin/AdminDoctorMediaManager";
import AdminStatsCards from "@/components/dashboard/admin/AdminStatsCards";
import AdminUsersTable from "@/components/dashboard/admin/AdminUsersTable";
import CatalogueAdminManager from "@/components/dashboard/admin/CatalogueAdminManager";
import ConsultationBookingsAnalytics from "@/components/dashboard/admin/ConsultationBookingsAnalytics";
import ConsultationBookingsTable from "@/components/dashboard/admin/ConsultationBookingsTable";
import DoctorPlansCard from "@/components/dashboard/admin/DoctorPlansCard";
import DoctorProfilesPlanTable from "@/components/dashboard/admin/DoctorProfilesPlanTable";
import RefundRequestsManager from "@/components/dashboard/admin/RefundRequestsManager";

export default function AdminPanelPage() {
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
          Monitor platform activity and key user metrics.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <AdminStatsCards />
        </div>

        <div className="mt-8">
          <DoctorPlansCard />
        </div>

        <div className="mt-8">
          <DoctorProfilesPlanTable />
        </div>

        <div className="mt-8">
          <AdminDoctorMediaManager />
        </div>

        <div className="mt-8">
          <ConsultationBookingsAnalytics />
        </div>

        <div className="mt-8">
          <ConsultationBookingsTable />
        </div>

        <div className="mt-8">
          <RefundRequestsManager />
        </div>

        <div className="mt-8">
          <AdminUsersTable />
        </div>

        <div className="mt-8">
          <CatalogueAdminManager />
        </div>
      </div>
    </main>
  );
}