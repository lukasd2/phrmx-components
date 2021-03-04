import { html, css, LitElement } from 'lit-element';
import '../../query-text/query-text.js';
import '../../result-media/result-media.js';

export class QueryUi extends LitElement {
	static get styles() {
		return css`
			:host {
				display: grid;
				grid-template-columns: repeat(12, 1fr);
				grid-column: 4/12;
			}
		`;
	}

	static get properties() {
		return {
			rootApiEndpoint: { type: String },
			dictionariesRoute: { type: String },
			searchResults: { type: Array },
			dictionaries: { type: Object },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = 'https://my.api.mockaroo.com/';
		this.dictionariesRoute = 'dictionaries.json?key=d8dae1b0'; // not hiding keys for demo/testing purposes
		this.searchRoute = 'answerset.json?key=d8dae1b0';
	}

	connectedCallback() {
		super.connectedCallback();
		console.debug('DEBUG: QueryUi successfuly added to the DOM');
		this.getDictionariesRequest(this.dictionariesRoute);
		this.addEventListener('search-query-event', this._handleSearchedQuery);
	}

	updated(changedProperties) {
		console.debug('[QueryUI] changed properties: ', changedProperties); // logs previous values
	}

	disconnectedCallback() {
		this.removeEventListener(
			'search-query-event',
			this._handleSearchedQuery
		);
		super.disconnectedCallback();
	}

	async getDictionariesRequest(route) {
		const response = await fetch(`${this.rootApiEndpoint}${route}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${
					this.rootApiEndpoint
				}${route}`
			);
		}

		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${this.rootApiEndpoint}${route} has arrived:`,
			jsonResponse
		);
		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.dictionaries = { ...this.dictionaries, ...jsonResponse };
		return jsonResponse;
	}

	async postSearchRequest(route, data) {
		const response = await fetch(`${this.rootApiEndpoint}${route}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${
					this.rootApiEndpoint
				}${route}`
			);
		}
		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${this.rootApiEndpoint}${route} has arrived:`,
			jsonResponse
		);
		this.searchResults = jsonResponse;
		return jsonResponse;
	}

	_handleSearchedQuery(ev) {
		console.debug('_handleSearchedQuery', ev.detail.searchedQuery);
		this.postSearchRequest(this.searchRoute, ev.detail.searchedQuery);
	}

	render() {
		return html`
			<query-text
				.dictionaries=${this.dictionaries}
				placeholderText="Inserisci il testo da cercare..."
			></query-text>
			<result-media .answerSet=${this.searchResults}></result-media>
		`;
	}
}
