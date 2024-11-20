import { copy } from 'fs-extra';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src'],
  splitting: false,
  sourcemap: true,
  clean: true,
  loader: {
    '.html': 'text',
  },
  ignoreWatch: ['src/socket-docs'],
  onSuccess: async () => {
    try {
      await copy('src/socket-docs', 'dist/socket-docs');
      console.log('Copied src/socket-docs to dist/socket-docs');
    } catch (err) {
      console.error('Error copying socket-docs:', err);
    }
  },
});
