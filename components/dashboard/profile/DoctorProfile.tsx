import ClinicBannerManager from "./ClinicBannerManager";

export default function DoctorProfile({ user }: { user: { id: string } }) {
  return (
    <div className="p-2">
      <ClinicBannerManager doctorId={user.id} />
    </div>
  );
}