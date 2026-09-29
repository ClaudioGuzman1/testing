// js/images.js - Gestión de imágenes

class ImageManager {
  /**
   * Comprimir imagen
   * @param {File} file - Archivo de imagen
   * @param {Number} maxWidth - Ancho máximo
   * @param {Number} quality - Calidad (0-1)
   * @returns {Promise<String>} Base64 de imagen comprimida
   */
  static async compress(file, maxWidth = 800, quality = 0.6) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calcular nueva altura manteniendo aspecto
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              const reader2 = new FileReader();
              reader2.onload = () => resolve(reader2.result);
              reader2.onerror = reject;
              reader2.readAsDataURL(blob);
            },
            'image/jpeg',
            quality
          );
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Guardar imagen en BD
   * @param {String} category - Categoría (inicial, mediciones, etc)
   * @param {String} base64 - Datos base64
   * @returns {String} ID único de imagen
   */
  static saveImage(category, base64) {
    const id = `img_${category}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    db.saveImage(id, base64);
    return id;
  }

  /**
   * Obtener imagen para mostrar
   * @param {String} id - ID de imagen
   * @returns {String} Base64 o empty string
   */
  static getImage(id) {
    return db.getImage(id) || '';
  }

  /**
   * Eliminar imagen
   * @param {String} id - ID de imagen
   */
  static deleteImage(id) {
    // Solo eliminar de BD si es local
    // Las de Supabase se eliminarán diferente
    if (id.startsWith('img_')) {
      db.images.delete(id);
      db.save();
    }
  }

  /**
   * Agregar imagen a orden
   * @param {Number} orderId - ID de orden
   * @param {String} category - Categoría
   * @param {String} imageId - ID de imagen
   */
  static addImageToOrder(orderId, category, imageId) {
    const order = db.getOrder(orderId);
    if (order) {
      if (!order.images) order.images = {};
      if (!order.images[category]) order.images[category] = [];
      if (!order.images[category].includes(imageId)) {
        order.images[category].push(imageId);
      }
      db.save();
    }
  }

  /**
   * Eliminar imagen de orden
   * @param {Number} orderId - ID de orden
   * @param {String} category - Categoría
   * @param {String} imageId - ID de imagen
   */
  static removeImageFromOrder(orderId, category, imageId) {
    const order = db.getOrder(orderId);
    if (order?.images?.[category]) {
      order.images[category] = order.images[category].filter(id => id !== imageId);
      db.save();
    }
    this.deleteImage(imageId);
  }

  /**
   * Obtener todas las imágenes de una orden
   * @param {Number} orderId - ID de orden
   * @returns {Object} Mapa de categoría -> imagenes
   */
  static getOrderImages(orderId) {
    const order = db.getOrder(orderId);
    if (!order?.images) return {};

    const result = {};
    Object.keys(order.images).forEach(category => {
      result[category] = order.images[category].map(id => ({
        id,
        url: this.getImage(id)
      }));
    });
    return result;
  }

  /**
   * Contar imágenes de una orden
   * @param {Number} orderId - ID de orden
   * @returns {Number} Total de imágenes
   */
  static countImages(orderId) {
    const order = db.getOrder(orderId);
    if (!order?.images) return 0;
    
    return Object.values(order.images)
      .reduce((sum, arr) => sum + (arr?.length || 0), 0);
  }

  /**
   * Verificar si hay imágenes en categoría
   * @param {Number} orderId - ID de orden
   * @param {String} category - Categoría
   * @returns {Boolean}
   */
  static hasImages(orderId, category) {
    const order = db.getOrder(orderId);
    return (order?.images?.[category]?.length || 0) > 0;
  }

  /**
   * Generar URL de descarga para imagen
   * @param {String} imageId - ID de imagen
   * @returns {String} Data URL
   */
  static getImageURL(imageId) {
    const base64 = this.getImage(imageId);
    return base64 || '';
  }

  /**
   * Estadísticas de imágenes
   * @returns {Object}
   */
  static stats() {
    return {
      totalImages: db.images.size,
      totalSize: new Blob([
        JSON.stringify(Array.from(db.images.values()))
      ]).size
    };
  }
}
