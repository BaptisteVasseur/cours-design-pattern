const appConfig = {
  apiUrl: 'https://api.example.com',
  apiKey: 'secret-key-123',
  theme: 'dark',
  language: 'fr',
  debug: false,

  getApiUrl() {
    return this.apiUrl;
  },

  setTheme(theme) {
    console.log(`🎨 Changement du thème: ${this.theme} → ${theme}`);
    this.theme = theme;
  },

  getTheme() {
    return this.theme;
  },

  setLanguage(language) {
    console.log(`🌍 Changement de langue: ${this.language} → ${language}`);
    this.language = language;
  },

  getLanguage() {
    return this.language;
  },

  enableDebug() {
    this.debug = true;
    console.log('🐛 Mode debug activé');
  },

  isDebugEnabled() {
    return this.debug;
  }
};

Object.freeze(appConfig);

export default appConfig;

console.log('Config créée');
appConfig.setTheme('light');
console.log(`Thème: ${appConfig.getTheme()}`);

appConfig.setLanguage('en');
console.log(`Langue: ${appConfig.getLanguage()}`);

