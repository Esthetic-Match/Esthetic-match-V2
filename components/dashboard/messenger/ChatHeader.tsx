import Image from "next/image";
import type { OtherPerson } from "./types";
import { getInitials } from "./utils";

type ChatHeaderProps = {
  person: OtherPerson | null;
  subtitle: string;
};

export default function ChatHeader({ person, subtitle }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-4 border-b border-[#283C5D]/10 bg-white px-6 py-5">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#283C5D]/10 text-[#283C5D]">
        {person?.image ? (
          <Image
            src={person.image}
            alt={person.name || "Profile"}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-sm font-bold">
            {getInitials(person?.name, person?.email)}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#283C5D]">{person?.name}</h2>
        <p className="text-sm text-[#283C5D]/50">{subtitle}</p>
      </div>
    </div>
  );
}