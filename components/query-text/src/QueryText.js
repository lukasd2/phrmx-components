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
	}

	connectedCallback() {
		super.connectedCallback();
		console.debug('DEBUG: QueryText successfuly added to the DOM');
		this.updateDictionariesInfo();
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

	_handleTextInputEvent(ev) {
		const textInput = this.trimString(ev.target.value);
		this.textInput = textInput;
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
			} else if (this.isQueryStringEligibleForAutocompletion(textInput)) {
				this.autocompleteResults = this.queryConstructor();
			}
		}
	}

	trimString = textInput => textInput.trim();

	isTextInputLenghtGreaterThanThreshold = textInput =>
		textInput.length > this.mintextInputLenght;

	isQueryStringEligibleForAutocompletion(textInput) {
		return (
			Object.keys(this.dictionaries).length > 0 &&
			this.doesTextInputContainDefinedPrefixes(textInput)
		);
	}

	doesTextInputContainDefinedPrefixes(textInput) {
		for (let key of Object.keys(this.dictionaries)) {
			if (textInput.includes(key)) return true;
		}
		return false;
	}

	queryConstructor() {
		console.log('queryConstructor textInput', this.textInput);
		let matchedPrefixes = this.buildQueryFromMatchingRegex();
		console.log('queryConstructor', matchedPrefixes);
		let normalizedQuery = this.normalizeQueryByRemovingPrefixes(
			matchedPrefixes
		);
		console.log('queryConstructor', normalizedQuery);

		let results = this.findResourcesByMatchingSubString(normalizedQuery);
		console.log('findResourcesByMatchingSubString', results);
		return results;
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

	normalizeQueryByRemovingPrefixes(matchedPrefixes) {
		let normalizedTextInput = '';

		matchedPrefixes.forEach(query => {
			let activePrefix = query.prefix;

			query.match.map(query => {
				let cleanTextFromPrefix = query.replace(activePrefix, '');

				normalizedTextInput = normalizedTextInput.concat(
					cleanTextFromPrefix,
					' '
				);
			});
		});

		return normalizedTextInput;
	}

	findResourcesByMatchingSubString(textInput) {
		console.debug('DEBUG: findResourcesByMatchingSubString', textInput);
		const fuse = new Fuse(this.dictionaries['@'], this.fuzzySearchOpts);
		return fuse.search(textInput);
	}

	// TODO: example regex: @\S{2,}.\w*\b
	// var matches = yourString.match(/\btotal\b/g);
	// var lastMatch = matches[matches.length-1];

	composeSearchResultsTemplate = () => {
		if (this.autocompleteResults) {
			console.log('searchResults appeared', this.autocompleteResults);
			const generatedTemplate = this.autocompleteResults.map(result => {
				return html` <li>
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
				<slot></slot>
				<!-- put search button here -->
			</div>
			<ul class="search-results">
				${this.composeSearchResultsTemplate()}
			</ul>
		`;
	}
}
