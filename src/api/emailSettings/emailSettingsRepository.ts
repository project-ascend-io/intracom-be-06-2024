import { UpdateResult } from 'mongodb';

import { sendEmail } from '@/common/utils/sendEmail';

import { mongoDatabase } from '../mongoDatabase';
import { EmailSettings, EmailSettingsModel } from './emailSettingsModel';

interface TestEmailRequest {
  email: string;
}

export const emailSettingsRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findAllAsync: async (): Promise<EmailSettings[]> => {
    const mondodb = await emailSettingsRepository.startConnection();
    const EmailSettingsCollection = mondodb.model<EmailSettings>('EmailSettings');
    return await EmailSettingsCollection.find();
  },

  insertEmailSettings: async (emailSettings: EmailSettings): Promise<EmailSettings> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');
      const newEmailSettings = new EmailSettingsModel(emailSettings);
      console.log(newEmailSettings);
      const savedEmailSettings = await EmailSettingsCollection.create(newEmailSettings);
      return savedEmailSettings;
    } catch (err) {
      console.error('Error inserting email-settings: ', err);
      throw err;
    }
  },

  updateEmailSettings: async (emailSettings: EmailSettings): Promise<UpdateResult<Document> | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');

      const updateData = { $set: emailSettings };
      const savedEmailSettings = await EmailSettingsCollection.updateOne(
        { username: emailSettings.username },
        updateData
      );
      if (savedEmailSettings.matchedCount === 0) {
        console.log('No email settings found with the given username to update.');
        return null;
      }
      return savedEmailSettings;
    } catch (err) {
      console.error('Error updating email-settings: ', err);
      throw err;
    }
  },

  // Send test email using nodemailer
  testEmailSettings: async (request: TestEmailRequest): Promise<boolean> => {
    try {
      const { email } = request;

      if (!email) {
        return false;
      }

      const options = {
        to: email,
        subject: 'Test',
        message: 'This is a test email',
      };

      await sendEmail(options);

      return true;
    } catch (err) {
      console.error('Error testing email-settings: ', err);
      throw err;
    }
  },
};
