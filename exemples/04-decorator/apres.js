class APIService {
    async fetchData(url) {
        console.log(`Fetching ${url}...`);

        console.log('Vérification du cache...');
        console.log('Logging de la requête...');
        console.log('Vérification de l\'authentification...');
        console.log('Validation des données...');

        const response = await fetch(url);
        const data = await response.json();

        console.log('Sauvegarde en cache...');
        console.log('Transformation des données...');

        return data;
    }
}

class APIServiceDecorator {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async fetchData(url) {
        this.apiService.fetchData(url)
    }
}

class CacheDecorator extends APIServiceDecorator {
    async fetchData(url) {
        // Récupérer le cache, aller vérifier dans le cache que l'url existe
        // Si oui : retourne la valeur du cache
        // Si non, on execute la méthode fetchData -> après faut save la réponse
        // dans le cache

        if (cache.has(url)) {
            return cache.get(url);
        } else {
            const response = await super.fetchData()
            cache.set(cache, response);
            return response;
        }
    }
}

class LoggingDecorator extends APIServiceDecorator {
    async fetchData(url) {
        const response = await super.fetchData(url);
        console.log(`URl : ${url} | Response : ${JSON.stringify(response)}`);
    }
}

// Validation de l'authentification
// Vérification des données

let api = new APIService();
api = new CacheDecorator(api)

if (APP_ENV = 'dev') {
    api = new LoggingDecorator(api)
}

if (user && user.isLogged()) {
    api = new AuthDecorator(api);
}

api.fetchData('https://api.example.com/users');

