import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { authRegistry } from '@/api/auth/authRouter';
import { chatRegistry } from '@/api/chat/chatRouter';
import { emailSettingsRegistry } from '@/api/emailSettings/emailSettingsRouter';
import { healthCheckRegistry } from '@/api/healthCheck/healthCheckRouter';
import { messageRegistry } from '@/api/message/messageRouter';
import { organizationRegistry } from '@/api/organization/organizationRouter';
import { userRegistry } from '@/api/user/userRouter';
import { userInviteRegistry } from '@/api/userInvite/userInviteRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    authRegistry,
    healthCheckRegistry,
    userRegistry,
    organizationRegistry,
    emailSettingsRegistry,
    chatRegistry,
    messageRegistry,
    userInviteRegistry,
  ]);

  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
