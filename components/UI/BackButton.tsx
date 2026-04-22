type BackButtonProps = {
  onBack: () => void;
};

export default function BackButton({ onBack }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="text-sm text-gray-500 underline underline-offset-4"
    >
      Back
    </button>
  );
}