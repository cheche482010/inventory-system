const nodemailer = require('nodemailer');

// In a real application, these would come from process.env
const testAccount = {
    user: 'arlen.wolff@ethereal.email',
    pass: 'gZ5gDxW1s7YxWzwnpW',
    smtp: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false
    },
    imap: {
        host: 'imap.ethereal.email',
        port: 993,
        secure: true
    },
    pop3: {
        host: 'pop.ethereal.email',
        port: 995,
        secure: true
    },
    web: 'https://ethereal.email'
};

const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
        user: testAccount.user,
        pass: testAccount.pass,
    },
});

const sendBudgetEmail = async (user, cart) => {
    let total = 0;
    const itemsHtml = cart.items.map(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        return `
            <tr>
                <td>${item.product.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${item.price}</td>
                <td style="text-align: right;">$${subtotal.toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    const emailHtml = `
        <h1>Hola, ${user.firstName}!</h1>
        <p>Tu solicitud de presupuesto #${cart.id} ha sido aprobada. Aquí están los detalles:</p>
        <table style="width: 100%; border-collapse: collapse;" border="1">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3" style="text-align: right;">Total:</th>
                    <th style="text-align: right;">$${total.toFixed(2)}</th>
                </tr>
            </tfoot>
        </table>
        <p>Gracias por tu interés.</p>
    `;

    try {
        const info = await transporter.sendMail({
            from: '"Tu Tienda" <no-reply@example.com>',
            to: user.email,
            subject: `Presupuesto Aprobado #${cart.id}`,
            html: emailHtml,
        });

        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = { sendBudgetEmail };
