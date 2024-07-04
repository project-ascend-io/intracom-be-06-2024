import nodemailer, { Transporter } from 'nodemailer';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const emailSettings = await emailSettingsRepository.findAllAsync();

  const transporter: Transporter = nodemailer.createTransport({
    host: emailSettings[0].server,
    port: emailSettings[0].port,
    secure: false,
    auth: {
      user: emailSettings[0].username,
      pass: emailSettings[0].password,
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
