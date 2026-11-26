declare const __ONLINE_BETA__: boolean;

declare module 'virtual:online-beta-fast-bank' {
  const bank: import('./lib/adaptive/fast/index.ts').FastBank;
  export default bank;
}
