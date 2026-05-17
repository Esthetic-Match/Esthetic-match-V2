export type ConversationUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type Conversation = {
  id: string;
  status: "ACTIVE" | "CLOSED";
  lastMessageAt: string | null;
  unreadCount: number;
  patientUser: ConversationUser;
  doctorProfile: {
    id: string;
    clinicName: string;
    avatar: string | null;
    user: ConversationUser;
  };
};

export type Message = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: "PATIENT" | "DOCTOR";
  text: string;
  createdAt: string;
};

export type MeUser = {
  id: string;
  role: "PATIENT" | "DOCTOR";
};

export type OtherPerson = {
  name: string;
  email: string;
  image: string | null;
  label: string;
};