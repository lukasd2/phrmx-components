# Project overview

This repository contains a set of reusable Web Components and an app that uses them. The app is an multimedia editing tool (video-editor).

The app structure is the following:

-   Video-Editor-App
    -   Video-Preview
    -   Track-Editor
-   Query-Ui
    -   Query-Text
    -   Result-Media

![alt text](docs/img/App_mock_up.png)

A detailed description of the app can be found in "Remix Culture: development of a component based
multimedia editing platform", pages 66-80 [https://github.com/lukasd2/Remix-Culture-development-of-a-component-based-multimedia-editing-platform/blob/e73bae3ce8fa9eddfd83e12dfbab7de2718733f7/Dissertation_RemixCulture.pdf].

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
import "@shoelace-style/shoelace/dist/themes/base.css";
import "@shoelace-style/shoelace";
```

Also refer to the Sholace library guides: [https://shoelace.style/getting-started/installation].

A config.js in the main directory is needed in most cases to contain the API-key.
This has to be created manually.
An example of a config file can be found below:

```javascript
// config.js
const config = {
    API_KEY: "<insert_your_key_here>",
};

export { config };
```

## License

Each component inside this repository is licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.
