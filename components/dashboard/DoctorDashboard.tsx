import DoctorDashboardHeader from "@/components/dashboard/doctor/DoctorDashboardHeader";
import DoctorLikeDash from "./doctor/DoctorLikeDash";
import DoctorReviewDash from "./doctor/DoctorReviewDash";

export default function DoctorDashboard() {
  return (
    <main className="min-h-screen bg-[#F7F7F5] p-4 sm:p-6 md:p-10">
      <div className="mx-auto w-full max-w-7xl">
        <DoctorDashboardHeader />

        <DoctorLikeDash />

        <DoctorReviewDash />
      </div>
    </main>
  );
}