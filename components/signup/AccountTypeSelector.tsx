import MessageText from "@/components/UI/MessageText";
import type { AccountTypeSelectorProps } from "@/app/sign-up/types";

export default function AccountTypeSelector({
  infoMessage,
  onSelectPatient,
  onSelectDoctor,
}: AccountTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Choose how you would like to sign up.
      </p>

      <button
        type="button"
        onClick={onSelectPatient}
        className="w-full rounded border px-4 py-3 text-left transition hover:bg-gray-50"
      >
        <span className="block font-medium">Sign up as Patient</span>
        <span className="mt-1 block text-sm text-gray-500">
          Create a patient account with email and password.
        </span>
      </button>

      <button
        type="button"
        onClick={onSelectDoctor}
        className="w-full rounded border px-4 py-3 text-left transition hover:bg-gray-50"
      >
        <span className="block font-medium">Sign up as Doctor</span>
        <span className="mt-1 block text-sm text-gray-500">
          This option will be available soon.
        </span>
      </button>

      <MessageText message={infoMessage} variant="info" />
    </div>
  );
}