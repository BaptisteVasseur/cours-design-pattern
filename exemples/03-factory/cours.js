class UIManager {
    createComponent(type, props) {
        const factory = new ComponentFactory();
        return factory.createComponent(type, props);
    }
}

// create a class for earch component type

class BaseComponent {
    constructor(props) {
        this.props = props;
    }

    render() {
        throw new Error('Render method must be implemented by subclasses');
    }
}

class ButtonComponent extends BaseComponent {
    render() {
        return `<button class="btn btn-${this.props.variant || 'primary'}" onclick="${this.props.onClick || ''}">${this.props.label}</button>`;
    }
}

class InputComponent extends BaseComponent {
    render() {
        return `<input type="${this.props.type || 'text'}" name="${this.props.name || ''}" placeholder="${this.props.placeholder || ''}" class="form-input" />`;
    }
}

class ModalComponent extends BaseComponent {
    render() {
        return `
      <div class="modal modal-${this.props.size || 'md'}">
        <div class="modal-header">
          <h2>${this.props.title}</h2>
          <button class="close">×</button>
        </div>
        <div class="modal-body">${this.props.content}</div>
      </div>
    `;
    }
}

class ToastComponent extends BaseComponent {
    render() {
        return `<div class="toast toast-${this.props.variant || 'info'}" data-duration="${this.props.duration || 3000}">${this.props.message}</div>`;
    }
}

class CardComponent extends BaseComponent {
    render() {
        return ``;
    }
}

class ComponentFactory {
    createComponent(type, props) {
        switch (type) {
            case 'button':
                return new ButtonComponent(props);
            case 'input':
                return new InputComponent(props);
            case 'modal':
                return new ModalComponent(props);
            case 'toast':
                return new ToastComponent(props);
            case 'card':
                return new CardComponent(props);
            default:
                throw new Error('Unknown component type');
        }
    }
}

const ui = new UIManager();
const button = ui.createComponent('button', { label: 'Cliquez-moi' });
console.log(button.render());

