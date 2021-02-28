import { html, css, LitElement } from 'lit-element';

export class QueryUi extends LitElement {
	static get styles() {
		return css`
			:host {
				display: block;
				padding: 25px;
				color: var(--query-ui-text-color, #000);
			}
		`;
	}

	static get properties() {
		return {
			rootApiEndpoint: { type: String },
			dictionariesRoute: { type: String },
			searchResults: { type: Object },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = 'https://my.api.mockaroo.com/';
		this.dictionariesRoute = 'getdictionariesrequest.json?key=d8dae1b0';
		this.dictionaries = {};
		this.searchResults = {};
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

	async postDictionariesRequest(route, data) {
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
		this.searchResults = { ...this.searchResults, ...jsonResponse };
		return jsonResponse;
	}

	_handleSearchedQuery(ev) {
		console.warn('_handleSearchedQuery', ev);
		console.log(ev.detail.searchedQuery);
		this.postDictionariesRequest(
			this.dictionariesRoute,
			ev.detail.searchedQuery
		);
	}

	render() {
		return html` ${this.dictionaries
			? html` <h1>Dictionaries received!</h1>`
			: ''}`;
	}
}
