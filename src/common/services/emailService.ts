import nodemailer, { Transporter } from 'nodemailer';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';
import { EmailSettings } from '@/api/emailSettings/emailSettingsSchema';
import { Organization } from '@/api/organization/organizationSchema';

export interface MailBag {
  to: string;
  url: string;
  from: string;
  hash: string;
  organization_name: string;
}

export const createEmailTransformer = async (organization: Organization): Promise<Transporter | null> => {
  const settings: EmailSettings | null = await emailSettingsRepository.findByIdAsync(organization._id.toString());
  if (!settings) {
    return null;
  }
  return nodemailer.createTransport({
    host: settings.server,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });
};

export const sendUserInvite = async (emailTransformer: Transporter, mailSender: MailBag) => {
  const hash: string = 'hash';
  const domain: string = 'https://localhost:8080/';
  const link = domain + 'user-invites/' + hash;
  const body = {
    subject: `Join ${mailSender.organization_name} in Intracom`,
    html: `<h1>Join ${mailSender.organization_name} in Intracom</h1><p>${mailSender.organization_name} (${mailSender.from}) has invited you to join the Intracom workspace ${mailSender.organization_name}.</p><a href="${link}" target="_blank">Click here</a>`,
  };

  const response = await emailTransformer.sendMail({
    to: mailSender.to,
    from: mailSender.from,
    ...body,
  });
  console.log('Email Transformer Response: ', response);
};
