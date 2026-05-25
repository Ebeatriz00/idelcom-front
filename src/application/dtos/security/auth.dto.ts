export interface AuthResponseDto {
  usersId: string;
  workerId?: string;
  businessId: string | null;
  businessName: string;
  usersName: string;
  userPhoto: string | null;
  usersLastName: string;
  profilesName: string;
  apiToken: string | null;
  refreshToken: string | null;
  codeLicense: string;
  businessRuc: string;
  message: string;
  status: string;

  areasId: number;
  usersVisibiliyId: number;
}

export interface AuthRequestDto {
  usersKey: string;
  usersPassword: string;
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export type AuthBootstrapDto = {
  allowedModuleCodes: string[];
  effectiveList: string[];
  allowedModules: {
    modulesId: number;
    code: string;
    label: string;
    path: string | null;
    iconKey: string | null;
    parentModulesId: number | null;
    parentId: number | null;
    orderNo: number | null;
  }[];
  hash: string;
};

export type AuthSessionDto = {
  authenticated: boolean;
  expiresAt: string | null;
  remainingSeconds: number;
};

export type Mod = {
  modulesId: number;
  code: string;
  label: string;
  path: string | null;
  iconKey: string | null;
  parentModulesId: number | null;
  parentId: number | null;
  orderNo: number | null;
};

export type ModNode = Mod & { children: ModNode[] };
