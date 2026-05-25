export interface WarehousesMovementResponseDto {
  warehouseMovementId: number;
  movementTypeId: number;
  movementTypeDescription: string;
  movOperId: number;
  movOperDescription: string;
  warehouseId: number;
  warehouseDescription: string;
  supplierName: string;
  clientName: string;
  series?: string;
  numberDocument?: string;
  referenceDocument?: string;
  movementDate: Date;
  total: number;
  status: string;
}

export interface WarehousesMovementByIdDto {
  movementTypeId: number;
  movementTypeCode: string;
  movementTypeDescription: string;
  movOperId: number;
  movOperDescription: string;
  warehouseId: number;
  warehouseDescription: string;
  warehouseDestinationId: number;
  warehouseDestinationDescription: string;
  suppliersId: number;
  supplierName: string;
  clientsId: number;
  clientName: string;
  series: string;
  numberDocument: string;
  referenceDocument: string;
  movementDate: Date;
  observation: string;
  subTotal: number;
  igv: number;
  total: number;
  status: string;
  createDate: Date;
  createUser: number;
  details: WarehousesMovementByIdDatailDto[];
}

export interface WarehousesMovementByIdDatailDto {
  warehouseMovementDetailId: number;
  productsId: number;
  productDescription: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  lotNumber: string;
  serialNumber: string;
  expirationDate: null;
  observation: string;
}

export interface AvailableStockDto {
  productsId: number;
  productDescription: string;
  warehouseId: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  averageCost: number;
  lastCost: number;
}
