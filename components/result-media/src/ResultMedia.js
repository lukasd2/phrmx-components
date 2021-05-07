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
      metadataResponse: { type: Object },
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
      this._emitDraggedItemType(thumbnailElement.dataset.type);

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

  _emitDraggedItemType(type) {
    const event = new CustomEvent('dragged-item-type', {
      detail: {
        draggedElementType: type,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _emitPreviewData(ev) {
    if (ev.target.classList.contains('play-preview-btn')) {
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
    } else if (ev.target.classList.contains('metadata-preview-btn')) {
      const parentRef = ev.target.getAttribute('parent-ref');
      const dialog = this.shadowRoot.querySelector('.dialog-overview');
      dialog.show();
      this._emitMetadataRequest(parentRef);
      const closeButton = dialog.querySelector('sl-button[slot="footer"]');
      closeButton.addEventListener('click', () => {
        dialog.hide();
        this.metadataResponse = [];
      });
    }
  }

  _emitMetadataRequest(parentRef) {
    const event = new CustomEvent('metadata-request', {
      detail: {
        metadataRequest: parentRef,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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
          >
            <sl-tooltip>
              <div slot="content">
                Titolo: <strong>${answer.film_name}</strong><br />
                Tipo: <em>${answer.media_type}</em> <br />
                Durata: <em>${answer.duration}</em> secondi
              </div>
              <sl-card class="card-image">
                <img
                  class="image-thumbnail"
                  slot="image"
                  src=${answer.thumbnail_url}
                  alt="Qui una descrizione a parole della immagine scaricata"
                />
                <div class="card-content ${answer.media_type}">
                  <sl-badge>${answer.media_type}</sl-badge>
                  <sl-icon-button
                    class="metadata-preview-btn"
                    parent-ref=${answer.film_id}
                    name="info-circle"
                    label="Dettagli"
                  ></sl-icon-button>
                  <sl-icon-button
                    class="play-preview-btn"
                    name="play-circle"
                    label="Riproduci"
                  ></sl-icon-button>
                </div>
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
      </ul>
      <sl-dialog
        label="Metadati sulla fonte di provenienza"
        class="dialog-overview"
      >
        <p><div class="metadata-field">Titolo del film:</div> ${
          this.metadataResponse.phx_title
        }</p>
        <p><div class="metadata-field">Identificativo:</div> ${
          this.metadataResponse.id
        }</p>
        <p><div class="metadata-field">Prodotto in:</div> ${
          this.metadataResponse.phx_country
        }</p>
        <p><div class="metadata-field">Diretto da:</div> ${
          this.metadataResponse.phx_director
        }</p>
        <p><div class="metadata-field">Anno di produzione:</div> ${
          this.metadataResponse.phx_year
        }</p>
        <p>
        <div class="metadata-field">Fonte e collocazione:</div> ${
            this.metadataResponse['Archivio di conservazione']
          }.
          ${this.metadataResponse['Note copia']}
        </p>

        <sl-button slot="footer" type="primary">Close</sl-button>
      </sl-dialog>`;
  }
}
