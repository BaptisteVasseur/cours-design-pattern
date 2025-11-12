class WebPageRenderer {
  renderHomePage() {
    console.log('<!DOCTYPE html>');
    console.log('<html>');
    console.log('<head><title>Accueil</title></head>');
    console.log('<body>');
    console.log('<header><h1>Mon Site</h1></header>');
    console.log('<main>');
    console.log('<h2>Bienvenue</h2>');
    console.log('<p>Contenu de la page d\'accueil</p>');
    console.log('</main>');
    console.log('<footer>© 2024</footer>');
    console.log('</body>');
    console.log('</html>');
  }

  renderBlogPage() {
    console.log('<!DOCTYPE html>');
    console.log('<html>');
    console.log('<head><title>Blog</title></head>');
    console.log('<body>');
    console.log('<header><h1>Mon Site</h1></header>');
    console.log('<main>');
    console.log('<h2>Blog</h2>');
    console.log('<article>Article 1</article>');
    console.log('</main>');
    console.log('<footer>© 2024</footer>');
    console.log('</body>');
    console.log('</html>');
  }
}

const renderer = new WebPageRenderer();
renderer.renderHomePage();

