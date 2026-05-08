import { LinkIcon, Share2 } from "lucide-react";
import CardTitle from "../UI/CardTitle";
import UpgradeButton from "../UI/UpgradeButton";
import SocialLockedRow from "../UI/SocialLockedRow";
import GoogleReviewsButton from "../UI/GoogleReviewsButton";

type SocialLinksProps = {
  socialMediaLink?: string | null;
  clinicName?: string | null;
  workAddress?: string | null;
  city?: string | null;
  country?: string | null;
  workLatitude?: number | null;
  workLongitude?: number | null;
  googlePlaceId?: string | null;
};

export default function SocialLinks({
  socialMediaLink,
  clinicName,
  workAddress,
  city,
  country,
  workLatitude,
  workLongitude,
  googlePlaceId,
}: SocialLinksProps) {
  return (
    <div className="rounded-3xl border border-gray-300/10 bg-white p-6 shadow-lg md:p-8">
      <CardTitle icon={<Share2 size={22} />} title="Social Media" />

      {socialMediaLink ? (
        <a
          href={socialMediaLink}
          target="_blank"
          rel="noreferrer"
          className="mt-10 inline-flex w-full items-center justify-center rounded-full border border-[#d8bd8d]/60 px-6 py-2.5 text-sm font-semibold text-[#283C5D] transition hover:bg-[#d8bd8d]/10"
        >
          <LinkIcon size={15} className="mr-2" />
          Open social media
        </a>
      ) : (
        <div className="mt-8">
          <GoogleReviewsButton
            clinicName={clinicName}
            workAddress={workAddress}
            city={city}
            country={country}
            workLatitude={workLatitude}
            workLongitude={workLongitude}
            googlePlaceId={googlePlaceId}
          />

          <SocialLockedRow locked={true} label="Instagram" iconSrc="/icons/igIcon.svg" />
          <SocialLockedRow locked={true} label="TikTok" iconSrc="/icons/tiktokIcon.svg" />

          <div className="mt-7 text-center">
            <p className="text-sm font-medium text-[#283C5D]">
              Social links are hidden
            </p>
            <p className="mt-1 text-sm text-[#283C5D]/60">
              Upgrade to Premium to display
            </p>

            <UpgradeButton />
          </div>
        </div>
      )}
    </div>
  );
}