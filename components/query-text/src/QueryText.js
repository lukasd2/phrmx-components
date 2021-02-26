import { html, LitElement } from 'lit-element';
import { queryTextStyles } from './styles/QueryTextStyles.js';

import Fuse from 'fuse.js';

export class QueryText extends LitElement {
	static get styles() {
		return [queryTextStyles];
	}

	static get properties() {
		return {
			rootApiEndpoint: { type: String },
			placeholderText: { type: String },
			textInput: { type: String },
			dictionaries: { type: Object },
			prefixToMatchinRegexMapping: { type: Object },
			mintextInputLenght: { type: Number },
			autocompleteResults: { type: Array },
			showSearchSuggestions: { type: Boolean },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = '';
		this.placeholderText = 'Cerca per esplorare i contenuti disponibili';
		this.textInput = '';
		this.mintextInputLenght = 2;
		this.dictionaries = {
			'@': [
				'Kylynn Normavill',
				'Gwyneth Aikin',
				'Katey Stegel',
				'Blair Treher',
				'Karly Simoni',
				'Bernita Coiley',
				'Earle Cunah',
				'Harvey Emeny',
				'Barret Mapp',
				'Alberik Hickinbottom',
			],
			'title:': [
				'Thorn in the Heart, The',
				'Executioner, The',
				'Black Balloon, The',
				'Love Happy',
				'Never Again',
				'Science and Islam',
				'Finding Forrester',
				'No Looking Back',
				'Warrior of the Lost World',
				'Gross Anatomy (a.k.a. A Cut Above)',
			],
			'nationality:': [
				'Russia',
				'Indonesia',
				'Philippines',
				'Poland',
				'Tanzania',
				'Brazil',
				'Namibia',
				'Russia',
				'China',
				'Brazil',
			],
		};
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
		// pipe or function reducer would be ideal for cleaner code. The choice is to not add helper functions for now
		// altrimenti anche un try catch
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
		if (Object.keys(this.dictionaries).length === 0)
			return this.dictionaries;

		let extractedPrefixesFromDicts = [];
		for (let prefix of Object.keys(this.dictionaries)) {
			extractedPrefixesFromDicts.push(prefix);
		}
		return extractedPrefixesFromDicts;
	}

	createMatchingRegexFromPrefixes(extractedPrefixes) {
		let prefixToMatchingRegex = {};

		extractedPrefixes.map(prefix => {
			const regex = this.createRegexFromPrefix(prefix);
			prefixToMatchingRegex[prefix] = {
				regex: regex,
			};
		});
		return prefixToMatchingRegex;
	}

	createRegexFromPrefix(prefix) {
		const minCharsAfterPrefix = this.mintextInputLenght;
		// Regex that matches any defined prefix with the word (longer than threshold) that it follows until a white space occurs
		// It is complicated to create a regex which matches only textInput without the prefix. Example issue: example@example
		const regex = new RegExp(`${prefix}\\S{${minCharsAfterPrefix},}`, 'gi'); //example: "@\S{2,}" --> @==prefix && 2==this.mintextInputLenght

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
				let event = new CustomEvent('search-query-event', {
					detail: {
						searchedQuery: textInput,
					},
					bubbles: true,
					composed: true,
				});
				this.dispatchEvent(event);
			} else if (this.isQueryStringEligibleForAutocompletion()) {
				this.showSearchSuggestions = true;
				this.autocompleteResults = this.queryConstructor();
			} else {
				this.showSearchSuggestions = false;
			}
		}
	}

	_handleAutocompleteList(ev) {
		console.debug('_handleAutocompleteList', ev);
		if (ev.target.tagName === 'LI') {
			this.searchInput.value = ev.target.textContent.trim();
		}
		this.showSearchSuggestions = false;
	}

	trimString = textInput => textInput.trim();

	isTextInputLenghtGreaterThanThreshold = textInput =>
		textInput.length > this.mintextInputLenght;

	isQueryStringEligibleForAutocompletion() {
		return (
			Object.keys(this.dictionaries).length > 0 &&
			this.doesTextInputContainDefinedPrefixes(this.textInput)
		);
	}

	doesTextInputContainDefinedPrefixes(textInput) {
		for (let key of Object.keys(this.dictionaries)) {
			if (textInput.includes(key)) return true;
		}
		return false;
	}

	queryConstructor() {
		let activePrefix = this.extractLastPrefixToBeAutocompleted();

		if (activePrefix === '' || activePrefix === null) return;

		let prefixedString = this.prefixMatchedWithRegex(activePrefix);

		if (prefixedString === null || prefixedString === undefined) return;

		let cleanTextWithoutPrefix = this.normalizeQueryByRemovingPrefixes(
			activePrefix,
			prefixedString
		);

		let results = this.findResourcesByMatchingSubString(
			activePrefix,
			cleanTextWithoutPrefix
		);
		console.log('findResourcesByMatchingSubString', results);
		return results;
	}

	extractLastPrefixToBeAutocompleted() {
		const textInput = this.textInput;
		let indicesOfLastPrefixes = {};
		// initialized to be lower than -1 because of: String.indexOf() --> -1
		let highestPrefixIndex = -2;
		let lastPrefix = '';

		for (let prefix of Object.keys(this.dictionaries)) {
			indicesOfLastPrefixes[prefix] = textInput.lastIndexOf(prefix);

			if (highestPrefixIndex < indicesOfLastPrefixes[prefix]) {
				highestPrefixIndex = indicesOfLastPrefixes[prefix];
				lastPrefix = prefix;
			}
		}

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
		let match = this.textInput.match(
			this.prefixToMatchingRegexMapping[prefix].regex
		);
		if (match === null || match === undefined) return null;

		const lastMatch = match[match.length - 1];
		return lastMatch;
	}

	normalizeQueryByRemovingPrefixes(activePrefix, matchedPrefixes) {
		let cleanTextWithoutPrefix = matchedPrefixes.replace(activePrefix, '');

		return cleanTextWithoutPrefix;
	}

	buildQueryFromMatchingRegex() {
		const prefixWithRegex = this.prefixToMatchingRegexMapping;
		let stringMatches = [];

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
			console.log('searchResults appeared', this.autocompleteResults);
			const generatedTemplate = this.autocompleteResults.map(result => {
				return html` <li tabindex="0">
					<span class="name"> ${result.item} </span>
				</li>`;
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
				/>
				<!-- put search button here -->
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
