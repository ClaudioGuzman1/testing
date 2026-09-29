// tests/images.test.js - Tests de imágenes

const imagesTests = new TestRunner('Images Tests');
const assert = TestRunner.assert;

beforeEach = () => {
  localStorage.clear();
  db.init();
};

// Compresión de imágenes
imagesTests.test('Debe comprimir imagen', async () => {
  // Crear un archivo de imagen de prueba
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  
  canvas.toBlob(async (blob) => {
    const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
    const compressed = await ImageManager.compress(file, 800, 0.6);
    
    assert.ok(compressed.startsWith('data:image/'), 'Debe retornar base64');
    assert.ok(compressed.length > 0, 'Comprimido no puede estar vacío');
  }, 'image/jpeg');
});

imagesTests.test('Debe guardar imagen en BD', () => {
  const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA...';
  const id = ImageManager.saveImage('inicial', base64);
  
  assert.ok(id, 'Debe retornar ID de imagen');
  assert.ok(id.includes('img_'), 'ID debe contener prefijo');
  assert.equal(ImageManager.getImage(id), base64, 'Debe recuperar imagen guardada');
});

imagesTests.test('Debe eliminar imagen', () => {
  const base64 = 'data:image/jpeg;base64,...';
  const id = ImageManager.saveImage('inicial', base64);
  
  assert.ok(ImageManager.getImage(id), 'Imagen debe existir');
  ImageManager.deleteImage(id);
  assert.equal(ImageManager.getImage(id), '', 'Imagen debe estar eliminada');
});

// Órdenes con imágenes
imagesTests.test('Debe agregar imagen a orden', () => {
  const order = db.createOrder({ numeroTicket: 'T001' });
  const imageId = ImageManager.saveImage('inicial', 'data:...');
  
  ImageManager.addImageToOrder(order.id, 'inicial', imageId);
  
  assert.ok(order.images.inicial.includes(imageId), 'Imagen debe estar en orden');
});

imagesTests.test('Debe obtener todas las imágenes de una orden', () => {
  const order = db.createOrder({ numeroTicket: 'T002' });
  
  const img1 = ImageManager.saveImage('inicial', 'data:img1');
  const img2 = ImageManager.saveImage('mediciones', 'data:img2');
  
  ImageManager.addImageToOrder(order.id, 'inicial', img1);
  ImageManager.addImageToOrder(order.id, 'mediciones', img2);
  
  const images = ImageManager.getOrderImages(order.id);
  assert.equal(Object.keys(images).length, 2, 'Debe tener 2 categorías');
  assert.equal(images.inicial.length, 1, 'Debe tener 1 imagen inicial');
  assert.equal(images.mediciones.length, 1, 'Debe tener 1 imagen mediciones');
});

imagesTests.test('Debe contar imágenes de una orden', () => {
  const order = db.createOrder({ numeroTicket: 'T003' });
  
  const img1 = ImageManager.saveImage('inicial', 'data:1');
  const img2 = ImageManager.saveImage('inicial', 'data:2');
  const img3 = ImageManager.saveImage('mediciones', 'data:3');
  
  ImageManager.addImageToOrder(order.id, 'inicial', img1);
  ImageManager.addImageToOrder(order.id, 'inicial', img2);
  ImageManager.addImageToOrder(order.id, 'mediciones', img3);
  
  const count = ImageManager.countImages(order.id);
  assert.equal(count, 3, 'Debe contar 3 imágenes');
});

imagesTests.test('Debe verificar si hay imágenes en categoría', () => {
  const order = db.createOrder({ numeroTicket: 'T004' });
  
  assert.isFalse(
    ImageManager.hasImages(order.id, 'inicial'),
    'Categoría vacía debe retornar false'
  );
  
  const img = ImageManager.saveImage('inicial', 'data:...');
  ImageManager.addImageToOrder(order.id, 'inicial', img);
  
  assert.isTrue(
    ImageManager.hasImages(order.id, 'inicial'),
    'Categoría con imágenes debe retornar true'
  );
});

imagesTests.test('Debe eliminar imagen de orden', () => {
  const order = db.createOrder({ numeroTicket: 'T005' });
  const img = ImageManager.saveImage('inicial', 'data:...');
  
  ImageManager.addImageToOrder(order.id, 'inicial', img);
  assert.equal(ImageManager.countImages(order.id), 1);
  
  ImageManager.removeImageFromOrder(order.id, 'inicial', img);
  assert.equal(ImageManager.countImages(order.id), 0, 'Debe eliminar imagen');
});

imagesTests.test('No debe agregar imagen duplicada a orden', () => {
  const order = db.createOrder({ numeroTicket: 'T006' });
  const img = ImageManager.saveImage('inicial', 'data:...');
  
  ImageManager.addImageToOrder(order.id, 'inicial', img);
  ImageManager.addImageToOrder(order.id, 'inicial', img); // Agregar de nuevo
  
  const count = ImageManager.countImages(order.id);
  assert.equal(count, 1, 'No debe duplicar imagen');
});

imagesTests.test('Debe calcular estadísticas de imágenes', () => {
  ImageManager.saveImage('inicial', 'data:img1');
  ImageManager.saveImage('mediciones', 'data:img2');
  ImageManager.saveImage('instalacion', 'data:img3');
  
  const stats = ImageManager.stats();
  assert.equal(stats.totalImages, 3, 'Debe contar 3 imágenes');
  assert.ok(stats.totalSize > 0, 'Tamaño debe ser mayor a 0');
});

imagesTests.test('Debe manejar orden sin imágenes', () => {
  const order = db.createOrder({ numeroTicket: 'T007' });
  
  const images = ImageManager.getOrderImages(order.id);
  assert.deepEqual(images, {}, 'Debe retornar objeto vacío');
  
  const count = ImageManager.countImages(order.id);
  assert.equal(count, 0, 'Debe contar 0 imágenes');
});

imagesTests.test('Debe obtener URL de imagen para descarga', () => {
  const base64 = 'data:image/jpeg;base64,ABC123';
  const id = ImageManager.saveImage('inicial', base64);
  
  const url = ImageManager.getImageURL(id);
  assert.equal(url, base64, 'URL debe ser el base64');
});

imagesTests.test('Debe copiar imágenes al duplicar orden', () => {
  const order1 = db.createOrder({ numeroTicket: 'T008' });
  const img = ImageManager.saveImage('inicial', 'data:image');
  
  ImageManager.addImageToOrder(order1.id, 'inicial', img);
  
  const order2 = db.duplicateOrder(order1.id);
  assert.ok(order2, 'Debe duplicarse orden');
  assert.equal(ImageManager.countImages(order2.id), 1, 'Copia debe tener imagen');
});
