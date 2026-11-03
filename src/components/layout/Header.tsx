import { useState } from 'react';
import logo from '../../../assets/brand/Greg Public Study Logo.png';
import lightLogo from '../../../assets/brand/greg-public-study-logo-light.png';
import { Icon } from '../Icon';

export function Header({ route, themeStorageKey = 'gps.theme.v1' }: { route: string; themeStorageKey?: string }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#121212' : '#F7F7F7');
    setTheme(next);
    try { localStorage.setItem(themeStorageKey, next); } catch { setStorageUnavailable(true); }
  }
  return <header className="site-header">
    <div className="header-inner">
      <a className="brand" href="#/" aria-label="Greg Public Study — главная" onClick={() => setMenuOpen(false)}><img src={theme === 'light' ? lightLogo : logo} width="2172" height="724" alt="Greg Public Study" /></a>
      <nav className="desktop-nav" aria-label="Основная навигация">
        <a href="#/" aria-current={route === '/' ? 'page' : undefined}>Главная</a>
        <a href="#/course/a1" aria-current={route.startsWith('/course') || route.startsWith('/lesson') ? 'page' : undefined}>Курс A1</a>
      </nav>
      <div className="header-actions">
        <button className="theme-toggle" onClick={toggleTheme} aria-label={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} aria-pressed={theme === 'dark'}><Icon name={theme === 'light' ? 'moon' : 'sun'} /><span>{theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}</span></button>
        <button className="icon-button mobile-menu-button" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
      </div>
    </div>
    {menuOpen && <nav id="mobile-nav" className="mobile-nav" aria-label="Мобильная навигация"><a href="#/" aria-current={route === '/' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Главная</a><a href="#/course/a1" aria-current={route.startsWith('/course') || route.startsWith('/lesson') ? 'page' : undefined} onClick={() => setMenuOpen(false)}>Курс A1</a></nav>}
    {storageUnavailable && <p className="storage-note" role="status">Браузер не разрешает сохранить тему. Она действует до перезагрузки.</p>}
  </header>;
}
