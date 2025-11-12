class TextEditor {
  constructor() {
    this.content = '';
  }

  type(text) {
    this.content += text;
  }

  delete(length) {
    this.content = this.content.slice(0, -length);
  }

  getContent() {
    return this.content;
  }

  setContent(content) {
    this.content = content;
  }
}

class Command {
  execute() {
    throw new Error('La méthode execute doit être implémentée');
  }

  undo() {
    throw new Error('La méthode undo doit être implémentée');
  }
}

class TypeCommand extends Command {
  constructor(editor, text) {
    super();
    this.editor = editor;
    this.text = text;
  }

  execute() {
    this.editor.type(this.text);
  }

  undo() {
    this.editor.delete(this.text.length);
  }
}

class DeleteCommand extends Command {
  constructor(editor, length) {
    super();
    this.editor = editor;
    this.length = length;
    this.deletedText = '';
  }

  execute() {
    const content = this.editor.getContent();
    this.deletedText = content.slice(-this.length);
    this.editor.delete(this.length);
  }

  undo() {
    this.editor.type(this.deletedText);
  }
}

class BoldCommand extends Command {
  constructor(editor, start, end) {
    super();
    this.editor = editor;
    this.start = start;
    this.end = end;
    this.previousContent = '';
  }

  execute() {
    this.previousContent = this.editor.getContent();
    const content = this.editor.getContent();
    const before = content.slice(0, this.start);
    const selected = content.slice(this.start, this.end);
    const after = content.slice(this.end);
    this.editor.setContent(`${before}<b>${selected}</b>${after}`);
  }

  undo() {
    this.editor.setContent(this.previousContent);
  }
}

class CommandHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }

  execute(command) {
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex < 0) {
      console.log('❌ Rien à annuler');
      return;
    }

    const command = this.history[this.currentIndex];
    command.undo();
    this.currentIndex--;
    console.log('↩️  Annulation effectuée');
  }

  redo() {
    if (this.currentIndex >= this.history.length - 1) {
      console.log('❌ Rien à refaire');
      return;
    }

    this.currentIndex++;
    const command = this.history[this.currentIndex];
    command.execute();
    console.log('↪️  Rétablissement effectué');
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}

const editor = new TextEditor();
const history = new CommandHistory();

console.log('✏️  Éditeur de texte avec Undo/Redo\n');

history.execute(new TypeCommand(editor, 'Bonjour '));
console.log(`📝 Contenu: "${editor.getContent()}"`);

history.execute(new TypeCommand(editor, 'le monde'));
console.log(`📝 Contenu: "${editor.getContent()}"`);

history.execute(new BoldCommand(editor, 8, 16));
console.log(`📝 Contenu: "${editor.getContent()}"`);

console.log('\n--- Annulation ---\n');
history.undo();
console.log(`📝 Contenu: "${editor.getContent()}"`);

history.undo();
console.log(`📝 Contenu: "${editor.getContent()}"`);

console.log('\n--- Rétablissement ---\n');
history.redo();
console.log(`📝 Contenu: "${editor.getContent()}"`);

console.log('\n--- Nouvelle commande ---\n');
history.execute(new TypeCommand(editor, '!'));
console.log(`📝 Contenu: "${editor.getContent()}"`);

console.log('\n--- Essai de refaire (devrait échouer) ---\n');
history.redo();

