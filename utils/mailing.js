import nodemailer from 'nodemailer';

export const sendMail = (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    return Promise.resolve();

    const mailOptions = {
        from: 'Yehor Yekaterynin <uatours@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    return transporter.sendMail(mailOptions);
};