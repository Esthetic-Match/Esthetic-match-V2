import PostOpInvitationClient from "@/components/public/post-op/PostOpInvitationClient";

type Props = {
  params: Promise<{
    locale: string;
    token: string;
  }>;
};

export default async function PostOpInvitationPage({
  params,
}: Props) {
  const {
    token,
  } = await params;

  return (
    <PostOpInvitationClient
      token={token}
    />
  );
}