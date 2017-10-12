export class App {
  configureRouter(config, router) {
    this.router = router;
    config.options.pushState = true;
    config.options.root = '/';
    config.title = 'Synthese Algorithm';
    config.map([
      { route: '',             name: 'start',       moduleId: 'start/index' },
      { route: '/about',       name: 'about',       moduleId: './components/about/about'},
      { route: 'algorithm',    name: 'algorithm',    moduleId: './components/algorithmContainer/algorithm-container'}
    ]);
  }
}
