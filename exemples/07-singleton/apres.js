class AppConfig {
  constructor() {
    if (AppConfig.instance) {
        return AppConfig.instance;
    }

    this.apiUrl = 'https://api.example.com';
    this.theme = 'dark';
    this.language = 'fr';

    AppConfig.instance = this;

  }

  getApiUrl() {
    return this.apiUrl;
  }

  setTheme(theme) {
    console.log(`🎨 Changement du thème: ${this.theme} → ${theme}`);
    this.theme = theme;
  }

  getTheme() {
    return this.theme;
  }

  setLanguage(language) {
    console.log(`🌍 Changement de langue: ${this.language} → ${language}`);
    this.language = language;
  }

  getLanguage() {
    return this.language;
  }
}

const config1 = new AppConfig();
console.log('Config 1 créée');
config1.setTheme('light');

const config2 = new AppConfig();
console.log('Config 2 créée (même instance)');
console.log(`Thème de config2: ${config2.getTheme()}`);

console.log(`\nConfig1 === Config2: ${config1 === config2}`);

config2.setLanguage('en');
console.log(`Langue de config1: ${config1.getLanguage()}`);

