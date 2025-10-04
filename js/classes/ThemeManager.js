class ThemeManager {
  constructor() {
    this.current_theme = 'light';
    this.THEME_KEY = 'kanban_theme';
    this.auto_detect = true;
  }

  // Initialize theme
  InitTheme() {
    const saved_theme = localStorage.getItem(this.THEME_KEY);
    if (saved_theme) {
      this.current_theme = saved_theme;
      this.auto_detect = false;
    } else {
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        this.current_theme = 'dark';
      } else {
        this.current_theme = 'light';
      }
    }
    this.ApplyTheme(this.current_theme);
    this.SetupSystemThemeListener();
  }

  // Apply theme
  ApplyTheme(theme) {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    this.current_theme = theme;
    this.UpdateThemeToggleUI();
  }

  // Toggle theme
  ToggleTheme() {
    const new_theme = this.current_theme === 'light' ? 'dark' : 'light';
    this.ApplyTheme(new_theme);
    localStorage.setItem(this.THEME_KEY, new_theme);
    this.auto_detect = false;
  }

  // Set theme
  SetTheme(theme) {
    if (theme !== 'light' && theme !== 'dark') return;
    this.ApplyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.auto_detect = false;
  }

  // Enable auto theme detection
  EnableAutoDetect() {
    this.auto_detect = true;
    localStorage.removeItem(this.THEME_KEY);
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      this.ApplyTheme('dark');
    } else {
      this.ApplyTheme('light');
    }
  }

  // Setup system theme change listener
  SetupSystemThemeListener() {
    if (!window.matchMedia) return;
    const media_query = window.matchMedia('(prefers-color-scheme: dark)');
    media_query.addEventListener('change', e => {
      if (this.auto_detect) {
        this.ApplyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  // Update theme toggle UI
  UpdateThemeToggleUI() {
    const toggle_button = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!toggle_button || !icon) return;
    if (this.current_theme === 'dark') {
      icon.innerHTML = `
        <svg
          class="fill-current"
          width="18"
          height="18"
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M232 488c0 13.3 10.7 24 24 24s24-10.7 24-24l0-56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 56zm0-408c0 13.3 10.7 24 24 24s24-10.7 24-24l0-56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 56zM75 75c-9.4 9.4-9.4 24.6 0 33.9l39.6 39.6c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9L108.9 75c-9.4-9.4-24.6-9.4-33.9 0zM363.5 363.5c-9.4 9.4-9.4 24.6 0 33.9L403.1 437c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-39.6-39.6c-9.4-9.4-24.6-9.4-33.9 0zM0 256c0 13.3 10.7 24 24 24l56 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-56 0c-13.3 0-24 10.7-24 24zm408 0c0 13.3 10.7 24 24 24l56 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-56 0c-13.3 0-24 10.7-24 24zM75 437c9.4 9.4 24.6 9.4 33.9 0l39.6-39.6c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L75 403.1c-9.4 9.4-9.4 24.6 0 33.9zM363.5 148.5c9.4 9.4 24.6 9.4 33.9 0L437 108.9c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39.6 39.6c-9.4 9.4-9.4 24.6 0 33.9zM256 368a112 112 0 1 0 0-224 112 112 0 1 0 0 224z"
          />
        </svg>
      `;
      toggle_button.setAttribute('title', 'Switch to Light Mode');
    } else {
      icon.innerHTML = `
        <svg
          class="fill-current"
          width="18"
          height="18"
          viewBox="0 0 640 640"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="currentColor"
            d="M320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576C388.8 576 451.3 548.8 497.3 504.6C504.6 497.6 506.7 486.7 502.6 477.5C498.5 468.3 488.9 462.6 478.8 463.4C473.9 463.8 469 464 464 464C362.4 464 280 381.6 280 280C280 207.9 321.5 145.4 382.1 115.2C391.2 110.7 396.4 100.9 395.2 90.8C394 80.7 386.6 72.5 376.7 70.3C358.4 66.2 339.4 64 320 64z"
          />
        </svg>
      `;
      toggle_button.setAttribute('title', 'Switch to Dark Mode');
    }
  }

  // Get current theme
  GetCurrentTheme() {
    return this.current_theme;
  }

  // Check if auto detect is enabled
  IsAutoDetectEnabled() {
    return this.auto_detect;
  }
}
