import { defineConfig, loadEnv, type Plugin } from 'vite';
import { BETA_STORAGE_KEYS } from './src/lib/betaStorage.ts';

const betaBankModule = 'virtual:online-beta-fast-bank';

/** Materialize the reviewed fast bank at build time. The reused legacy choices
 * retain their IDs without bringing the old R/P bank into the browser graph. */
function onlineBetaBank(): Plugin {
  const resolved = '\0' + betaBankModule;
  return {
    name: 'online-beta-fast-bank',
    resolveId(id) { if (id === betaBankModule) return resolved; },
    async load(id) {
      if (id !== resolved) return;
      const { fastPlacementBank } = await import('./src/content/fast-placement/index.ts');
      const { validateFastBank } = await import('./src/lib/adaptive/fast/bank.ts');
      const errors = validateFastBank(fastPlacementBank);
      if (errors.length) this.error(errors.join('\n'));
      return `export default ${JSON.stringify(fastPlacementBank)};`;
    },
  };
}

export default defineConfig(({ mode }) => {
  const beta = mode === 'beta';
  const env = loadEnv(mode, '.', 'VITE_');
  const themeKey = beta ? BETA_STORAGE_KEYS.theme : 'gps.theme.v1';
  return {
    base: beta ? '/greg-public-study/beta/' : env.VITE_BASE_PATH || './',
    define: { __ONLINE_BETA__: JSON.stringify(beta) },
    build: { manifest: true, outDir: beta ? 'dist-beta' : 'dist' },
    plugins: [
      { name: 'initial-theme-key', transformIndexHtml: { order: 'pre', handler: html => html.replace('%GPS_THEME_KEY%', themeKey) } },
      ...(beta ? [onlineBetaBank()] : []),
    ],
  };
});
