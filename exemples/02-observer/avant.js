class ShoppingCart {
  constructor() {
    this.items = [];
    this.totalItems = 0;
  }

  addItem(product) {
    this.items.push(product);
    this.totalItems++;

    document.getElementById('cart-count').textContent = this.totalItems;
    document.getElementById('cart-total').textContent = this.getTotal();
    
    console.log('Email envoyé: Produit ajouté au panier');
    console.log('Analytics: Produit ajouté au panier');
    console.log('Toast notification affichée');
    
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.totalItems--;

    document.getElementById('cart-count').textContent = this.totalItems;
    document.getElementById('cart-total').textContent = this.getTotal();
    
    console.log('Analytics: Produit retiré du panier');
    
    localStorage.setItem('cart', JSON.stringify(this.items));
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
}

const cart = new ShoppingCart();
cart.addItem({ id: 1, name: 'Laptop', price: 999 });

