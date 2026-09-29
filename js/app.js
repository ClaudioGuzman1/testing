// js/app.js - Inicialización y orquestación

class App {
  /**
   * Inicializar aplicación
   */
  static async init() {
    try {
      console.log('🚀 Iniciando aplicación...');

      // 1. Inicializar BD
      db.init();
      console.log('✅ Base de datos cargada');

      // 2. Cargar órdenes en estado
      appState.setState({
        orders: db.getAllOrders()
      });
      console.log(`✅ ${appState.orders.length} órdenes cargadas`);

      // 3. Actualizar UI
      UIManager.showListView();
      UIManager.updateOrdersList(appState.orders);
      console.log('✅ UI inicializada');

      // 4. Inicializar event handlers
      Handlers.init();
      console.log('✅ Event handlers listos');

      // 5. Registrar Service Worker
      if ('serviceWorker' in navigator) {
        const basePath = window.location.pathname.split('/').filter(Boolean)[0] 
          ? '/' + window.location.pathname.split('/').filter(Boolean)[0] + '/'
          : '/';
        
        navigator.serviceWorker.register(basePath + 'service-worker.js', { 
          scope: basePath 
        }).then(reg => {
          console.log('✅ Service Worker registrado');
        }).catch(e => {
          console.warn('⚠️ SW no disponible:', e);
        });
      }

      // 6. Obtener datos de Supabase si están disponibles
      if (window.supabaseKey) {
        CONFIG.SUPABASE.KEY = window.supabaseKey;
        console.log('✅ Supabase configurado');
      }

      // 7. Log de información
      this.logInfo();

      console.log('✅ Aplicación lista');
    } catch (error) {
      console.error('❌ Error iniciando app:', error);
      Toast.error('Error al iniciar la aplicación');
    }
  }

  /**
   * Mostrar información de debug
   */
  static logInfo() {
    const stats = {
      'Órdenes': appState.orders.length,
      'Imágenes': db.images.size,
      'Vista': appState.view,
      'PDF': PDFManager.isAvailable() ? '✅' : '❌',
      'SW': 'Registrado',
      'Memoria': performance.memory ? 
        `${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB` : 'N/A'
    };

    console.table(stats);
  }

  /**
   * Exportar datos (para backup)
   * @returns {Object}
   */
  static exportData() {
    return {
      timestamp: new Date().toISOString(),
      version: '1.0',
      orders: db.getAllOrders(),
      stats: db.stats()
    };
  }

  /**
   * Importar datos
   * @param {Object} data - Datos a importar
   */
  static importData(data) {
    if (!data.orders || !Array.isArray(data.orders)) {
      throw new Error('Formato de datos inválido');
    }

    data.orders.forEach(order => {
      const existing = db.getOrder(order.id);
      if (!existing) {
        db.db.orders.push(order);
        db.db.counter = Math.max(db.db.counter, order.id + 1);
      }
    });

    db.save();
    appState.setState({ orders: db.getAllOrders() });
  }

  /**
   * Limpiar base de datos
   * @param {Boolean} confirm - Confirmar eliminación
   */
  static clearData(confirm = false) {
    if (!confirm) {
      Toast.warning('Usa clearData(true) para confirmar');
      return;
    }

    if (window.confirm('¿Eliminar TODOS los datos?')) {
      localStorage.removeItem(CONFIG.DB_KEY);
      localStorage.removeItem(CONFIG.IMAGES_KEY);
      location.reload();
    }
  }

  /**
   * Obtener estado de la app
   * @returns {Object}
   */
  static getState() {
    return {
      appState: appState.export(),
      db: db.stats(),
      pdf: PDFManager.getInfo()
    };
  }

  /**
   * Descargar backup como JSON
   */
  static downloadBackup() {
    const data = this.exportData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    Toast.success('Backup descargado');
  }

  /**
   * Cargar backup desde archivo
   */
  static async loadBackup(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      this.importData(data);
      Toast.success('Backup restaurado');
    } catch (error) {
      Toast.error('Error al restaurar backup');
    }
  }
}

// Inicializar cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Exponer globalmente para debugging
window.App = App;
window.appState = appState;
window.db = db;
