class AppConfig {
  constructor() {
    this.apiUrl = 'https://api.example.com';
    this.theme = 'dark';
    this.language = 'fr';
  }

  getApiUrl() {
    return this.apiUrl;
  }

  setTheme(theme) {
    this.theme = theme;
  }

  getTheme() {
    return this.theme;
  }
}

const config1 = new AppConfig();
config1.setTheme('light');

const config2 = new AppConfig();
console.log(config2.getTheme());

