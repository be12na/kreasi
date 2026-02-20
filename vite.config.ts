import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Plugin: copy dist/ output to project root after build (for cPanel git deploy)
function copyDistToRoot(): import('vite').Plugin {
  return {
    name: 'copy-dist-to-root',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const rootDir = path.resolve(__dirname);

      // Copy dist/dev.html -> root/index.html (rename for production)
      const srcHtml = path.join(distDir, 'dev.html');
      const destHtml = path.join(rootDir, 'index.html');
      if (fs.existsSync(srcHtml)) {
        fs.copyFileSync(srcHtml, destHtml);
        // Also rename in dist/ for consistency
        fs.renameSync(srcHtml, path.join(distDir, 'index.html'));
        console.log('\n✅ Copied dist/dev.html -> index.html');
      }

      // Copy dist/assets/ -> root/assets/
      const srcAssets = path.join(distDir, 'assets');
      const destAssets = path.join(rootDir, 'assets');
      if (fs.existsSync(srcAssets)) {
        if (!fs.existsSync(destAssets)) fs.mkdirSync(destAssets, { recursive: true });
        for (const file of fs.readdirSync(srcAssets)) {
          fs.copyFileSync(path.join(srcAssets, file), path.join(destAssets, file));
        }
        console.log('✅ Copied dist/assets/ -> assets/');
      }
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
        isProduction && copyDistToRoot(),
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
