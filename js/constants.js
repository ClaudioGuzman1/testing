// js/constants.js - Configuración global

const CONFIG = {
  // Base de datos
  DB_KEY: 'ods_data',
  IMAGES_KEY: 'ods_images',
  
  // Supabase (será reemplazado)
  SUPABASE: {
    URL: 'https://yohycjzpjfiydszblavn.supabase.co',
    KEY: '', // Cargar del HTML
    BUCKET: 'ods-imagenes'
  },
  
  // Imágenes
  IMAGE: {
    MAX_WIDTH: 800,
    QUALITY: 0.6,
    FORMATS: ['image/jpeg', 'image/png', 'image/webp']
  },
  
  // UI
  TOAST_DURATION: 3500,
  TOAST_POSITION: { bottom: '24px', right: '24px' },
  
  // Formulario
  TABS: ['general', 'mediciones', 'evidencias', 'entregas'],
  IMAGE_CATEGORIES: ['inicial', 'mediciones', 'instalacion', 'extras'],
  
  // PDF
  PDF: {
    PAGE_WIDTH: 210,
    PAGE_HEIGHT: 279,
    MARGINS: { left: 15, right: 15, top: 15, bottom: 15 }
  }
};

// Estructura default de una orden
const DEFAULT_ORDER = {
  numeroTicket: '',
  fechaAtencion: new Date().toISOString().split('T')[0],
  ingeniero: '',
  cliente: '',
  ubicacion: '',
  direccion: '',
  contacto: '',
  cargo: '',
  telefono: '',
  correo: '',
  incidencia: '',
  tipoServicio: '',
  fechaCreacion: new Date().toISOString().split('T')[0],
  nombreTerminal: '',
  solicitaTerminal: false,
  modeloTerminal: '',
  serieRetirada: '',
  macRetirada: '',
  fallaRetirada: '',
  serieInstalada: '',
  macInstalada: '',
  solucion: '',
  comentario: '',
  images: {
    inicial: [],
    mediciones: [],
    instalacion: [],
    extras: []
  },
  entregas: {
    materiales: []
  },
  firmaCliente: null,
  firmaIngeniero: null
};

// Mensajes
const MESSAGES = {
  SUCCESS: {
    CREATE: '✅ Orden creada exitosamente',
    UPDATE: '✅ Orden actualizada',
    DELETE: '✅ Orden eliminada',
    DUPLICATE: '✅ Orden duplicada',
    IMAGE_SAVED: '✅ Imagen guardada',
    PDF_GENERATED: '✅ PDF generado'
  },
  ERROR: {
    DELETE_CONFIRM: '❌ Cancelado',
    VALIDATION: '❌ Por favor completa los campos requeridos',
    IMAGE_COMPRESS: '❌ Error al comprimir imagen',
    PDF_ERROR: '❌ Error al generar PDF',
    NETWORK: '❌ Error de conexión'
  }
};
