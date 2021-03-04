import { html, LitElement } from 'lit-element';

import Fuse from 'fuse.js';

import { queryTextStyles } from './styles/QueryTextStyles.js';

export class QueryText extends LitElement {
	static get styles() {
		return [queryTextStyles];
	}

	static get properties() {
		return {
			placeholderText: { type: String },
			textInput: { type: String },
			dictionaries: { type: Object },
			prefixToMatchinRegexMapping: { type: Object },
			mintextInputLenght: { type: Number },
			maxAutocompleteSuggestions: { type: Number },
			autocompleteResults: { type: Array },
			showSearchSuggestions: { type: Boolean },
			currentMatch: { type: String },
		};
	}

	constructor() {
		super();
		this.placeholderText = 'Search for anything...';
		this.textInput = '';
		this.mintextInputLenght = 2;
		this.maxAutocompleteSuggestions = 10;
		this.dictionaries = {};
		this.prefixesToRegexMapping = {};
		this.autocompleteResults = [];
		this.fuzzySearchOpts = {
			includeScore: true,
			threshold: 0.4,
			shouldSort: true,
			includeMatches: true,
		};
		this.showSearchSuggestions = false;
		this.searchInput = '';
		this.currentMatch = '';
	}

	/* LIFECYCLE METHODS */

	connectedCallback() {
		super.connectedCallback();
		console.debug('DEBUG: QueryText successfuly added to the DOM');
		this.updateDictionariesInfo();
	}

	firstUpdated() {
		this.searchInput = this.shadowRoot.querySelector('.search-bar');
	}

	updated(changedProperties) {
		console.debug('changedProperty', changedProperties); // logs previous values
		if (changedProperties.has('dictionaries')) {
			this.updateDictionariesInfo();
		}
	}

	updateDictionariesInfo() {
		if (!this.dictionaries || Object.keys(this.dictionaries).length === 0)
			return null;
		// pipe or function reducer would be ideal for cleaner code. The choice is to not add helper functions for now
		// TODO: Possibile improvement at next iteration, add loadash utility library
		const extractedPrefixes = this.extractPrefixesFromDictionaries();

		const prefixesToRegexMapping = this.createMatchingRegexFromPrefixes(
			extractedPrefixes
		);
		this.prefixToMatchingRegexMapping = {
			...this.prefixToMatchingRegexMapping,
			...prefixesToRegexMapping,
		};
	}

	extractPrefixesFromDictionaries() {
		if (Object.keys(this.dictionaries).length === 0) return [];

		const extractedPrefixesFromDicts = [];
		for (const prefix of Object.keys(this.dictionaries)) {
			extractedPrefixesFromDicts.push(prefix);
		}
		return extractedPrefixesFromDicts;
	}

	createMatchingRegexFromPrefixes(extractedPrefixes) {
		const prefixToMatchingRegex = {};

		extractedPrefixes.map(prefix => {
			const regex = this.createRegexFromPrefix(prefix);
			prefixToMatchingRegex[prefix] = {
				regex: regex,
			};
			return prefixToMatchingRegex;
		});
		return prefixToMatchingRegex;
	}

	createRegexFromPrefix(prefix) {
		const minCharsAfterPrefix = this.mintextInputLenght;
		// Regex that matches any defined prefix with the word (longer than threshold) that it follows until a white space occurs
		//example: "@\S{2,}" --> @==prefix && 2==this.mintextInputLenght
		const regex = new RegExp(`${prefix}\\S{${minCharsAfterPrefix},}`, 'gi');

		return regex;
	}

	/* EVENT HANDLERS */

	_handleTextInputEvent(ev) {
		const textInput = this.trimString(ev.target.value);
		this.textInput = textInput;
		this.showSearchSuggestions = false;
		if (this.isTextInputLenghtGreaterThanThreshold(textInput)) {
			const pressedKey = ev.code || ev.key;
			if (pressedKey === 'Enter' || pressedKey === 13) {
				const event = new CustomEvent('search-query-event', {
					detail: {
						searchedQuery: textInput,
					},
					bubbles: true,
					composed: true,
				});
				this.dispatchEvent(event);
			} else if (this.isQueryStringEligibleForAutocompletion()) {
				this.showSearchSuggestions = true;

				const fullAutocompleteResults = this.queryConstructor();
				this.autocompleteResults = this.removeResultsIfHigherThanThreshold(
					fullAutocompleteResults
				);
			} else {
				this.showSearchSuggestions = false;
			}
		}
	}

	_handleAutocompleteList(ev) {
		if (ev.target.tagName === 'LI') {
			this.searchInput.value = this.searchInput.value.replaceAll(
				this.currentMatch,
				ev.target.textContent.trim()
			);
		}
		this.showSearchSuggestions = false;
	}

