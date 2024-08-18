import { StatusCodes } from 'http-status-codes';
import nodemailer, { Transporter } from 'nodemailer';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';
import { EmailSettings } from '@/api/emailSettings/emailSettingsSchema';
import { Organization } from '@/api/organization/organizationSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { UserInviteTemplate } from '@/templates/userInviteTemplate';

export interface MailBag {
  to: string;
  url: string;
  from: string;
  hash: string;
  organization_name: string;
}

export const emailService = {
  createEmailTransformer: async (organization: Organization): Promise<Transporter | null> => {
    logger.info('organization._id');
    logger.info(organization._id.toString());
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
  },
  sendUserInvite: async (organization: Organization, mailSender: MailBag) => {
    try {
      const emailTransformer = await emailService.createEmailTransformer(organization);
      if (!emailTransformer) {
        logger.error('EmailService - null emailTransformer');
        return;
      }
      const hash: string = mailSender.hash;
      const domain: string = mailSender.url;
      const link = domain + 'user-invites/' + hash;

      const template = UserInviteTemplate({
        invite_link: link,
        organization_name: mailSender.organization_name,
        organization_website: domain,
        owner_email: mailSender.from,
      });

      const body = {
        subject: `Join ${mailSender.organization_name} in Intracom`,
        html: template,
      };

      const response = await emailTransformer.sendMail({
        to: mailSender.to,
        from: mailSender.from,
        ...body,
      });
      console.log('Email Transformer Response: ', response);
    } catch (ex) {
      const errorMessage = `EmailService: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
