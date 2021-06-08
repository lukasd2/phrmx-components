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
				min-height: 500px;
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
			metadataResponse: { type: Object },
			isLoading: { type: Boolean },
		};
	}

	constructor() {
		super();
		this.rootApiEndpoint = '<INSERT_YOUR_ROOT_API_PATH>';
		this.popularVideosBaseUrl = 'https://api.pexels.com/videos/popular'; // an example from Pexels API (key needed)
		this.dictionariesRoute = `<INSERT_YOUR_API_PATH_TO_DICTIONARIES>${config.API_KEY}`;
		this.searchRoute = `<INSERT_YOUR_API_PATH_TO_SEARCH>${config.API_KEY}`;
		this.isLoading = false;
		this.dictionaries = {};
		this.metadataResponse = {};
		this.searchResults = [];
	}

	/* LIFECYCLE METHODS */

	connectedCallback() {
		super.connectedCallback();
		// console.debug('DEBUG: QueryUi successfuly added to the DOM');
		// this.getDictionariesRequest(this.dictionariesRoute);
		this.localContentRequest();
		this.getCollectionsFromPexels();
		this.addEventListener('search-query-event', this._handleSearchedQuery);
		this.addEventListener('metadata-request', this._handleMetadataRequest);
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

	/* API Calls */

	async getCollectionsFromPexels() {
		const response = await fetch(
			`https://api.pexels.com/v1/collections/l6ucob1`,
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
					this.popularVideosBaseUrl
				}`
			);
		}

		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from https://api.pexels.com/v1/collections/l6ucob1 has arrived:`,
			jsonResponse
		);

		const constructedSampleArray = this.extractFromCollections(
			jsonResponse
		);
		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, ...constructedSampleArray];
		return jsonResponse;
	}

	extractFromCollections(jsonResponse) {
		const media = jsonResponse.media;
		const arrayOfVideos = [];
		const arrayOfPhotos = [];

		media.forEach(element => {
			if (element.type === 'Video') {
				arrayOfVideos.push({
					thumbnail_url: element.image,
					item_name: element.url,
					media_type: 'video',
					duration: element.duration,
					reference: element.id,
				});
			} else if (element.type === 'Photo') {
				arrayOfPhotos.push({
					thumbnail_url: element.src.small,
					item_name: element.url,
					media_type: 'image',
					reference: element.id,
				});
			}
		});
		return [...arrayOfVideos, ...arrayOfPhotos];
	}

	async localContentRequest() {
		const response = await fetch(`${config.LOCAL_API_PATH}answerSet`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`'Network response: ${response.blob()} `);
		}

		const jsonResponse = await response.json();
		/* console.debug(
			`DEBUG: Async data from ${config.LOCAL_API_PATH} has arrived:`,
			jsonResponse
		); */

		const constructedSampleArray = this.extractAndConstructFromLocalData(
			jsonResponse
		);

		// immutability data pattern used to update LitElement lifecycle (https://open-wc.org/guides/knowledge/lit-element/rendering/#litelements-property-system)
		this.searchResults = [...this.searchResults, ...constructedSampleArray];
		return jsonResponse;
	}

	extractAndConstructFromLocalData(jsonResponse) {
		const arrayOfVideos = [];
		const data = jsonResponse;
		data.forEach(element => {
			arrayOfVideos.push({
				local: true,
				thumbnail_url: `/assets/thumbnail/${element.id}.jpeg`,
				item_name: element.film_name,
				media_type: element.media_type ? element.media_type : 'video',
				duration: element.duration,
				reference: element.id,
			});
		});

		return arrayOfVideos;
	}

	async metadataRequest(route, metadataSourceId, type) {
		const response = await fetch(`${route}${metadataSourceId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: config.PEXELS_API_KEY,
			},
		});
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${route}${metadataSourceId}`
			);
		}
		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${route}${metadataSourceId} has arrived:`,
			jsonResponse
		);
		const constructedSampleArray = this.extractMetadataFromPexels(
			jsonResponse,
			type
		);
		this.metadataResponse = { ...constructedSampleArray };
		return jsonResponse;
	}

	extractMetadataFromPexels(jsonResponse, type) {
		let response = {};
		if (type === 'video') {
			response = {
				id: jsonResponse.id,
				userName: jsonResponse.user.name,
				userProfile: jsonResponse.user.url,
				height: jsonResponse.height,
				width: jsonResponse.width,
				url: jsonResponse.url,
			};
		} else if (type === 'image') {
			response = {
				id: jsonResponse.id,
				userName: jsonResponse.photographer,
				userProfile: jsonResponse.photographer_url,
				avgColor: jsonResponse.avg_color,
				height: jsonResponse.height,
				width: jsonResponse.width,
				url: jsonResponse.url,
			};
		}

		return response;
	}

	async localMetadataRequest(route, metadataSourceId) {
		const response = await fetch(
			`${route}metadataSet/${metadataSourceId}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);
		if (!response.ok) {
			throw new Error(
				`'Network response: ${response.blob()} from: ${route}${metadataSourceId}`
			);
		}
		const jsonResponse = await response.json();
		console.debug(
			`DEBUG: Async data from ${route}${metadataSourceId} has arrived:`,
			jsonResponse
		);
		const constructedSampleArray = this.extractMetadataFromLocal(
			jsonResponse
		);
		this.metadataResponse = { ...constructedSampleArray };
		return jsonResponse;
	}

	extractMetadataFromLocal(jsonResponse) {
		let response = {};
		response = {
			id: jsonResponse.id,
			description: jsonResponse.description,
			userName: jsonResponse.userName,
			userProfile: jsonResponse.userProfile,
			height: jsonResponse.height,
			width: jsonResponse.width,
			url: jsonResponse.url,
		};
		return response;
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

	async _handleMetadataRequest(ev) {
		const metadataSourceId = ev.detail.metadataRequest;
		const isLocal = ev.detail.local;
		if (ev.detail.mediaType === 'video') {
			if (isLocal === 'true') {
				await this.localMetadataRequest(
					config.LOCAL_API_PATH,
					metadataSourceId
				);
			} else {
				await this.metadataRequest(
					config.SINGLE_VIDEO_ROUTE,
					metadataSourceId,
					'video'
				);
			}
		} else if (ev.detail.mediaType === 'image') {
			if (isLocal === 'true') {
				await this.localMetadataRequest(
					config.LOCAL_API_PATH,
					metadataSourceId
				);
			} else {
				await this.metadataRequest(
					config.SINGLE_IMAGE_ROUTE,
					metadataSourceId,
					'image'
				);
			}
		}
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
				placeholderText="Search for anything..."
			>
				<sl-button
					slot="search-button-slot"
					class="search-button"
					type="default"
					?loading=${this.isLoading}
					size="large"
				>
					<sl-icon slot="suffix" name="search"></sl-icon>
					Search
				</sl-button>
			</query-text>
			<result-media
				.answerSet=${this.searchResults}
				?isLoading=${this.isLoading}
				headerTitle="Content explorer"
				.metadataResponse=${this.metadataResponse}
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
