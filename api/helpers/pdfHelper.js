const PDFDocument = require('pdfkit');

function generateBudgetPdf(cart, res) {
    const doc = new PDFDocument({ margin: 50 });
  
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(`Presupuesto #${cart.id}`, { align: 'center' });
    doc.moveDown();

    // User Info
    const user = cart.user || (cart.get && cart.get('user')); 
    doc.fontSize(12).text(`Cliente: ${user.firstName} ${user.lastName}`);
    doc.text(`Email: ${user.email}`);
    doc.text(`Fecha: ${new Date(cart.updatedAt).toLocaleDateString()}`);
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Producto', 50, tableTop);
    doc.text('Cantidad', 280, tableTop, { width: 90, align: 'right' });
    doc.text('Precio Unit.', 370, tableTop, { width: 90, align: 'right' });
    doc.text('Subtotal', 460, tableTop, { width: 90, align: 'right' });
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Table Rows
    let total = 0;
    cart.items.forEach(item => {
        const product = item.product || (item.get && item.get('product'));
        const subtotal = item.quantity * item.price;
        total += subtotal;
        const y = doc.y;
        doc.text(product.name, 50, y, { width: 220 });
        doc.text(item.quantity.toString(), 280, y, { width: 90, align: 'right' });
        doc.text(`$${item.price}`, 370, y, { width: 90, align: 'right' });
        doc.text(`$${subtotal.toFixed(2)}`, 460, y, { width: 90, align: 'right' });
        doc.moveDown();
    });

    // Table Footer
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();
    doc.fontSize(12).text(`Total: $${total.toFixed(2)}`, { align: 'right' });

    doc.end();
}

module.exports = { generateBudgetPdf };
