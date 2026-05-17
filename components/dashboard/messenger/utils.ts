import type { Conversation, MeUser, OtherPerson } from "./types";

export function getInitials(name?: string | null, email?: string) {
  const value = name || email || "U";

  return value
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatMessageTime(value: string) {
  const date = new Date(value);

  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(date);

  const formattedTime = new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${formattedDate} • ${formattedTime}`;
}

export function getOtherPerson(
  conversation: Conversation,
  me: MeUser | null
): OtherPerson | null {
  if (!me) return null;

  if (me.role === "PATIENT") {
    return {
      name:
        conversation.doctorProfile.user.name ||
        conversation.doctorProfile.clinicName,
      email: conversation.doctorProfile.user.email,
      image:
        conversation.doctorProfile.avatar ||
        conversation.doctorProfile.user.image,
      label: conversation.doctorProfile.clinicName,
    };
  }

  return {
    name: conversation.patientUser.name || "Patient",
    email: conversation.patientUser.email,
    image: conversation.patientUser.image,
    label: conversation.patientUser.email,
  };
}