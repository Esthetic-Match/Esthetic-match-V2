import Image from "next/image";
import { ImageIcon, Lock } from "lucide-react";
import { Link } from "@/i18n/navigation";

type PhotoGalleryProps = {
  userId: string;
};

type BeforeAfterCardProps = {
  beforeImage: string;
  afterImage: string;
};

const dummyGallery = [
  {
    beforeImage: "/dev/gallery-before-1.jpg",
    afterImage: "/dev/gallery-before-1.jpg",
  },
  {
    beforeImage: "/dev/gallery-before-1.jpg",
    afterImage: "/dev/gallery-before-1.jpg",
  },
  {
    beforeImage: "/dev/gallery-before-1.jpg",
    afterImage: "/dev/gallery-before-1.jpg",
  },
];

export default function PhotoGallery({ userId }: PhotoGalleryProps) {
  const gallery = dummyGallery;
  const isEmpty = gallery.length === 0;

  if (isEmpty) {
    return (
      <section className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
        <p className="text-sm text-[#283C5D]/50">Your gallery is empty.</p>
      </section>
    );
  }

  return (
    <section className="relative z-20 mx-auto mt-6 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ImageIcon size={21} className="text-[#d8bd8d]" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#283C5D]">
            My Photo Gallery{" "}
            <span className="font-medium text-[#283C5D]/40">(5/10)</span>
          </h2>
        </div>

        <Link
          href="/dashboard/settings"
          className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-medium text-[#283C5D] shadow-sm transition hover:bg-[#FAF9F7] active:scale-[0.98]"
        >
          Edit gallery
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_160px]">
        {gallery.slice(0, 3).map((item, index) => (
          <BeforeAfterCard
            key={`${userId}-${index}`}
            beforeImage={item.beforeImage}
            afterImage={item.afterImage}
          />
        ))}

        <div className="flex min-h-[190px] flex-col items-center justify-center rounded-2xl bg-[#07182A]/80 p-5 text-center text-white backdrop-blur-md">
          <Lock size={26} className="mb-4 text-[#d8bd8d]" />
          <p className="text-lg font-semibold">+5 more</p>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            Upgrade to Premium to see all your results
          </p>
        </div>
      </div>

      <div className="mt-7 text-center">
        <p className="text-sm text-[#283C5D]/45">
          Only 5 results are visible on your profile
        </p>

        <Link
          href="/dashboard/settings"
          className="mt-1 inline-flex text-sm font-medium text-[#d8bd8d] transition hover:text-[#283C5D]"
        >
          Upgrade to Premium to showcase up to 20 results
        </Link>
      </div>
    </section>
  );
}

function BeforeAfterCard({ beforeImage, afterImage }: BeforeAfterCardProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <GalleryImage src={beforeImage} label="Before" />
      <GalleryImage src={afterImage} label="After" />
    </div>
  );
}

function GalleryImage({ src, label }: { src: string; label: string }) {
  return (
    <div>
      <div className="relative h-40 overflow-hidden rounded-xl bg-[#FAF9F7]">
        <Image src={src} alt={label} fill sizes="150px" className="object-cover" />
      </div>

      <p className="mt-2 text-center text-xs font-medium text-[#283C5D]/65">
        {label}
      </p>
    </div>
  );
}