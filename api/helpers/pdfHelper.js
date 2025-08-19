const PDFDocument = require("pdfkit");

/**
 * Generates a PDF document for a budget request with dual currency.
 * @param {object} cart - The cart object representing the budget.
 * @param {object} user - The user who made the request.
 * @param {number} dolarRate - The current USD to VES exchange rate.
 * @returns {Promise<Buffer>} A promise that resolves with the PDF buffer.
 */
function generateBudgetPdf(cart, user, dolarRate) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text(`Presupuesto #${cart.id}`, { align: 'center' });
        doc.moveDown();

        // User and Date Info
        doc.fontSize(10).font('Helvetica');
        doc.text(`Cliente: ${user.firstName} ${user.lastName} (${user.email})`);
        doc.text(`Fecha: ${new Date(cart.updatedAt).toLocaleDateString('es-ES')}`);
        if (dolarRate) {
            doc.font('Helvetica-Bold').text(`Tasa de cambio: ${dolarRate.toFixed(2)} VES por USD`);
        }
        doc.moveDown(2);

        // Table Header
        const tableTop = doc.y;
        const col = {
            item: 40,
            qty: 240,
            priceUSD: 290,
            subUSD: 360,
            priceVES: 430,
            subVES: 500,
        };
        const colWidth = {
            item: 180,
            qty: 40,
            priceUSD: 60,
            subUSD: 60,
            priceVES: 60,
            subVES: 60,
        };

        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('Producto', col.item, tableTop);
        doc.text('Cant.', col.qty, tableTop, { width: colWidth.qty, align: 'center' });
        doc.text('Precio USD', col.priceUSD, tableTop, { width: colWidth.priceUSD, align: 'right' });
        doc.text('Subtotal USD', col.subUSD, tableTop, { width: colWidth.subUSD, align: 'right' });
        doc.text('Precio VES', col.priceVES, tableTop, { width: colWidth.priceVES, align: 'right' });
        doc.text('Subtotal VES', col.subVES, tableTop, { width: colWidth.subVES, align: 'right' });
        doc.font('Helvetica');

        const drawLine = (y) => doc.moveTo(col.item, y).lineTo(col.subVES + colWidth.subVES, y).strokeColor("#cccccc").stroke();
        let y = tableTop + 15;
        drawLine(y);
        y += 5;

        // Table Rows
        let totalUSD = 0;
        for (const item of cart.items) {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 0;
            const subtotalUSD = price * quantity;
            totalUSD += subtotalUSD;

            const priceVES = price * dolarRate;
            const subtotalVES = subtotalUSD * dolarRate;

            const rowHeight = doc.heightOfString(item.product.name, { width: colWidth.item });

            if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                y = doc.page.margins.top;
            }

            doc.text(item.product.name, col.item, y, { width: colWidth.item });
            doc.text(quantity.toString(), col.qty, y, { width: colWidth.qty, align: 'center' });
            doc.text(`$${price.toFixed(2)}`, col.priceUSD, y, { width: colWidth.priceUSD, align: 'right' });
            doc.text(`$${subtotalUSD.toFixed(2)}`, col.subUSD, y, { width: colWidth.subUSD, align: 'right' });
            doc.text(`${priceVES.toFixed(2)}`, col.priceVES, y, { width: colWidth.priceVES, align: 'right' });
            doc.text(`${subtotalVES.toFixed(2)}`, col.subVES, y, { width: colWidth.subVES, align: 'right' });

            y += rowHeight + 10;
        }

        // Footer and Totals
        drawLine(y);
        y += 10;

        const totalVES = totalUSD * dolarRate;

        doc.font('Helvetica-Bold');
        doc.text('Total USD:', col.priceUSD, y, { width: colWidth.priceUSD, align: 'right' });
        doc.text(`$${totalUSD.toFixed(2)}`, col.subUSD, y, { width: colWidth.subUSD, align: 'right' });

        doc.text('Total VES:', col.priceVES, y, { width: colWidth.priceVES, align: 'right' });
        doc.text(`${totalVES.toFixed(2)}`, col.subVES, y, { width: colWidth.subVES, align: 'right' });

        doc.end();
    });
}

module.exports = { generateBudgetPdf };
