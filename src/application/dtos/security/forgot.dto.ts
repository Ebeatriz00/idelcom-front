export type ForgotPasswordRequest = {
  UsersKey: string;
  TenantId?: string;
};

export type VerifyResetCodeRequest = {
  UsersKey: string;
  TenantId?: string;
  Code: string;
};

export type ResetPasswordRequest = {
  UsersKey: string;    
  TenantId?: string;
  CodeOrToken: string;   
  NewPassword: string;
};

export type ValidateResetTokenRequest = {
  Token: string;
  TenantId?: string;
};

export type ValidateResetTokenResponse = {
  UsersKey: string;      
};