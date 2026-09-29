// js/toast.js - Sistema de notificaciones

class Toast {
  /**
   * Mostrar notificación
   * @param {String} message - Mensaje a mostrar
   * @param {String} type - 'success', 'error', 'info', 'warning'
   * @param {Number} duration - Duración en ms
   */
  static show(message, type = 'info', duration = CONFIG.TOAST_DURATION) {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };

    toast.className = `
      fixed z-50 px-6 py-3 rounded-lg text-white shadow-lg
      animate-fade-in
      ${colors[type] || colors.info}
    `;
    
    Object.assign(toast.style, CONFIG.TOAST_POSITION);

    toast.textContent = message;
    document.body.appendChild(toast);

    // Agregar animación si no existe
    if (!document.querySelector('style[data-toast-css]')) {
      const style = document.createElement('style');
      style.setAttribute('data-toast-css', 'true');
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateY(0); }
          to { opacity: 0; transform: translateY(10px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-fade-out {
          animation: fadeOut 0.3s ease-out forwards;
        }
      `;
      document.head.appendChild(style);
    }

    // Auto-remover
    setTimeout(() => {
      toast.classList.add('animate-fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);

    return toast;
  }

  /**
   * Notificación de éxito
   * @param {String} message
   */
  static success(message) {
    return this.show(message, 'success');
  }

  /**
   * Notificación de error
   * @param {String} message
   */
  static error(message) {
    return this.show(message, 'error');
  }

  /**
   * Notificación informativa
   * @param {String} message
   */
  static info(message) {
    return this.show(message, 'info');
  }

  /**
   * Notificación de advertencia
   * @param {String} message
   */
  static warning(message) {
    return this.show(message, 'warning');
  }

  /**
   * Confirmación modal
   * @param {String} message - Mensaje
   * @param {Function} onConfirm - Callback si confirma
   * @param {Function} onCancel - Callback si cancela
   */
  static confirm(message, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm">
        <p class="text-gray-800 mb-6">${message}</p>
        <div class="flex gap-3 justify-end">
          <button id="cancelBtn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">
            Cancelar
          </button>
          <button id="confirmBtn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Confirmar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#confirmBtn').addEventListener('click', () => {
      modal.remove();
      onConfirm?.();
    });

    modal.querySelector('#cancelBtn').addEventListener('click', () => {
      modal.remove();
      onCancel?.();
    });

    // Cerrar al clickear fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        onCancel?.();
      }
    });

    return modal;
  }

  /**
   * Prompt con input
   * @param {String} message - Mensaje
   * @param {String} defaultValue - Valor default
   * @returns {Promise<String|null>}
   */
  static async prompt(message, defaultValue = '') {
    return new Promise(resolve => {
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 shadow-xl max-w-sm">
          <p class="text-gray-800 mb-4">${message}</p>
          <input type="text" id="promptInput" class="w-full border border-gray-300 rounded px-3 py-2 mb-6"
                 value="${defaultValue}">
          <div class="flex gap-3 justify-end">
            <button id="cancelBtn" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">
              Cancelar
            </button>
            <button id="confirmBtn" class="px-4 py-2 bg-blue-600 text-white rounded">
              Aceptar
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      const input = modal.querySelector('#promptInput');
      input.focus();

      const confirm = () => {
        modal.remove();
        resolve(input.value);
      };

      modal.querySelector('#confirmBtn').addEventListener('click', confirm);
      modal.querySelector('#cancelBtn').addEventListener('click', () => {
        modal.remove();
        resolve(null);
      });

      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') confirm();
      });
    });
  }

  /**
   * Limpiar todos los toasts
   */
  static clearAll() {
    document.querySelectorAll('[class*="animate-fade"]').forEach(el => {
      if (el.closest('.fixed')) el.remove();
    });
  }
}
