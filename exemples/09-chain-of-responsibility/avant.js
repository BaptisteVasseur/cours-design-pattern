class FormValidator {
  validate(formData) {
    const errors = [];

    if (!formData.email) {
      errors.push('Email requis');
    } else if (!formData.email.includes('@')) {
      errors.push('Email invalide');
    }

    if (!formData.password) {
      errors.push('Mot de passe requis');
    } else if (formData.password.length < 8) {
      errors.push('Mot de passe trop court');
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.push('Mot de passe doit contenir une majuscule');
    }

    if (!formData.age) {
      errors.push('Âge requis');
    } else if (formData.age < 18) {
      errors.push('Vous devez avoir 18 ans');
    }

    if (!formData.terms) {
      errors.push('Vous devez accepter les conditions');
    }

    return errors;
  }
}

const validator = new FormValidator();
const errors = validator.validate({
  email: 'test@example.com',
  password: 'pass',
  age: 16,
  terms: false
});

console.log('Erreurs:', errors);

