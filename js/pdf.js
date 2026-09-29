// js/pdf.js - Generación de PDF

class PDFManager {
  /**
   * Generar PDF de orden
   * @param {Object} order - Orden a convertir
   * @returns {Promise<void>}
   */
  static async generatePDF(order) {
    try {
      if (!window.jsPDF) {
        Toast.error('❌ jsPDF no está cargado');
        return;
      }

      UIManager.showProgress('Generando PDF...', 30);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Título
      doc.setFontSize(20);
      doc.text('ORDEN DE SERVICIO', pageWidth / 2, 20, { align: 'center' });

      // Datos principales
      doc.setFontSize(10);
      let y = 35;
      const lineHeight = 6;

      doc.text(`Ticket: ${order.numeroTicket}`, 15, y);
      y += lineHeight;
      doc.text(`Fecha: ${order.fechaAtencion}`, 15, y);
      y += lineHeight;
      doc.text(`Ingeniero: ${order.ingeniero}`, 15, y);
      y += lineHeight * 2;

      // Cliente
      doc.setFontSize(12);
      doc.text('INFORMACIÓN DEL CLIENTE', 15, y);
      doc.setFontSize(10);
      y += lineHeight + 2;

      doc.text(`Cliente: ${order.cliente}`, 15, y);
      y += lineHeight;
      doc.text(`Contacto: ${order.contacto}`, 15, y);
      y += lineHeight;
      doc.text(`Teléfono: ${order.telefono}`, 15, y);
      y += lineHeight;
      doc.text(`Email: ${order.correo || 'N/A'}`, 15, y);
      y += lineHeight;
      doc.text(`Ubicación: ${order.ubicacion}`, 15, y);
      y += lineHeight * 2;

      // Detalles del servicio
      doc.setFontSize(12);
      doc.text('DETALLES DEL SERVICIO', 15, y);
      doc.setFontSize(10);
      y += lineHeight + 2;

      doc.text(`Tipo: ${order.tipoServicio}`, 15, y);
      y += lineHeight;
      doc.text(`Incidencia: ${order.incidencia}`, 15, y);
      y += lineHeight;
      doc.text(`Solución: ${order.solucion || 'N/A'}`, 15, y);
      y += lineHeight * 2;

      // Imágenes si las hay
      const images = ImageManager.getOrderImages(order.id);
      if (Object.keys(images).length > 0) {
        if (y > pageHeight - 50) {
          doc.addPage();
          y = 20;
        }

        doc.setFontSize(12);
        doc.text('EVIDENCIAS', 15, y);
        y += lineHeight + 5;

        let imgCount = 0;
        const imgsPerRow = 2;

        for (const [category, imgs] of Object.entries(images)) {
          for (const img of imgs) {
            if (img.url) {
              const imgSize = 35;
              const x = 15 + (imgCount % imgsPerRow) * (pageWidth / 2 - 10);
              const yImg = y + Math.floor(imgCount / imgsPerRow) * 45;

              if (yImg + imgSize > pageHeight - 20) {
                doc.addPage();
                y = 20;
                imgCount = 0;
              }

              try {
                doc.addImage(img.url, 'JPEG', x, yImg, imgSize, imgSize);
              } catch (e) {
                console.warn('Error agregando imagen:', e);
              }

              imgCount++;
            }
          }
        }
      }

      UIManager.showProgress('Finalizando...', 90);

      // Descargar
      doc.save(`Orden_${order.numeroTicket}.pdf`);
      UIManager.hideProgress();

      Toast.success(MESSAGES.SUCCESS.PDF_GENERATED);
    } catch (error) {
      console.error('Error generando PDF:', error);
      UIManager.hideProgress();
      Toast.error(MESSAGES.ERROR.PDF_ERROR);
    }
  }

  /**
   * Validar que jsPDF esté disponible
   * @returns {Boolean}
   */
  static isAvailable() {
    return window.jsPDF !== undefined;
  }

  /**
   * Obtener información del PDF
   * @returns {Object}
   */
  static getInfo() {
    return {
      available: this.isAvailable(),
      library: 'jsPDF 2.5.1',
      source: 'CDN CDNJS'
    };
  }
}
