import Image from "next/image";

export default function LumiLoadingDots() {
  return (
    <div className="flex items-start gap-3">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full shadow-sm">
        <Image
          src="/images/lumi.png"
          alt="Lumi"
          fill
          className="object-cover"
          sizes="36px"
        />
      </div>

      <div className="rounded-[1.4rem] rounded-tl-md border border-[#283C5D]/8 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[#283C5D]/60 [animation-delay:-0.3s]" />

          <span className="h-2 w-2 animate-bounce rounded-full bg-[#283C5D]/60 [animation-delay:-0.15s]" />

          <span className="h-2 w-2 animate-bounce rounded-full bg-[#283C5D]/60" />
        </div>
      </div>
    </div>
  );
}