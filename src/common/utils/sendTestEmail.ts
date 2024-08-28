import nodemailer, { Transporter } from 'nodemailer';

interface EmailOptions {
  server: string;
  port: number;
  username: string;
  password: string;
  verified_sender_email: string;
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
    from: options.verified_sender_email,
    to: options.to,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};
