# \<result-media> Web Component based on Lit

Reusable Web Component based on LitElement. It renders some results onto the interface. The results are displayed as a gallery of thumbnails with the support of Drag and Drop API..

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i result-media
```

## Usage

Basic instantiation:

```html
<script type="module">
  import 'result-media/index.js';
</script>

<result-media></result-media>
```

More complex instantiation (refer to implementation section for the explanation of the attributes and properties):

```html
<script type="module">
  import 'result-media/index.js';
</script>

<result-media
  .answerSet="${answerSet}"
  headerTitle="Some header title on top of the results"
></result-media>
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
- "@shoelace-style/shoelace" | Shoelace [https://shoelace.style/] Limited to components: Badge [https://shoelace.style/components/badge], Icon Button[https://shoelace.style/components/icon-button] and Icon [https://shoelace.style/components/icon]

## Implementation details

- Results to be displayed

An Array of objects to be displayed.

```javascript
[
  {
    thumbnail_url,
    item_name,
    reference,
    media_type,
  },
  {
	...
  }
];
```

An example:

```javascript
this.answerSet = [
			{
				thumbnail_url: 'https://picsum.photos/id/999/150/200',
				film_name: 'NasceturRidiculus.jpeg',
				reference: 999,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/998/150/200',
				film_name: 'LiberoNonMattis.mp4',
				reference: 998,
				media_type: 'video',
			}];
};
```

- List of all QueryText class properties. Refer to Lit Reactive properties for more details about the reactive update cycle [https://lit.dev/docs/components/properties/]. Also the difference between attributes and properties [https://open-wc.org/guides/knowledge/attributes-and-properties/].

```javascript
this.isLoading = false; // Boolean indicates if the component should be displayed in loading state (skeleton elements instead of thumbnails)
this.answerSet = []; // the items to be displayed as thumbnails alongside with some data describing them
this.headerTitle = 'Contenuti cercati'; // header title
```

Anytime these attributes/properties can be checked (and changed) via the browser console

```javascript
const resultMedia = document.querySelector('result-media');
resultMedia; // dumps the state of the component
```

- Emits an event when the users start dragging an item, the "dragged-item-type" sends the type of dragged media item.

```javascript
_emitDraggedItemType(type) {
    const event = new CustomEvent('dragged-item-type', {
      detail: {
        draggedElementType: type,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
```

- Emits an event when the users click on the "play" button the item reference(id) and media type are sent upwards.

```javascript
const event = new CustomEvent('result-media-preview', {
  detail: {
    singleMediaPreview: mediaPreview,
  },
  bubbles: true,
  composed: true,
});
this.dispatchEvent(event);
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

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
