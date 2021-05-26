import { html, css, LitElement } from 'lit-element';

import { config } from '../config.js';

import 'query-text';
import 'result-media';

export class QueryUi extends LitElement {
	static get styles() {
		return css`
			result-media {
				box-shadow: var(--sl-shadow-x-large);
				margin-top: 10px;
				height: 50vh;
				overflow: hidden;
			}
		`;
	}

	static get properties() {
		return {
			rootApiEndpoint: { type: String },
			dictionariesRoute: { type: String },
			searchResults: { type: Array },
			dictionaries: { type: Object },
			isLoading: { type: Boolean },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = '<INSERT_YOUR_ROOT_API_PATH>';
		this.popularVideosBaseUrl = 'https://api.pexels.com/videos/popular'; // an example from Pexels API (key needed)
		this.dictionariesRoute = `<INSERT_YOUR_API_PATH_TO_DICTIONARIES>${config.apiKey}`;
		this.searchRoute = `<INSERT_YOUR_API_PATH_TO_SEARCH>${config.apiKey}`;
		this.isLoading = false;
		this.dictionaries = {};
		this.searchResults = [];
	}

	/* LIFECYCLE METHODS */

	connectedCallback() {
		super.connectedCallback();
		// console.debug('DEBUG: QueryUi successfuly added to the DOM');
		this.getDictionariesRequest(this.dictionariesRoute);
		this.popularVidoesRequest(); // FIXME testing, demo purposes. Get the most popular video segmetns from "pexels"
		this.addEventListener('search-query-event', this._handleSearchedQuery);
	}

	/* updated(changedProperties) {
		console.debug('[QueryUI] changed properties: ', changedProperties); // logs previous values Useful for debugging purposes
	} */

	disconnectedCallback() {
		this.removeEventListener(
			'search-query-event',
			this._handleSearchedQuery
		);
		super.disconnectedCallback();
	}

	async popularVidoesRequest() {
		const response = await fetch(`${this.popularVideosBaseUrl}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: config.PEXELS_API_KEY, // config.js API KEY needed
			},
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${
					this.popularVideosBaseUrl
				}`
			);
		}

		const jsonResponse = await response.json();
		/* console.debug(
			`DEBUG: Async data from ${this.popularVideosBaseUrl} has arrived:`,
			jsonResponse
		); */
		const constructedSampleArray = this.extractAndConstructSampleResultMediaObjs(
			jsonResponse
		);
		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, ...constructedSampleArray];
		return jsonResponse;
	}

	// Manual formatting of the incoming results to match our app format

	extractAndConstructSampleResultMediaObjs(jsonResponse) {
		let arrayOfVideos = [];
		if (jsonResponse.videos) {
			const videos = jsonResponse.videos;
			videos.forEach(element => {
				arrayOfVideos.push({
					thumbnail_url: element.image,
					film_name: element.url,
					media_type: 'video',
					duration: element.duration,
					reference: element.id,
				});
			});
		}
		return arrayOfVideos;
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
		const response = await fetch(
			`https://api.pexels.com/v1/search?query=nature&per_page=1`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: config.PEXELS_API_KEY,
				},
				//body: JSON.stringify(data), // depends on the API implementation. It might be a good idea to do a POST with the searched string.
			}
		);
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

	// It can be more complex with message error types, depending on the adopted error support strategy.
	changeLoadingState() {
		this.isLoading = false;
	}

	_handleSearchedQuery(ev) {
		// console.debug('_handleSearchedQuery', ev.detail.searchedQuery);
		this.isLoading = true;
		const result = this.postSearchRequest(
			this.searchRoute,
			ev.detail.searchedQuery
		);
		result.then(this.changeLoadingState());
	}

	render() {
		return html`
			<query-text
				.dictionaries=${this.dictionaries}
				placeholderText="Inserisci il testo da cercare..."
			>
				<sl-button
					slot="search-button-slot"
					class="search-button"
					type="default"
					?loading=${this.isLoading}
					size="large"
				>
					<sl-icon slot="suffix" name="search"></sl-icon>
					Cerca
				</sl-button>
			</query-text>
			<result-media
				.answerSet=${this.searchResults}
				?isLoading=${this.isLoading}
				headerTitle="Esplora i contenuti"
			>
				${this.searchInProgress
					? html`
							<h1 slot="searchInProgress">Search in progress!</h1>
					  `
					: ''}
				></result-media
			>
		`;
	}
}
