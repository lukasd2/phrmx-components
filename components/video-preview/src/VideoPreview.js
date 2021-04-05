import { html, LitElement } from 'lit-element';
import { videoPreviewStyles } from './styles/VideoPreviewStyles.js';

export class VideoPreview extends LitElement {
  static get styles() {
    return [videoPreviewStyles];
  }

  static get properties() {
    return {
      VideoEditorTitle: { type: String },
      trackElements: { type: Object },
      playbackArray: { type: Array },
      nextStep: { type: Number },
      playedElement: { type: Number },
      resources: { type: Array },
      singleMediaPreview: { type: Object },
      displayMediaPreview: { type: Boolean },
      displayLoadingScreen: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.VideoEditorTitle = 'This is your new video title';
    this.trackElements = {};
    this.resources = [];
    this.playbackArray = [];
    this.nextStep = 0;
    this.playedElement = 0;
    this.displayMediaPreview = false;
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: VideoPreview successfuly added to the DOM');
  }

  updated(changedProperties) {
    //console.debug('changedProperty', changedProperties); // logs previous values
    if (changedProperties.has('resources')) {
      const playback = this.shadowRoot.getElementById('playback');
      console.debug(playback.children);
      const playbackArray = [...playback.children];
      this.playbackArray = playbackArray;
    }

    if (changedProperties.has('actualTime')) {
      if (this.playbackArray.length > 0) this._updatePlayback();
    }

    if (changedProperties.has('singleMediaPreview')) {
      this._updateBoardPreview();
    }
  }

  _updateBoardPreview() {
    if (
      !this.singleMediaPreview ||
      Object.keys(this.singleMediaPreview).length === 0
    ) {
      this.displayMediaPreview = false;
    } else {
      this.displayMediaPreview = true;
    }
  }

  firstUpdated() {
    this.initializeMediaCanvas();
    const playback = this.shadowRoot.getElementById('playback');
    console.debug(playback.children);
    const playbackArray = [...playback.children];
    this.playbackArray = playbackArray;
  }

  _updatePlayback() {
    if (this.actualTime > this.nextStep && this.playedElement <= 2) {
      console.warn('playedElement1', this.playedElement);
      if (this.playedElement > 0) {
        this.playbackArray[this.playedElement - 1].style.visibility = 'hidden';
        this.playbackArray[this.playedElement - 1].style.opacity = 0;
      }
      let i = this.playedElement;

      this.playbackArray[i].style.visibility = 'visible';
      this.playbackArray[i].style.opacity = 1;
      let startTime;
      if (this.playbackArray[i + 1] !== undefined) {
        startTime = this.playbackArray[i + 1].dataset.start;
      } else {
        startTime = 9999;
      }

      this.playedElement++;
      this.nextStep = startTime;
    }
  }

  initializeMediaCanvas() {
    console.debug('initializeMediaCanvas');
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
    console.warn('composeSingleMediaPreview', this.singleMediaPreview);

    let generatedTemplate;
    if (this.singleMediaPreview.type === 'image') {
      generatedTemplate = this.composeImageLayer(
        this.singleMediaPreview.download_url
      );
    } else {
      // it is a video!
      generatedTemplate = this.composeVideoLayer(
        this.singleMediaPreview.video_files[0].link
      );
    }
    console.warn(generatedTemplate);
    return html`${generatedTemplate}`;
  }

  composeImageLayer(url) {
    return html` <div
      class="image-player-container"
      style="visibility: visible; opacity: 1"
    >
      <div
        class="image-player-content"
        style="background-image:url(${url})"
      ></div>
    </div>`;
  }

  composeVideoLayer(url) {
    return html` <div
      class="video-player-container"
      style="visibility: visible; opacity: 1"
    >
      <video class="video-player-content" preload="auto" autoplay>
        <source src=${url} type="video/mp4" />
      </video>
    </div>`;
  }

  composeMediaLayersTemplate() {
    if (this.resources.length > 0) {
      const generatedTemplate = this.resources.map(res => {
        return html` <div class="image-player-container">
          <div
            class="image-player-content"
            style="background-image:url(${res.response.download_url})"
            data-start=${this.formatTimeFromHoundreths(5000)}
          ></div>
        </div>`;
      });
      return html`${generatedTemplate}`;
    }
  }

  render() {
    return html`
      <h3 class="videoEditorTitle">${this.VideoEditorTitle}</h3>

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

                <!--  <div class="image-player-container">
                  <div class="image-player-content"></div>
                </div>
                <div class="video-player-container" data-start="1000">
                  <video class="video-player-content" preload="none">
                    <source
                      src="https://media.w3.org/2010/05/sintel/trailer.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
                <div class="image-player-container" data-start="2000">
                  <div class="image-player-content2"></div>
                </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
