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
  users: z
    .string()
    .array()
    .openapi({ example: ['66b14242e9a75ff13a66027a', '66b14242e9a75ff13a66027b'] }),
  chatAdmin: z.null().openapi({ example: null }),
});

export const ChatSchema = z.object({
  _id: z.string().openapi({ example: '668f0c2ce629e80c6fa7ec7d' }),
  chatName: z.string().openapi({ example: 'user' }),
  isChannel: z.boolean().openapi({ example: false }),
  users: z
    .string()
    .array()
    .openapi({ example: ['66b14242e9a75ff13a66027a', '66b14242e9a75ff13a66027b'] }),
  chatAdmin: z.null().openapi({ example: null }),
  lastMessage: z.instanceof(ObjectId),
});

export type NewChat = z.infer<typeof NewChatSchema>;
export type Chat = z.infer<typeof ChatSchema>;
