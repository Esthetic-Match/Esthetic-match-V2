import DoctorProceduresManager from "@/components/dashboard/doctor/DoctorProceduresManager";

export default function DoctorProceduresPage() {
  return (
    <main className="min-h-screen bg-[#FAF9F7] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D8BD8D]">
          Treatments
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#283C5D]">
          Procedures & pricing
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#283C5D]/60">
          Manage the prices and information patients see for the procedures you offer.
        </p>

        <div className="mt-8">
          <DoctorProceduresManager />
        </div>
      </div>
    </main>
  );
}