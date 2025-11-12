class OrderForm {
  constructor() {
    this.state = 'draft';
    this.data = {};
  }

  fillForm(data) {
    if (this.state === 'draft') {
      this.data = data;
      console.log('Formulaire rempli');
    } else {
      console.log('Impossible de modifier le formulaire');
    }
  }

  submit() {
    if (this.state === 'draft') {
      this.state = 'submitted';
      console.log('Formulaire soumis');
    } else {
      console.log('Formulaire déjà soumis');
    }
  }

  validate() {
    if (this.state === 'submitted') {
      this.state = 'validated';
      console.log('Formulaire validé');
    } else {
      console.log('Impossible de valider');
    }
  }

  reject() {
    if (this.state === 'submitted') {
      this.state = 'draft';
      console.log('Formulaire rejeté, retour au brouillon');
    } else {
      console.log('Impossible de rejeter');
    }
  }
}

const form = new OrderForm();
form.fillForm({ item: 'Laptop', quantity: 1 });
form.submit();
form.validate();

