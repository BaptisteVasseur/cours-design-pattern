class UIManager {
  createComponent(type, props) {
    if (type === 'button') {
      return {
        type: 'button',
        render() {
          return `<button class="btn">${props.label}</button>`;
        }
      };
    } else if (type === 'input') {
      return {
        type: 'input',
        render() {
          return `<input type="${props.inputType}" placeholder="${props.placeholder}" />`;
        }
      };
    } else if (type === 'modal') {
      return {
        type: 'modal',
        render() {
          return `<div class="modal"><h2>${props.title}</h2><p>${props.content}</p></div>`;
        }
      };
    } else if (type === 'toast') {
      return {
        type: 'toast',
        render() {
          return `<div class="toast toast-${props.variant}">${props.message}</div>`;
        }
      };
    }
  }
}

const ui = new UIManager();
const button = ui.createComponent('button', { label: 'Cliquez-moi' });
console.log(button.render());

