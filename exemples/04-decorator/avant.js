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

const api = new APIService();
api.fetchData('https://api.example.com/users');

