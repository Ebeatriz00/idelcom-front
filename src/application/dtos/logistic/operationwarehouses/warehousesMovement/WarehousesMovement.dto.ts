export interface WarehousesMovementUpsertDto {
  movementTypeId: number;
  warehouseId: number;
  warehouseDestinationId: number;
  suppliersId: number;
  clientsId: number;
  taxesId?: number;
  series: string;
  numberDocument: string;
  referenceDocument: string;
  movementDate: Date;
  observation: string;
  details: WarehousesMovementDetailUpsertDto[];
}

export interface WarehousesMovementDetailUpsertDto {
  productsId: number;
  quantity: number;
  unitCost: number;
  lotNumber: string;
  serialNumber: string;
  expirationDate: Date;
  observation: string;
}
