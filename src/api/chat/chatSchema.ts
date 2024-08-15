import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  _id: z.instanceof(ObjectId),
});

export const NewChatSchema = z.object({
  chatName: z.string().openapi({ example: 'user' }),
  isChannel: z.boolean().openapi({ example: false }),
  users: z.instanceof(ObjectId).array(),
  chatAdmin: z.instanceof(ObjectId),
});

export const ChatSchema = z.object({
  _id: z.string().openapi({ example: '668f0c2ce629e80c6fa7ec7d' }),
  chatName: z.string().openapi({ example: 'user' }),
  isChannel: z.boolean().openapi({ example: false }),
  users: z.instanceof(ObjectId).array(),
  chatAdmin: z.instanceof(ObjectId),
});

export type NewChat = z.infer<typeof NewChatSchema>;
export type Chat = z.infer<typeof ChatSchema>;
