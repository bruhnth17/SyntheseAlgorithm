export class App {
  configureRouter(config, router) {
    this.router = router;
    config.options.pushState = true;
    config.options.root = "/";
    config.title = "Synthese Algorithm";

    const handleUnknownRoutes = (instruction) => {
      return { route: "", moduleId: "start" };
    }
    config.mapUnknownRoutes(handleUnknownRoutes);

    config.map([
      { route: "",             name: "start",       moduleId: "start/index", nav: true, title:"Home"},
      { route: "/about",       name: "about",       moduleId: "./components/about/about", nav: true, title:"About"},
      { route: "/:base64",    name: "algorithm",    moduleId: "./components/algorithmContainer/algorithm-container"}
    ]);
  }
}
