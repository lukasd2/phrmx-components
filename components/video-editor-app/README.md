## Starter Video-Editor-App

This app is an example that usese all the components in the "phrmx-components" components repository.

[![Built with open-wc recommendations](https://img.shields.io/badge/built%20with-open--wc-blue.svg)](https://github.com/open-wc)

## Quickstart

To get started:

```bash
npm i
npm dev
```

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
