type MessageTextProps = {
  message: string;
  variant: "error" | "info";
};

export default function MessageText({
  message,
  variant,
}: MessageTextProps) {
  if (!message) return null;

  return (
    <p className={variant === "error" ? "text-sm text-red-600" : "text-sm text-blue-600"}>
      {message}
    </p>
  );
}