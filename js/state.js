// js/state.js - Gestión de estado global

class AppState {
  constructor() {
    this.view = 'list';           // 'list' o 'form'
    this.orders = [];
    this.currentOrder = null;
    this.search = '';
    this.tab = 'general';
    this.listeners = [];
    
    // Cloud state
    this.cloudOrders = [];
    this.cloudSearch = '';
    this.cloudLoading = false;
    this.cloudPage = 0;
    this.cloudPageSize = 150;
    this.cloudTotal = 0;
    this.cloudEditId = null;
  }

  /**
   * Actualizar estado y notificar
   * @param {Object} newState - Nuevo estado parcial
   */
  setState(newState) {
    Object.assign(this, newState);
    this.notify();
  }

  /**
   * Suscribirse a cambios de estado
   * @param {Function} listener - Callback a ejecutar
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar todos los listeners
   */
  notify() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (e) {
        console.error('Error en listener de estado:', e);
      }
    });
  }

  /**
   * Limpiar estado para nueva orden
   */
  reset() {
    this.currentOrder = null;
    this.tab = 'general';
  }

  /**
   * Exportar estado (para debugging)
   */
  export() {
    return {
      view: this.view,
      tab: this.tab,
      orders: this.orders.length,
      currentOrder: this.currentOrder?.id || null,
      cloudLoading: this.cloudLoading
    };
  }
}

// Instancia global
const appState = new AppState();
