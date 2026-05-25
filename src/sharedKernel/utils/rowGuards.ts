// shared/rowGuards.ts
export type RowGuardConfig<T> = {
  getInUse?: (row: T) => boolean;          
  getActive?: (row: T) => boolean;         
  canToggleWhenInUse?: boolean;            
  canDeleteWhenInUse?: boolean;          
};

export function createRowGuards<T>(cfg: RowGuardConfig<T>) {
  const {
    getInUse = () => false,
    getActive = () => false,
    canToggleWhenInUse = false,
    canDeleteWhenInUse = false,
  } = cfg;

  function isInUse(row: T) {
    return !!getInUse(row);
  }

  function isActive(row: T) {
    return !!getActive(row);
  }

  function canToggle(row: T) {
    const inUse = isInUse(row);
    return inUse ? canToggleWhenInUse : true;
  }

  function canDelete(row: T) {
    const inUse = isInUse(row);
    return inUse ? canDeleteWhenInUse : true;
  }

  return { isInUse, isActive, canToggle, canDelete };
}
