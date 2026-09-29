// js/handlers.js - Manejadores de eventos

class Handlers {
  /**
   * Inicializar todos los event listeners
   */
  static init() {
    // Botones de vista
    document.getElementById('newOrderBtn')?.addEventListener('click', () => this.newOrder());
    document.getElementById('backBtn')?.addEventListener('click', () => UIManager.showListView());

    // Tabs
    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.getAttribute('data-tab-btn');
        UIManager.showTab(tabName);
      });
    });

    // Formulario
    document.getElementById('saveOrderBtn')?.addEventListener('click', () => this.saveOrder());
    document.getElementById('cancelFormBtn')?.addEventListener('click', () => UIManager.showListView());

    // Búsqueda
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      this.search(e.target.value);
    });

    // Acciones en lista
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('edit-btn')) {
        this.editOrder(parseInt(e.target.getAttribute('data-id')));
      }
      if (e.target.classList.contains('delete-btn')) {
        this.deleteOrder(parseInt(e.target.getAttribute('data-id')));
      }
      if (e.target.classList.contains('duplicate-btn')) {
        this.duplicateOrder(parseInt(e.target.getAttribute('data-id')));
      }
      if (e.target.classList.contains('pdf-btn')) {
        this.generatePDF(parseInt(e.target.getAttribute('data-id')));
      }
    });

    // Carga de imágenes
    document.querySelectorAll('[data-image-input]').forEach(input => {
      input.addEventListener('change', (e) => this.uploadImage(e));
    });

    // Actualizar lista cuando cambia el estado
    appState.subscribe(() => {
      if (appState.view === 'list') {
        const orders = appState.search 
          ? db.searchOrders(appState.search)
          : db.getAllOrders();
        UIManager.updateOrdersList(orders);
      }
    });
  }

  /**
   * Crear nueva orden
   */
  static newOrder() {
    UIManager.clearForm();
    UIManager.clearErrors();
    appState.setState({ currentOrder: null });
    UIManager.showFormView();
    UIManager.showTab('general');
  }

  /**
   * Editar orden existente
   * @param {Number} orderId - ID de orden
   */
  static editOrder(orderId) {
    const order = db.getOrder(orderId);
    if (!order) {
      Toast.error('Orden no encontrada');
      return;
    }
    UIManager.clearErrors();
    UIManager.loadOrderToForm(order);
    UIManager.showFormView();
    UIManager.showTab('general');
    UIManager.updateImageCount(orderId);
  }

  /**
   * Guardar orden
   */
  static async saveOrder() {
    UIManager.clearErrors();
    const formData = UIManager.getFormData();

    // Validar
    const validation = Validators.validateOrder(formData);
    if (!validation.valid) {
      validation.errors.forEach(error => {
        Toast.error(error);
      });
      return;
    }

    try {
      UIManager.setFormEnabled(false);
      UIManager.showProgress('Guardando...', 50);

      const isNew = !appState.currentOrder?.id;
      let savedOrder;

      if (isNew) {
        savedOrder = db.createOrder(formData);
      } else {
        savedOrder = db.updateOrder(appState.currentOrder.id, formData);
      }

      UIManager.hideProgress();
      UIManager.setFormEnabled(true);

      Toast.success(
        isNew ? MESSAGES.SUCCESS.CREATE : MESSAGES.SUCCESS.UPDATE
      );

      // Actualizar estado
      appState.setState({
        orders: db.getAllOrders(),
        currentOrder: null
      });

      // Volver a lista
      setTimeout(() => UIManager.showListView(), 500);
    } catch (error) {
      console.error('Error guardando:', error);
      UIManager.hideProgress();
      UIManager.setFormEnabled(true);
      Toast.error(MESSAGES.ERROR.VALIDATION);
    }
  }

  /**
   * Eliminar orden
   * @param {Number} orderId - ID de orden
   */
  static deleteOrder(orderId) {
    const order = db.getOrder(orderId);
    if (!order) return;

    Toast.confirm(
      `¿Eliminar orden ${order.numeroTicket}?`,
      () => {
        db.deleteOrder(orderId);
        Toast.success(MESSAGES.SUCCESS.DELETE);
        appState.setState({ orders: db.getAllOrders() });
      },
      () => {
        Toast.info(MESSAGES.ERROR.DELETE_CONFIRM);
      }
    );
  }

  /**
   * Duplicar orden
   * @param {Number} orderId - ID de orden
   */
  static duplicateOrder(orderId) {
    const newOrder = db.duplicateOrder(orderId);
    if (newOrder) {
      Toast.success(MESSAGES.SUCCESS.DUPLICATE);
      appState.setState({ orders: db.getAllOrders() });
    } else {
      Toast.error('Error al duplicar orden');
    }
  }

  /**
   * Generar PDF
   * @param {Number} orderId - ID de orden
   */
  static async generatePDF(orderId) {
    const order = db.getOrder(orderId);
    if (!order) return;

    if (!PDFManager.isAvailable()) {
      Toast.error('PDF no disponible en este momento');
      return;
    }

    await PDFManager.generatePDF(order);
  }

  /**
   * Buscar órdenes
   * @param {String} query - Término de búsqueda
   */
  static search(query) {
    appState.setState({ search: query });
    const results = db.searchOrders(query);
    UIManager.updateOrdersList(results);
  }

  /**
   * Subir imagen
   * @param {Event} e - Event del input
   */
  static async uploadImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar
    const validation = Validators.validateImage(file);
    if (!validation.valid) {
      Toast.error(validation.error);
      return;
    }

    if (!appState.currentOrder?.id) {
      Toast.error('Primero guarda la orden');
      return;
    }

    try {
      UIManager.showProgress('Comprimiendo imagen...', 30);

      // Comprimir
      const compressed = await ImageManager.compress(file);

      UIManager.showProgress('Guardando...', 70);

      // Guardar
      const category = e.target.getAttribute('data-category') || 'inicial';
      const imageId = ImageManager.saveImage(category, compressed);
      ImageManager.addImageToOrder(appState.currentOrder.id, category, imageId);

      UIManager.hideProgress();
      UIManager.updateImageCount(appState.currentOrder.id);

      Toast.success(MESSAGES.SUCCESS.IMAGE_SAVED);

      // Limpiar input
      e.target.value = '';
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      UIManager.hideProgress();
      Toast.error(MESSAGES.ERROR.IMAGE_COMPRESS);
    }
  }
}

// Inicializar cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Handlers.init());
} else {
  Handlers.init();
}
