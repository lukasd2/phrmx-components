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
		this.rootApiEndpoint = 'https://my.api.mockaroo.com/';
		this.singleVideoBaseUrl = 'https://api.pexels.com/videos';
		this.popularVideosBaseUrl = 'https://api.pexels.com/videos/popular';
		this.dictionariesRoute = `dictionaries.json?${config.apiKey}`; // not hiding keys for demo/testing purposes
		this.searchRoute = `answerset.json?${config.apiKey}`;
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
		this.searchResults = [
			{
				thumbnail_url: 'https://picsum.photos/id/999/150/200',
				film_name: 'NasceturRidiculus.avi',
				start: 0.7542,
				stop: 1.6687,
				reference: 999,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/998/150/200',
				film_name: 'LiberoNonMattis.avi',
				start: 0.515,
				stop: 1.6765,
				reference: 998,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/997/150/200',
				film_name: 'NisiVulputate.mp3',
				start: 0.581,
				stop: 1.6561,
				reference: 997,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/996/150/200',
				film_name: 'InterdumMaurisUllamcorper.avi',
				start: 0.0669,
				stop: 1.2132,
				reference: 996,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/995/150/200',
				film_name: 'Nulla.mp3',
				start: 0.8252,
				stop: 1.719,
				reference: 995,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/994/150/200',
				film_name: 'EstDonecOdio.mp3',
				start: 0.4759,
				stop: 1.8958,
				reference: 994,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/993/150/200',
				film_name: 'Curabitur.mov',
				start: 0.5066,
				stop: 1.4263,
				reference: 993,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/992/150/200',
				film_name: 'UltricesErat.avi',
				start: 0.845,
				stop: 1.8617,
				reference: 992,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/991/150/200',
				film_name: 'PulvinarLobortisEst.mp3',
				start: 0.5096,
				stop: 1.6085,
				reference: 991,
				media_type: 'image',
			},
			{
				thumbnail_url: 'https://picsum.photos/id/990/150/200',
				film_name: 'VestibulumAnte.mp3',
				start: 0.0421,
				stop: 1.201,
				reference: 990,
				media_type: 'image',
			},
		];
	}

	connectedCallback() {
		super.connectedCallback();
		console.debug('DEBUG: QueryUi successfuly added to the DOM');
		// this.getDictionariesRequest(this.dictionariesRoute); // FIXME, Demo purposes an example dictionary is
		this.localVideoRequest(); // seminario demo
		// this.popularVidoesRequest(); // FIXME testing, demo purposes. Get the most popular video segmetns from "pexels"
		this.addEventListener('search-query-event', this._handleSearchedQuery);
		this.addEventListener('metadata-request', this._handleMetadataRequest);
	}

	updated(changedProperties) {
		console.debug('[QueryUI] changed properties: ', changedProperties); // logs previous values
	}

	async localVideoRequest() {
		const response = await fetch(`http://localhost:3000/answerSet`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${
					this.singleVideoBaseUrl
				}`
			);
		}

		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from http://localhost:3000/answerSet has arrived:`,
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
		console.warn('jsonResponse', jsonResponse);
		const data = jsonResponse;
		data.forEach(element => {
			arrayOfVideos.push({
				thumbnail_url: `/assets/thumbnail/${element.id}.jpeg`,
				film_name: element.film_name,
				film_id: element.film_id,
				media_type: 'video',
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

	async popularVidoesRequest() {
		const response = await fetch(`${this.popularVideosBaseUrl}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: config.PEXELS_API_KEY,
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
		console.debug(
			`DEBUG: Async data from ${this.popularVideosBaseUrl} has arrived:`,
			jsonResponse
		);
		const constructedSampleArray = this.extractAndConstructSampleResultMediaObjs(
			jsonResponse
		);
		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, ...constructedSampleArray];
		return jsonResponse;
	}

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

	async _handleMetadataRequest(ev) {
		console.warn(ev.detail.metadataRequest);
		const metadataSourceId = ev.detail.metadataRequest;
		await this.metadataRequest(metadataSourceId);
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

	changeLoadingState() {
		this.isLoading = false;
	}

	_handleSearchedQuery(ev) {
		console.debug('_handleSearchedQuery', ev.detail.searchedQuery);
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
