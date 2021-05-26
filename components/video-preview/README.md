# \<video-preview> Web Component based on Lit

Reusable Web Component based on LitElement. Renders and plays some media types (images, videos and audio) into a canvas.

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i video-preview
```

## Usage

```html
<script type="module">
  import 'video-preview/index.js';
</script>

<video-preview></video-preview>
```

More complex instantiation (refer to implementation section for the explanation of the attributes and properties):

```html
<script type="module">
  import 'video-preview/index.js';
</script>

<video-preview
  .singleMediaRequestState="${this.singleMediaRequestState}"
  ?displayLoadingScreen="${this.displayLoadingScreen}"
  ?stopPlayer="${this.stopPlayer}"
  ?resumePlayer="${this.resumePlayer}"
  .singleMediaPreview="${this.singleMediaPreview}"
  .resources="${this.resources}"
  .executeSegmentsPreview="${this.playSegments}"
  .terminateSegmentsPreview="${this.endSegments}"
></video-preview>
```

## Quickstart

Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
By default it will start on http://localhost:8000/demo/ using the local Web Dev Server (@web/dev-server in `package.json` devDependencies).

## Dependencies

Please refer to the component `package.json` for the updated listed of dependecies with their versions.

- "lit-element"
- "lit-html"
- "@shoelace-style/shoelace" | Shoelace [https://shoelace.style/]. Limited to components: Spinner [https://shoelace.style/components/spinner?id=spinner]

## Implementation details

- Scaling function

By default the scale factor equals to 100 which results in 100px = 1second and so on with the minimum scale factor of 10 which equals to 10px = 1second.

- List of all TrackEditor class properties. Refer to Lit Reactive properties for more details about the reactive update cycle [https://lit.dev/docs/components/properties/]. Also the difference between attributes and properties [https://open-wc.org/guides/knowledge/attributes-and-properties/].

```javascript
this.videoEditorTitle = 'This is your new video title'; // Video title header
this.resources = []; // array of incoming elements that have to be subsequently displayed (initially only templates are created)
this.displayMediaPreview = false; // indicates only if a single media has to be displayed
this.playback = ''; // DOM reference to the media template container
this.stopPlayer = false; // indicates that the preview has to be paused
this.singlePreviewVideoRef = ''; // reference to the single media element that has to be shown/hide
this.executeSegmentsPreview = []; // indicates the current item(s) to be played
this.terminateSegmentsPreview = []; // indicates the current item(s) to be stopped
```

Anytime these attributes/properties can be checked (and changed) via the browser console

```javascript
cost videoPreview = document.querySelector('track-editor');
videoPreview; // dumps the state of the component
```

## Linting with ESLint, Prettier, and Types

To scan the project for linting errors, run

```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well

```bash
npm run lint:eslint
```

```bash
npm run lint:prettier
```

To automatically fix many linting errors, run

```bash
npm run format
```

You can format using ESLint and Prettier individually as well

```bash
npm run format:eslint
```

```bash
npm run format:prettier
```

## Testing with Web Test Runner

To run the suite of Web Test Runner tests, run

```bash
npm run test
```

To run the tests in watch mode (for &lt;abbr title=&#34;test driven development&#34;&gt;TDD&lt;/abbr&gt;, for example), run

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
