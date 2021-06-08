import { LitElement, html, css } from 'lit-element';
import 'query-ui';
import 'track-editor';
import 'video-preview';
import { config } from '../config.js';

export class VideoEditorApp extends LitElement {
  static get properties() {
    return {
      trackElements: { type: Array },
      singleMediaPreview: { type: Object },
      isSingleMediaPreview: { type: Boolean },
      displayLoadingScreen: { type: Boolean },
      resources: { type: Array },
      singleMediaRequestState: { type: Object },
      playSegments: { type: Array },
      draggedElementType: { type: String },
      endSegments: { type: Array },
      stopPlayer: { type: Boolean },
      resumePlayer: { type: Boolean },
      goForLauch: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        margin: 0 auto;
        padding: 1em;
        max-height: 100vh;
      }

      query-ui {
        grid-column: 8/13;
        display: grid;
      }
    `;
  }

  constructor() {
    super();
    this.rootApiEndpoint = 'https://api.pexels.com/v1/photos';
    this.singleVideoBaseUrl = 'https://api.pexels.com/videos';
    this.getResource = `id`;
    this.trackElements = [];
    this.resources = [];
    this.singleMediaPreview = {};
    this.isSingleMediaPreview = false;
    this.singleMediaRequestState = {
      loadingMedia: false,
      errorState: null,
    };
    this.displayLoadingScreen = false;
    this.playSegments = [];
    this.draggedElementType = '';
    this.endSegments = [];
    this.stopPlayer = false;
    this.resumePlayer = false;
    this.goForLauch = false;
  }

  connectedCallback() {
    super.connectedCallback();
    // console.debug('DEBUG: Video-Editor-App successfuly added to the DOM');

    this.addEventListener('track-elements', this._handlePlayMedia);
    this.addEventListener('start-preview', this._handleStartPreview);
    this.addEventListener('end-preview', this._handleStopPreview); // to be renamed as end-elements-preview
    this.addEventListener('stop-preview', this._handleGlobalStop); // of all track elements
    this.addEventListener('resume-preview', this._handleGlobalResume); // of all track elements
    this.addEventListener('dragged-item-type', this._handleDraggedType);
    this.addEventListener(
      'result-media-preview',
      this._handlePreviewSingleMediaResult
    );
  }

  updated(changedProperties) {
    if (changedProperties.has('trackElements')) {
      this._makeSequentialRequests();
    }
  }

  _handleGlobalResume() {
    this.resumePlayer = true;
    this.stopPlayer = false;
    if (this.resources.length > 0) this.goForLauch = true;
  }
  _handleGlobalStop() {
    this.stopPlayer = true;
    this.resumePlayer = false;
    this.goForLauch = false;
  }

  _handleDraggedType(ev) {
    this.draggedElementType = ev.detail.draggedElementType;
  }

  _handleStartPreview(ev) {
    //console.debug('_handleStartPreview', ev);
    this.playSegments = ev.detail.start.elements;
  }

  _handleStopPreview(ev) {
    //console.debug('_handleStopPreview', ev);
    this.endSegments = ev.detail.end.elements;
  }

  async _handlePreviewSingleMediaResult(ev) {
    if (ev.detail.singleMediaPreview.type === 'image') {
      this.displayLoadingScreen = true;
      this.isSingleMediaPreview = true;

      if (ev.detail.singleMediaPreview.local === 'true') {
        await this.localResourceRequest(
          config.LOCAL_API_PATH,
          'segments/',
          ev.detail.singleMediaPreview.id
        );
      } else {
        await this.requestMediaElement(ev.detail.singleMediaPreview.id);
      }
      this.displayLoadingScreen = false;
    } else if (
      ev.detail.singleMediaPreview.type === 'video' ||
      ev.detail.singleMediaPreview.type === 'sound'
    ) {
      this.displayLoadingScreen = true;
      this.isSingleMediaPreview = true;

      if (ev.detail.singleMediaPreview.local === 'true') {
        await this.singleLocalVideoRequest(ev.detail.singleMediaPreview.id);
      } else {
        await this.singleVideoRequest(ev.detail.singleMediaPreview.id);
      }

      this.isSingleMediaPreview = false;
      this.displayLoadingScreen = false;
    }
  }

  async singleVideoRequest(id) {
    const response = await fetch(`${this.singleVideoBaseUrl}/videos/${id}`, {
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
        `'Network response: ${response.blob()} from: ${this.singleVideoBaseUrl}`
      );
    }

    const jsonResponse = await response.json();
    /* console.debug(
      `DEBUG: Async data from ${this.singleVideoBaseUrl} has arrived:`,
      jsonResponse
    ); */
    if (this.isSingleMediaPreview) {
      this.singleMediaPreview = jsonResponse;
      this.singleMediaPreview.type = 'video';
      this.updateLoadingSingleMediaState('loadingMedia', false);
    }
    return jsonResponse;
  }

  updateLoadingSingleMediaState(key, value) {
    this.singleMediaRequestState = {
      ...this.singleMediaRequestState,
      [key]: value,
    };
  }

  async singleLocalVideoRequest(id) {
    const response = await fetch(`http://localhost:3000/segments/${id}`, {
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
        `'Network response: ${response.blob()} from: ${this.singleVideoBaseUrl}`
      );
    }

    const jsonResponse = await response.json();
    /* console.debug(
      `DEBUG: Async data from http://localhost:3000/segments/${id} has arrived:`,
      jsonResponse
    ); */
    if (this.isSingleMediaPreview) {
      this.singleMediaPreview = jsonResponse;
      this.singleMediaPreview.type = 'video';
      this.updateLoadingSingleMediaState('loadingMedia', false);
    }
    return jsonResponse;
  }

  // Requests all the media sequentially from an API

  _makeSequentialRequests = async () => {
    if (!this.trackElements || this.trackElements.length === 0) return null;
    const elementsArray = this.trackElements;

    const getData = Promise.all(
      elementsArray.map(request => {
        const response = this.sequentialRequestMediaByType(request);
        return response;
      })
    );
    getData.then(values => {
      console.warn('Promise.All resolved', values);
      let mergedArray = [];
      elementsArray.forEach(request => {
        values.forEach(response => {
          if (Number(response.id) === Number(request.identificator)) {
            mergedArray.push({ ...request, ...response });
          }
        });
      });
      this.resources = [...mergedArray];
      this.goForLauch = true;
    });
  };

  sequentialRequestMediaByType(request) {
    if (request.mediaType === 'image') {
      let response;
      if (request.local === 'true') {
        response = this.localResourceRequest(
          config.LOCAL_API_PATH,
          'segments/',
          request.identificator
        );
      } else {
        response = this.requestMediaElement(request.identificator);
      }
      return response;
    } else if (
      (request.mediaType === 'video' && request.trackRef === 'musicTrack1') ||
      request.mediaType === 'sound'
    ) {
      request.mediaType = 'sound';
      let response;
      if (request.local === 'true') {
        response = this.singleLocalVideoRequest(request.identificator);
      } else {
        response = this.singleVideoRequest(request.identificator);
      }
      return response;
    } else if (request.mediaType === 'video') {
      let response;
      if (request.local === 'true') {
        response = this.singleLocalVideoRequest(request.identificator);
      } else {
        response = this.singleVideoRequest(request.identificator);
      }
      return response;
    }
  }

  async requestMediaElement(id) {
    const response = await fetch(`${config.SINGLE_IMAGE_ROUTE}/${id}`, {
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
        `'Network response: ${response.blob()} from: ${
          config.SINGLE_IMAGE_ROUTE
        }/${id}`
      );
    }
    const jsonResponse = await response.json();
    /* console.debug(
      `DEBUG: Async data from ${config.SINGLE_IMAGE_ROUTE}/${id} has arrived:`,
      jsonResponse
    ); */

    if (this.isSingleMediaPreview) {
      this.singleMediaPreview = jsonResponse;
      this.singleMediaPreview.type = 'image';
      this.updateLoadingSingleMediaState('loadingMedia', false);
    }

    return jsonResponse;
  }

  async localResourceRequest(route, path, id) {
    const response = await fetch(`${route}${path}${id}`, {
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
        `'Network response: ${response.blob()} from: ${route}${path}${id}F`
      );
    }
    const jsonResponse = await response.json();
    /* console.debug(
      `DEBUG: Async data from ${route}${path}${id} has arrived:`,
      jsonResponse
    ); */

    if (this.isSingleMediaPreview) {
      this.singleMediaPreview = jsonResponse;
      this.singleMediaPreview.type = 'image';
      this.updateLoadingSingleMediaState('loadingMedia', false);
    }

    return jsonResponse;
  }

  _handlePlayMedia(ev) {
    this.trackElements = [...ev.detail.trackElements];
    this.stopPlayer = false;
    this.resumePlayer = true;
    console.warn(
      'DEAMO APP: just received these trackElements: ',
      this.trackElements
    );
  }

  render() {
    return html`
      <video-preview
        .singleMediaRequestState=${this.singleMediaRequestState}
        ?displayLoadingScreen=${this.displayLoadingScreen}
        ?stopPlayer=${this.stopPlayer}
        ?resumePlayer=${this.resumePlayer}
        .singleMediaPreview=${this.singleMediaPreview}
        .resources=${this.resources}
        .executeSegmentsPreview=${this.playSegments}
        .terminateSegmentsPreview=${this.endSegments}
      ></video-preview>

      <query-ui></query-ui>
      <track-editor
        ?goForLaunch=${this.goForLauch}
        draggedElementType=${this.draggedElementType}
      ></track-editor>
    `;
  }
}
