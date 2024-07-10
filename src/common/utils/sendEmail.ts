import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  server: string;
  port: number;
  username: string;
  password: string;
  to: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: options.server,
    port: options.port,
    secure: false,
    auth: {
      user: options.username,
      pass: options.password,
    },
  } as any);

  const mailOptions = {
    from: 'robert@projectascend.io',
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
