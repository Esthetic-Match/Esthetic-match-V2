import Image from "next/image";
import BackButton from "@/components/UI/BackButton";

type BlueBannerProps = {
  variant?: "blue" | "gold";
};

export default function BlueBanner({ variant = "blue" }: BlueBannerProps) {
  const isGold = variant === "gold";

  return (
    <div
      className={`relative w-full py-10 flex flex-col items-center justify-center z-10 ${
        isGold
          ? "bg-[#d8bd8d]"
          : "bg-[#35445D]"
      }`}
    >
      {/* subtle radial glow (only on blue for contrast) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)]" />


      <div className="relative flex flex-col items-center">
        <Image
          src={isGold ? "/logoBlue.svg" : "/logo.svg"}
          alt="Esthetic Match"
          width={80}
          height={80}
          className="mb-3"
        />

        <p
          className={`text-xs font-semibold uppercase tracking-[0.25em] ${
            isGold ? "text-[#0f233f]" : "text-white"
          }`}
        >
          Esthetic Match
        </p>
      </div>

      <BackButton onBack={() => {}} variant={isGold ? "dark" : "light"} />
    </div>
  );
}