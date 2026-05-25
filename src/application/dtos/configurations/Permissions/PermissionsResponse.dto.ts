export interface PermissionsResponseDto{
    permissionsId: number;
    businessId: number;
    permissionsCode?: string;
    permissionsName: string;
    permissionsDescription?: string;
    status: string;
    permissionsCount: number;
}