class UIComponent {
  constructor(props) {
    this.props = props;
  }

  render() {
    throw new Error('La méthode render doit être implémentée');
  }
}

class Button extends UIComponent {
  render() {
    const { label, variant = 'primary', onClick } = this.props;
    return `<button class="btn btn-${variant}" onclick="${onClick}">${label}</button>`;
  }
}

class Input extends UIComponent {
  render() {
    const { type = 'text', placeholder, name } = this.props;
    return `<input type="${type}" name="${name}" placeholder="${placeholder}" class="form-input" />`;
  }
}

class Modal extends UIComponent {
  render() {
    const { title, content, size = 'md' } = this.props;
    return `
      <div class="modal modal-${size}">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="close">×</button>
        </div>
        <div class="modal-body">${content}</div>
      </div>
    `;
  }
}

class Toast extends UIComponent {
  render() {
    const { message, variant = 'info', duration = 3000 } = this.props;
    return `<div class="toast toast-${variant}" data-duration="${duration}">${message}</div>`;
  }
}

class Card extends UIComponent {
  render() {
    const { title, description, imageUrl } = this.props;
    return `
      <div class="card">
        <img src="${imageUrl}" alt="${title}" />
        <div class="card-body">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
      </div>
    `;
  }
}

class UIComponentFactory {
  static createComponent(type, props) {
    switch (type) {
      case 'button':
        return new Button(props);
      case 'input':
        return new Input(props);
      case 'modal':
        return new Modal(props);
      case 'toast':
        return new Toast(props);
      case 'card':
        return new Card(props);
      default:
        throw new Error(`Type de composant inconnu: ${type}`);
    }
  }
}

const button = UIComponentFactory.createComponent('button', {
  label: 'Soumettre',
  variant: 'success',
  onClick: 'handleSubmit()'
});

const input = UIComponentFactory.createComponent('input', {
  type: 'email',
  placeholder: 'Entrez votre email',
  name: 'email'
});

const modal = UIComponentFactory.createComponent('modal', {
  title: 'Confirmation',
  content: 'Êtes-vous sûr de vouloir continuer ?',
  size: 'lg'
});

const toast = UIComponentFactory.createComponent('toast', {
  message: 'Opération réussie !',
  variant: 'success'
});

console.log('🔘 Button:', button.render());
console.log('📝 Input:', input.render());
console.log('🪟 Modal:', modal.render());
console.log('🔔 Toast:', toast.render());

