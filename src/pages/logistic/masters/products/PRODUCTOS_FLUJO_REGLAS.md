# Productos - Flujo y Reglas

## Alcance

El modulo de Productos funciona solo como catalogo maestro.

No gestiona:

- Proveedores
- Costos reales
- Compras
- Ingresos
- Kardex

La relacion producto-proveedor y los costos se manejaran despues desde los modulos de ingresos, compras y almacen.

## Flujo del formulario

1. El usuario abre el formulario para crear o editar un producto.
2. Completa la informacion principal:
   - Tipo de producto
   - Categoria
   - Linea de producto
   - Marca
   - Unidad de medida
   - SKU
   - Codigo de barras
   - Numero de parte
   - Descripcion
   - Descripcion corta
3. Configura el comportamiento del producto:
   - Activo
   - Se compra
   - Se vende
   - Servicio
   - Inventariable
   - Lotes
   - Series
   - Vencimiento
   - Herramienta
   - Retornable
4. Agrega imagenes del producto en creacion.
5. Define datos logisticos cuando corresponda:
   - Stock minimo
   - Stock maximo
   - Peso
   - Volumen
6. El formulario aplica reglas automaticas y validaciones antes de enviar.

## Secciones

### Informacion Principal

Contiene datos de identificacion y clasificacion del catalogo.

Reglas:

- Tipo, categoria, linea, marca, unidad y descripcion son obligatorios.
- La linea depende de la categoria seleccionada.
- Si cambia la categoria, se limpia la linea seleccionada.

### Configuracion

Define como se comporta el producto dentro del ERP.

Reglas automaticas:

- Si `Servicio` esta activo:
  - `Inventariable` se desactiva.
  - `Lotes` se desactiva.
  - `Series` se desactiva.
  - `Vencimiento` se desactiva.
  - `Stock minimo` se limpia.
  - `Stock maximo` se limpia.
  - `Peso` se limpia.
  - `Volumen` se limpia.

- Si `Herramienta` esta activo:
  - `Servicio` se desactiva.
  - `Inventariable` se activa.
  - `Retornable` se activa.
  - `Se vende` se desactiva.

- Si `Inventariable` esta inactivo:
  - `Stock minimo` se deshabilita y limpia.
  - `Stock maximo` se deshabilita y limpia.

- Si `Lotes` esta inactivo:
  - `Vencimiento` se desactiva.

### Imagenes del Producto

Permite cargar imagenes para productos nuevos.

Reglas:

- Acepta PNG, JPG, JPEG y WebP.
- Limite de archivo: 5MB.
- Permite drag and drop.
- Permite previsualizar imagen.
- Permite cambiar imagen.
- Permite eliminar imagen.

### Logistica

Contiene datos logisticos basicos del catalogo.

Reglas:

- `Stock minimo` y `Stock maximo` solo aplican si el producto es inventariable.
- `Peso` y `Volumen` no aplican a servicios.
- No se registran costos, proveedores, compras, ingresos ni kardex en esta seccion.

## Validaciones

El schema valida:

- No se permite manejar lotes y series al mismo tiempo.
- Si `Vencimiento` esta activo, `Lotes` debe estar activo.
- Si `Servicio` esta activo, `Inventariable` debe estar inactivo.
- Si `Herramienta` esta activo, `Retornable` debe estar activo.
- Si `Herramienta` esta activo, `Inventariable` debe estar activo.
- Si `Herramienta` esta activo, `Se vende` debe estar inactivo.

## Arquitectura

La logica automatica del formulario esta separada en:

- `utils/useProductCatalogRules.ts`

Los valores iniciales se centralizan en:

- `utils/buildDefaultValues.ts`

Las validaciones se centralizan en:

- `utils/products.schema.ts`

El formulario principal esta en:

- `components/modal/ProductsForm.tsx`

El dropzone de imagenes del producto esta en:

- `components/modal/RHFImageDropzone.tsx`

## Regla de dominio

Productos debe mantenerse como catalogo maestro.

No agregar en este modulo:

- Seleccion de proveedor
- Precio de compra
- Costo promedio
- Costo real
- Historial de compras
- Movimientos de almacen
- Kardex

Estas responsabilidades pertenecen a modulos posteriores de compras, ingresos y almacen.
