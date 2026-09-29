// tests/state.test.js - Tests de estado global

const stateTests = new TestRunner('State Tests');
const assert = TestRunner.assert;

stateTests.test('Debe inicializar estado por defecto', () => {
  const state = new AppState();
  assert.equal(state.view, 'list', 'Vista default debe ser list');
  assert.equal(state.tab, 'general', 'Tab default debe ser general');
  assert.deepEqual(state.orders, [], 'Órdenes debe estar vacío');
  assert.equal(state.currentOrder, null, 'Current order debe ser null');
});

stateTests.test('Debe cambiar vista', () => {
  const state = new AppState();
  state.setState({ view: 'form' });
  assert.equal(state.view, 'form', 'Vista debe cambiar a form');
});

stateTests.test('Debe cambiar tab', () => {
  const state = new AppState();
  state.setState({ tab: 'mediciones' });
  assert.equal(state.tab, 'mediciones', 'Tab debe cambiar');
});

stateTests.test('Debe notificar listeners cuando cambia estado', (done) => {
  const state = new AppState();
  let called = false;

  state.subscribe(() => {
    called = true;
  });

  state.setState({ view: 'form' });
  assert.isTrue(called, 'Listener debe ser llamado');
  done();
});

stateTests.test('Debe permitir múltiples subscribers', (done) => {
  const state = new AppState();
  let count = 0;

  state.subscribe(() => count++);
  state.subscribe(() => count++);
  state.subscribe(() => count++);

  state.setState({ tab: 'test' });
  assert.equal(count, 3, 'Deben llamarse 3 listeners');
  done();
});

stateTests.test('Debe desuscribirse de cambios', (done) => {
  const state = new AppState();
  let count = 0;

  const unsubscribe = state.subscribe(() => count++);
  state.setState({ view: 'form' });
  
  unsubscribe();
  state.setState({ tab: 'test' });
  
  assert.equal(count, 1, 'Debe llamarse solo una vez');
  done();
});

stateTests.test('Debe resetear estado de orden', () => {
  const state = new AppState();
  state.currentOrder = { id: 1, numeroTicket: 'T001' };
  state.tab = 'mediciones';

  state.reset();

  assert.equal(state.currentOrder, null, 'Current order debe ser null');
  assert.equal(state.tab, 'general', 'Tab debe resetear a general');
});

stateTests.test('Debe almacenar búsqueda', () => {
  const state = new AppState();
  state.setState({ search: 'cliente' });
  assert.equal(state.search, 'cliente', 'Búsqueda debe almacenarse');
});

stateTests.test('Debe exportar estado para debugging', () => {
  const state = new AppState();
  state.setState({
    view: 'form',
    tab: 'mediciones',
    orders: [{ id: 1 }],
    currentOrder: { id: 1 }
  });

  const exported = state.export();
  assert.equal(exported.view, 'form');
  assert.equal(exported.tab, 'mediciones');
  assert.equal(exported.orders, 1);
  assert.equal(exported.currentOrder, 1);
});

stateTests.test('Debe manejar estado de cloud/Supabase', () => {
  const state = new AppState();
  state.setState({
    cloudLoading: true,
    cloudPage: 2,
    cloudTotal: 100
  });

  assert.isTrue(state.cloudLoading);
  assert.equal(state.cloudPage, 2);
  assert.equal(state.cloudTotal, 100);
});

stateTests.test('Debe actualizar estado parcialmente', () => {
  const state = new AppState();
  const original = state.view;

  state.setState({ tab: 'test' });

  assert.equal(state.view, original, 'View no debe cambiar');
  assert.equal(state.tab, 'test', 'Tab debe cambiar');
});

stateTests.test('Debe mantener listeners después de setState', () => {
  const state = new AppState();
  let count = 0;

  state.subscribe(() => count++);
  state.setState({ view: 'form' });
  state.setState({ tab: 'test' });

  assert.equal(count, 2, 'Listener debe seguir funcionando');
});

stateTests.test('Debe manejar errores en listeners sin romper otros', (done) => {
  const state = new AppState();
  let count = 0;

  state.subscribe(() => {
    throw new Error('Error en listener');
  });

  state.subscribe(() => {
    count++;
  });

  state.setState({ view: 'form' });
  assert.equal(count, 1, 'Segundo listener debe ejecutarse');
  done();
});
