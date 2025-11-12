class APIService {
  async fetchUser(userId) {
    console.log(`🌐 API Call: Fetching user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      id: userId,
      name: `User ${userId}`,
      email: `user${userId}@example.com`,
      timestamp: new Date().toISOString()
    };
  }

  async fetchProducts() {
    console.log('🌐 API Call: Fetching products...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: 1, name: 'Laptop', price: 999 },
      { id: 2, name: 'Mouse', price: 49 },
      { id: 3, name: 'Keyboard', price: 79 }
    ];
  }

  async createOrder(orderData) {
    console.log('🌐 API Call: Creating order...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: Math.random().toString(36).substr(2, 9), ...orderData, status: 'created' };
  }
}

class CachedAPIProxy {
  constructor(apiService, cacheDuration = 5000) {
    this.apiService = apiService;
    this.cache = new Map();
    this.cacheDuration = cacheDuration;
  }

  _getCacheKey(method, args) {
    return `${method}:${JSON.stringify(args)}`;
  }

  _isCacheValid(cacheEntry) {
    return Date.now() - cacheEntry.timestamp < this.cacheDuration;
  }

  async fetchUser(userId) {
    const cacheKey = this._getCacheKey('fetchUser', [userId]);
    
    if (this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey);
      if (this._isCacheValid(cacheEntry)) {
        console.log(`💾 Cache HIT: User ${userId}`);
        return cacheEntry.data;
      } else {
        console.log(`⏰ Cache EXPIRED: User ${userId}`);
        this.cache.delete(cacheKey);
      }
    }

    console.log(`💾 Cache MISS: User ${userId}`);
    const data = await this.apiService.fetchUser(userId);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async fetchProducts() {
    const cacheKey = this._getCacheKey('fetchProducts', []);
    
    if (this.cache.has(cacheKey)) {
      const cacheEntry = this.cache.get(cacheKey);
      if (this._isCacheValid(cacheEntry)) {
        console.log('💾 Cache HIT: Products');
        return cacheEntry.data;
      } else {
        console.log('⏰ Cache EXPIRED: Products');
        this.cache.delete(cacheKey);
      }
    }

    console.log('💾 Cache MISS: Products');
    const data = await this.apiService.fetchProducts();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  async createOrder(orderData) {
    console.log('⚠️  Méthode non cachée (création)');
    return this.apiService.createOrder(orderData);
  }

  clearCache() {
    console.log('🗑️  Cache vidé');
    this.cache.clear();
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

class LoggingAPIProxy {
  constructor(apiService) {
    this.apiService = apiService;
    this.requestCount = 0;
    this.requestLog = [];
  }

  async fetchUser(userId) {
    this.requestCount++;
    const startTime = Date.now();
    console.log(`📊 Request #${this.requestCount}: fetchUser(${userId})`);
    
    try {
      const result = await this.apiService.fetchUser(userId);
      const duration = Date.now() - startTime;
      this.requestLog.push({ method: 'fetchUser', args: [userId], duration, success: true });
      console.log(`✅ Completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.requestLog.push({ method: 'fetchUser', args: [userId], duration, success: false, error });
      console.log(`❌ Failed in ${duration}ms`);
      throw error;
    }
  }

  async fetchProducts() {
    this.requestCount++;
    const startTime = Date.now();
    console.log(`📊 Request #${this.requestCount}: fetchProducts()`);
    
    const result = await this.apiService.fetchProducts();
    const duration = Date.now() - startTime;
    this.requestLog.push({ method: 'fetchProducts', args: [], duration, success: true });
    console.log(`✅ Completed in ${duration}ms`);
    return result;
  }

  async createOrder(orderData) {
    this.requestCount++;
    const startTime = Date.now();
    console.log(`📊 Request #${this.requestCount}: createOrder()`);
    
    const result = await this.apiService.createOrder(orderData);
    const duration = Date.now() - startTime;
    this.requestLog.push({ method: 'createOrder', args: [orderData], duration, success: true });
    console.log(`✅ Completed in ${duration}ms`);
    return result;
  }

  getStats() {
    const totalDuration = this.requestLog.reduce((sum, log) => sum + log.duration, 0);
    return {
      totalRequests: this.requestCount,
      averageDuration: totalDuration / this.requestCount,
      log: this.requestLog
    };
  }
}

(async () => {
  console.log('=== Test avec Cache Proxy ===\n');
  
  const api = new APIService();
  const cachedAPI = new CachedAPIProxy(api, 5000);
  
  console.log('Request 1: User 1');
  await cachedAPI.fetchUser(1);
  
  console.log('\nRequest 2: User 1 (devrait être en cache)');
  await cachedAPI.fetchUser(1);
  
  console.log('\nRequest 3: Products');
  await cachedAPI.fetchProducts();
  
  console.log('\nRequest 4: Products (devrait être en cache)');
  await cachedAPI.fetchProducts();
  
  console.log('\nRequest 5: User 2');
  await cachedAPI.fetchUser(2);
  
  console.log('\n📊 Statistiques du cache:', cachedAPI.getCacheStats());
  
  console.log('\n=== Test avec Logging Proxy ===\n');
  
  const loggedAPI = new LoggingAPIProxy(api);
  
  await loggedAPI.fetchUser(1);
  await loggedAPI.fetchProducts();
  await loggedAPI.createOrder({ items: [1, 2], total: 1048 });
  
  console.log('\n📊 Statistiques des requêtes:', loggedAPI.getStats());
  
  console.log('\n=== Test avec Proxy combiné (Cache + Logging) ===\n');
  
  const combinedAPI = new LoggingAPIProxy(new CachedAPIProxy(api));
  
  await combinedAPI.fetchUser(5);
  await combinedAPI.fetchUser(5);
  
  console.log('\n📊 Stats finales:', combinedAPI.getStats());
})();

