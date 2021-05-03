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
			metadataResponse: { type: Object },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = 'http://localhost:3000/';
		this.localVideosBaseUrl = 'answerSet';
		this.localAudiosBaseUrl = 'answerSetAudio';
		this.singleVideoBaseUrl = 'https://api.pexels.com/videos';
		this.dictionariesRoute = `dictionaries.json?${config.apiKey}`;
		this.searchRoute = `answerSet`;
		this.isLoading = false;
		this.metadataResponse = {};
		this.dictionaries = {
			'@': [
				'Valerio Ciriaci',
				'Alessio Genovese',
				'Paola Rossi',
				'Lilly Wachowski',
			],
			'title:': [
				'Mister Wonderland',
				'L’ultima frontiera',
				'Storie di Valerio',
				'Matrix',
			],
			'nationality:': ['Russia', 'Indonesia', 'Italia', 'Stati Uniti'],
		};
		this.searchResults = [];
	}

	connectedCallback() {
		super.connectedCallback();
		console.debug('DEBUG: QueryUi successfuly added to the DOM');
		//this.getDictionariesRequest(this.dictionariesRoute);
		this.localContentRequest(this.localVideosBaseUrl); // seminario demo
		this.localContentRequest(this.localAudiosBaseUrl); // seminario demo
		this.addEventListener('search-query-event', this._handleSearchedQuery);
		this.addEventListener('metadata-request', this._handleMetadataRequest);
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

	async _handleSearchedQuery(ev) {
		console.debug('_handleSearchedQuery', ev.detail.searchedQuery);
		this.isLoading = true;
		const result = this.postSearchRequest(
			this.searchRoute,
			ev.detail.searchedQuery
		);
		result.then(this.changeLoadingState());
	}

	changeLoadingState() {
		this.isLoading = false;
	}

	async _handleMetadataRequest(ev) {
		const metadataSourceId = ev.detail.metadataRequest;
		await this.metadataRequest(metadataSourceId);
	}

	async postSearchRequest(route, data) {
		const response = await fetch(
			`${this.rootApiEndpoint}${route}?q=${data}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				//body: JSON.stringify(data),
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

		const constructedSampleArray = this.extractAndConstructDataForSeminario(
			jsonResponse
		);

		this.searchResults = [...constructedSampleArray];
		return jsonResponse;
	}

	async localContentRequest(path) {
		const response = await fetch(`${this.rootApiEndpoint}${path}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${path}`
			);
		}

		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${this.rootApiEndpoint}${this.localVideosBaseUrl} has arrived:`,
			jsonResponse
		);

		const constructedSampleArray = this.extractAndConstructDataForSeminario(
			jsonResponse
		);

		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, ...constructedSampleArray];
		return jsonResponse;
	}

	extractAndConstructDataForSeminario(jsonResponse) {
		let arrayOfVideos = [];
		const data = jsonResponse;
		data.forEach(element => {
			arrayOfVideos.push({
				thumbnail_url: `/assets/thumbnail/${element.id}.jpeg`,
				film_name: element.film_name,
				film_id: element.film_id,
				media_type: element.media_type ? element.media_type : 'video',
				duration: element.duration,
				reference: element.id,
			});
		});

		return arrayOfVideos;
	}

	async singleVideoRequest(id) {
		const response = await fetch(
			`${this.singleVideoBaseUrl}/videos/${id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: config.PEXELS_API_KEY,
				},
			}
		);
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${
					this.singleVideoBaseUrl
				}`
			);
		}

		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${this.singleVideoBaseUrl} has arrived:`,
			jsonResponse
		);
		const constructSampleObject = {
			thumbnail_url: jsonResponse.image,
			film_name: jsonResponse.url,
			media_type: 'video',
			start: 0,
			stop: 5,
			duration: jsonResponse.duration,
			reference: jsonResponse.id,
		};

		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, constructSampleObject];
		return jsonResponse;
	}

	async metadataRequest(metadataSourceId) {
		const response = await fetch(
			`http://localhost:3000/metadataSet/${metadataSourceId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: http://localhost:3000/metadataSet/${metadataSourceId}`
			);
		}
		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from http://localhost:3000/segments/${metadataSourceId} has arrived:`,
			jsonResponse
		);
		this.metadataResponse = jsonResponse;
		return jsonResponse;
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
				.metadataResponse=${this.metadataResponse}
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
