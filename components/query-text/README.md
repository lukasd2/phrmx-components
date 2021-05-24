# \<query-text> Web Component based on Lit

Reusable Web Component based on LitElement. It provides the search functionality within multi-keyed dictionary of strings.

It extracts keys from the dictionary and uses them as prefixes for autocompletion purposes. When key: _"ENTER"_ is pressed, it emits an event (through custom event bubble) with the actual value of query string alongside with its prefix (if typed). Additionaly, a button element can be instantiated inside its named slot.

The main goal is to provide fuzzy search with autocompletion when user types into search bar.

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i query-text
```

## Usage

Basic instantiation:

```html
<script type="module">
	import 'query-text/index.js';
</script>

<query-text></query-text>
```

More complex instantiation (refer to implementation section for the explanation of the attributes and properties):

```html
<script type="module">
	import 'query-text/index.js';
</script>

<query-text
	.dictionaries="${dictionaries}"
	placeholderText="Some placeholder text..."
	mintextInputLenght="3"
	maxAutocompleteSuggestions="5"
	.fuzzySearchOpts="${searchOpts}"
></query-text>
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

-   "lit-element"
-   "lit-html"
-   "@shoelace-style/shoelace" | Shoelace [https://shoelace.style/] Limited to components: Button [https://shoelace.style/components/button] and Icon [https://shoelace.style/components/icon]
-   "fuse.js" | Fuse.js [https://fusejs.io/], limited to: Fuse.js Basic build version [https://fusejs.io/getting-started/different-builds.html]
-   "lodash-es" | Lodash [https://lodash.com/], Limited to debounce method [https://lodash.com/docs/4.17.15#debounce]

## Implementation details

-   Structure of a a dictionary {prefix, dictionary}:

```javascript
{
	'prefix1': [
		'string1',
	    ...
        'string(n)',
	],
	'prefix(n)': [
        'string1',
	    ...
        'string(n)',
    ],
    ...
}
```

This translates to the following example:

```javascript
this.dictionaries = {
	'@': ['John Doe', 'Mr. Smith', 'John Wick'],
	'title:': ['Mister Wonderland', 'Pride and Prejudice', 'Matrix'],
	'nationality:': ['Russia', 'Indonesia', 'Italia', 'Stati Uniti'],
};
```

-   List of all QueryText class properties. Refer to Lit Reactive properties for more details about the reactive update cycle [https://lit.dev/docs/components/properties/]. Also the difference between attributes and properties [https://open-wc.org/guides/knowledge/attributes-and-properties/].

```javascript
this.placeholderText = 'Search for anything...'; // Text placeholder to be shown on the search bar
this.textInput = ''; // Current search input value
this.mintextInputLenght = 2; // Min lenght of input value to activate autocomplete and search-query-event
this.maxAutocompleteSuggestions = 10; // max number of autocomplete suggestions (done by slicing the total results)
this.dictionaries = {}; // prefixed dictionaries object
this.fuzzySearchOpts = {
	// refine fuzzy search options, refer to the library docs (https://fusejs.io/api/options.html)
	includeScore: true,
	threshold: 0.4,
	shouldSort: true,
	includeMatches: true,
};
// the following class properties were not designed to be used for instantiating the component. They are used for internal actions
this.prefixesToRegexMapping = {}; // create regexes from prefixes so they can be matched and recognised later when users type on the search bar. Example, the prefix @ may result in: { "@": { regex: /@\S{2,}/gi }, ... }
this.autocompleteResults = []; // array of suggestions for autocomplete
this.showSearchSuggestions = false; // indicates if the suggestion list should be displayed
this.searchInput = ''; // DOM reference to the search bar HTML element
this.currentMatch = ''; // the current prefix+word that has to be autocompleted. For example: "@John"
this.activePrefix = ''; // the current prefix that has to be autocompleted. For example: "@"
this.distinctAutocompletes = []; // keeps track of resolved prefixes so they are excluded from the new suggestions when new prefixes are inserted.
this.debouncedTextInputHandler = debounce(
	// debounces the on type event on the search bar
	this._handleTextInputEvent.bind(this),
	150
);
```

Anytime these attributes/properties can be checked (and changed) via the browser console

```javascript
const queryText = document.querySelector('query-text');
queryText; // dumps the state of the component
```

-   Emits an event "searchedQuery" with the searched query text. This can be used to bubble the event up to API calls, thereby perform the search on the back-end.

```javascript
let event = new CustomEvent('search-query-event', {
	detail: {
		searchedQuery: textInput,
	},
	bubbles: true,
	composed: true,
});
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

To run the tests in watch mode, run

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
