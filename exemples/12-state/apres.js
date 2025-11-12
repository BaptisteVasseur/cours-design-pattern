class FormState {
  constructor(form) {
    this.form = form;
  }

  fillForm(data) {
    console.log('❌ Action non autorisée dans cet état');
  }

  submit() {
    console.log('❌ Action non autorisée dans cet état');
  }

  validate() {
    console.log('❌ Action non autorisée dans cet état');
  }

  reject() {
    console.log('❌ Action non autorisée dans cet état');
  }

  cancel() {
    console.log('❌ Action non autorisée dans cet état');
  }

  edit() {
    console.log('❌ Action non autorisée dans cet état');
  }

  getStateName() {
    return this.constructor.name;
  }
}

class DraftState extends FormState {
  fillForm(data) {
    console.log('✏️  Remplissage du formulaire...');
    this.form.data = { ...this.form.data, ...data };
    console.log(`   Données: ${JSON.stringify(this.form.data)}`);
  }

  submit() {
    if (Object.keys(this.form.data).length === 0) {
      console.log('❌ Impossible de soumettre un formulaire vide');
      return;
    }
    console.log('📤 Soumission du formulaire...');
    this.form.setState(new SubmittedState(this.form));
  }

  cancel() {
    console.log('🗑️  Formulaire annulé');
    this.form.data = {};
  }
}

class SubmittedState extends FormState {
  validate() {
    console.log('✅ Validation du formulaire...');
    this.form.setState(new ValidatedState(this.form));
  }

  reject() {
    console.log('❌ Rejet du formulaire, retour au brouillon');
    this.form.setState(new DraftState(this.form));
  }

  cancel() {
    console.log('🗑️  Annulation de la soumission');
    this.form.setState(new CancelledState(this.form));
  }
}

class ValidatedState extends FormState {
  edit() {
    console.log('✏️  Retour en mode édition');
    this.form.setState(new DraftState(this.form));
  }

  cancel() {
    console.log('🗑️  Annulation du formulaire validé');
    this.form.setState(new CancelledState(this.form));
  }
}

class CancelledState extends FormState {
  edit() {
    console.log('♻️  Réouverture du formulaire');
    this.form.setState(new DraftState(this.form));
  }
}

class OrderForm {
  constructor() {
    this.state = new DraftState(this);
    this.data = {};
  }

  setState(state) {
    console.log(`🔄 Changement d'état: ${this.state.getStateName()} → ${state.getStateName()}`);
    this.state = state;
  }

  fillForm(data) {
    this.state.fillForm(data);
  }

  submit() {
    this.state.submit();
  }

  validate() {
    this.state.validate();
  }

  reject() {
    this.state.reject();
  }

  cancel() {
    this.state.cancel();
  }

  edit() {
    this.state.edit();
  }

  getState() {
    return this.state.getStateName();
  }

  getData() {
    return this.data;
  }
}

console.log('=== Scénario 1: Flux normal ===\n');

const form1 = new OrderForm();
console.log(`État initial: ${form1.getState()}\n`);

form1.fillForm({ product: 'Laptop', quantity: 1, price: 999 });
console.log('');

form1.submit();
console.log('');

form1.validate();
console.log('');

console.log(`État final: ${form1.getState()}`);
console.log(`Données: ${JSON.stringify(form1.getData())}`);

console.log('\n=== Scénario 2: Rejet puis modification ===\n');

const form2 = new OrderForm();
form2.fillForm({ product: 'Mouse', quantity: 2, price: 49 });
console.log('');

form2.submit();
console.log('');

form2.reject();
console.log('');

form2.fillForm({ product: 'Mouse', quantity: 3, price: 49 });
console.log('');

form2.submit();
console.log('');

form2.validate();

console.log('\n=== Scénario 3: Actions non autorisées ===\n');

const form3 = new OrderForm();
console.log('Tentative de validation sans soumission:');
form3.validate();
console.log('');

form3.fillForm({ product: 'Keyboard', quantity: 1, price: 79 });
form3.submit();
console.log('\nTentative de remplissage après soumission:');
form3.fillForm({ product: 'Monitor', quantity: 1, price: 299 });

console.log('\n=== Scénario 4: Annulation ===\n');

const form4 = new OrderForm();
form4.fillForm({ product: 'Headset', quantity: 1, price: 129 });
console.log('');

form4.submit();
console.log('');

form4.cancel();
console.log('');

console.log('Tentative d\'édition après annulation:');
form4.edit();
console.log('');

form4.fillForm({ product: 'Webcam', quantity: 1, price: 89 });

