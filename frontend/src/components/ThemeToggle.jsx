import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ className = 'theme-toggle' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button type="button" className={className} onClick={toggleTheme} aria-label="Toggle dark and light mode">
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;
