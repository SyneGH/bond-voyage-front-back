import { HTTP_STATUS } from "@/constants/constants";
import { AuthenticatedRequest } from "@/types";
import { throwError } from "@/utils/responseHandler";

type AuthUser = NonNullable<AuthenticatedRequest["user"]>;

export const requireAuthUser = (req: AuthenticatedRequest): AuthUser => {
  if (!req.user) {
    throwError(HTTP_STATUS.UNAUTHORIZED, "Unauthorized");
  }

  return req.user as AuthUser;
};
