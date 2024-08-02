import LoggedInRoute from './logged-in';

// this is run before any of the project-user sub routes
export default LoggedInRoute.extend({
  queryParams: {
    rank: {refreshModel: false}, // setting this to true causes an ember bug
    isCollapsed: {refreshModel: false},
    anchor: {refreshModel: false},
    filter0: {refreshModel: false},
    filter1: {refreshModel: false},
    filter2: {refreshModel: false},
    filter3: {refreshModel: false},
    filter4: {refreshModel: false},
  },
  trackPage(page) {
    this.get('analytics').sendPageView(`/page/${page.get('slug')}`, page.get('titleContent'));
  },
  model(params) {
    this.set('slug', params.slug);
    return this.store.peekAll('page').findBy('slug', params.slug);
  },
  afterModel: function(model, transition) {
    //jshint unused:false
    if (Ember.isNone(model)) {
      this.get('analytics').sendPageView(`${ this.get('slug')}`, 'Not Found, Redirecting');
      return this.transitionTo('first');
    }
    this.trackPage(model);

    this.get('registry').preloadUserScenario();
    this.get('registry').preloadGroupScenario();
    this.get('registry').preloadSigningPackage();
  },
  serialize(model) {
    return {slug: model.get('slug')};
  },
  setupController(controller, model){
    controller.set('model', model);
    this.get('menu').set('currentPage', model);
    controller.updateMenuFilters();
  },
  // make sure anchor doesn't stick around
  resetController (controller, isExiting, transition) {
    controller.set('anchor', null);
  },
  clearCurrentPageOnLeave: function() {
    this.set('menu.currentPage', null);
  }.on('deactivate'),

  actions: {
    willTransition() {
      window.scrollTo(0, 0);
    },
    toggleDrawer() {
      const menu = this.get('menu');
      menu.get('toggleDrawer').call(menu);
    },
    didTransition() {
      Ember.run.scheduleOnce("afterRender", this, function() {
        // trigger external js
        $(window).trigger('emberDidTransition', window.location);

        // initialize popovers. NOTE: can only use dismissible popovers for now
        $('[data-toggle="popover"]').popover();

        // initialize material (buggy on BB
        if (navigator.userAgent.indexOf("BB10") < 0 && navigator.userAgent.indexOf("BlackBerry") < 0) {
          $.material.init();
        }

        this.controller.scrollToAnchor();

        // close the drawer
        let menu = this.get('menu');
        menu.get('toggleDrawer').call(menu, 'hide');

        $("#btn-skip-content").attr("href", `${window.location.origin}${window.location.pathname}#main-block-center`);

        //#region Accessibility for dynamic links added from admin panel
          /**
           * Instead of adding "tabindex" attr manually on all the <a> tags from admin panel,
           * It is better to add it from here dynamically.
           */
          if($(".dropdown-link a") && $(".dropdown-link a").length > 0) {
            $(".dropdown-link a").each((_, item) => {
              if(item && $(item)) {
                $(item).attr("tabindex", 0);
              }
            });
          }

          $(document).on("keydown", ".dropdown-link", function (e) {
            // Only allow Enter/Spacebar key in accessibility to open/close the dropdown
            if (e && "keyCode" in e && (e.keyCode === 13 || e.keyCode === 32)) {
              let trigger = e.target;
              let target = $(trigger).data("target");

              $(target).collapse("toggle");
              e.preventDefault();
            }
          });
        //#endregion Accessibility for dynamic links

        try {

          // Added logic to load dynamic Javascript from 'Look and Feel' on admin panel
          if(afterRenderCustomCallback && typeof afterRenderCustomCallback === "function"){
            afterRenderCustomCallback();
          }
        } catch (error) {
          // console.log('Custom function "afterRenderCustomCallback" not found');
        }
      });

      // wait cursor off
      $('body').css('cursor', 'default');
    },
  }

});
