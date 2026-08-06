import { Moon, Sun } from 'lucide-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { useThemeMode } from './theme-mode.context';

export function ThemeToggle(): ReactElement {
  const { resolvedMode, setMode } = useThemeMode();
  const { t } = useTranslation();
  const isDark = resolvedMode === 'dark';

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
      {isDark ? t('theme.switchToLightMode') : t('theme.switchToDarkMode')}
    </button>
  );
}
