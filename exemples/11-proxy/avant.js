class APIService {
  async fetchUser(userId) {
    console.log(`Fetching user ${userId} from API...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  }

  async fetchProducts() {
    console.log('Fetching products from API...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Mouse', price: 49 }
    ];
  }
}

(async () => {
  const api = new APIService();
  
  console.log('Request 1:');
  await api.fetchUser(1);
  
  console.log('\nRequest 2 (same user):');
  await api.fetchUser(1);
  
  console.log('\nRequest 3:');
  await api.fetchProducts();
  
  console.log('\nRequest 4 (same products):');
  await api.fetchProducts();
})();

