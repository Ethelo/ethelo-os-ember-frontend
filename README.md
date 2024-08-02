# Frontend

## Prerequisites

## The Docker Way

* Build the container, including the NPM and Bower dependencies: `docker-compose build`
* Then run docker-compose up to start the ember server

## Non-docker Installation

OR, you can do a local setup:
You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [N](https://github.com/tj/n) or another Node Version Manager
* [Bower](http://bower.io/)
* [Ember CLI](http://www.ember-cli.com/)
* [PhantomJS](http://phantomjs.org/)

## Installation

*  switch to node v5.6.0.
* `git clone <repository-url>` this repository
*  change into the new directory
* `npm install`
* `bower install`
*  npm install -g ember-cli@1.13.8S

### Troubleshooting

If bower cannot find jquery after running `ember serve`, remove and reinstall jquery via bower at 2.1.4

If you get an error like ' You have to be inside an ember-cli project':
* verify you are on the correct version of node
* remove the node_modules and bower_components directories
* npm install
* bower install


troubleshooting OSX:
- you may have to manually install some libraries. The library in question will be the last library listed in the npm debug log.

`npm install binaryextensions@2.2.0`
`npm install textextensions@2.2.0`

- if you see issues with node-gyp they can be ignored ( https://github.com/nodejs/node-gyp/issues/569 )

## Running / Development

* `ember server`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Standalone Mode

Standalone mode allows you to only run the ember client on your local development machine, with all data loads coming from the live server.

1. Add the following meta tags to the index.html file. You can swap out the project slug for any project on the beta server.

```
  <meta name="frontend/config/environment/url" content="URL">
  <meta name="frontend/config/environment/decision" content="SUBDOMAIN">
  <meta name="frontend/config/environment/root" content="/">
```

2. Change the urls for the css and custom javascript in the index.html file by substituting the project slug

 ```
   <script src="URL/api/v2/decisions/SUBDOMAIN/script.js"></script>

   <link rel="stylesheet" href="URL/api/v2/decisions/SUBDOMAIN/theme.css">
 ```

3. Install a plugin like https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc/related?hl=en on your bwoser to allow you to get past CSP issues.

4. Run `ember server` to serve the site


IMPORTANT: IF YOU CHECK IN THESE CHANGES they could be overridden by other developers. It's better to use a patch file.

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Make sure you have built in production and checked in before deploying


## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
