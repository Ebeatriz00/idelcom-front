import http from "@infrastructure/http/httpClient";
import type {
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  ValidateResetTokenRequest,
  ValidateResetTokenResponse,
} from "@dtos/security/forgot.dto";

export async function requestForgotPassword(payload: ForgotPasswordRequest) {
  return http.post("/Auth/ForgotPassword", {
    userskey: payload.UsersKey,
    tenantId: payload.TenantId,
  });
}

export async function verifyResetCode(payload: VerifyResetCodeRequest) {
  return http.post("/Auth/VerifyResetCode", {
    userskey: payload.UsersKey,
    tenantId: payload.TenantId,
    code: payload.Code,
  });
}

export async function resetPassword(payload: ResetPasswordRequest) {
  return http.post("/Auth/ResetPassword", {
    userskey: payload.UsersKey,
    tenantId: payload.TenantId,
    codeOrToken: payload.CodeOrToken,
    newPassword: payload.NewPassword,
  });
}

// validar token del enlace
export async function validateResetToken(
  payload: ValidateResetTokenRequest
): Promise<ValidateResetTokenResponse> {
  const { data } = await http.post<ValidateResetTokenResponse>(
    "/Auth/ValidateResetToken",
    { token: payload.Token, tenantId: payload.TenantId }
  );
  return data;
}
