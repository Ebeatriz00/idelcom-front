import { Modal, useModalHistoryLock } from "@/layouts";
import type { PropsFormModal } from "../../utils/products.type";
import { ProductsForm } from "./ProductsForm";
import { ProductModalFooter } from "./shell/ProductModalFooter";
import { ProductModalHeader } from "./shell/ProductModalHeader";
import { ProductModalLoading } from "./shell/ProductModalLoading";

export function ProductsFormModal({
  open,
  title,
  loadingDetail = false,
  defaultValues,
  onClose,
  onSubmit,
  saving = false,
  categoriesLabel,
  productLinesLabel,
  brandsLabel,
  productTypesLabel,
  uomLabel,
}: PropsFormModal) {
  useModalHistoryLock(open, onClose);

  if (!open) return null;

  const formId = "products-crm-form";

  return (
    <Modal
      title={<ProductModalHeader title={title} />}
      size="full"
      onClose={onClose}
      overlayClassName="absolute inset-0 bg-black/40"
      contentClassName="flex h-[90vh] max-h-[90vh] min-h-0 flex-col overflow-hidden"
      headerClassName="z-10 flex shrink-0 items-start gap-3 border-b border-secondary/10 bg-background px-5 py-4"
      bodyClassName="flex min-h-0 flex-1 overflow-hidden bg-background p-0"
      footerClassName="z-10 flex h-[72px] shrink-0 items-center justify-end gap-2 overflow-hidden border-t border-secondary/10 bg-background px-5 py-3"
      closeButtonClassName="ml-auto rounded-lg p-2 text-secondary transition hover:bg-muted"
      footer={
        <ProductModalFooter
          formId={formId}
          isEditing={Boolean(defaultValues?.productsId)}
          loadingDetail={loadingDetail}
          saving={saving}
          onClose={onClose}
        />
      }
    >
      {loadingDetail ? (
        <ProductModalLoading />
      ) : (
        <div className="flex min-h-0 w-full flex-1 overflow-auto bg-background p-4 md:p-5">
          <div className="mx-auto w-full max-w-7xl">
            <ProductsForm
              formId={formId}
              defaultValues={defaultValues}
              onSubmit={onSubmit}
              saving={saving}
              showActions={false}
              categoriesLabel={categoriesLabel}
              productLinesLabel={productLinesLabel}
              brandsLabel={brandsLabel}
              productTypesLabel={productTypesLabel}
              uomLabel={uomLabel}
            />
          </div>
        </div>
      )}
    </Modal>
  );
}
