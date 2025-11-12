class ValidationHandler {
  constructor() {
    this.nextHandler = null;
  }

  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }

  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return request;
  }
}

class EmailValidationHandler extends ValidationHandler {
  handle(request) {
    if (!request.data.email) {
      request.errors.push('❌ Email requis');
    } else if (!request.data.email.includes('@')) {
      request.errors.push('❌ Email invalide (doit contenir @)');
    } else if (request.data.email.length < 5) {
      request.errors.push('❌ Email trop court');
    } else {
      console.log('✅ Email valide');
    }

    return super.handle(request);
  }
}

class PasswordValidationHandler extends ValidationHandler {
  handle(request) {
    if (!request.data.password) {
      request.errors.push('❌ Mot de passe requis');
    } else {
      if (request.data.password.length < 8) {
        request.errors.push('❌ Mot de passe trop court (min 8 caractères)');
      }
      if (!/[A-Z]/.test(request.data.password)) {
        request.errors.push('❌ Mot de passe doit contenir une majuscule');
      }
      if (!/[a-z]/.test(request.data.password)) {
        request.errors.push('❌ Mot de passe doit contenir une minuscule');
      }
      if (!/[0-9]/.test(request.data.password)) {
        request.errors.push('❌ Mot de passe doit contenir un chiffre');
      }
      if (request.errors.length === 0 || !request.errors.some(e => e.includes('Mot de passe'))) {
        console.log('✅ Mot de passe valide');
      }
    }

    return super.handle(request);
  }
}

class AgeValidationHandler extends ValidationHandler {
  handle(request) {
    if (!request.data.age) {
      request.errors.push('❌ Âge requis');
    } else if (request.data.age < 18) {
      request.errors.push('❌ Vous devez avoir au moins 18 ans');
    } else if (request.data.age > 120) {
      request.errors.push('❌ Âge invalide');
    } else {
      console.log('✅ Âge valide');
    }

    return super.handle(request);
  }
}

class TermsValidationHandler extends ValidationHandler {
  handle(request) {
    if (!request.data.terms) {
      request.errors.push('❌ Vous devez accepter les conditions d\'utilisation');
    } else {
      console.log('✅ Conditions acceptées');
    }

    return super.handle(request);
  }
}

class UsernameValidationHandler extends ValidationHandler {
  handle(request) {
    if (request.data.username) {
      if (request.data.username.length < 3) {
        request.errors.push('❌ Nom d\'utilisateur trop court (min 3 caractères)');
      } else if (!/^[a-zA-Z0-9_]+$/.test(request.data.username)) {
        request.errors.push('❌ Nom d\'utilisateur invalide (lettres, chiffres et _ seulement)');
      } else {
        console.log('✅ Nom d\'utilisateur valide');
      }
    }

    return super.handle(request);
  }
}

class FormValidator {
  constructor() {
    this.chain = null;
  }

  buildChain(...handlers) {
    for (let i = 0; i < handlers.length - 1; i++) {
      handlers[i].setNext(handlers[i + 1]);
    }
    this.chain = handlers[0];
    return this;
  }

  validate(formData) {
    const request = {
      data: formData,
      errors: []
    };

    if (this.chain) {
      this.chain.handle(request);
    }

    return request.errors;
  }
}

console.log('=== Validation d\'un formulaire d\'inscription ===\n');

const validator = new FormValidator();
validator.buildChain(
  new EmailValidationHandler(),
  new PasswordValidationHandler(),
  new AgeValidationHandler(),
  new UsernameValidationHandler(),
  new TermsValidationHandler()
);

const formData1 = {
  email: 'test@example.com',
  password: 'Pass1234',
  age: 25,
  username: 'john_doe',
  terms: true
};

console.log('📝 Test 1 - Données valides:');
const errors1 = validator.validate(formData1);
console.log(`\n${errors1.length === 0 ? '✅ Formulaire valide!' : '❌ Erreurs: ' + errors1.join(', ')}\n`);

console.log('\n=== Test 2 - Données invalides ===\n');

const formData2 = {
  email: 'invalide',
  password: 'pass',
  age: 16,
  username: 'ab',
  terms: false
};

console.log('📝 Test 2 - Données invalides:');
const errors2 = validator.validate(formData2);
console.log(`\n❌ ${errors2.length} erreur(s) trouvée(s):`);
errors2.forEach(error => console.log(`   ${error}`));

