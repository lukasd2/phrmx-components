import { html, LitElement } from 'lit-element';

import Fuse from 'fuse.js';

import { debounce } from 'lodash-es';
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
			activePrefix: { type: String },
			distinctAutocompletes: { type: Array },
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
		this.activePrefix = '';
		this.distinctAutocompletes = [];
		this.debouncedTextInputHandler = debounce(
			this._handleTextInputEvent.bind(this),
			150
		);
	}

	/* LIFECYCLE METHODS */

	connectedCallback() {
		super.connectedCallback();
		// console.debug('DEBUG: QueryText successfuly added to the DOM');
		this.updateDictionariesInfo();
	}

	firstUpdated() {
		const searchInput = this.shadowRoot.querySelector('.search-bar');
		this.searchInput = searchInput;
		searchInput.addEventListener('keyup', this.debouncedTextInputHandler);
	}

	updated(changedProperties) {
		// console.debug('changedProperty', changedProperties); // logs all previous values (useful for component debug)
		if (changedProperties.has('dictionaries')) {
			this.updateDictionariesInfo();
		}
	}

	// Extract prefixes from dictionaries and create corresponding regexes. Regexes are used to match with text that is beign typed on the search bar

	updateDictionariesInfo() {
		if (!this.dictionaries || Object.keys(this.dictionaries).length === 0)
			return null;

		const extractedPrefixes = this.extractPrefixesFromDictionaries();

		const prefixesToRegexMapping = this.createMatchingRegexFromPrefixes(
			extractedPrefixes
		);
		this.prefixToMatchingRegexMapping = {
			...this.prefixToMatchingRegexMapping,
			...prefixesToRegexMapping,
		};
		return this.prefixToMatchingRegexMapping;
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
				regex,
			};
			return prefixToMatchingRegex;
		});
		return prefixToMatchingRegex;
	}

	createRegexFromPrefix(prefix) {
		const minCharsAfterPrefix = this.mintextInputLenght; // prefix is excluded from the mintextInputLenght count
		// Create regex that matches any defined prefix with the word (longer than threshold) that follows until a white space occurs
		// example: "@\S{2,}" ==> @ is the "@" prefix && 2 is the value of this.mintextInputLenght
		const regex = new RegExp(`${prefix}\\S{${minCharsAfterPrefix},}`, 'gi');

		return regex;
	}

	/* EVENT HANDLERS */

	// Handles text typing on the search bar. Sends an event upwards if ENTER is pressed. Triggers the search engine and shows autocomplete suggestion if a prefix is typed.
	_handleTextInputEvent(ev) {
		const searchInputValue = this.searchInput.value;
		const textInput = this.trimString(searchInputValue);
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

	// Handles the user click on the suggestion

	_handleAutocompleteList(ev) {
		if (ev.target.tagName === 'LI') {
			const prefixAutocompleteText = `${
				this.activePrefix
			}${ev.target.textContent.trim()}`;

			this.searchInput.value = this.searchInput.value.replace(
				this.currentMatch,
				prefixAutocompleteText
			);
			// adds the resolved prefix with the suggestion to the list if not already present
			if (
				this.distinctAutocompletes.indexOf(prefixAutocompleteText) ===
				-1
			)
				this.distinctAutocompletes.push(prefixAutocompleteText);
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

	// constructs the query that has to be searched. It extracts and manages the prefix with its text string, matches it with the respective regex and sends the prefix and text string to the search function.
	queryConstructor() {
		if (this.distinctAutocompletes.length > 0) {
			// exclude previous autocompletions from new proposals. It allows to exclude already resolved prefixes so they do not appear among the suggestions again.
			this.textInput = this.findUnresolvedPrefixes();
		}
		const activePrefix = this.extractLastPrefixToBeAutocompleted();

		if (activePrefix === '' || activePrefix === null) return null;

		this.activePrefix = activePrefix;

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

	findUnresolvedPrefixes() {
		let unresolvedPrefixes = this.textInput;

		this.distinctAutocompletes.forEach(autocomplete => {
			if (this.textInput.includes(autocomplete)) {
				unresolvedPrefixes = unresolvedPrefixes.replaceAll(
					autocomplete,
					''
				);
			} else {
				// remove previous autocompleted words
				this.distinctAutocompletes.splice(
					this.distinctAutocompletes.indexOf(autocomplete),
					1
				);
			}
		});
		return unresolvedPrefixes;
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
		}
		return fullAutocompleteResults;
	}

	extractLastPrefixToBeAutocompleted() {
		// eslint-disable-next-line prefer-destructuring
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
			const match = this.textInput.match(prefixWithRegex[prefix].regex);
			if (match) {
				stringMatches.push({
					prefix,
					match,
				});
			}
		});
		return stringMatches;
	}

	// Uses the Fuse library to perform a search inside a prefixed dictionary of strings

	findResourcesByMatchingSubString(prefix, textInput) {
		/* console.debug(
			'DEBUG: findResourcesByMatchingSubString [string to be searched]:',
			textInput
		);
		console.debug(
			'DEBUG: findResourcesByMatchingSubString [prefix found]:',
			prefix
		); */
		const fuse = new Fuse(this.dictionaries[prefix], this.fuzzySearchOpts);
		return fuse.search(textInput);
	}

	/* HTML/lit-html TEMPLATES */

	composeSearchResultsTemplate = () => {
		if (this.autocompleteResults) {
			const generatedTemplate = this.autocompleteResults.map(
				result => html` <li tabindex="0">${result.item}</li>`
			);
			return html`${generatedTemplate}`;
		}
	};

	handleClickOnSearchBtn() {
		if (this.isTextInputLenghtGreaterThanThreshold(this.textInput)) {
			this.showSearchSuggestions = false;
			const event = new CustomEvent('search-query-event', {
				detail: {
					searchedQuery: this.textInput,
				},
				bubbles: true,
				composed: true,
			});
			this.dispatchEvent(event);
		}
	}

	render() {
		return html`
			<div class="search-box">
				<input
					class="search-bar"
					type="text"
					placeholder="${this.placeholderText}"
					maxlength="150"
				/>
				<slot
					name="search-button-slot"
					@click="${this.handleClickOnSearchBtn}"
				></slot>
			</div>
			<div class="search-results__container">
				<ul
					class="search-results"
					@click=${this._handleAutocompleteList}
				>
					${this.showSearchSuggestions
						? html` ${this.composeSearchResultsTemplate()} `
						: ''}
				</ul>
			</div>
		`;
	}
}