	trimString = textInput => textInput.trim();

	isTextInputLenghtGreaterThanThreshold = textInput =>
		textInput.length > this.mintextInputLenght;

	isQueryStringEligibleForAutocompletion() {
		if (!this.dictionaries) return false;
		return (
			Object.keys(this.dictionaries).length > 0 &&
			this.doesTextInputContainDefinedPrefixes(this.textInput)
		);
	}

	doesTextInputContainDefinedPrefixes(textInput) {
		for (const key of Object.keys(this.dictionaries)) {
			if (textInput.includes(key)) return true;
		}
		return false;
	}

	queryConstructor() {
		const activePrefix = this.extractLastPrefixToBeAutocompleted();

		if (activePrefix === '' || activePrefix === null) return null;

		const prefixedString = this.prefixMatchedWithRegex(activePrefix);
		if (prefixedString === null || prefixedString === undefined)
			return null;

		this.currentMatch = prefixedString;

		const cleanTextWithoutPrefix = this.normalizeQueryByRemovingPrefixes(
			activePrefix,
			prefixedString
		);

		const results = this.findResourcesByMatchingSubString(
			activePrefix,
			cleanTextWithoutPrefix
		);

		return results;
	}

	removeResultsIfHigherThanThreshold(fullAutocompleteResults) {
		if (
			fullAutocompleteResults !== null &&
			fullAutocompleteResults.length > this.maxAutocompleteSuggestions
		) {
			return fullAutocompleteResults.slice(
				0,
				this.maxAutocompleteSuggestions
			);
		} else return fullAutocompleteResults;
	}

	extractLastPrefixToBeAutocompleted() {
		const textInput = this.textInput;
		const indicesOfLastPrefixes = {};

		// initialized to be lower than -1 because of: String.indexOf() --> -1
		let highestPrefixIndex = -2;
		let lastPrefix = '';

		for (const prefix of Object.keys(this.dictionaries)) {
			indicesOfLastPrefixes[prefix] = textInput.lastIndexOf(prefix);

			if (highestPrefixIndex < indicesOfLastPrefixes[prefix]) {
				highestPrefixIndex = indicesOfLastPrefixes[prefix];
				lastPrefix = prefix;
			}
		}

		// Check if the last prefixed world is long enough to provide autocomplete
		if (
			!this.isTextInputLenghtGreaterThanThreshold(
				this.textInput.slice(
					textInput.lastIndexOf(lastPrefix) + lastPrefix.length - 1
				)
			)
		)
			return null;

		return lastPrefix;
	}

	prefixMatchedWithRegex(prefix) {
		const match = this.textInput.match(
			this.prefixToMatchingRegexMapping[prefix].regex
		);
		if (match === null || match === undefined) return null;

		const lastMatch = match[match.length - 1];

		return lastMatch;
	}

	normalizeQueryByRemovingPrefixes(activePrefix, matchedPrefixes) {
		const cleanTextWithoutPrefix = matchedPrefixes.replace(
			activePrefix,
			''
		);

		return cleanTextWithoutPrefix;
	}

	buildQueryFromMatchingRegex() {
		const prefixWithRegex = this.prefixToMatchingRegexMapping;
		const stringMatches = [];

		Object.keys(prefixWithRegex).forEach(prefix => {
			let match = this.textInput.match(prefixWithRegex[prefix].regex);
			if (match) {
				stringMatches.push({
					prefix: prefix,
					match: match,
				});
			}
		});
		return stringMatches;
	}

	findResourcesByMatchingSubString(prefix, textInput) {
		console.debug('DEBUG: findResourcesByMatchingSubString', textInput);
		console.debug('DEBUG: findResourcesByMatchingSubString', prefix);
		const fuse = new Fuse(this.dictionaries[prefix], this.fuzzySearchOpts);
		return fuse.search(textInput);
	}

	/* HTML/lit-html TEMPLATES */

	composeSearchResultsTemplate = () => {
		if (this.autocompleteResults) {
			const generatedTemplate = this.autocompleteResults.map(result => {
				return html` <li tabindex="0">${result.item}</li>`;
			});
			return html`${generatedTemplate}`;
		}
	};

	render() {
		return html`
			<div class="search-box">
				<input
					@keyup=${this._handleTextInputEvent}
					class="search-bar"
					type="text"
					placeholder="${this.placeholderText}"
					maxlength="150"
				/>
				<!-- TODO: put search button here -->
				<slot></slot>
			</div>
			<ul class="search-results" @click=${this._handleAutocompleteList}>
				${this.showSearchSuggestions
					? html` ${this.composeSearchResultsTemplate()} `
					: ''}
			</ul>
		`;
	}
}
