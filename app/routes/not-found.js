import LoggedInRoute from './logged-in';

// this is run before any of the project-user sub routes
export default LoggedInRoute.extend({

  afterModel(){
    this.transitionTo('index');
  }
});
