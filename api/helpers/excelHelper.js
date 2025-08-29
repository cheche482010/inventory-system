const ExcelJS = require("exceljs");

/**
 * Generates an Excel file for a budget and returns it as a buffer.
 * @param {object} cart - The cart object with items.
 * @param {object} budgetUser - The user who owns the budget.
 * @returns {Promise<Buffer>} - A promise that resolves with the Excel file buffer.
 */
const generateBudgetExcel = async (cart, budgetUser) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Presupuesto ${cart.id}`);

    // Set up worksheet content
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = `Presupuesto #${cart.id}`;
    worksheet.getCell('A1').alignment = { horizontal: 'center' };
    worksheet.getCell('A1').font = { size: 16, bold: true };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = `Cliente: ${budgetUser.firstName} ${budgetUser.lastName} (${budgetUser.email})`;
    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `Fecha: ${new Date(cart.updatedAt).toLocaleDateString()}`;

    worksheet.addRow([]);

    worksheet.addRow(['Código', 'Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']);
    worksheet.getRow(6).font = { bold: true };
    worksheet.getRow(6).eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4F81BD' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    cart.items.forEach(item => {
        worksheet.addRow([
            item.product.code,
            item.product.name,
            item.quantity,
            item.price,
            item.quantity * item.price
        ]);
    });

    const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['', '', '', 'Total:', total]);
    totalRow.font = { bold: true };
    worksheet.getCell(`D${totalRow.number}`).alignment = { horizontal: 'right' };

    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 40;
    worksheet.getColumn('C').width = 15;
    worksheet.getColumn('D').width = 20;
    worksheet.getColumn('E').width = 20;

    // Return the Excel file as a buffer
    return await workbook.xlsx.writeBuffer();
};

module.exports = {
    generateBudgetExcel,
};
