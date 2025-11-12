class Observer {
  update(data) {
    throw new Error('La méthode update doit être implémentée');
  }
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(event, data) {
    this.observers.forEach(observer => {
      observer.update(event, data);
    });
  }

  addItem(product) {
    this.items.push(product);
    this.notify('itemAdded', { product, cart: this });
  }

  removeItem(productId) {
    const item = this.items.find(item => item.id === productId);
    this.items = this.items.filter(item => item.id !== productId);
    this.notify('itemRemoved', { product: item, cart: this });
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  getItemCount() {
    return this.items.length;
  }
}

class CartUIObserver extends Observer {
  update(event, data) {
    if (event === 'itemAdded' || event === 'itemRemoved') {
      const { cart } = data;
      console.log(`🎨 UI mise à jour: ${cart.getItemCount()} articles, Total: ${cart.getTotal()}€`);
    }
  }
}

class CartAnalyticsObserver extends Observer {
  update(event, data) {
    if (event === 'itemAdded') {
      console.log(`📊 Analytics: Produit ajouté - ${data.product.name}`);
    } else if (event === 'itemRemoved') {
      console.log(`📊 Analytics: Produit retiré - ${data.product.name}`);
    }
  }
}

class CartEmailObserver extends Observer {
  constructor(userEmail) {
    super();
    this.userEmail = userEmail;
  }

  update(event, data) {
    if (event === 'itemAdded') {
      console.log(`📧 Email envoyé à ${this.userEmail}: "${data.product.name}" ajouté au panier`);
    }
  }
}

class CartStorageObserver extends Observer {
  update(event, data) {
    if (event === 'itemAdded' || event === 'itemRemoved') {
      console.log(`💾 LocalStorage mis à jour`);
    }
  }
}

class CartNotificationObserver extends Observer {
  update(event, data) {
    if (event === 'itemAdded') {
      console.log(`🔔 Toast: "${data.product.name}" ajouté au panier!`);
    } else if (event === 'itemRemoved') {
      console.log(`🔔 Toast: "${data.product.name}" retiré du panier`);
    }
  }
}

const cart = new ShoppingCart();

cart.subscribe(new CartUIObserver());
cart.subscribe(new CartAnalyticsObserver());
cart.subscribe(new CartEmailObserver('user@example.com'));
cart.subscribe(new CartStorageObserver());
cart.subscribe(new CartNotificationObserver());

cart.addItem({ id: 1, name: 'MacBook Pro', price: 2499 });
console.log('---');
cart.addItem({ id: 2, name: 'Magic Mouse', price: 99 });
console.log('---');
cart.removeItem(1);

