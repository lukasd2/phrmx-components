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
    this.headerTitle = 'Library of elements';
    this.answerSet = [];
  }

  /* LIFECYCLE METHODS */

  connectedCallback() {
    super.connectedCallback();
    // console.debug('DEBUG: ResultMedia successfuly added to the DOM');
  }

  /* updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values (useful for component debug)
  } */

  /* EVENT HANDLERS */

  _dragStartItemHandler(ev) {
    // The target depends on the css strucuture, in this case it is the top-parent <li>
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

  // Emit an event that specifies the type (for example: video, image etc) of the currently dragged item.

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

  // Emit an event containing the item data when users click on the "play" button.

  _emitPreviewData(ev) {
    if (ev.target.classList.contains('play-preview-btn')) {
      const thumbnailElement = ev.currentTarget;
      const thumbnailElementId = thumbnailElement.getAttribute(
        'data-reference'
      );
      const thumbnailElementType = thumbnailElement.getAttribute('data-type');

      const mediaPreview = {
        id: thumbnailElementId,
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

  /* HTML/lit-html TEMPLATES */

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
      // console.debug('answerSet', this.answerSet);
      const generatedTemplate = this.answerSet.map(
        answer => html`
          <li
            @click=${this._emitPreviewData}
            class="thumbnail-element"
            draggable="true"
            data-segmentname="${answer.item_name}"
            data-type="${answer.media_type}"
            data-reference="${answer.reference}"
            data-duration=${answer.duration ? answer.duration * 100 : '500'}
          >
            <sl-tooltip>
              <div slot="content">
                Titolo: <strong>${answer.item_name}</strong><br />
                Tipo: <em>${answer.media_type}</em> <br />
                Durata: <em>${answer.duration}</em> secondi
              </div>
              <sl-card class="card-image">
                <img
                  class="image-thumbnail"
                  slot="image"
                  draggable="false"
                  src=${answer.thumbnail_url}
                  alt="Qui una descrizione a parole della immagine scaricata"
                />
                <div class="card-content ${answer.media_type}">
                  <sl-badge>${answer.media_type}</sl-badge>
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
    const templates = [];
    for (let i = 0; i < 10; i + 1) {
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
