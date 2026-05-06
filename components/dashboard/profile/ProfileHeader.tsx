import Image from "next/image";
import { Camera, MapPin, Pencil, Building2, BadgeCheck } from "lucide-react";
import { formatLabel } from "@/utils/dashboard/helper";

type ProfileHeaderProps = {
  name: string;
  specialty?: string | null;
  clinicName?: string | null;
  workAddress?: string | null;
  avatar?: string | null;
  yearsOfExperience?: number | null;
  onEditProfile?: () => void;
  onEditAvatar?: () => void;
};

const fallbackAvatar = "/dev/profile-placeholder.jpg";

export default function ProfileHeader({
  name,
  specialty,
  clinicName,
  workAddress,
  avatar,
  yearsOfExperience,
  onEditProfile,
  onEditAvatar,
}: ProfileHeaderProps) {
    const initials = name
        ? name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "U";

  return (
    <section className="relative z-20 mx-auto -mt-16 w-[calc(100%-2rem)] max-w-6xl rounded-3xl border border-black/10 bg-white px-6 pb-8 pt-24 shadow-lg md:-mt-20 md:px-10 md:pt-10">
      <div className="absolute -top-20 left-6 md:left-10">
        <div className="relative h-40 w-40 rounded-full border-4 border-white bg-white shadow-md md:h-40 md:w-40">
            {avatar ? (
                <Image
                    src={avatar}
                    alt={`${name} profile photo`}
                    fill
                    sizes="160px"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="absolute  flex h-38 w-38 items-center justify-center rounded-full bg-[#283c5d] text-2xl font-semibold text-white">
                    {initials}
                  </div>
                )
            }
          <button
            type="button"
            onClick={onEditAvatar}
            className="absolute bottom-1 right-2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-[#283C5D] shadow-md transition hover:bg-[#FAF9F7] active:scale-[0.98]"
            aria-label="Edit profile photo"
          >
            <Camera size={18} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-8 md:ml-48 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#283C5D] md:text-3xl">
              {name}
            </h1>

            <BadgeCheck size={18} className="fill-[#d8bd8d] text-white" />
          </div>

          {specialty ? (
            <p className="mt-1 text-sm font-medium text-[#283C5D]/55">
              {formatLabel(specialty)}
            </p>
          ) : null}

          <div className="mt-5 space-y-3">
            {clinicName ? (
              <div className="flex items-center gap-3 text-sm font-medium text-[#283C5D]">
                <Building2 size={17} className="text-[#d8bd8d]" />
                <span>{clinicName}</span>
              </div>
            ) : null}

            {workAddress ? (
              <div className="flex items-center gap-3 text-sm text-[#283C5D]/75">
                <MapPin size={17} className="text-[#283C5D]/55" />
                <span>{workAddress}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-7 grid max-w-lg grid-cols-1 gap-6 border-t border-black/10 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                Specialty
              </p>

              <span className="mt-2 inline-flex rounded-full border border-black/10 bg-[#FAF9F7] px-4 py-1.5 text-xs font-medium text-[#283C5D]">
                {formatLabel(specialty) || "NA"}
              </span>
            </div>

            <div>
              <p className="text-xs font-medium text-[#283C5D]/45">
                Years of experience
              </p>

              <p className="mt-2 text-sm font-semibold text-[#283C5D]">
                {yearsOfExperience != null
                  ? `${yearsOfExperience} years`
                  : "Not Added"}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[#283C5D] shadow-sm transition hover:bg-[#FAF9F7] active:scale-[0.98]"
        >
          <Pencil size={15} />
          Edit profile
        </button>
      </div>
    </section>
  );
}