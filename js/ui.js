// js/ui.js - Gestión de UI

class UIManager {
  /**
   * Mostrar vista de lista
   */
  static showListView() {
    const listView = document.getElementById('listView');
    const formView = document.getElementById('formView');
    if (listView) listView.style.display = 'block';
    if (formView) formView.style.display = 'none';
    appState.setState({ view: 'list' });
  }

  /**
   * Mostrar vista de formulario
   */
  static showFormView() {
    const listView = document.getElementById('listView');
    const formView = document.getElementById('formView');
    if (listView) listView.style.display = 'none';
    if (formView) formView.style.display = 'block';
    appState.setState({ view: 'form' });
  }

  /**
   * Mostrar tab específico
   * @param {String} tabName - Nombre del tab
   */
  static showTab(tabName) {
    // Ocultar todos los tabs
    document.querySelectorAll('[data-tab]').forEach(el => {
      el.style.display = 'none';
    });

    // Remover clase active de botones
    document.querySelectorAll('[data-tab-btn]').forEach(btn => {
      btn.classList.remove('active', 'bg-blue-600', 'text-white');
      btn.classList.add('bg-gray-200');
    });

    // Mostrar tab seleccionado
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) tab.style.display = 'block';

    // Marcar botón activo
    const btn = document.querySelector(`[data-tab-btn="${tabName}"]`);
    if (btn) {
      btn.classList.add('active', 'bg-blue-600', 'text-white');
      btn.classList.remove('bg-gray-200');
    }

    appState.setState({ tab: tabName });
  }

  /**
   * Actualizar lista de órdenes
   * @param {Array} orders - Órdenes a mostrar
   */
  static updateOrdersList(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12 text-gray-500">
          <p>📋 No hay órdenes</p>
          <p class="text-sm">Crea una nueva para comenzar</p>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => `
      <div class="bg-white p-4 rounded-lg shadow hover:shadow-md transition border-l-4 border-blue-500" 
           data-order-id="${order.id}">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-bold text-lg">${order.numeroTicket || 'S/N'}</h3>
            <p class="text-gray-600 text-sm">${order.cliente || 'Cliente'}</p>
            <p class="text-gray-500 text-xs">${order.fechaAtencion || ''}</p>
          </div>
          <div class="flex gap-2">
            <button class="edit-btn px-3 py-1 bg-blue-500 text-white rounded text-sm" 
                    data-id="${order.id}">✏️ Editar</button>
            <button class="delete-btn px-3 py-1 bg-red-500 text-white rounded text-sm"
                    data-id="${order.id}">🗑️ Eliminar</button>
            <button class="duplicate-btn px-3 py-1 bg-green-500 text-white rounded text-sm"
                    data-id="${order.id}">📋 Duplicar</button>
            <button class="pdf-btn px-3 py-1 bg-purple-500 text-white rounded text-sm"
                    data-id="${order.id}">📄 PDF</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Cargar datos de orden en formulario
   * @param {Object} order - Orden a cargar
   */
  static loadOrderToForm(order) {
    if (!order) return;

    CONFIG.FORM_FIELDS?.forEach(fieldName => {
      const input = document.getElementById(fieldName);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = order[fieldName] === true;
        } else {
          input.value = order[fieldName] || '';
        }
      }
    });

    appState.setState({ currentOrder: order });
  }

  /**
   * Obtener datos del formulario
   * @returns {Object} Datos del formulario
   */
  static getFormData() {
    const data = {};

    CONFIG.FORM_FIELDS?.forEach(fieldName => {
      const input = document.getElementById(fieldName);
      if (input) {
        if (input.type === 'checkbox') {
          data[fieldName] = input.checked;
        } else {
          data[fieldName] = input.value.toUpperCase?.() === 
            fieldName || input.value.trim();
        }
      }
    });

    return { ...DEFAULT_ORDER, ...data };
  }

  /**
   * Limpiar formulario
   */
  static clearForm() {
    if (!CONFIG.FORM_FIELDS) {
      CONFIG.FORM_FIELDS = Object.keys(DEFAULT_ORDER).filter(
        k => k !== 'id' && k !== 'images'
      );
    }

    CONFIG.FORM_FIELDS.forEach(fieldName => {
      const input = document.getElementById(fieldName);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else {
          input.value = '';
        }
      }
    });
  }

  /**
   * Mostrar error de validación
   * @param {String} fieldName - Campo con error
   * @param {String} message - Mensaje de error
   */
  static showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    if (input) {
      input.classList.add('border-red-500', 'border-2');
      const error = document.createElement('div');
      error.className = 'text-red-500 text-xs mt-1';
      error.textContent = message;
      error.id = `error_${fieldName}`;
      input.parentNode?.appendChild(error);
    }
  }

  /**
   * Limpiar errores de validación
   */
  static clearErrors() {
    document.querySelectorAll('[id^="error_"]').forEach(el => el.remove());
    document.querySelectorAll('input, textarea').forEach(el => {
      el.classList.remove('border-red-500', 'border-2');
    });
  }

  /**
   * Habilitar/deshabilitar botones
   * @param {Boolean} enabled
   */
  static setFormEnabled(enabled) {
    document.querySelectorAll('#formView button, #formView input, #formView textarea')
      .forEach(el => {
        el.disabled = !enabled;
      });
  }

  /**
   * Actualizar contador de imágenes
   * @param {Number} orderId - ID de orden
   */
  static updateImageCount(orderId) {
    const count = ImageManager.countImages(orderId);
    const countEl = document.getElementById('imageCount');
    if (countEl) {
      countEl.textContent = count;
      countEl.className = count > 0 ? 'text-green-600' : 'text-gray-500';
    }
  }

  /**
   * Mostrar progreso
   * @param {String} message
   * @param {Number} percent - 0-100
   */
  static showProgress(message, percent = null) {
    let progress = document.getElementById('progressBar');
    if (!progress) {
      progress = document.createElement('div');
      progress.id = 'progressBar';
      progress.className = 'fixed top-0 left-0 right-0 z-50 h-1 bg-blue-500 transition-all';
      document.body.appendChild(progress);
    }
    
    progress.style.width = percent ? `${percent}%` : '100%';
    progress.style.opacity = '1';
  }

  /**
   * Esconder progreso
   */
  static hideProgress() {
    const progress = document.getElementById('progressBar');
    if (progress) {
      progress.style.opacity = '0';
      setTimeout(() => progress.remove(), 300);
    }
  }
}

// Inicializar campos del formulario si no están
if (!CONFIG.FORM_FIELDS) {
  CONFIG.FORM_FIELDS = Object.keys(DEFAULT_ORDER).filter(
    k => !['id', 'images', 'firmaCliente', 'firmaIngeniero'].includes(k)
  );
}
