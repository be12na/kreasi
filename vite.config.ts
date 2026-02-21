import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin: generate root index.html that loads dist/ assets (for cPanel git deploy)
function generateRootIndex(): import('vite').Plugin {
  return {
    name: 'generate-root-index',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const rootDir = path.resolve(__dirname);

      // Read the built HTML from dist/dev.html
      const srcHtml = path.join(distDir, 'dev.html');
      if (!fs.existsSync(srcHtml)) {
        console.warn('⚠️ dist/dev.html not found, skipping root index.html generation');
        return;
      }

      let html = fs.readFileSync(srcHtml, 'utf-8');
      
      // Fix asset paths: /kreasi/assets/ -> /kreasi/dist/assets/
      // This way assets load from dist/ subfolder on the server
      html = html.replace(/\/kreasi\/assets\//g, '/kreasi/dist/assets/');
      
      // Write to root index.html
      fs.writeFileSync(path.join(rootDir, 'index.html'), html, 'utf-8');
      console.log('\n✅ Generated root index.html (pointing to dist/assets/)');
      
      // Also rename dist/dev.html -> dist/index.html for direct access
      fs.renameSync(srcHtml, path.join(distDir, 'index.html'));
      console.log('✅ Renamed dist/dev.html -> dist/index.html');
      console.log('🚀 Build ready for cPanel deployment!\n');
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    return {
      base: '/kreasi/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        isProduction && generateRootIndex(),
      ].filter(Boolean),
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          input: path.resolve(__dirname, 'dev.html'),
        }
      }
    };
});
