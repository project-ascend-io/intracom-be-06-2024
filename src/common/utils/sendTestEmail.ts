import nodemailer, { Transporter } from 'nodemailer';

export interface EmailOptions {
  server: string;
  port: number;
  username: string;
  password: string;
  to: string;
  subject: string;
  message: string;
}

export const sendTestEmail = async (options: EmailOptions) => {
  const transporter: Transporter = nodemailer.createTransport({
    host: options.server,
    port: options.port,
    secure: options.port === 465 ? true : false,
    auth: {
      user: options.username,
      pass: options.password,
    },
  } as any);

  const mailOptions = {
    from: 'oscar@projectascend.io',
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
