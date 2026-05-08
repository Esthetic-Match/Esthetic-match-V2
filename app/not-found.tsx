// "use client";

// import Image from "next/image";
// import { useRouter } from "@/i18n/navigation";
// import { ArrowLeft, Home } from "lucide-react";
// import "./globals.css";

// export default function NotFound() {
//   const router = useRouter();

//   return (
//     <main className="relative flex min-h-screen flex-col overflow-hidden text-black">
  
//   {/* Header */}
//   <div className="relative w-full py-10 flex flex-col items-center justify-center z-10 bg-[#35445D]">
//     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent_70%)]" />
//     <div className="relative flex flex-col items-center">
//       <Image
//         src="/logo.svg"
//         alt="Esthetic Match"
//         width={80}
//         height={80}
//         className="mb-3"
//       />
//     </div>
//   </div>

//   {/* Centered Content */}
//   <div className="flex flex-1 items-center justify-center px-6">
//     <section className="flex w-full max-w-2xl flex-col items-center rounded-[2rem] border border-white/70 bg-white/75 px-8 text-center">
    
//       <p className="mb-3 rounded-full border border-[#283C5D]/10 bg-[#283C5D]/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#283C5D]/60">
//         Error 404
//       </p>
//       <div className="mb-8 rounded-3xl bg-[#FAF9F7] p-6">
//         <Image
//           src="/images/404.svg"
//           alt="Page not found"
//           width={320}
//           height={320}
//           priority
//           className="h-auto w-64 md:w-80"
//         />
//       </div>

//       <h1 className="text-3xl font-bold tracking-tight text-[#283C5D] md:text-5xl">
//         Page not found
//       </h1>

//       <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
//         <button
//           type="button"
//           onClick={() => router.back()}
//           className="inline-flex items-center justify-center gap-2 rounded-full border border-[#283C5D]/15 bg-white px-6 py-3 text-sm font-semibold text-[#283C5D] transition hover:bg-[#283C5D]/5 active:scale-[0.98]"
//         >
//           <ArrowLeft size={16} />
//           BACK
//         </button>

//         <button
//           type="button"
//           onClick={() => router.push("/")}
//           className="inline-flex items-center justify-center gap-2 rounded-full bg-[#283C5D] 
//           px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#283C5D]/20 transition 
//           hover:opacity-90 active:scale-[0.98]"
//         >
//           <Home size={16} />
//           HOME
//         </button>
//       </div>

//     </section>
//   </div>
// </main>
//   );
// }

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1>404 - Page not found</h1>
    </main>
  );
}