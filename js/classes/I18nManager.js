class I18nManager {
  constructor() {
    this.current_language = 'en';
    this.translations = {
      en: TRANSLATIONS_EN,
      th: TRANSLATIONS_TH
    };
    this.LoadLanguagePreference();
  }

  // Load language preference from localStorage (English by default)
  LoadLanguagePreference() {
    const saved_language = localStorage.getItem('kanban_language');
    if (saved_language && this.translations[saved_language]) {
      this.current_language = saved_language;
    } else {
      const browser_language = navigator.language || navigator.userLanguage;
      if (browser_language.startsWith('th')) {
        this.current_language = 'th';
      } else {
        this.current_language = 'en';
      }
    }
    this.ApplyLanguage();
  }

  // Change language
  ChangeLanguage(language_code) {
    if (!this.translations[language_code]) {
      console.error(`Language ${language_code} not found`);
      return;
    }
    this.current_language = language_code;
    localStorage.setItem('kanban_language', language_code);
    this.ApplyLanguage();
    if (typeof ui_manager !== 'undefined' && ui_manager) {
      ui_manager.RenderTasks();
    }
    document.documentElement.lang = language_code;
  }

  // Translate text by key (supports nested keys like 'common.save')
  Translate(key, replacements = {}) {
    const keys = key.split('.');
    let value = this.translations[this.current_language];
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    if (typeof value === 'string') {
      return this.ReplacePlaceholders(value, replacements);
    }
    return value || key;
  }

  // Replace placeholders in text, e.g. {count}, {name}
  ReplacePlaceholders(text, replacements) {
    let result = text;
    for (const [key, value] of Object.entries(replacements)) {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    return result;
  }

  // Update DOM elements with data-i18n attribute
  ApplyLanguage() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.Translate(key);
      const attr = element.getAttribute('data-i18n-attr');
      if (attr) {
        element.setAttribute(attr, translation);
      } else {
        if (
          element.childNodes.length === 1 &&
          element.childNodes[0].nodeType === Node.TEXT_NODE
        ) {
          element.textContent = translation;
        } else {
          const text_node = Array.from(element.childNodes).find(
            node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
          );
          if (text_node) {
            text_node.textContent = translation;
          } else {
            element.textContent = translation;
          }
        }
      }
    });
    const placeholder_elements = document.querySelectorAll(
      '[data-i18n-placeholder]'
    );
    placeholder_elements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.Translate(key);
      element.placeholder = translation;
    });
    const title_elements = document.querySelectorAll('[data-i18n-title]');
    title_elements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.Translate(key);
      element.title = translation;
    });
    const aria_elements = document.querySelectorAll('[data-i18n-aria]');
    aria_elements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria');
      const translation = this.Translate(key);
      element.setAttribute('aria-label', translation);
    });
  }

  // Get current language
  GetCurrentLanguage() {
    return this.current_language;
  }

  // Get available languages
  GetAvailableLanguages() {
    return Object.keys(this.translations);
  }

  // Get language name in that language
  GetLanguageName(language_code) {
    const names = {
      en: 'English',
      th: 'ไทย'
    };
    return names[language_code] || language_code;
  }

  // Format date according to the current language
  FormatDate(date_string) {
    if (!date_string) return '';
    const date = new Date(date_string);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const task_date = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (task_date.getTime() === today.getTime()) {
      return this.Translate('date.today');
    } else if (task_date.getTime() === yesterday.getTime()) {
      return this.Translate('date.yesterday');
    } else if (task_date.getTime() === tomorrow.getTime()) {
      return this.Translate('date.tomorrow');
    }
    if (this.current_language === 'th') {
      const months_th = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.'
      ];
      const day = date.getDate();
      const month = months_th[date.getMonth()];
      const year = date.getFullYear() + 543;
      return `${day} ${month} ${year}`;
    } else {
      const months_en = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      const day = date.getDate();
      const month = months_en[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day}, ${year}`;
    }
  }

  // Format datetime according to the current language
  FormatDateTime(date_string) {
    if (!date_string) return '';
    const date = new Date(date_string);
    if (this.current_language === 'th') {
      const months_th = [
        'ม.ค.',
        'ก.พ.',
        'มี.ค.',
        'เม.ย.',
        'พ.ค.',
        'มิ.ย.',
        'ก.ค.',
        'ส.ค.',
        'ก.ย.',
        'ต.ค.',
        'พ.ย.',
        'ธ.ค.'
      ];
      const day = date.getDate();
      const month = months_th[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month}, ${hours}:${minutes}`;
    } else {
      const months_en = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
      ];
      const day = date.getDate();
      const month = months_en[date.getMonth()];
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${month} ${day}, ${hours}:${minutes}`;
    }
  }

  // Format plural (for English)
  FormatPlural(count, singular, plural) {
    if (this.current_language === 'th') {
      return singular;
    }
    return count === 1 ? singular : plural || singular + 's';
  }
}
