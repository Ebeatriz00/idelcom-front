import type { WarehousesMovementUpsertDto } from "@/application";
import type { IncomeFormValues } from "./incomes.schema";

function optionalNumber(value?: number) {
  return value && value > 0 ? value : 0;
}

function optionalId(value?: number) {
  return value && value > 0 ? value : undefined;
}

function optionalDate(value?: string) {
  return value ? new Date(value) : (null as unknown as Date);
}

export function mapIncomeFormToDto(
  values: IncomeFormValues,
): WarehousesMovementUpsertDto {
  return {
    movementTypeId: values.movementTypeId,
    warehouseId: values.warehouseId,
    warehouseDestinationId: 0,
    suppliersId: optionalNumber(values.suppliersId),
    clientsId: 0,
    taxesId: optionalId(values.taxesId),
    series: values.series ?? "",
    numberDocument: values.numberDocument ?? "",
    referenceDocument: values.referenceDocument ?? "",
    movementDate: new Date(values.movementDate),
    observation: values.observation ?? "",
    details: values.details.map((detail) => ({
      productsId: detail.productsId,
      quantity: detail.quantity,
      unitCost: detail.unitCost,
      lotNumber: detail.lotNumber ?? "",
      serialNumber: detail.serialNumber ?? "",
      expirationDate: optionalDate(detail.expirationDate),
      observation: detail.observation ?? "",
    })),
  };
}

export function detailTotal(quantity: number, unitCost: number) {
  const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
  const safeUnitCost = Number.isFinite(unitCost) ? unitCost : 0;

  return Number((safeQuantity * safeUnitCost).toFixed(2));
}
