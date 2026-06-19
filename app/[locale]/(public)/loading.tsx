import Loading from "@/components/UI/loaders/Loading";

export default function LoadingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF9F7]">
      <Loading label="Chargement…" />
    </main>
  );
}