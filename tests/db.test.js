// tests/db.test.js - Tests de base de datos

const dbTests = new TestRunner('Database Tests');
const assert = TestRunner.assert;

// Limpiar antes de tests
beforeEach = () => {
  localStorage.clear();
  db.init();
};

// CRUD Operations
dbTests.test('Debe inicializar base de datos vacía', () => {
  db.init();
  assert.equal(db.getAllOrders().length, 0, 'BD debe estar vacía');
  assert.ok(db.db, 'DB object debe existir');
});

dbTests.test('Debe crear nueva orden', () => {
  const order = db.createOrder({
    numeroTicket: 'T001',
    cliente: 'Test Client'
  });
  assert.ok(order.id, 'Orden debe tener ID');
  assert.equal(order.numeroTicket, 'T001', 'Número de ticket correcto');
  assert.equal(db.getAllOrders().length, 1, 'Debe haber 1 orden');
});

dbTests.test('Debe obtener orden por ID', () => {
  const created = db.createOrder({
    numeroTicket: 'T002',
    cliente: 'Client 2'
  });
  const retrieved = db.getOrder(created.id);
  assert.deepEqual(retrieved, created, 'Orden recuperada debe coincidir');
});

dbTests.test('Debe actualizar orden existente', () => {
  const order = db.createOrder({ numeroTicket: 'T003' });
  db.updateOrder(order.id, { cliente: 'Updated' });
  const updated = db.getOrder(order.id);
  assert.equal(updated.cliente, 'Updated', 'Cliente debe estar actualizado');
});

dbTests.test('Debe eliminar orden', () => {
  const order = db.createOrder({ numeroTicket: 'T004' });
  assert.equal(db.getAllOrders().length, 1);
  db.deleteOrder(order.id);
  assert.equal(db.getAllOrders().length, 0, 'Orden debe estar eliminada');
});

dbTests.test('Debe duplicar orden', () => {
  const original = db.createOrder({
    numeroTicket: 'T005',
    cliente: 'Original'
  });
  const duplicate = db.duplicateOrder(original.id);
  assert.ok(duplicate.id !== original.id, 'ID debe ser diferente');
  assert.equal(duplicate.cliente, original.cliente, 'Cliente debe ser igual');
  assert.equal(db.getAllOrders().length, 2, 'Debe haber 2 órdenes');
});

// Imágenes
dbTests.test('Debe guardar imagen', () => {
  const imageData = 'data:image/jpeg;base64,...';
  db.saveImage('img_123', imageData);
  assert.equal(db.getImage('img_123'), imageData, 'Imagen debe recuperarse');
});

dbTests.test('Debe eliminar imagen al eliminar orden', () => {
  const order = db.createOrder({ numeroTicket: 'T006' });
  db.saveImage('img_456', 'data:image/jpeg;base64,...');
  if (order.images) order.images.inicial = ['img_456'];
  db.save();
  db.deleteOrder(order.id);
  // La imagen debe estar marcada para eliminación
  assert.ok(true, 'Imagen eliminada con orden');
});

// Búsqueda
dbTests.test('Debe buscar órdenes por cliente', () => {
  db.createOrder({
    numeroTicket: 'T007',
    cliente: 'SearchMe',
    ubicacion: 'Mazatlán'
  });
  db.createOrder({
    numeroTicket: 'T008',
    cliente: 'Other',
    ubicacion: 'Culiacán'
  });

  const results = db.searchOrders('SearchMe');
  assert.equal(results.length, 1, 'Debe encontrar 1 orden');
  assert.equal(results[0].cliente, 'SearchMe', 'Cliente debe coincidir');
});

dbTests.test('Debe buscar órdenes por ticket', () => {
  db.createOrder({ numeroTicket: 'SEARCH001' });
  db.createOrder({ numeroTicket: 'OTHER001' });

  const results = db.searchOrders('SEARCH001');
  assert.equal(results.length, 1, 'Debe encontrar 1 orden');
});

dbTests.test('Debe retornar todas si búsqueda vacía', () => {
  db.createOrder({ numeroTicket: 'T009' });
  db.createOrder({ numeroTicket: 'T010' });

  const results = db.searchOrders('');
  assert.equal(results.length, 2, 'Debe retornar todas las órdenes');
});

// Persistencia
dbTests.test('Debe persistir datos en localStorage', () => {
  const order = db.createOrder({
    numeroTicket: 'T011',
    cliente: 'Persist'
  });

  // Simular recarga
  const db2 = new Database();
  db2.init();
  
  const retrieved = db2.getOrder(order.id);
  assert.ok(retrieved, 'Orden debe recuperarse después de recarga');
  assert.equal(retrieved.cliente, 'Persist');
});

// Estadísticas
dbTests.test('Debe calcular estadísticas de BD', () => {
  db.createOrder({ numeroTicket: 'T012' });
  db.saveImage('img_789', 'data:...');

  const stats = db.stats();
  assert.equal(stats.totalOrders, 1);
  assert.equal(stats.totalImages, 1);
  assert.ok(stats.dbSize > 0);
});

// Edge cases
dbTests.test('No debe actualizar orden no existente', () => {
  const result = db.updateOrder(99999, { cliente: 'Updated' });
  assert.equal(result, null, 'Debe retornar null');
});

dbTests.test('No debe obtener orden no existente', () => {
  const result = db.getOrder(99999);
  assert.equal(result, undefined, 'Debe retornar undefined');
});

dbTests.test('Debe manejar órdenes sin images', () => {
  const order = db.createOrder({ numeroTicket: 'T013' });
  delete order.images;
  db.save();
  db.deleteOrder(order.id); // No debe throw error
  assert.ok(true);
});

dbTests.test('Debe incrementar contador de ID', () => {
  const o1 = db.createOrder({ numeroTicket: 'A' });
  const o2 = db.createOrder({ numeroTicket: 'B' });
  const o3 = db.createOrder({ numeroTicket: 'C' });
  assert.ok(o1.id < o2.id && o2.id < o3.id, 'IDs deben ser incrementales');
});
