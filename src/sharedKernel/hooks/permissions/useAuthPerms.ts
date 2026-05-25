import { useAuthBootstrap } from "../security/useAuthBootstrap";

export function useAuthPerms() {
  const { data, isLoading, isError } = useAuthBootstrap();

  const effectiveList = data?.effectiveList ?? [];

  function hasRaw(permission: string) {
    return effectiveList.includes(permission);
  }

  function has(moduleCode: string, permissionName: string) {
    return hasRaw(`${moduleCode}:${permissionName}`);
  }

  return {
    isLoading,
    isError,
    effectiveList,
    has,
    hasRaw,
  };
}
