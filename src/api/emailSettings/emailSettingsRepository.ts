import { DeleteResult, UpdateResult } from 'mongodb';

import { mongoDatabase } from '../mongoDatabase';
import { EmailSettings, EmailSettingsModel } from './emailSettingsModel';

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

  findByIdAsync: async (id: number): Promise<EmailSettings | null> => {
    const mondodb = await emailSettingsRepository.startConnection();
    const EmailSettingsCollection = mondodb.model<EmailSettings>('EmailSettings');
    return await EmailSettingsCollection.findOne({ id: id });
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

  deleteByEmailSettingsIdAsync: async (id: number): Promise<DeleteResult | null> => {
    const mongodb = await emailSettingsRepository.startConnection();
    const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');
    return await EmailSettingsCollection.deleteOne({ id: id });
  },

  patchEmailSettings: async (emailSettings: EmailSettings): Promise<UpdateResult<Document> | null> => {
    try {
      const mongodb = await emailSettingsRepository.startConnection();
      const EmailSettingsCollection = mongodb.model<EmailSettings>('EmailSettings');

      const updateData = { $set: emailSettings };
      const savedEmailSettings = await EmailSettingsCollection.updateOne({ id: emailSettings.id }, updateData);
      if (savedEmailSettings.matchedCount === 0) {
        console.log('No email settings found with the given id to update.');
        return null;
      }
      return savedEmailSettings;
    } catch (err) {
      console.error('Error updating email-settings: ', err);
      throw err;
    }
  },
};
