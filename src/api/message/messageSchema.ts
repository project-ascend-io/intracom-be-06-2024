import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const ModelID = z.object({
  _id: z.instanceof(ObjectId),
});

export const NewMessageSchema = z.object({
  sender: z.string().openapi({ example: '66b69114935161d476b3bc3b' }),
  content: z.string().trim().openapi({ example: 'Hello World!' }),
  chat: z.string().openapi({ example: '66b69114935161d476b3bc3b' }),
});

export const MessageSchema = z.object({
  _id: z.string().openapi({ example: '668f0c2ce629e80c6fa7ec7d' }),
  sender: z.string().openapi({ example: '66c3d383189638b81eac7cf7' }),
  content: z.string().trim().openapi({ example: 'Hello World!' }),
  chat: z.string().openapi({ example: '66c3d3fe189638b81eac7cfd' }),
});

export type NewMessage = z.infer<typeof NewMessageSchema>;
export type Message = z.infer<typeof MessageSchema>;
