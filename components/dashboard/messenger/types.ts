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

export type MessageAttachment = {
  id: string;
  objectPath: string;
  readUrl: string;
  fileName: string | null;
  contentType: string;
  sizeBytes: number | null;
  createdAt?: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: "PATIENT" | "DOCTOR";

  messageType: "TEXT" | "IMAGE" | "MIXED";

  text: string;

  attachments: MessageAttachment[];

  createdAt: string;
  readAt?: string | null;
  editedAt?: string | null;
  deletedAt?: string | null;
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