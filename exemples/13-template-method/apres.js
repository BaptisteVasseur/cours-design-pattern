class PageTemplate {
  render() {
    this.renderDoctype();
    this.renderHtmlOpen();
    this.renderHead();
    this.renderBodyOpen();
    this.renderHeader();
    this.renderNavigation();
    this.renderMainOpen();
    this.renderContent();
    this.renderMainClose();
    this.renderSidebar();
    this.renderFooter();
    this.renderBodyClose();
    this.renderHtmlClose();
    this.renderAnalytics();
  }

  renderDoctype() {
    console.log('<!DOCTYPE html>');
  }

  renderHtmlOpen() {
    console.log('<html lang="fr">');
  }

  renderHead() {
    console.log('<head>');
    console.log(`  <meta charset="UTF-8">`);
    console.log(`  <meta name="viewport" content="width=device-width, initial-scale=1.0">`);
    console.log(`  <title>${this.getTitle()}</title>`);
    console.log(`  <meta name="description" content="${this.getDescription()}">`);
    this.renderStyles();
    console.log('</head>');
  }

  renderStyles() {
    console.log('  <link rel="stylesheet" href="/css/main.css">');
  }

  renderBodyOpen() {
    console.log('<body>');
  }

  renderHeader() {
    console.log('  <header class="site-header">');
    console.log(`    <h1>${this.getSiteName()}</h1>`);
    console.log('  </header>');
  }

  renderNavigation() {
    console.log('  <nav class="main-nav">');
    console.log('    <ul>');
    console.log('      <li><a href="/">Accueil</a></li>');
    console.log('      <li><a href="/blog">Blog</a></li>');
    console.log('      <li><a href="/contact">Contact</a></li>');
    console.log('    </ul>');
    console.log('  </nav>');
  }

  renderMainOpen() {
    console.log('  <main class="content">');
  }

  renderContent() {
    throw new Error('La méthode renderContent doit être implémentée');
  }

  renderMainClose() {
    console.log('  </main>');
  }

  renderSidebar() {
  }

  renderFooter() {
    console.log('  <footer class="site-footer">');
    console.log(`    <p>© ${new Date().getFullYear()} ${this.getSiteName()}</p>`);
    console.log('  </footer>');
  }

  renderBodyClose() {
    console.log('</body>');
  }

  renderHtmlClose() {
    console.log('</html>');
  }

  renderAnalytics() {
  }

  getTitle() {
    return 'Mon Site Web';
  }

  getDescription() {
    return 'Description par défaut';
  }

  getSiteName() {
    return 'Mon Site';
  }
}

class HomePage extends PageTemplate {
  getTitle() {
    return 'Accueil - Mon Site';
  }

  getDescription() {
    return 'Bienvenue sur mon site web';
  }

  renderContent() {
    console.log('    <section class="hero">');
    console.log('      <h2>Bienvenue sur mon site</h2>');
    console.log('      <p>Découvrez nos services et produits</p>');
    console.log('      <button>En savoir plus</button>');
    console.log('    </section>');
    console.log('    <section class="features">');
    console.log('      <div class="feature">Service 1</div>');
    console.log('      <div class="feature">Service 2</div>');
    console.log('      <div class="feature">Service 3</div>');
    console.log('    </section>');
  }

  renderAnalytics() {
    console.log('<!-- Google Analytics -->');
    console.log('<script>console.log("Analytics loaded")</script>');
  }
}

class BlogPage extends PageTemplate {
  constructor(posts) {
    super();
    this.posts = posts;
  }

  getTitle() {
    return 'Blog - Mon Site';
  }

  getDescription() {
    return 'Articles et actualités';
  }

  renderContent() {
    console.log('    <section class="blog">');
    console.log('      <h2>Derniers Articles</h2>');
    this.posts.forEach(post => {
      console.log('      <article class="post">');
      console.log(`        <h3>${post.title}</h3>`);
      console.log(`        <p class="meta">Par ${post.author} - ${post.date}</p>`);
      console.log(`        <p>${post.excerpt}</p>`);
      console.log(`        <a href="/blog/${post.id}">Lire la suite</a>`);
      console.log('      </article>');
    });
    console.log('    </section>');
  }

  renderSidebar() {
    console.log('  <aside class="sidebar">');
    console.log('    <h3>Catégories</h3>');
    console.log('    <ul>');
    console.log('      <li><a href="/blog/tech">Tech</a></li>');
    console.log('      <li><a href="/blog/design">Design</a></li>');
    console.log('    </ul>');
    console.log('  </aside>');
  }
}

class ContactPage extends PageTemplate {
  getTitle() {
    return 'Contact - Mon Site';
  }

  getDescription() {
    return 'Contactez-nous pour plus d\'informations';
  }

  renderContent() {
    console.log('    <section class="contact">');
    console.log('      <h2>Contactez-nous</h2>');
    console.log('      <form>');
    console.log('        <input type="text" name="name" placeholder="Nom" required>');
    console.log('        <input type="email" name="email" placeholder="Email" required>');
    console.log('        <textarea name="message" placeholder="Message" required></textarea>');
    console.log('        <button type="submit">Envoyer</button>');
    console.log('      </form>');
    console.log('    </section>');
  }
}

class DashboardPage extends PageTemplate {
  constructor(user) {
    super();
    this.user = user;
  }

  getTitle() {
    return `Dashboard - ${this.user.name}`;
  }

  getDescription() {
    return 'Tableau de bord utilisateur';
  }

  renderNavigation() {
    console.log('  <nav class="dashboard-nav">');
    console.log('    <ul>');
    console.log('      <li><a href="/dashboard">Tableau de bord</a></li>');
    console.log('      <li><a href="/dashboard/profile">Profil</a></li>');
    console.log('      <li><a href="/dashboard/settings">Paramètres</a></li>');
    console.log('      <li><a href="/logout">Déconnexion</a></li>');
    console.log('    </ul>');
    console.log('  </nav>');
  }

  renderContent() {
    console.log('    <section class="dashboard">');
    console.log(`      <h2>Bonjour, ${this.user.name}</h2>`);
    console.log('      <div class="stats">');
    console.log(`        <div class="stat">Commandes: ${this.user.orders}</div>`);
    console.log(`        <div class="stat">Points: ${this.user.points}</div>`);
    console.log('      </div>');
    console.log('      <div class="recent-activity">');
    console.log('        <h3>Activité récente</h3>');
    console.log('        <ul>');
    console.log('          <li>Commande #123 - Livrée</li>');
    console.log('          <li>Commande #122 - En cours</li>');
    console.log('        </ul>');
    console.log('      </div>');
    console.log('    </section>');
  }

  renderStyles() {
    super.renderStyles();
    console.log('  <link rel="stylesheet" href="/css/dashboard.css">');
  }
}

console.log('=== Page d\'accueil ===\n');
const homePage = new HomePage();
homePage.render();

console.log('\n\n=== Page Blog ===\n');
const blogPosts = [
  { id: 1, title: 'Introduction à JavaScript', author: 'Alice', date: '2024-01-15', excerpt: 'Découvrez les bases de JavaScript...' },
  { id: 2, title: 'Design Patterns en pratique', author: 'Bob', date: '2024-01-20', excerpt: 'Les patterns les plus utilisés...' }
];
const blogPage = new BlogPage(blogPosts);
blogPage.render();

console.log('\n\n=== Page Contact ===\n');
const contactPage = new ContactPage();
contactPage.render();

console.log('\n\n=== Page Dashboard ===\n');
const dashboardPage = new DashboardPage({
  name: 'Jean Dupont',
  orders: 15,
  points: 2500
});
dashboardPage.render();

