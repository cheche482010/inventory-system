const nodemailer = require('nodemailer');
const { User, Notification } = require('../models');
const { Op } = require("sequelize");
const { generateBudgetPdf } = require('./pdfHelper');

// SMTP configuration from environment variables
const mailConfig = {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false // do not fail on invalid certs
    }
};

const transporter = nodemailer.createTransport(mailConfig);

if (!process.env.MAIL_HOST) {
    console.warn(`
        ****************************************************************
        * WARNING: Mail server is not configured. Emails will not be sent. *
        * Please set MAIL_HOST, MAIL_USER, etc. in .env file.        *
        ****************************************************************
    `);
}

/**
 * Sends an email using the pre-configured transporter.
 */
const sendEmail = async (to, subject, html, attachments = []) => {
    // If mail host is not set, don't even try to send.
    if (!process.env.MAIL_HOST) return;
    try {
        const info = await transporter.sendMail({
            from: `"Tu Tienda" <${process.env.MAIL_USER}>`,
            to,
            subject,
            html,
            attachments,
        });
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

/**
 * Notifies all admins and devs about a new budget submission.
 */
const sendNewBudgetAdminNotification = async (cart, budgetUser, dolarRate) => {
    const adminsAndDevs = await User.findAll({ where: { role: { [Op.in]: ['admin', 'dev'] } } });
    if (!adminsAndDevs.length) return;

    const pdfBuffer = await generateBudgetPdf(cart, budgetUser, dolarRate);
    const subject = `Nueva Solicitud de Presupuesto #${cart.id} de ${budgetUser.firstName}`;
    const notificationMessage = JSON.stringify({
        title: 'Nueva solicitud de presupuesto',
        budgetId: cart.id,
        userName: budgetUser.firstName
    });

    for (const admin of adminsAndDevs) {
        const emailHtml = `
            <h1>Hola, ${admin.firstName}!</h1>
            <p>Se ha recibido una nueva solicitud de presupuesto de <b>${budgetUser.firstName} ${budgetUser.lastName}</b>.</p>
            <p>Se adjunta el presupuesto en formato PDF.</p>
            <p>Puedes revisar la solicitud en el panel de administración.</p>
        `;
        const attachments = [{
            filename: `presupuesto_${cart.id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
        }];
        
        await sendEmail(admin.email, subject, emailHtml, attachments);
        await Notification.create({ userId: admin.id, message: notificationMessage, type: 'new_budget' });
    }
};

/**
 * Sends a confirmation email to the user who submitted the budget.
 */
const sendBudgetConfirmationToUser = async (cart, budgetUser, dolarRate) => {
    const pdfBuffer = await generateBudgetPdf(cart, budgetUser, dolarRate);
    const subject = `Confirmación de tu Solicitud de Presupuesto #${cart.id}`;
    const emailHtml = `
        <h1>Hola, ${budgetUser.firstName}!</h1>
        <p>Hemos recibido tu solicitud de presupuesto #${cart.id}.</p>
        <p>En breve, uno de nuestros representantes se pondrá en contacto contigo.</p>
        <p>Adjuntamos una copia de tu solicitud en formato PDF para tu referencia.</p>
        <br>
        <p>Gracias por tu interés,</p>
        <p><b>El Equipo de Tu Tienda</b></p>
    `;
    const attachments = [{
        filename: `presupuesto_${cart.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
    }];
    
    await sendEmail(budgetUser.email, subject, emailHtml, attachments);
};

module.exports = { sendNewBudgetAdminNotification, sendBudgetConfirmationToUser };
