## Starter Video-Editor-App

This app is an example that usese all the components in the "phrmx-components" components repository.

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

## Quickstart

Follow the installation instructions for installing the entir video-editor-app. Otherwise refer to the docs inside single components repositories.

To get started:

Fast-start, ideal for local development
Remember to create config.js files!

```bash
npm i
lerna bootstrap
cd components/video-editor-app
npm start
```

Alternatively, generated a /dist bundle with the of rollup and switch the imports into index.html from CDN to local bundle.

```bash
npm i
lerna bootstrap
npm build
cd components/video-editor-app
npm start
```

Also instead of npm build, the npm dev is indicated for the live reload development (watch mode).

Important for the bundle, include Shoelace dependency into each component (for example QueryText.js, ResultMedia.js etc.) by importing it if the /dist folder does not contain the base.css and shoelace assets.

```javascript
import '@shoelace-style/shoelace/dist/themes/base.css';
import '@shoelace-style/shoelace';
```

Also refer to the Sholace library guides: [https://shoelace.style/getting-started/installation].

A config.js in the main directory is needed in most cases to contain the API-key.
This has to be created manually.
An example of a config file can be found below:

```javascript
// config.js
const config = {
  API_KEY: '<insert_your_key_here>',
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
