import { Moon, Sun } from './Icons.jsx'

export default function ThemeToggle({ theme, onTheme }) {
  return (
    <div
      className={'theme-toggle ' + (theme === 'light' ? 'is-light' : '')}
      role="group"
      aria-label="Theme"
    >
      <span className="knob" aria-hidden="true" />
      <button
        className={theme === 'dark' ? 'on' : ''}
        onClick={() => onTheme('dark')}
        aria-label="Dark theme"
        title="Dark"
      >
        <Moon />
      </button>
      <button
        className={theme === 'light' ? 'on' : ''}
        onClick={() => onTheme('light')}
        aria-label="Light theme"
        title="Light"
      >
        <Sun />
      </button>
    </div>
  )
}
