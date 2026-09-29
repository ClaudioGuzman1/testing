// js/validators.js - Validaciones

class Validators {
  /**
   * Validar orden completa
   * @param {Object} order - Orden a validar
   * @returns {Object} { valid: boolean, errors: [] }
   */
  static validateOrder(order) {
    const errors = [];

    if (!order.numeroTicket?.trim()) 
      errors.push('Número de ticket requerido');
    
    if (!order.fechaAtencion?.trim()) 
      errors.push('Fecha de atención requerida');
    
    if (!order.ingeniero?.trim()) 
      errors.push('Ingeniero requerido');
    
    if (!order.cliente?.trim()) 
      errors.push('Cliente requerido');
    
    if (!order.ubicacion?.trim()) 
      errors.push('Ubicación requerida');
    
    if (!order.contacto?.trim()) 
      errors.push('Contacto requerido');
    
    if (!order.telefono?.trim()) 
      errors.push('Teléfono requerido');
    
    if (!order.incidencia?.trim()) 
      errors.push('Incidencia requerida');
    
    if (!order.tipoServicio?.trim()) 
      errors.push('Tipo de servicio requerido');

    // Validaciones condicionales
    if (order.solicitaTerminal) {
      if (!order.nombreTerminal?.trim()) 
        errors.push('Nombre de terminal requerido');
      
      if (!order.modeloTerminal?.trim()) 
        errors.push('Modelo de terminal requerido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar campo individual
   * @param {String} fieldName - Nombre del campo
   * @param {*} value - Valor a validar
   * @returns {Boolean} Es válido
   */
  static validateField(fieldName, value) {
    if (typeof value === 'string') {
      value = value.trim();
    }

    const requiredFields = [
      'numeroTicket', 'fechaAtencion', 'ingeniero', 'cliente',
      'ubicacion', 'contacto', 'telefono', 'incidencia', 'tipoServicio'
    ];

    if (requiredFields.includes(fieldName)) {
      return value && value.length > 0;
    }

    return true;
  }

  /**
   * Validar email
   * @param {String} email
   * @returns {Boolean}
   */
  static isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Validar teléfono
   * @param {String} phone
   * @returns {Boolean}
   */
  static isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  }

  /**
   * Validar fecha
   * @param {String} date - Formato YYYY-MM-DD
   * @returns {Boolean}
   */
  static isValidDate(date) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }

  /**
   * Validar imagen
   * @param {File} file
   * @returns {Object} { valid: boolean, error: string }
   */
  static validateImage(file) {
    if (!file) 
      return { valid: false, error: 'Archivo no seleccionado' };

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize)
      return { valid: false, error: 'Imagen muy grande (máx 5MB)' };

    if (!CONFIG.IMAGE.FORMATS.includes(file.type))
      return { valid: false, error: 'Formato no soportado' };

    return { valid: true };
  }

  /**
   * Validar que un campo de texto sea alfanumérico (para seriales/MACs)
   * @param {String} value
   * @returns {Boolean}
   */
  static isAlphaNumeric(value) {
    return /^[a-zA-Z0-9-_]*$/.test(value);
  }

  /**
   * Validar formato MAC
   * @param {String} mac
   * @returns {Boolean}
   */
  static isValidMac(mac) {
    const regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return regex.test(mac) || mac.length === 0;
  }
}
