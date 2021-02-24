import { html, LitElement } from 'lit-element';
import { queryTextStyles } from './styles/QueryTextStyles.js';

export class QueryText extends LitElement {
	static get styles() {
		return [queryTextStyles];
	}

	static get properties() {
		return {
			rootApiEndpoint: { type: String },
			placeholderText: { type: String },
			dictionaries: { type: Object },
			extractedPrefixesFromDicts: { type: Array },
			prefixToMatchinRegexMapping: { type: Object },
			mintextInputLenght: { type: Number },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = '';
		this.placeholderText = 'Cerca per esplorare i contenuti disponibili';
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
		this.extractedPrefixesFromDicts = [];
		this.prefixToMatchinRegexMapping = {};
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
		// pipe or reduce would be ideal for cleaner code. The choice is to not add helper functions for now...
		const extractedPrefixes = this.extractPrefixesFromDictionaries();
		this.extractedPrefixesFromDicts = [
			...this.extractedPrefixesFromDicts,
			...extractedPrefixes,
		];

		const extractedPrefixesToRegexes = this.createMatchingRegexFromPrefixes();
		this.prefixToMatchinRegexMapping = {
			...this.extractedPrefixesFromDicts,
			...extractedPrefixes,
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

	createMatchingRegexFromPrefixes() {
		let prefixToMatchingRegex = {};

		this.extractedPrefixesFromDicts.map(prefix => {
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
				let activePrefix = this.doesTextInputContainDefinedPrefixes(
					textInput
				);
				console.log('hey', activePrefix);
				//this.searchResults = this.queryConstructor();
			}
		}
	}

	trimString = textInput => textInput.trim();

	isTextInputLenghtGreaterThanThreshold = textInput =>
		textInput.length > this.mintextInputLenght;

	isQueryStringEligibleForAutocompletion(textInput) {
		let isDefinedPrefix = false;
		if (this.doesTextInputContainDefinedPrefixes(textInput) !== false)
			isDefinedPrefix = true;
		return Object.keys(this.dictionaries).length > 0 && isDefinedPrefix;
	}

	doesTextInputContainDefinedPrefixes(textInput) {
		for (let key of Object.keys(this.dictionaries)) {
			if (textInput.includes(key)) return key;
		}
		return false;
	}

	// TODO: example regex: @\S{2,}.\w*\b
	// var matches = yourString.match(/\btotal\b/g);
	// var lastMatch = matches[matches.length-1];

	render() {
		return html`
			<div class="search-box">
				<input
					@keyup=${this._handleTextInputEvent}
					class="search-bar"
					type="text"
					placeholder="${this.placeholderText}"
				/>
			</div>
			<ul class="search-results"></ul>
		`;
	}
}
