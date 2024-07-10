import dotenv from 'dotenv';
import { cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly('test'),
    choices: ['development', 'production', 'test'],
  }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:3000') }),
  COMMON_RATE_LIMIT_MAX_REQUESTS: num({ devDefault: testOnly(1000) }),
  COMMON_RATE_LIMIT_WINDOW_MS: num({ devDefault: testOnly(1000) }),
  MONGODB_CONNECTION_STRING: str({ devDefault: testOnly('mongodb://root:root@localhost:27017') }),
  JWT_SECRET: str({ devDefault: testOnly('RANDOM_KEY') }),
  // This is the session secret key
  SESSION_SECRET: str('M4twM8i3c2wiu0VnchpJDFMk3kS0KSVNESmCY7MnwwMT5aiD3o21NFwv0itexZur'),
});
