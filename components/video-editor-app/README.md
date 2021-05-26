## Starter Video-Editor-App

This app is an example that usese all the components in the "phrmx-components" components repository.

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

## Quickstart

Follow the installation instructions for installing the entire Video-Editor-App. Otherwise refer to the docs inside each component repository.

To get started:

Fast-start, ideal for local development

_Remember to create config.js files!_

```bash
npm i
lerna bootstrap
cd components/video-editor-app
npm start
```

Alternatively, generate a /dist bundle with Rollup module bundler and switch the imports inside demo/_index.html_ from CDNs to local bundle path.

```bash
npm i
lerna bootstrap
npm build
cd components/video-editor-app
npm start
```

Also instead of npm build, the npm dev is indicated for the live reload development (watch mode).

Important for the bundle, include Shoelace dependency into each component (for example QueryText.js, ResultMedia.js etc.). If the /dist folder does not contain the _base.css_ file and and shoelace assets directory try importing it manually inside each component.

```javascript
import '@shoelace-style/shoelace/dist/themes/base.css';
import '@shoelace-style/shoelace';
```

Also refer to the Sholace library guides: [https://shoelace.style/getting-started/installation].

## Config.js

A config.js has to placed in the main directory for the Video-Edtior-App (app) and Query-Ui (component) as it is needed in most cases. It contains the API-keys and has to be created manually.
An example of a config file can be found below:

```javascript
// config.js
const config = {
  API_KEY: '<insert_your_key_here>',
  PEXELS_API_KEY: '<insert_your_key_here>',
};

export { config };
```

## Scripts

- `start` runs your app for development, reloading on file changes
- `start:build` runs your app after it has been built using the build command
- `build` builds your app and outputs it in your `dist` directory
- `dev` builds your app with the watch mode and outputs it in your `dist` directory
- `test` runs your test suite with Web Test Runner
- `lint` runs the linter for your project

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
