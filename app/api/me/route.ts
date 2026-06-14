import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { ApiError, apiSuccess } from "@/lib/api/error-handler";
import { withApiHandler } from "@/lib/api/with-api-handler";

export const GET = withApiHandler(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new ApiError("Unauthorized", 401, "UNAUTHORIZED");
  }

  return apiSuccess({
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: session.user.role,
    },
  });
});