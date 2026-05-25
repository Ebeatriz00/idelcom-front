import type { HelpDoc } from "./utils/help.type";

export const HELP_DOCS: HelpDoc[] = [
  // =========================
  // GENERAL
  // =========================
  {
    id: "introduccion-centro-ayuda",
    area: "GENERAL",
    group: "1. Inicio",
    title: "Introducción al ERP",
    keywords: [
      "introducción",
      "manual",
      "erp",
      "ventas",
      "preventa",
      "gerencia",
    ],
    sections: [
      {
        id: "vision-general",
        title: "Visión General del Sistema",
        body: "El ERP centraliza el proceso comercial, técnico y estratégico de la organización. Integra CRM, Pre-Venta y Gerencia en un flujo estructurado que garantiza trazabilidad y control.",
      },
      {
        id: "estructura-modulos",
        title: "Estructura de Módulos",
        body: "El sistema está organizado en módulos que trabajan de forma integrada:",
        bullets: [
          "CRM (Ventas): Gestión de cuentas, contactos, leads, oportunidades y viabilidad.",
          "Pre-Venta: Proyectos técnicos, tareas, cotizaciones y procesos de portabilidad.",
          "Gerencia: Evaluación estratégica y aprobaciones.",
        ],
      },
      {
        id: "flujo-integrado",
        title: "Flujo Integrado del Proceso",
        body: "El proceso comercial sigue una secuencia lógica y controlada:",
        bullets: [
          "Lead → Calificación → Conversión a Oportunidad",
          "Análisis técnico en Pre-Venta",
          "Generación de Cotización",
          "Evaluación de Viabilidad (si aplica)",
          "Resultado: Ganado, Perdido o Stand By",
        ],
      },
      {
        id: "reglas-negocio",
        title: "Reglas de Negocio y Bloqueos",
        body: "El ERP aplica reglas automáticas para proteger la coherencia del proceso. Si no puedes avanzar en una etapa, generalmente existe un requisito pendiente (tarea, entregable, evaluación o aprobación).",
      },
      {
        id: "uso-manual",
        title: "Cómo utilizar este Centro de Ayuda",
        body: "Navega por áreas desde el menú lateral o utiliza el buscador para encontrar temas específicos. Cada guía explica flujos, reglas y bloqueos comunes del módulo correspondiente.",
      },
    ],
    related: [
      "crm-oportunidades-flujo",
      "preventa-introduccion",
      "gerencia-evaluacion-comercial",
    ],
  },

  // =========================
  // CRM - CONFIGURACIONES Y LEADS
  // =========================
  {
    id: "crm-parametros-comercial",
    area: "CRM",
    group: "1. Parámetros Comercial",
    title: "Parámetros Comercial: qué es y cómo se usa",
    keywords: ["parámetros", "catálogos", "configuración", "ventas"],
    sections: [
      {
        id: "que-son",
        title: "¿Qué son los parámetros comerciales?",
        body: "Es un catálogo y regla que alimentan el CRM. Aca se puede modificar el puntaje minimo y maximo de la viabilidad",
      },
      {
        id: "buenas-practicas",
        title: "Buenas prácticas",
        body: "",
        bullets: [
          "Evita duplicados (mismo nombre con distinta escritura).",
          "No edites catálogos críticos sin coordinar con el equipo.",
        ],
      },
    ],
  },
  {
    id: "crm-leads-intro",
    area: "CRM",
    group: "2. Leads",
    title: "Leads: configuración de catálogos",
    keywords: [
      "tipos de lead",
      "calificación",
      "fuentes",
      "estados",
      "configuración",
      "cuentas",
    ],
    sections: [
      {
        id: "proposito",
        title: "Propósito del módulo",
        body: "El módulo Leads permite configurar los catálogos que se utilizan en el registro de cuentas y prospectos dentro del CRM.",
      },
      {
        id: "uso-en-cuentas",
        title: "Uso en el formulario de Cuentas",
        body: "Los valores configurados aquí se muestran en el formulario de Nueva Cuenta y determinan cómo se clasifica un cliente dentro del sistema.",
      },
      {
        id: "componentes",
        title: "Catálogos disponibles",
        body: "Estos catálogos alimentan los campos del CRM:",
        bullets: [
          "Tipos de Lead: Define el tipo o rol del contacto (ej. decisor, influenciador, clave, externo).",
          "Calificación de Lead: Clasifica el nivel de interés o prioridad comercial.",
          "Fuentes de Lead: Indica el origen del cliente (referido, campaña, web, llamada, etc.).",
          "Estados de Lead: Controla el estado del prospecto dentro del proceso.",
        ],
      },
      {
        id: "impacto",
        title: "Impacto en el sistema",
        body: "Modificar estos valores afecta directamente los formularios de Cuentas, Leads y reportes comerciales. Se recomienda evitar cambios sin coordinación previa.",
      },
    ],
  },
  {
    id: "crm-leads-calificacion",
    area: "CRM",
    group: "2. Leads",
    title: "Calificación de Lead",
    keywords: ["calificación", "lead", "alto", "medio", "bajo"],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "La Calificación permite medir el nivel de interés o prioridad comercial de un cliente. Se utiliza para segmentar y priorizar la gestión comercial.",
      },
      {
        id: "valores",
        title: "Valores comunes",
        body: "Ejemplos de calificación:",
        bullets: [
          "ALTO: Alta probabilidad de conversión.",
          "MEDIO: Interés moderado o en evaluación.",
          "BAJO: Bajo interés o contacto preliminar.",
        ],
      },
      {
        id: "impacto",
        title: "Impacto en el sistema",
        body: "La calificación se muestra en el registro de Cuentas y Leads, y puede influir en reportes, priorización y seguimiento comercial.",
      },
      {
        id: "recomendaciones",
        title: "Recomendaciones",
        body: "",
        bullets: [
          "Evitar crear calificaciones duplicadas.",
          "No modificar nombres si ya están en uso.",
          "Definir criterios claros para cada nivel.",
        ],
      },
    ],
  },
  {
    id: "crm-leads-fuentes",
    area: "CRM",
    group: "2. Leads",
    title: "Fuentes de Lead",
    keywords: ["fuentes", "origen", "referido", "web", "cuenta"],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "Las Fuentes indican el origen de la cuenta. Permiten analizar de dónde provienen los clientes y medir efectividad de canales comerciales.",
      },
      {
        id: "ejemplos",
        title: "Ejemplos de fuentes",
        body: "",
        bullets: [
          "Página Web",
          "Recomendación",
          "Google",
          "Invitación",
          "Referido",
          "Prospección directa",
        ],
      },
      {
        id: "impacto",
        title: "Impacto en reportes",
        body: "Esta información se utiliza para análisis de marketing, desempeño de campañas y efectividad del equipo comercial.",
      },
      {
        id: "recomendaciones",
        title: "Recomendaciones",
        body: "",
        bullets: [
          "Mantener nombres estandarizados.",
          "No eliminar fuentes que estén en uso.",
          "Evitar duplicados con distinta ortografía.",
        ],
      },
    ],
  },
  {
    id: "crm-leads-estados",
    area: "CRM",
    group: "2. Leads",
    title: "Estados de Lead",
    keywords: ["estado", "lead", "prospecto", "cliente"],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "Los Estados controlan la situación actual de la cuenta dentro del proceso comercial.",
      },
      {
        id: "ejemplos",
        title: "Estados comunes",
        body: "",
        bullets: [
          "PROSPECTO: Contacto inicial sin calificación completa.",
          "LEAD: Prospecto en gestión comercial.",
          "CLIENTE: Prospecto convertido en cliente activo.",
        ],
      },
      {
        id: "flujo",
        title: "Relación con el flujo comercial",
        body: "El estado ayuda a determinar en qué etapa se encuentra el registro y puede utilizarse como criterio para convertirlo en oportunidad.",
      },
      {
        id: "recomendaciones",
        title: "Recomendaciones",
        body: "",
        bullets: [
          "Definir claramente cuándo cambiar de estado.",
          "Evitar crear estados redundantes.",
          "Coordinar cambios con el equipo comercial.",
        ],
      },
    ],
  },

  // =========================
  // CRM - CUENTAS (CLIENTES)
  // =========================
  {
    id: "crm-cuentas-creacion",
    area: "CRM",
    group: "3. Cuentas",
    title: "Creación y Formulario de Cuentas",
    keywords: [
      "crear",
      "cuenta",
      "cliente",
      "formulario",
      "documento",
      "ruc",
      "dirección"
    ],
    sections: [
      {
        id: "proposito-cuentas",
        title: "¿Qué es una Cuenta?",
        body: "En el sistema, una 'Cuenta' representa a una empresa o entidad (cliente corporativo) con la que interactuamos comercialmente. Todas las oportunidades y contactos se vinculan a una cuenta.",
      },
      {
        id: "campos-obligatorios",
        title: "Campos Obligatorios y Validaciones",
        body: "Al registrar una nueva cuenta, el sistema exige información clave para evitar registros duplicados o inválidos:",
        bullets: [
          "Datos Básicos: El nombre del 'Cliente' es obligatorio y debe tener al menos 3 caracteres.",
          "Documento: Debes seleccionar el 'Tipo de documento' (ej. RUC) e ingresar el número. El sistema solo acepta números y exige entre 8 y 11 dígitos.",
          "Dirección: Es obligatorio registrar la dirección principal del cliente (mínimo 3 caracteres).",
        ],
      },
      {
        id: "clasificacion-comercial",
        title: "Clasificación del Cliente",
        body: "El formulario incluye una sección de 'Negocio y Lead' donde puedes catalogar a la empresa. Se recomienda completar los campos de Sector, Negocio, Fuente, Calificación y Estado para mantener una base de datos segmentada que ayude en los reportes gerenciales.",
      },
    ],
  },
  {
    id: "crm-cuentas-tabla-acciones",
    area: "CRM",
    group: "3. Cuentas",
    title: "Tabla de Cuentas y Acciones Rápidas",
    keywords: [
      "tabla",
      "buscar",
      "exportar",
      "vendedor",
      "bloqueo",
      "estado",
      "contacto"
    ],
    sections: [
      {
        id: "busqueda-exportacion",
        title: "Búsqueda y Exportación",
        body: "La tabla principal te permite buscar cuentas rápidamente ingresando el RUC, el nombre del Cliente o el nombre del Vendedor. Además, si tienes los permisos, puedes exportar tu listado a CSV, Excel o PDF.",
      },
      {
        id: "regla-otro-vendedor",
        title: "Regla de Privacidad: Otro Vendedor",
        body: "El sistema protege las carteras de clientes. Si una cuenta está asignada a un vendedor distinto a ti, verás una etiqueta naranja que dice 'Otro vendedor'.",
        bullets: [
          "Bloqueo de Edición: No podrás editar la información de esa cuenta ni cambiar su estado.",
          "Bloqueo de Contactos: Tampoco podrás agregarle nuevos contactos directamente desde la tabla.",
        ],
      },
      {
        id: "acciones-disponibles",
        title: "Acciones Disponibles (Para tus cuentas)",
        body: "Si eres el propietario de la cuenta, podrás usar los botones de acción lateral para:",
        bullets: [
          "Agregar contacto: Vincular a una persona directa a esta empresa.",
          "Cambiar Vendedor: Reasignar la cuenta a otro miembro del equipo.",
          "Editar: Modificar los datos del formulario.",
          "Activar / Desactivar: Cambiar el estado de la cuenta. Nota: No podrás desactivar una cuenta si actualmente está 'en uso' (por ejemplo, si tiene oportunidades activas vinculadas).",
          "Historial: Ver el registro de cambios de la cuenta.",
        ],
      },
    ],
  },
  {
    id: "crm-cuentas-detalle-360",
    area: "CRM",
    group: "3. Cuentas",
    title: "Vista Detalle 360 de la Cuenta",
    keywords: [
      "detalle",
      "360",
      "perfil",
      "gráfico",
      "contactos",
      "pipeline",
      "timeline",
      "bitácora"
    ],
    sections: [
      {
        id: "acceso-detalle",
        title: "Acceso a la Vista Detalle",
        body: "Al hacer clic en el nombre de un cliente resaltado en azul dentro de la tabla, accederás a la 'Vista Detalle'. Este es un panel integral (360 grados) que consolida toda la información comercial de esa empresa.",
      },
      {
        id: "componentes-vista",
        title: "Módulos de la Vista Detalle",
        body: "La pantalla está dividida estratégicamente para ofrecer un panorama rápido:",
        bullets: [
          "Gráfico de Tendencias: Muestra un resumen visual de la actividad reciente con este cliente.",
          "Lista de Contactos: Todas las personas vinculadas a la empresa, con sus respectivos cargos y datos de contacto directo.",
          "Pipeline (Oportunidades): Un bloque que lista todos los prospectos y oportunidades de venta (abiertas, ganadas o perdidas) asociadas a este cliente.",
          "Timeline (Bitácora): El historial cronológico de todas las interacciones, llamadas, reuniones y correos que el equipo comercial ha registrado con esta cuenta.",
        ],
      },
    ],
  },

  // =========================
  // CRM - CONTACTOS
  // =========================
  {
    id: "crm-contactos-creacion",
    area: "CRM",
    group: "4. Contactos",
    title: "Creación y Validación de Contactos",
    keywords: [
      "contacto",
      "crear",
      "formulario",
      "email",
      "vendedor",
      "asignación",
      "cargo"
    ],
    sections: [
      {
        id: "proposito-contactos",
        title: "¿Qué es un Contacto?",
        body: "Un Contacto es una persona natural (ej. un gerente, un ingeniero o un jefe de compras) que trabaja para una de nuestras Cuentas (clientes empresariales). Toda la comunicación directa se realiza a través de ellos.",
      },
      {
        id: "campos-obligatorios",
        title: "Campos Obligatorios y Validaciones",
        body: "El sistema valida estrictamente la información ingresada para asegurar la calidad de la base de datos:",
        bullets: [
          "Datos Personales: El Nombre del contacto y su Cargo son obligatorios (mínimo 3 caracteres cada uno).",
          "Correo Electrónico: Es un campo obligatorio. El sistema verificará que tenga un formato de email válido (ej. nombre@empresa.com).",
          "Clasificación: Debes indicar obligatoriamente la Fuente (de dónde provino el contacto) y el Tipo de contacto (ej. decisor, influenciador).",
        ],
      },
      {
        id: "asignacion-vendedor",
        title: "Regla de Asignación de Vendedor",
        body: "La asignación del vendedor responsable del contacto depende de tus permisos en el sistema:",
        bullets: [
          "Asignación Automática: Si tu usuario no tiene permisos para asignar contactos a otros, el sistema te asignará automáticamente a ti como el vendedor responsable.",
          "Selección Manual: Solo los usuarios con perfiles gerenciales o permisos especiales verán habilitado el campo para elegir a qué vendedor pertenece el contacto.",
        ],
      },
    ],
  },
  {
    id: "crm-contactos-vinculacion",
    area: "CRM",
    group: "4. Contactos",
    title: "Vinculación Rápida a Cuentas",
    keywords: [
      "vincular",
      "asociar",
      "cuenta",
      "cliente",
      "rápido",
      "modal"
    ],
    sections: [
      {
        id: "creacion-contextual",
        title: "Creación Contextual (Desde la Cuenta)",
        body: "No es necesario ir al módulo general de Contactos para registrar a alguien nuevo. Si estás dentro de la tabla de Cuentas o en el Perfil 360 de un cliente, puedes usar el botón 'Agregar Contacto'.",
      },
      {
        id: "ventaja-vinculacion",
        title: "Autocompletado del Sistema",
        body: "Al usar la opción de vinculación rápida, el sistema optimiza el formulario:",
        bullets: [
          "Oculta el selector de clientes, ya que el sistema asocia automáticamente al nuevo contacto con la cuenta que estás visualizando.",
          "Pre-carga tu usuario como responsable (si aplica) para agilizar el guardado.",
        ],
      },
    ],
    related: [
      "crm-cuentas-tabla-acciones",
      "crm-contactos-creacion"
    ],
  },
  {
    id: "crm-contactos-tabla",
    area: "CRM",
    group: "4. Contactos",
    title: "Tabla de Contactos y Estados",
    keywords: [
      "tabla",
      "exportar",
      "buscar",
      "estado",
      "desactivar",
      "en uso"
    ],
    sections: [
      {
        id: "busqueda-filtros",
        title: "Búsqueda y Exportación",
        body: "La tabla central de contactos te permite buscar rápidamente a cualquier persona usando la barra superior. Puedes buscar por nombre del contacto, nombre de la cuenta (empresa), vendedor responsable o incluso por el cargo que ocupa.",
        bullets: [
          "También cuentas con opciones para exportar la lista filtrada a formatos Excel, CSV o PDF (con un límite de seguridad de 150 registros por PDF).",
        ],
      },
      {
        id: "cambio-estado",
        title: "Activación y Desactivación",
        body: "Puedes cambiar el estado de un contacto (activo/inactivo) usando el botón de encendido en la columna de acciones. Un contacto inactivo no aparecerá en las listas de selección al crear nuevas oportunidades.",
      },
      {
        id: "bloqueo-en-uso",
        title: "Regla de Bloqueo: Contacto 'En Uso'",
        body: "El sistema protege la integridad de los datos históricos. Si intentas desactivar un contacto, pero el botón aparece bloqueado o gris, significa que el contacto está 'En Uso'.",
        bullets: [
          "Esto ocurre cuando el contacto está asociado a una oportunidad abierta, un proyecto de preventa activo o una cotización en curso.",
          "Deberás cerrar o reasignar esos procesos antes de poder desactivar al contacto del sistema.",
        ],
      },
    ],
  },

  // =========================
  // CRM - OPORTUNIDADES Y COTIZACIONES
  // =========================
  {
    id: "crm-oportunidades-core-prospectos",
    area: "CRM",
    group: "5. Oportunidades",
    title: "Oportunidades CRM: creación de prospectos",
    keywords: [
      "prospecto",
      "oportunidad",
      "crear",
      "etapa de negocio",
      "concurso",
      "contacto",
      "caracteres especiales",
    ],
    sections: [
      {
        id: "que-es",
        title: "¿Qué se registra aquí?",
        body: "Esta pantalla es el núcleo del CRM: aquí se crean los prospectos (oportunidades iniciales) que alimentan todo el flujo comercial.",
      },
      {
        id: "campo-obligatorio",
        title: "Campo obligatorio: Etapa de negocio",
        body: "La Etapa de negocio es obligatoria. Define el contexto comercial del prospecto desde el inicio (ej. revisión inicial, estudio de mercado, concurso).",
      },
      {
        id: "cliente-directo",
        title: "Regla: si ya es cliente directo",
        body: "Cuando el prospecto corresponde a un cliente directo, se debe seleccionar la etapa de negocio 'CONCURSO'.",
      },
      {
        id: "descripcion",
        title: "Regla: Descripción sin caracteres especiales",
        body: "La descripción del prospecto no permite caracteres especiales. Usa solo texto normal (letras, números y signos básicos permitidos).",
        bullets: [
          "Evita símbolos no válidos (ej: caracteres raros o no estándar).",
          "Si pegas texto desde WhatsApp/Excel, revisa que no traiga caracteres ocultos.",
        ],
      },
      {
        id: "contactos",
        title: "Selección de contacto",
        body: "El contacto se utiliza para asociar correctamente la gestión comercial con la persona del cliente.",
        bullets: [
          "Si el cliente tiene más de un contacto: debes seleccionar el contacto con el que salió el proyecto.",
          "Si el cliente tiene un solo contacto: el sistema lo selecciona automáticamente.",
          "Si el cliente no tiene contactos asociados: se mostrará el mensaje 'Este cliente no tiene contactos registrados.'",
        ],
      },
      {
        id: "campos-clave",
        title: "Campos clave y reglas",
        body: "Estos campos determinan cómo se gestiona el prospecto, sus alertas y su trazabilidad comercial.",
      },
      {
        id: "comercial-permisos",
        title: "Comercial: visible según permisos",
        body: "El campo Comercial solo se muestra si tu perfil tiene permiso para seleccionar comercial. Si no tienes el permiso, el sistema asigna automáticamente el comercial según el usuario que inició sesión.",
      },
      {
        id: "probabilidad",
        title: "Probabilidad (obligatoria)",
        body: "La probabilidad es obligatoria. Se usa para estimar qué tan probable es que el prospecto avance y se considera en reportes y priorización comercial.",
      },
      {
        id: "moneda",
        title: "Moneda (obligatoria)",
        body: "La moneda es obligatoria y aplica al presupuesto/monto registrado en el prospecto.",
      },
      {
        id: "presupuesto",
        title: "Presupuesto / Monto estimado",
        body: "Debe registrarse un monto aproximado con el que cuenta el cliente para este prospecto. No es el monto final de venta: es una referencia inicial para el análisis comercial.",
      },
      {
        id: "recordatorio",
        title: "Recordatorio y alertas",
        body: "Si activas 'Activar recordatorio', el sistema crea una alerta automática para seguimiento.",
        bullets: [
          "Regla: la fecha del recordatorio no puede ser mayor a la Fecha Fin / Fecha Cierre de la oportunidad.",
          "El recordatorio ayuda a evitar que el prospecto se quede sin seguimiento.",
        ],
      },
      {
        id: "contrataciones",
        title: "Consultoría de contrataciones",
        body: "Si marcas 'Consultoría contrataciones', se habilita el envío de consultas al área de Contrataciones.",
        bullets: [
          "Al activar esta opción, se habilita la selección de consultas.",
          "Se habilita también el módulo para adjuntar Archivos de soporte.",
          "Los archivos son obligatorios cuando la casilla de Consultoría contrataciones está marcada.",
        ],
      },
      {
        id: "archivos-soporte",
        title: "Archivos de soporte (obligatorios si hay consultoría)",
        body: "Los archivos de soporte permiten sustentar la consulta enviada a Contrataciones. Se aceptan formatos como PDF, Word, Excel, imágenes y TXT. Si no adjuntas archivos, no se debe permitir guardar cuando está activada la consultoría.",
      },
      {
        id: "buenas-practicas",
        title: "Buenas prácticas",
        body: "",
        bullets: [
          "Verifica cliente y contacto antes de guardar para evitar prospectos mal asociados.",
          "Si aparece 'Este cliente no tiene contactos registrados', registra primero un contacto en el módulo de Contactos.",
          "Completa la etapa de negocio correctamente: impacta reportes, filtros y flujo comercial.",
        ],
      },
    ],
  },
  {
    id: "crm-oportunidades-estados",
    area: "CRM",
    group: "5. Oportunidades",
    title: "Estados de Oportunidad",
    keywords: [
      "estados",
      "flujo",
      "prospecto",
      "negociación",
      "stand by",
      "perdido",
    ],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "Los Estados de Oportunidad controlan el avance del proceso comercial. Determinan en qué etapa se encuentra una oportunidad y permiten medir progreso.",
      },
      {
        id: "flujo",
        title: "Flujo Comercial",
        body: "Los estados representan las etapas del ciclo de venta:",
        bullets: [
          "PROSPECTO: Registro inicial.",
          "ANÁLISIS: Evaluación preliminar.",
          "OPORTUNIDAD: Validación comercial.",
          "PROPUESTA: Envío de cotización.",
          "NEGOCIACIÓN: Ajustes y acuerdos.",
          "OBSERVADO / REVISIÓN: Pendiente de corrección.",
          "STAND BY: Pausado temporalmente.",
          "PERDIDO: Cierre negativo.",
        ],
      },
      {
        id: "progreso",
        title: "Indicador de Progreso",
        body: "Cada estado puede tener un porcentaje asociado que representa el avance estimado de la oportunidad.",
      },
      {
        id: "recomendaciones",
        title: "Recomendaciones",
        body: "",
        bullets: [
          "No modificar estados críticos sin coordinación.",
          "Evitar eliminar estados que estén en uso.",
          "Mantener coherencia en el orden del flujo.",
        ],
      },
    ],
  },
  {
    id: "crm-oportunidades-lineas-negocio",
    area: "CRM",
    group: "5. Oportunidades",
    title: "Líneas de Negocio",
    keywords: ["líneas", "negocio", "video vigilancia", "incendio", "accesos"],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "Las Líneas de Negocio clasifican el tipo de solución o servicio que se ofrecerá en la oportunidad.",
      },
      {
        id: "ejemplos",
        title: "Ejemplos",
        body: "",
        bullets: [
          "Centro de Datos",
          "Detección de Incendio",
          "Extinción de Incendio",
          "Video Vigilancia",
          "Intrusión y Alarmas",
          "Control de Accesos",
          "Control de Aniego",
          "Relojes IP",
        ],
      },
      {
        id: "impacto",
        title: "Impacto en el sistema",
        body: "Esta clasificación se utiliza para reportes comerciales, segmentación de mercado y análisis estratégico.",
      },
      {
        id: "recomendaciones",
        title: "Recomendaciones",
        body: "",
        bullets: [
          "Mantener nombres estandarizados.",
          "No duplicar líneas con diferente ortografía.",
          "Coordinar creación de nuevas líneas con Gerencia Comercial.",
        ],
      },
    ],
  },
  {
    id: "crm-cuentas-tipo-sector",
    area: "CRM",
    group: "5. Oportunidades",
    title: "Sector (Público / Privado)",
    keywords: ["sector", "publico", "privado", "cliente"],
    sections: [
      {
        id: "proposito",
        title: "Propósito",
        body: "Define si la cuenta pertenece al sector Público o Privado. Esta clasificación impacta el tipo de proceso comercial, requisitos documentarios y reportes.",
      },
      {
        id: "valores",
        title: "Valores disponibles",
        body: "",
        bullets: ["PÚBLICO", "PRIVADO"],
      },
      {
        id: "impacto",
        title: "Impacto en el proceso",
        body: "El sector puede determinar condiciones contractuales, licitaciones, tiempos de aprobación y requisitos administrativos.",
      },
    ],
  },
  {
    id: "crm-viabilidad",
    area: "CRM",
    group: "6. Viabilidad",
    title: "Viabilidad: aprobación de oportunidades por puntaje",
    keywords: [
      "viabilidad",
      "gerente comercial",
      "aprobación",
      "rechazo",
      "prospecto",
      "oportunidad",
      "50",
      "70",
      "notificación",
      "correo",
    ],
    sections: [
      {
        id: "que-es",
        title: "¿Qué es Viabilidad?",
        body: "Viabilidad es el control de aprobación para prospectos que aún no califican automáticamente como oportunidad. Se basa en un puntaje y define si la oportunidad puede avanzar o debe descartarse.",
      },
      {
        id: "quienes-entran",
        title: "¿Qué registros ingresan a Viabilidad?",
        body: "En Viabilidad aparecen los prospectos (u oportunidades en etapa inicial) cuyo puntaje no supera el umbral requerido para convertirse automáticamente en oportunidad.",
      },
      {
        id: "umbrales",
        title: "Reglas por rangos de puntaje",
        body: "El sistema aplica reglas automáticas según el puntaje de viabilidad:",
        bullets: [
          "Mayor a 70: el prospecto califica y pasa automáticamente a OPORTUNIDAD.",
          "Entre 50 y 70: requiere evaluación del Gerente Comercial (se envía correo).",
          "Menor a 50: requiere atención inmediata (se envía notificación).",
        ],
      },
      {
        id: "alertas",
        title: "Notificaciones y correos",
        body: "Para asegurar respuesta rápida:",
        bullets: [
          "Puntaje < 50: se genera NOTIFICACIÓN para la gestión.",
          "Puntaje 50–70: se envía CORREO para revisión del Gerente Comercial.",
        ],
      },
      {
        id: "decision-gerencia",
        title: "Decisión del Gerente Comercial",
        body: "El Gerente Comercial revisa el caso y decide:",
        bullets: [
          "Aprobar: el registro pasa a estado OPORTUNIDAD.",
          "Rechazar: el registro cambia a estado DESCARTADO.",
        ],
      },
      {
        id: "consideraciones",
        title: "Consideraciones importantes",
        body: "",
        bullets: [
          "Los cambios de umbrales impactan en notificaciones, correos y flujo comercial.",
          "Evitar aprobar/rechazar sin sustento, porque afecta reportes y pipeline.",
          "El estado DESCARTADO es final (no debería reabrirse sin control).",
        ],
      },
    ],
  },
  {
    id: "crm-cotizaciones-versiones",
    area: "CRM",
    group: "7. Cotizaciones",
    title: "Versiones y Observaciones de Cotización",
    keywords: ["cotización", "versiones", "márgenes", "precios"],
    sections: [
      {
        id: "versiones",
        title: "Manejo de versiones",
        body: "Solo puede existir una versión activa por oportunidad. Las versiones anteriores quedan en historial.",
      },
      {
        id: "observacion-margenes",
        title: "Observación por Márgenes",
        body: "Cuando la observación es por márgenes, debes subir una nueva versión de cotización.",
      },
      {
        id: "observacion-precios",
        title: "Observación por Precios",
        body: "Las observaciones por precios suelen depender del equipo de Preventa.",
      },
    ],
  },  
  {
    id: "crm-cierre-cotizacion",
    area: "CRM",
    group: "7. Cotizaciones",
    title: "Carga de Cotización y Estados Finales",
    keywords: [
      "cotización",
      "cierre",
      "ganado",
      "perdido",
      "stand by",
      "descartado",
      "adjuntar",
      "finalizar"
    ],
    sections: [
      {
        id: "carga-cotizacion",
        title: "Recepción y Carga de la Cotización",
        body: "Una vez que Preventa culmina su trabajo (estado 'Entregado'), el Comercial recupera el control. Su primera tarea es utilizar los archivos proporcionados para armar la propuesta económica y adjuntar la cotización oficial en el sistema.",
      },
      {
        id: "estados-finales",
        title: "Estados que finalizan el proceso",
        body: "Tras presentar la cotización, el comercial decide el rumbo de la oportunidad. Los siguientes estados cierran o pausan el ciclo de forma definitiva, finalizando el proceso actual:",
        bullets: [
          "Ganado: El cliente acepta la propuesta y se procede al cierre exitoso.",
          "Perdido: La oportunidad no se concreta a nuestro favor (por precio, competencia, etc.).",
          "Stand By: El proyecto se pausa temporal o indefinidamente por parte del cliente.",
          "Descartado: Se anula la oportunidad por motivos comerciales, estratégicos o técnicos."
        ],
      },
    ],
    related: [
      "preventa-estado-revision-negociacion",
      "crm-oportunidades-estados"
    ],
  },

  // =========================
  // PREVENTA
  // =========================

  {
    id: "preventa-derivacion-requisitos",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Derivación a Preventa y Asignación",
    keywords: [
      "derivación",
      "asignación",
      "gerente de preventa",
      "viabilidad",
      "entregable",
      "responsable"
    ],
    sections: [
      {
        id: "requisitos-previos",
        title: "Requisitos previos del área Comercial",
        body: "Para que una oportunidad pueda ser derivada y visible para el equipo de Preventa, el ejecutivo comercial debe cumplir obligatoriamente con dos pasos:",
        bullets: [
          "Crear el Entregable: Definir claramente qué se está solicitando al equipo técnico.",
          "Completar la Viabilidad: La oportunidad debe haber pasado el proceso de evaluación de viabilidad correspondiente.",
        ],
      },
      {
        id: "recepcion-asignacion",
        title: "Recepción y Asignación del Proyecto",
        body: "Una vez que el comercial completa el entregable y la viabilidad, la oportunidad ingresa automáticamente a la bandeja de Preventa.",
        bullets: [
          "Revisión: El Gerente de Preventa recibe la solicitud y analiza la información comercial y técnica compartida.",
          "Asignación: Con base en el análisis y la carga laboral, el Gerente asigna un responsable (ingeniero de preventa) para que asuma la gestión del proyecto.",
        ],
      },
    ],
  },
  {
    id: "preventa-asignacion-bloqueo",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Asignación de Ingeniero y Bloqueo de Estados",
    keywords: [
      "asignación",
      "ingeniero",
      "estado",
      "modal",
      "bloqueo",
      "gerente"
    ],
    sections: [
      {
        id: "delegacion-proyecto",
        title: "Delegación del Proyecto",
        body: "Una vez que el proyecto ingresa a la bandeja de Preventa, el Gerente de Preventa es el responsable de analizar la información comercial y técnica para delegar el proyecto a un Ingeniero específico.",
      },
      {
        id: "bloqueo-cambio-estado",
        title: "Regla de Bloqueo: Cambio de Estado",
        body: "El sistema protege el flujo de trabajo asegurando que nadie pueda avanzar un proyecto sin ser el responsable:",
        bullets: [
          "Condición estricta: Si el proyecto AÚN NO tiene un ingeniero asignado, el sistema bloquea por completo el avance.",
          "Resultado: El botón/opción para abrir el modal de cambio de estado se mantendrá deshabilitado o no permitirá la acción hasta que la asignación esté completa.",
        ],
      },
    ],
  },
  {
    id: "preventa-estado-desarrollo-observaciones",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Estado 'Desarrollo' y Manejo de Observaciones",
    keywords: [
      "desarrollo",
      "observaciones",
      "crítica",
      "normal",
      "tarea",
      "fecha",
      "comercial",
      "viabilidad",
      "bloqueo",
      "observado"
    ],
    sections: [
      {
        id: "ingreso-desarrollo",
        title: "Inicio de Trabajo: Estado 'Desarrollo'",
        body: "Una vez asignado el proyecto, el ingeniero encargado comienza a analizar la información y cambia el estado a 'Desarrollo'. Durante esta revisión, si detecta información faltante o inconsistente, registrará una Observación.",
      },
      {
        id: "impacto-estado-comercial",
        title: "Cambio Automático a Estado 'Observado'",
        body: "En el instante en que el ingeniero registra la observación, el sistema actualiza automáticamente el estado de la oportunidad en la parte comercial a 'OBSERVADO'. Esto alerta de inmediato al área comercial de que hay un requerimiento pendiente que frena el proceso.",
      },
      {
        id: "tipos-observaciones",
        title: "Tipos de Observaciones",
        body: "El impacto técnico en el proyecto depende del tipo de observación registrada:",
        bullets: [
          "Observación Normal: Es una consulta o falta de dato menor. Permite que el ingeniero continúe trabajando en otras partes del proyecto, aunque requiere respuesta.",
          "Observación Crítica: Falta información vital para el diseño o costeo. Bloquea el avance técnico del proyecto y obliga a realizar una reevaluación de la Viabilidad.",
        ],
      },
      {
        id: "accion-comercial-fecha",
        title: "Gestión del Comercial: Fecha de Levantamiento",
        body: "Para resolver el estado 'OBSERVADO', el ejecutivo comercial debe ingresar al sistema y agregar obligatoriamente la fecha en la que se levantó o se levantará dicha observación.",
      },
      {
        id: "transformacion-tarea",
        title: "Conversión a Tarea y Desbloqueo",
        body: "El sistema controla que la respuesta se ejecute mediante esta regla:",
        bullets: [
          "Generación de Tarea: Al registrar la fecha, la observación se transforma en una Tarea pendiente asignada al comercial.",
          "Desbloqueo de Preventa: Para que el ingeniero pueda culminar su trabajo y el flujo continúe, el comercial debe marcar esa Tarea como completada.",
        ],
      },
    ],
  },
  {
    id: "preventa-aprobacion-observaciones",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Aprobación de Observaciones y Desbloqueo de Estado",
    keywords: [
      "aprobación",
      "validación",
      "observación levantada",
      "botón",
      "tabla",
      "modal",
      "cambio de estado",
      "bloqueo"
    ],
    sections: [
      {
        id: "validacion-preventa",
        title: "Revisión del Levantamiento de Observaciones",
        body: "Que el área Comercial marque la tarea como 'completada' no significa que el proyecto avance automáticamente. El flujo regresa al ingeniero de preventa para que valide si la información entregada es correcta y suficiente.",
      },
      {
        id: "boton-aprobacion",
        title: "Habilitación del Botón de Aprobación",
        body: "Una vez que el comercial completa su tarea, en la tabla de gestión del ingeniero de preventa se habilitará un botón de acción. Este botón le permite al ingeniero evaluar la respuesta y decidir si aprueba o rechaza el levantamiento de la observación.",
      },
      {
        id: "bloqueo-modal-estado",
        title: "Regla de Bloqueo: Modal de Cambio de Estado",
        body: "El sistema impone un control estricto para proteger la calidad del proyecto:",
        bullets: [
          "Bloqueo Activo: Mientras existan observaciones sin aprobar por el ingeniero, es imposible avanzar. El sistema bloquea por completo la apertura del modal de 'Cambio de Estado'.",
          "Desbloqueo: Solo en el momento en que el ingeniero aprueba la observación (confirmando que la información es válida), el sistema libera el modal, permitiendo que el proyecto continúe su curso hacia la siguiente etapa.",
        ],
      },
    ],
  },
  {
    id: "preventa-estado-entregado",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Paso a Estado 'Entregado' y Carga de Archivos",
    keywords: [
      "entregado",
      "archivos",
      "carpeta destino",
      "adjuntar",
      "comercial",
      "retorno",
      "documentación"
    ],
    sections: [
      {
        id: "requisitos-entregado",
        title: "Requisitos para cambiar a 'Entregado'",
        body: "Cuando el ingeniero de preventa finaliza su análisis o diseño y necesita cambiar el estado del proyecto a 'ENTREGADO', el sistema le exigirá sustentar su trabajo mediante la documentación correspondiente.",
      },
      {
        id: "carga-archivos-carpetas",
        title: "Obligatoriedad: Archivos y Carpetas Destino",
        body: "El ingeniero no puede simplemente cambiar el estado y cerrar su gestión. Debe cumplir estrictamente con lo siguiente:",
        bullets: [
          "Adjuntar Archivos: Es obligatorio subir los documentos técnicos resultantes de la oportunidad (ej. costeo, planos, arquitecturas, TDRs resueltos).",
          "Selección de Carpeta: Por cada archivo que se adjunte, el ingeniero debe seleccionar obligatoriamente a qué carpeta destino pertenece. Esto garantiza el orden documental.",
        ],
      },
      {
        id: "retorno-comercial",
        title: "Retorno al Área Comercial",
        body: "Una vez cumplidos los requisitos y guardado el estado como 'ENTREGADO', el ciclo técnico principal concluye.",
        bullets: [
          "Toda la información, junto con los archivos ordenados en sus carpetas, queda inmediatamente visible y disponible para el área Comercial.",
          "El ejecutivo comercial ya tiene luz verde para retomar la oportunidad, descargar los entregables y continuar con su flujo (por ejemplo, presentar la propuesta final al cliente).",
        ],
      },
    ],
  },
  {
    id: "preventa-estado-revision-negociacion",
    area: "PREVENTA",
    group: "1. Gestión de Proyectos",
    title: "Negociación y Retorno a Estado 'Revisión'",
    keywords: [
      "negociación",
      "observación",
      "revisión",
      "bucle",
      "resolución",
      "cotización",
      "reproceso"
    ],
    sections: [
      {
        id: "estado-negociacion",
        title: "El Estado 'Negociación'",
        body: "Si la oportunidad no se cierra inmediatamente tras presentar la cotización, el Comercial la pasa a estado 'Negociación'. En esta etapa, el cliente puede plantear dudas, solicitar cambios técnicos o ajustes de dimensionamiento.",
      },
      {
        id: "retorno-revision",
        title: "Retorno a Preventa: Estado 'Revisión'",
        body: "Si durante la negociación surge una observación sobre la cotización que requiere soporte técnico, la oportunidad hace un viaje de regreso:",
        bullets: [
          "El sistema cambia el estado del proyecto en Preventa a 'REVISIÓN'.",
          "El proyecto regresa a la bandeja del ingeniero de preventa originalmente asignado para que analice y resuelva esta nueva observación."
        ],
      },
      {
        id: "resolucion-bucle",
        title: "Resolución y el bucle de 'Entregado'",
        body: "El ingeniero de preventa debe trabajar en la observación solicitada. Una vez resuelta:",
        bullets: [
          "Debe volver a marcar el proyecto como 'ENTREGADO' (adjuntando los archivos corregidos a sus carpetas destino si aplica).",
          "La información vuelve al Comercial para que actualice la cotización y continúe la negociación.",
          "Este ciclo (Negociación -> Revisión -> Entregado) se repetirá tantas veces como existan observaciones, hasta que la oportunidad pase a un estado final (Ganado, Perdido, etc.)."
        ],
      },
    ],
  },
  {
    id: "preventa-entregables",
    area: "PREVENTA",
    group: "2. Entregables",
    title: "Entregables y Estado 'Entregado'",
    keywords: ["preventa", "entregado", "entregables"],
    sections: [
      {
        id: "que-significa",
        title: "¿Qué significa ENTREGADO?",
        body: "Significa que el análisis o soporte técnico solicitado fue finalizado correctamente.",
      },
      {
        id: "impacto-en-crm",
        title: "Impacto en CRM",
        body: "Mientras no esté en ENTREGADO, Comercial no podrá avanzar a ciertos estados.",
      },
    ],
  },
  {
    id: "preventa-visualizacion-viabilidad",
    area: "PREVENTA",
    group: "3. Herramientas de Proyecto",
    title: "Botón de Análisis de Viabilidad",
    keywords: [
      "viabilidad",
      "análisis",
      "botón",
      "puntaje",
      "lectura",
      "evaluación"
    ],
    sections: [
      {
        id: "proposito-boton-viabilidad",
        title: "¿Para qué sirve el botón de Viabilidad?",
        body: "Dentro de la gestión de un proyecto de preventa, encontrarás un botón o acceso directo para visualizar el 'Análisis de Viabilidad'. Esta herramienta te permite consultar rápidamente la evaluación inicial que realizó el área Comercial antes de derivar la oportunidad.",
      },
      {
        id: "modo-lectura",
        title: "Modo de Solo Lectura",
        body: "Es importante destacar que esta vista es estrictamente informativa (solo lectura).",
        bullets: [
          "Podrás ver los puntajes de cumplimiento, metodologías de contratación, presupuesto estimado y experiencia del cliente.",
          "El equipo técnico no puede modificar las respuestas ni el puntaje de viabilidad desde esta pantalla, ya que esa es responsabilidad exclusiva del área Comercial.",
        ],
      },
    ],
  },
  {
    id: "preventa-gestion-equipo",
    area: "PREVENTA",
    group: "3. Herramientas de Proyecto",
    title: "Gestión de Equipo",
    keywords: [
      "equipo",
      "colaboradores",
      "asignación",
      "añadir",
      "eliminar",
      "participantes"
    ],
    sections: [
      {
        id: "proposito-gestion-equipo",
        title: "Propósito de la Gestión de Equipo",
        body: "Aunque cada proyecto tiene un Ingeniero responsable principal, la herramienta 'Gestión de Equipo' permite añadir a otros especialistas o colaboradores que brindarán apoyo en el desarrollo de la oportunidad.",
      },
      {
        id: "como-agregar",
        title: "Cómo agregar nuevos colaboradores",
        body: "El proceso para integrar personal al proyecto consta de dos pasos:",
        bullets: [
          "Selección: Utiliza el buscador para encontrar al colaborador deseado. Al seleccionarlo, pasará a una lista de 'Colaboradores a Agregar'.",
          "Confirmación: Puedes agregar varios colaboradores a la vez a esta lista previa. Una vez que tengas a todos los necesarios, debes confirmar la acción para que el sistema los asigne oficialmente al proyecto.",
        ],
      },
      {
        id: "visualizacion-eliminacion",
        title: "Lista de Equipo Actual y Eliminación",
        body: "Dentro del mismo panel, podrás ver el listado completo de las personas que ya están asignadas al proyecto.",
        bullets: [
          "La lista te mostrará el nombre y el cargo de cada integrante. Si la lista es larga, podrás usar el buscador interno o cambiar de página.",
          "Si un colaborador ya no es requerido, puedes retirarlo del equipo utilizando el botón de eliminación (ícono de papelera) junto a su nombre. El sistema te pedirá confirmación antes de retirarlo.",
        ],
      },
      {
        id: "restriccion-bloqueo",
        title: "Restricciones de Asignación",
        body: "En ciertos estados del proyecto, la gestión del equipo puede estar bloqueada. Si esto ocurre, verás un candado y un mensaje indicando que la 'Asignación está Bloqueada' por ejmplo si tiene una observacion urgente.",
      },
    ],
  },
  {
    id: "preventa-gestion-tareas",
    area: "PREVENTA",
    group: "3. Herramientas de Proyecto",
    title: "Gestión de Tareas",
    keywords: [
      "tareas",
      "kanban",
      "subtareas",
      "estados",
      "prioridad",
      "organización"
    ],
    sections: [
      {
        id: "proposito-tareas",
        title: "Organización del Trabajo",
        body: "El módulo de tareas permite al ingeniero (y a sus colaboradores) desglosar el requerimiento técnico en actividades más pequeñas y manejables, asegurando que nada se pase por alto antes de marcar el proyecto como Entregado.",
      },
      {
        id: "vistas-tareas",
        title: "Vistas: Lista y Kanban",
        body: "El sistema ofrece dos formas de visualizar y gestionar el trabajo:",
        bullets: [
          "Vista de Lista: Ideal para ver todas las tareas de forma tabular, revisar fechas, responsables y prioridades rápidamente.",
          "Vista Kanban (Tablero): Una interfaz visual de tarjetas agrupadas por columnas según su estado (ej. Pendiente, En Progreso, Completado). Puedes cambiar el estado de una tarea fácilmente desde aquí.",
        ],
      },
      {
        id: "subtareas-detalles",
        title: "Subtareas y Prioridades",
        body: "Para un control más granular, cada tarea principal puede contener subtareas. Además, puedes asignar niveles de prioridad (ej. Alta, Media, Baja) para indicar qué puntos son críticos para el avance del proyecto.",
      },
    ],
  },
];