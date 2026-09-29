// js/db.js - Gestión de localStorage

class Database {
  constructor() {
    this.db = null;
    this.images = new Map();
  }

  /**
   * Inicializar base de datos desde localStorage
   */
  init() {
    try {
      const stored = localStorage.getItem(CONFIG.DB_KEY);
      this.db = stored ? JSON.parse(stored) : { 
        orders: [], 
        counter: 1 
      };

      const storedImages = localStorage.getItem(CONFIG.IMAGES_KEY);
      if (storedImages) {
        this.images = new Map(JSON.parse(storedImages));
      }
    } catch (e) {
      console.error('Error inicializando DB:', e);
      this.db = { orders: [], counter: 1 };
    }
  }

  /**
   * Guardar base de datos en localStorage
   */
  save() {
    try {
      localStorage.setItem(CONFIG.DB_KEY, JSON.stringify(this.db));
      localStorage.setItem(
        CONFIG.IMAGES_KEY,
        JSON.stringify(Array.from(this.images.entries()))
      );
    } catch (e) {
      console.error('Error guardando DB:', e);
      throw new Error('Error al guardar datos');
    }
  }

  /**
   * Obtener todas las órdenes
   * @returns {Array} Lista de órdenes
   */
  getAllOrders() {
    return this.db.orders || [];
  }

  /**
   * Obtener orden por ID
   * @param {Number} id - ID de la orden
   * @returns {Object|null} Orden o null
   */
  getOrder(id) {
    return this.db.orders.find(o => o.id === id);
  }

  /**
   * Crear nueva orden
   * @param {Object} order - Datos de la orden
   * @returns {Object} Orden creada con ID
   */
  createOrder(order) {
    const newOrder = {
      ...DEFAULT_ORDER,
      ...order,
      id: this.db.counter++
    };
    this.db.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  /**
   * Actualizar orden existente
   * @param {Number} id - ID de la orden
   * @param {Object} data - Datos a actualizar
   * @returns {Object|null} Orden actualizada o null
   */
  updateOrder(id, data) {
    const idx = this.db.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.db.orders[idx] = { ...this.db.orders[idx], ...data };
      this.save();
      return this.db.orders[idx];
    }
    return null;
  }

  /**
   * Eliminar orden
   * @param {Number} id - ID de la orden
   */
  deleteOrder(id) {
    const order = this.getOrder(id);
    if (order && order.images) {
      Object.keys(order.images).forEach(key => {
        (order.images[key] || []).forEach(imgId => 
          this.images.delete(imgId)
        );
      });
    }
    this.db.orders = this.db.orders.filter(o => o.id !== id);
    this.save();
  }

  /**
   * Duplicar orden
   * @param {Number} id - ID de la orden a duplicar
   * @returns {Object|null} Nueva orden duplicada
   */
  duplicateOrder(id) {
    const original = this.getOrder(id);
    if (!original) return null;

    const newOrder = {
      ...original,
      id: this.db.counter++
    };
    delete newOrder.firmaCliente;
    delete newOrder.firmaIngeniero;

    if (original.images) {
      newOrder.images = {};
      Object.keys(original.images).forEach(key => {
        newOrder.images[key] = (original.images[key] || []).map(imgId => {
          const imgData = this.images.get(imgId);
          if (imgData) {
            const newId = 'img_' + Date.now() + '_' + Math.random();
            this.images.set(newId, imgData);
            return newId;
          }
          return null;
        }).filter(Boolean);
      });
    }

    this.db.orders.push(newOrder);
    this.save();
    return newOrder;
  }

  /**
   * Guardar imagen comprimida
   * @param {String} id - ID único de la imagen
   * @param {String} data - Datos base64 de la imagen
   */
  saveImage(id, data) {
    this.images.set(id, data);
    this.save();
  }

  /**
   * Obtener imagen
   * @param {String} id - ID de la imagen
   * @returns {String|null} Datos base64 o null
   */
  getImage(id) {
    // Primero buscar en caché temporal (para imágenes de nube)
    if (window._tmpImgCache && window._tmpImgCache.has(id)) {
      return window._tmpImgCache.get(id);
    }
    return this.images.get(id);
  }

  /**
   * Buscar órdenes
   * @param {String} query - Término de búsqueda
   * @returns {Array} Órdenes que coinciden
   */
  searchOrders(query) {
    if (!query) return this.getAllOrders();
    
    const q = query.toLowerCase();
    return this.getAllOrders().filter(order =>
      order.cliente?.toLowerCase().includes(q) ||
      order.numeroTicket?.toLowerCase().includes(q) ||
      order.ubicacion?.toLowerCase().includes(q) ||
      order.contacto?.toLowerCase().includes(q)
    );
  }

  /**
   * Estadísticas de base de datos
   */
  stats() {
    return {
      totalOrders: this.db.orders.length,
      totalImages: this.images.size,
      dbSize: new Blob([localStorage.getItem(CONFIG.DB_KEY)]).size,
      imagesSize: new Blob([localStorage.getItem(CONFIG.IMAGES_KEY)]).size
    };
  }
}

// Instancia global
const db = new Database();
