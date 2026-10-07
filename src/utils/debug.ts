/**
 * Utilitário de debug condicional (CLAUDE.md › Qualidade: sem console.log commitado).
 * Só emite logs em desenvolvimento e quando `localStorage["presidente-simulator:debug"] === "1"`.
 */
const DEBUG_STORAGE_KEY = 'presidente-simulator:debug';

const isDebugEnabled = (): boolean => {
  if (!import.meta.env?.DEV) return false;
  try {
    return globalThis.localStorage?.getItem(DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const debugLog = (scope: string, ...details: unknown[]): void => {
  if (!isDebugEnabled()) return;
  // eslint-disable-next-line no-console
  console.debug(`[${scope}]`, ...details);
};
