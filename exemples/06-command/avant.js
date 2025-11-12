class TextEditor {
  constructor() {
    this.content = '';
  }

  type(text) {
    this.content += text;
    console.log(`Contenu: "${this.content}"`);
  }

  delete(chars) {
    this.content = this.content.slice(0, -chars);
    console.log(`Contenu: "${this.content}"`);
  }

  bold() {
    this.content = `<b>${this.content}</b>`;
    console.log(`Contenu: "${this.content}"`);
  }
}

const editor = new TextEditor();
editor.type('Hello');
editor.type(' World');
editor.delete(5);
editor.bold();

