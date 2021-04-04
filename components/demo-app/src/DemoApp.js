import { LitElement, html, css } from 'lit-element';
import 'query-ui';
import 'track-editor';
import { config } from '../config.js';

import '../../video-preview/index.js';

export class DemoApp extends LitElement {
  static get properties() {
    return {
      trackElements: { type: Object },
      singleMediaPreview: { type: Object },
      displayLoadingScreen: { type: Boolean },
      resources: { type: Array },
      singleMediaRequestState: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        margin: 0 auto;
        padding: 1em;
      }

      h1 {
        grid-column: 1/13;
        text-align: center;
      }

      query-ui {
        grid-column: 8/13;
        display: grid;
      }
    `;
  }

  constructor() {
    super();
    this.rootApiEndpoint = 'https://picsum.photos/';
    this.videoBaseUrl = 'https://api.pexels.com/videos';
    this.getResource = `id`;
    this.trackElements = {};
    this.respones;
    this.resources = [];
    this.singleMediaPreview = {};
    this.singleMediaRequestState = {
      loadingMedia: false,
      errorState: null,
    };
    this.displayLoadingScreen = false;
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: DemoApp successfuly added to the DOM');

    this.addEventListener('track-elements', this._handlePlayMedia);
    this.addEventListener(
      'result-media-preview',
      this._handlePreviewSingleMediaResult
    );
  }

  updated(changedProperties) {
    console.debug('[DemoApp] changed properties: ', changedProperties); // logs previous values
    if (changedProperties.has('trackElements')) {
      this._makeSequentialRequests();
    }
  }

  async _handlePreviewSingleMediaResult(ev) {
    if (ev.detail.singleMediaPreview.type === 'image') {
      this.displayLoadingScreen = true;

      await this.requestMediaElement(
        this.getResource,
        ev.detail.singleMediaPreview.id
      );

      this.displayLoadingScreen = false;
    } else if (ev.detail.singleMediaPreview.type === 'video') {
      this.displayLoadingScreen = true;

      await this.singleVideoRequest(ev.detail.singleMediaPreview.id);

      this.displayLoadingScreen = false;
    }
  }

  async singleVideoRequest(id) {
    const response = await fetch(`${this.videoBaseUrl}/videos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: config.PEXELS_API_KEY,
      },
    });
    if (!response.ok) {
      this.displayLoadingScreen = false;
      this.updateLoadingSingleMediaState('loadingMedia', false);
      this.updateLoadingSingleMediaState('errorState', 404);
      throw new Error(
        `'Network response: ${response.blob()} from: ${this.videoBaseUrl}`
      );
    }

    const jsonResponse = await response.json();
    console.debug(
      `DEBUG: Async data from ${this.videoBaseUrl} has arrived:`,
      jsonResponse
    );
    this.singleMediaPreview = jsonResponse;
    this.singleMediaPreview.type = 'video';
    this.updateLoadingSingleMediaState('loadingMedia', false);
    return jsonResponse;
  }

  updateLoadingSingleMediaState(key, value) {
    this.singleMediaRequestState = {
      ...this.singleMediaRequestState,
      [key]: value,
    };
    console.warn(
      'DEMO APP: singleMediaRequestState',
      this.singleMediaRequestState
    );
  }

  _makeSequentialRequests = async () => {
    if (!this.trackElements || Object.keys(this.trackElements).length === 0)
      return null;
    const elementsArray = this.trackElements.videoTrack1.elements;

    Promise.all(
      elementsArray.map(request => {
        return this.requestMediaElement(
          this.getResource,
          request.identificator
        ).then(response => {
          this.resources = [...this.resources, { request, response }];
        });
      })
    );
  };

  async requestMediaElement(route, id) {
    const response = await fetch(`${this.rootApiEndpoint}${route}/${id}/info`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      this.displayLoadingScreen = false;
      this.updateLoadingSingleMediaState('loadingMedia', false);
      this.updateLoadingSingleMediaState('errorState', 404);
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
    this.singleMediaPreview = jsonResponse;
    this.singleMediaPreview.type = 'image';

    this.updateLoadingSingleMediaState('loadingMedia', false);
    return jsonResponse;
  }

  _handlePlayMedia(ev) {
    this.trackElements = ev.detail.trackElements;
    console.debug('handePlayMedia', this.trackElements.videoTrack1.elements);
  }

  render() {
    return html`
      <video-preview
        .singleMediaRequestState=${this.singleMediaRequestState}
        ?displayLoadingScreen=${this.displayLoadingScreen}
        .singleMediaPreview=${this.singleMediaPreview}
        .resources=${this.resources}
      ></video-preview>
      <query-ui></query-ui>
      <track-editor></track-editor>
    `;
  }
}
