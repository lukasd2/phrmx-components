import { html, LitElement } from 'lit-element';
import { resultMediaStyles } from './styles/resultMediaStyles.js';

export class ResultMedia extends LitElement {
  static get styles() {
    return [resultMediaStyles];
  }

  static get properties() {
    return {
      answerSet: { type: Array },
      isLoading: { type: Boolean },
      headerTitle: { type: String },
    };
  }

  constructor() {
    super();
    this.answerSet = [];
    this.headerTitle = 'Contenuti cercati';
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: ResultMedia successfuly added to the DOM');
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
  }

  _dragStartItemHandler(ev) {
    let thumbnailElement;
    if (ev.target === 'LI') {
      thumbnailElement = ev.target;
    } else {
      thumbnailElement = ev.target.closest('li');
    }

    const thumbnailImage = thumbnailElement.querySelector('.image-thumbnail');

    thumbnailElement.classList.add('dragging');

    if (thumbnailElement) {
      const itemData = {
        type: thumbnailElement.dataset.type,
        segmentname: thumbnailElement.dataset.segmentname,
        clipstart: thumbnailElement.dataset.clipstart,
        clipend: thumbnailElement.dataset.clipend,
        duration: thumbnailElement.dataset.duration,
        reference: thumbnailElement.dataset.reference,
      };
      ev.dataTransfer.effectAllowed = 'copy';
      ev.dataTransfer.setData('text/plain', JSON.stringify(itemData));
      ev.dataTransfer.setData('text/uri-list', thumbnailImage.src);
    }
  }

  _onDragEnd(ev) {
    ev.preventDefault();
    if (ev.target === 'LI') ev.target.classList.remove('dragging');
    else ev.target.closest('li').classList.remove('dragging');
  }

  _emitPreviewData(ev) {
    if (ev.target.tagName === 'SL-BUTTON') {
      const thumbnailElement = ev.currentTarget;
      const thumbnailElementId = thumbnailElement.getAttribute(
        'data-reference'
      );
      const thumbnailElementStart = thumbnailElement.getAttribute('data-start');
      const thumbnailElementEnd = thumbnailElement.getAttribute('data-end');
      const thumbnailElementType = thumbnailElement.getAttribute('data-type');

      const mediaPreview = {
        id: thumbnailElementId,
        start: thumbnailElementStart,
        end: thumbnailElementEnd,
        type: thumbnailElementType,
      };

      const event = new CustomEvent('result-media-preview', {
        detail: {
          singleMediaPreview: mediaPreview,
        },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    }
  }

  composeHeaderTemplate = headerTitle => {
    const generatedTemplate = html`
      <header class="header">
        <div class="header__headline">
          <h1 class="header__title">${headerTitle}</h1>
        </div>
      </header>
    `;
    return html`${generatedTemplate}`;
  };

  composeThumbnailsTemplate = () => {
    if (this.answerSet) {
      console.warn('answerSet', this.answerSet);
      const generatedTemplate = this.answerSet.map(
        answer => html`
          <li
            @click=${this._emitPreviewData}
            class="thumbnail-element"
            draggable="true"
            data-segmentname="${answer.film_name}"
            data-type="${answer.media_type}"
            data-clipstart="00.50"
            data-clipend="00.50"
            data-reference="${answer.reference}"
            data-duration=${answer.duration ? answer.duration * 100 : '500'}
            tabindex="0"
          >
            <sl-tooltip>
              <div slot="content">
                Titolo: <strong>${answer.film_name}</strong><br />
                Tipo: <em>${answer.media_type}</em>
              </div>
              <sl-card class="card-image">
                <img
                  class="image-thumbnail"
                  slot="image"
                  src=${answer.thumbnail_url}
                  alt="Qui una descrizione a parole della immagine scaricata"
                />
                <sl-button type="primary"
                  ><sl-icon
                    slot="suffix"
                    class="btn-icon"
                    name="play-circle"
                  ></sl-icon
                  >Riproduci</sl-button
                >
              </sl-card>
            </sl-tooltip>
          </li>
        `
      );
      return html`${generatedTemplate}`;
    }
  };

  composeSkeletonThumbnails() {
    let templates = [];
    for (let i = 0; i < 20; i++) {
      templates.push(html`
        <li class="thumbnail-element loading">
          <div class="skeleton-shapes">
            <sl-skeleton class="square"></sl-skeleton>
          </div>
        </li>
      `);
    }
    return html`${templates}`;
  }

  render() {
    return html` ${this.composeHeaderTemplate(this.headerTitle)}
      <ul
        class="thumbnail-list"
        @dragstart=${this._dragStartItemHandler}
        @dragend=${this._onDragEnd}
      >
        ${this.answerSet ? html` ${this.composeThumbnailsTemplate()} ` : ''}
        ${this.isLoading ? html` ${this.composeSkeletonThumbnails()} ` : ''}
        <slot name="searchInProgress"></slot>
      </ul>`;
  }
}
