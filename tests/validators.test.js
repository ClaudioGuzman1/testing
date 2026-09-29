// tests/validators.test.js - Tests de validaciones

const validatorsTests = new TestRunner('Validators Tests');
const assert = TestRunner.assert;

// Validación de orden
validatorsTests.test('Debe validar orden completa correcta', () => {
  const order = {
    numeroTicket: 'T001',
    fechaAtencion: '2024-01-01',
    ingeniero: 'Juan',
    cliente: 'Cliente X',
    ubicacion: 'Mazatlán',
    contacto: 'Pedro',
    telefono: '6687654321',
    incidencia: 'Problema',
    tipoServicio: 'Mantenimiento',
    solicitaTerminal: false
  };

  const result = Validators.validateOrder(order);
  assert.isTrue(result.valid, 'Orden debe ser válida');
  assert.equal(result.errors.length, 0, 'No debe haber errores');
});

validatorsTests.test('Debe fallar si faltan campos requeridos', () => {
  const order = {
    numeroTicket: '', // Requerido pero vacío
    cliente: 'Test'
  };

  const result = Validators.validateOrder(order);
  assert.isFalse(result.valid, 'Orden debe ser inválida');
  assert.ok(result.errors.length > 0, 'Debe haber errores');
});

validatorsTests.test('Debe validar campo individual requerido', () => {
  assert.isTrue(
    Validators.validateField('numeroTicket', 'T001'),
    'Campo con valor debe ser válido'
  );
  assert.isFalse(
    Validators.validateField('numeroTicket', ''),
    'Campo vacío debe ser inválido'
  );
});

validatorsTests.test('Debe validar email correcto', () => {
  assert.isTrue(
    Validators.isValidEmail('test@example.com'),
    'Email válido debe pasar'
  );
  assert.isFalse(
    Validators.isValidEmail('invalid-email'),
    'Email inválido debe fallar'
  );
});

validatorsTests.test('Debe validar teléfono', () => {
  assert.isTrue(
    Validators.isValidPhone('6687654321'),
    'Teléfono válido debe pasar'
  );
  assert.isTrue(
    Validators.isValidPhone('+52-668-765-4321'),
    'Teléfono formateado debe pasar'
  );
  assert.isFalse(
    Validators.isValidPhone('123'), // Muy corto
    'Teléfono corto debe fallar'
  );
});

validatorsTests.test('Debe validar fecha en formato YYYY-MM-DD', () => {
  assert.isTrue(
    Validators.isValidDate('2024-01-15'),
    'Fecha válida debe pasar'
  );
  assert.isFalse(
    Validators.isValidDate('2024-13-01'),
    'Fecha inválida debe fallar'
  );
  assert.isFalse(
    Validators.isValidDate('01-01-2024'),
    'Formato incorrecto debe fallar'
  );
});

validatorsTests.test('Debe validar imagen', () => {
  const validFile = {
    size: 1024 * 500, // 500KB
    type: 'image/jpeg'
  };

  let result = Validators.validateImage(validFile);
  assert.isTrue(result.valid, 'Imagen válida debe pasar');

  const tooBig = {
    size: 6 * 1024 * 1024, // 6MB
    type: 'image/jpeg'
  };

  result = Validators.validateImage(tooBig);
  assert.isFalse(result.valid, 'Imagen grande debe fallar');

  const wrongType = {
    size: 1024,
    type: 'text/plain'
  };

  result = Validators.validateImage(wrongType);
  assert.isFalse(result.valid, 'Tipo incorrecto debe fallar');
});

validatorsTests.test('Debe validar alfanumérico para seriales', () => {
  assert.isTrue(
    Validators.isAlphaNumeric('ABC123-XYZ_789'),
    'Serial válido debe pasar'
  );
  assert.isFalse(
    Validators.isAlphaNumeric('ABC@123!'),
    'Serial con caracteres inválidos debe fallar'
  );
});

validatorsTests.test('Debe validar formato MAC', () => {
  assert.isTrue(
    Validators.isValidMac('00:1A:2B:3C:4D:5E'),
    'MAC válido debe pasar'
  );
  assert.isTrue(
    Validators.isValidMac('001A2B3C4D5E'),
    'MAC sin separadores debe pasar'
  );
  assert.isFalse(
    Validators.isValidMac('00:1A:2B:3C:4D:ZZ'),
    'MAC inválido debe fallar'
  );
});

validatorsTests.test('Debe requerir terminal si solicitaTerminal es true', () => {
  const order = {
    numeroTicket: 'T001',
    fechaAtencion: '2024-01-01',
    ingeniero: 'Juan',
    cliente: 'Cliente X',
    ubicacion: 'Mazatlán',
    contacto: 'Pedro',
    telefono: '6687654321',
    incidencia: 'Problema',
    tipoServicio: 'Mantenimiento',
    solicitaTerminal: true,
    nombreTerminal: '', // Falta
    modeloTerminal: ''
  };

  const result = Validators.validateOrder(order);
  assert.isFalse(result.valid, 'Debe fallar sin datos de terminal');
  assert.ok(result.errors.length > 0);
});

validatorsTests.test('No debe requerir terminal si solicitaTerminal es false', () => {
  const order = {
    numeroTicket: 'T001',
    fechaAtencion: '2024-01-01',
    ingeniero: 'Juan',
    cliente: 'Cliente X',
    ubicacion: 'Mazatlán',
    contacto: 'Pedro',
    telefono: '6687654321',
    incidencia: 'Problema',
    tipoServicio: 'Mantenimiento',
    solicitaTerminal: false
  };

  const result = Validators.validateOrder(order);
  assert.isTrue(result.valid, 'Debe pasar sin datos de terminal');
});

validatorsTests.test('Debe trimear espacios en validación de campo', () => {
  assert.isTrue(
    Validators.validateField('numeroTicket', '  T001  '),
    'Debe aceptar con espacios'
  );
});
