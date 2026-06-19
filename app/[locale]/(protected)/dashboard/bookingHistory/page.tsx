import PatientBookingHistory from "@/components/dashboard/profile/patient/PatientBookingHistory";

export default function PatientPaymentsPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-5xl">
        <PatientBookingHistory />
      </div>
    </main>
  );
}