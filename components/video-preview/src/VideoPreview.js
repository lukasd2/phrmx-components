import { html, LitElement } from 'lit-element';
import { videoPreviewStyles } from './styles/VideoPreviewStyles.js';

export class VideoPreview extends LitElement {
  static get styles() {
    return [videoPreviewStyles];
  }

  static get properties() {
    return {
      videoEditorTitle: { type: String },
      trackElements: { type: Object },
      playedElement: { type: Number },
      resources: { type: Array },
      stopPlayer: { type: Boolean },
      resumePlayer: { type: Boolean },
      executeSegmentsPreview: { type: Array },
      terminateSegmentsPreview: { type: Array },
      singleMediaPreview: { type: Object },
      displayMediaPreview: { type: Boolean },
      displayLoadingScreen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.videoEditorTitle = 'This is your new video title';
    this.trackElements = {};
    this.playedElement = 0;
    this.displayMediaPreview = false;
    this.playback = '';
    this.stopPlayer = false;
    this.singlePreviewVideoRef = '';
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: VideoPreview successfuly added to the DOM');
  }

  firstUpdated() {
    this.playback = this.shadowRoot.getElementById('playback');
  }

  updated(changedProperties) {
    // console.debug('[VIDEO PREVIEW] changed properties: ', changedProperties); // logs previous values

    if (changedProperties.has('resources')) {
      // Template engine may change the order of HTML videos elements we want to pause and hide canvas when new resources arrive
      this.updateTemplateRefs();
    }
    if (changedProperties.has('stopPlayer')) {
      this.stopCurrentlyPlayedMedia();
      this.stopPlayer = false;
    }
    if (changedProperties.has('resumePlayer')) {
      this.resumeCurrentlyPlayedMedia();
      this.resumePlayer = false;
    }
    if (changedProperties.has('executeSegmentsPreview')) {
      if (this.executeSegmentsPreview.length > 0) {
        this._startPreview();
      }
    }

    if (changedProperties.has('terminateSegmentsPreview')) {
      if (this.terminateSegmentsPreview.length > 0) this._endPreview();
    }

    if (changedProperties.has('singleMediaPreview')) {
      this.displayMediaPreview = true;
      this.singlePreviewVideoRef = this.shadowRoot.querySelector(
        '.single-preview-video'
      );
      if (this.singlePreviewVideoRef !== '') {
        this.singlePreviewVideoRef.load();
        this.singlePreviewVideoRef.play();
      }
    }
  }
  updateTemplateRefs() {
    const currentlyOnAir = this.shadowRoot.querySelectorAll(
      '.currently-on-air'
    );
    Array.from(currentlyOnAir).forEach(element => {
      element.pause();
      element.parentNode.style.visibility = 'hidden';
      element.parentNode.style.opacity = 0;
    });
  }
  _startPreview() {
    this.displayMediaPreview = false;
    if (this.executeSegmentsPreview.length === 1) {
      const playElements = this.playback.querySelector(
        `.${this.executeSegmentsPreview[0].localRef}`
      );
      console.warn('this is play element', playElements);
      if (playElements) {
        if (playElements.classList.contains('video-player-container')) {
          const existingSource = playElements.querySelector(
            '.video-player-content'
          );
          existingSource.classList.add('currently-on-air');

          existingSource.load();
          existingSource.muted = 'muted';
          existingSource.play();
        }
        if (playElements.classList.contains('music-player-container')) {
          const existingSource = playElements.querySelector(
            '.music-player-content'
          );
          existingSource.classList.add('currently-on-air');

          existingSource.play();
        }
        if (playElements.classList.contains('music-player-container')) {
          return;
        }
      }
      playElements.style.visibility = 'visible';
      playElements.style.opacity = 1;
    } else if (this.executeSegmentsPreview.length > 1) {
      this.executeSegmentsPreview.forEach(element => {
        const playElements = this.playback.querySelector(
          `.${element.localRef}`
        );
        if (playElements.classList.contains('video-player-container')) {
          const existingSource = playElements.querySelector(
            '.video-player-content'
          );
          existingSource.classList.add('currently-on-air');
          existingSource.load();
          existingSource.muted = 'muted';
          existingSource.play();
        }
        if (playElements.classList.contains('music-player-container')) {
          const existingSource = playElements.querySelector(
            '.music-player-content'
          );
          existingSource.classList.add('currently-on-air');

          existingSource.play();
        }
        if (playElements.classList.contains('music-player-container')) {
          return;
        }
        playElements.style.visibility = 'visible';
        playElements.style.opacity = 1;
      });
    }
  }

  _endPreview() {
    const stopElements = this.playback.querySelector(
      `.${this.terminateSegmentsPreview[0].localRef}`
    );

    console.warn('this is end element', stopElements);

    if (stopElements.classList.contains('video-player-container')) {
      const existingSource = stopElements.querySelector(
        '.video-player-content'
      );
      existingSource.classList.remove('currently-on-air');

      existingSource.pause();
    }
    if (stopElements.classList.contains('music-player-container')) {
      const existingSource = stopElements.querySelector(
        '.music-player-content'
      );
      existingSource.classList.remove('currently-on-air');

      existingSource.pause();
    }

    stopElements.style.visibility = 'hidden';
    stopElements.style.opacity = 0;
  }

  stopCurrentlyPlayedMedia() {
    const currentlyOnAir = this.shadowRoot.querySelectorAll(
      '.currently-on-air'
    );
    if (currentlyOnAir.length > 0) {
      Array.from(currentlyOnAir).forEach(element => {
        element.pause();
      });
    }
  }

  resumeCurrentlyPlayedMedia() {
    this.displayMediaPreview = false;

    const currentlyOnAir = this.shadowRoot.querySelectorAll(
      '.currently-on-air'
    );
    Array.from(currentlyOnAir).forEach(element => {
      element.play();
    });
  }

  composeLoadingTemplate() {
    const generatedTemplate = html`
      <section class="loading-part">
        <sl-spinner
          class="spinner__loading"
          style="font-size: 8rem; --stroke-width: 6px;"
        ></sl-spinner>
        <span class="spinner__caption">Caricamento contenuti in corso!</span>
      </section>
    `;
    return html`${generatedTemplate}`;
  }

  composeSingleMediaPreview() {
    if (this.singleMediaPreview.type === 'image') {
      return html` ${this.composeSingleImageLayer(
        this.singleMediaPreview.download_url
      )}`;
    }

    if (this.singleMediaPreview.type === 'video') {
      return html` ${this.composeSingleVideoLayer(
        this.singleMediaPreview.url,
        this.singleMediaPreview.id
      )}`;
    }
    if (this.singleMediaPreview.type === 'sound') {
      return html` ${this.composeSingleMusicLayer(
        this.singleMediaPreview.url,
        this.singleMediaPreview.id
      )}`;
    }
  }

  composeSingleImageLayer(url) {
    return html` <div
      class="image-player-container"
      style="visibility: visible; opacity: 1"
    >
      <div
        class="image-player-content"
        style="background-image:url(${url}); visibility: visible; opacity: 1"
      ></div>
    </div>`;
  }

  composeSingleVideoLayer(url, id) {
    return html` <div
      class="video-player-container ${id}"
      style="visibility: visible; opacity: 1"
    >
      <video
        class="video-player-content single-preview-video"
        preload="auto"
        autoplay
        controls
      >
        <source
          id="${id}"
          class="video-player__source"
          src=${url}
          type="video/mp4"
        />
      </video>
    </div>`;
  }

  composeSingleMusicLayer(url, id) {
    return html` ${this.composeSingleImageLayer(
        'https://img.icons8.com/fluent/512/000000/audio-wave.png'
      )}
      <div
        class="music-player-container"
        style="visibility: hidden; opacity: 0"
      >
        <video class="music-player-content" preload="auto" autoplay controls>
          <source
            id="${id}"
            class="music-player__source"
            src=${url}
            type="video/mp4"
          />
        </video>
      </div>`;
  }

  composeImageLayer(url, ref) {
    return html` <div class="image-player-container ${ref}">
      <div
        class="image-player-content"
        style="background-image:url(${url})"
      ></div>
    </div>`;
  }

  composeVideoLayer(url, ref) {
    return html` <div
      id="${ref}"
      class="video-player-container ${ref}"
      style="visibility: hidden; opacity: 0"
    >
      <video class="video-player-content" preload="auto">
        <source
          id="${ref}"
          class="video-player__source"
          src=${url}
          type="video/mp4"
        />
      </video>
    </div>`;
  }

  composeMusicLayer(url, ref) {
    return html` <div
      class="music-player-container ${ref}"
      style="visibility: hidden; opacity: 0"
    >
      <video class="music-player-content" preload="auto">
        <source
          id="${ref}"
          class="music-player__source"
          src=${url}
          type="video/mp4"
        />
      </video>
    </div>`;
  }

  composeMediaLayersTemplate() {
    if (this.resources.length > 0) {
      const generatedTemplate = this.resources.map(res => {
        if (res.mediaType === 'image') {
          return html`
            ${this.composeImageLayer(res.download_url, res.localRef)}
          `;
        } else if (res.mediaType === 'video') {
          return html` ${this.composeVideoLayer(res.url, res.localRef)} `;
        } else if (res.mediaType === 'sound') {
          return html` ${this.composeMusicLayer(res.url, res.localRef)} `;
        }
      });
      return html`${generatedTemplate}`;
    }
  }

  render() {
    return html`
      <header class="preview-header">
        <h3 class="videoEditorTitle">
          <span>"</span>
          <p class="video-edit-title" contenteditable="true">
            ${this.videoEditorTitle}
          </p>
          <span>"</span>
        </h3>
      </header>
      <div class="media-board-wrapper">
        <div class="media-board-element">
          <div class="media-board-inner">
            ${this.displayLoadingScreen
              ? html`${this.composeLoadingTemplate()} `
              : ''}
            <div class="media-board-inner__scale">
              <div id="playback" class="media-container">
                ${this.resources
                  ? html` ${this.composeMediaLayersTemplate()} `
                  : ''}
                ${this.displayMediaPreview
                  ? html` ${this.composeSingleMediaPreview()} `
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
