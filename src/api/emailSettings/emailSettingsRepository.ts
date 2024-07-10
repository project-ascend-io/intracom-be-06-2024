import { UpdateResult } from 'mongodb';

import { EmailSettingsModel } from '@/api/emailSettings/emailSettingsModel';
import { EmailSettings, EmailSettingsTest } from '@/api/emailSettings/emailSettingsSchema';
import { mongoDatabase } from '@/api/mongoDatabase';
import { sendEmail } from '@/common/utils/sendEmail';

export const emailSettingsRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findByIdAsync: async (id: string): Promise<EmailSettings | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');
      const emailSettings = await EmailSettingsCollection.findOne({ _id: id });
      return emailSettings;
    } catch (err) {
      console.error('Error finding email-settings by id: ', err);
      throw err;
    }
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

  updateEmailSettings: async (id: string, emailSettings: EmailSettings): Promise<UpdateResult<Document> | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');

      const updateData = { $set: emailSettings };
      const savedEmailSettings = await EmailSettingsCollection.updateOne({ _id: id }, updateData);
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
  testEmailSettings: async (request: EmailSettingsTest): Promise<boolean> => {
    try {
      const { server, port, username, password, email } = request;

      if (!email) {
        return false;
      }

      const options = {
        server: server,
        port: port,
        username: username,
        password: password,
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
