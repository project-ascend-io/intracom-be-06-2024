import { UpdateResult } from 'mongodb';
import { ObjectId } from 'mongodb';

import { EmailSettingsModel } from '@/api/emailSettings/emailSettingsModel';
import { EmailSettings, EmailSettingsTest, NewEmailSettings } from '@/api/emailSettings/emailSettingsSchema';
import { mongoDatabase } from '@/api/mongoDatabase';
import { sendTestEmail } from '@/common/utils/sendTestEmail';

export const emailSettingsRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findByIdAsync: async (id: string): Promise<EmailSettings | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');
      const emailSettings = await EmailSettingsCollection.findOne({ organization: id });
      return emailSettings;
    } catch (err) {
      console.error('Error finding email-settings by organization id: ', err);
      throw err;
    }
  },

  insertEmailSettings: async (emailSettings: NewEmailSettings): Promise<EmailSettings> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');
      const newEmailSettings = new EmailSettingsModel(emailSettings);
      const savedEmailSettings = await EmailSettingsCollection.create(newEmailSettings);
      return savedEmailSettings;
    } catch (err) {
      console.error('Error inserting email-settings: ', err);
      throw err;
    }
  },

  updateEmailSettings: async (
    organization: ObjectId,
    emailSettings: NewEmailSettings
  ): Promise<UpdateResult<Document> | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');

      const updateData = { $set: emailSettings };
      const savedEmailSettings = await EmailSettingsCollection.updateOne(
        { organization: organization._id },
        updateData
      );
      if (savedEmailSettings.matchedCount === 0) {
        console.log('No email settings found with the given organization id to update.');
        return null;
      }
      return savedEmailSettings;
    } catch (err) {
      console.error('Error updating email-settings: ', err);
      throw err;
    }
  },

  testEmailSettings: async (request: EmailSettingsTest): Promise<boolean> => {
    try {
      const { server, port, username, password, email, verified_sender_email } = request;

      if (!email) {
        return false;
      }

      const options = {
        server: server,
        port: port,
        username: username,
        password: password,
        verified_sender_email: verified_sender_email,
        to: email,
        subject: 'Test',
        message: 'This is a test email',
      };

      await sendTestEmail(options);

      return true;
    } catch (err) {
      console.error('Error testing email-settings: ', err);
      throw err;
    }
  },
};
