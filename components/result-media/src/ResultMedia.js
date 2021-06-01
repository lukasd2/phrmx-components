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
      hasMetadata: { type: Boolean },
    };
  }

  constructor() {
    super();
    this.headerTitle = 'Library of elements';
    this.answerSet = [];
    this.metadataResponse = {};
    this.hasMetadata = true;
  }

  /* LIFECYCLE METHODS */

  connectedCallback() {
    super.connectedCallback();
    // console.debug('DEBUG: ResultMedia successfuly added to the DOM');
  }

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
        local: thumbnailElement.dataset.local,
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
      const thumbnailOrigin = thumbnailElement.getAttribute('data-local');
      const thumbnailElementType = thumbnailElement.getAttribute('data-type');

      const mediaPreview = {
        id: thumbnailElementId,
        type: thumbnailElementType,
        local: thumbnailOrigin,
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
      const mediaType = ev.target.getAttribute('media-type');
      const thumbnailOrigin = ev.target.getAttribute('is-local');
      const dialog = this.shadowRoot.querySelector('.dialog-overview');
      dialog.show();

      this._emitMetadataRequest(parentRef, mediaType, thumbnailOrigin);

      const closeButton = dialog.querySelector('sl-button[slot="footer"]');
      closeButton.addEventListener('click', () => {
        dialog.hide();
        this.metadataResponse = {};
      });
    }
  }

  _emitMetadataRequest(parentRef, mediaType, local) {
    const event = new CustomEvent('metadata-request', {
      detail: {
        metadataRequest: parentRef,
        mediaType,
        local,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
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

  cleanDescStringFromPexels(string) {
    if (string && string.length > 0) {
      let cleanString = string;

      const cleanTmp = cleanString.split('/')[4].replace(/-/g, ' ');
      const cleanTmp2 = cleanTmp.replace(/[0-9]/g, '').trim();

      cleanString = cleanTmp2;
      return cleanString;
    }
    return '';
  }

  composeVideoLayer(answer) {
    return html`
      <li
        @click=${this._emitPreviewData}
        class="thumbnail-element"
        draggable="true"
        data-segmentname="${answer.item_name}"
        data-type="${answer.media_type}"
        data-reference="${answer.reference}"
        data-local=${answer.local ? true : false}
        data-duration=${answer.duration ? answer.duration * 100 : '500'}
      >
        <sl-tooltip>
          <div slot="content">
            Name:
            ${answer.local
              ? html` <strong>${answer.item_name}</strong><br />`
              : html` <strong
                    >${this.cleanDescStringFromPexels(answer.item_name)}</strong
                  ><br />`}
            Media type: <em>${answer.media_type}</em> <br />
            Duration: <em>${answer.duration}</em> seconds
          </div>
          <sl-card class="card-image">
            <img
              class="image-thumbnail"
              slot="image"
              draggable="false"
              src=${answer.thumbnail_url}
              alt="${answer.item_name}"
            />
            <div class="card-content ${answer.media_type}">
              <sl-badge>${answer.media_type}</sl-badge>
              ${this.hasMetadata
                ? html` <sl-icon-button
                    class="metadata-preview-btn"
                    parent-ref=${answer.reference}
                    media-type=${answer.media_type}
                    is-local=${answer.local ? true : false}
                    name="info-circle"
                    label="Details"
                  ></sl-icon-button>`
                : ``}
              <sl-icon-button
                class="play-preview-btn"
                name="play-circle"
                label="Play"
              ></sl-icon-button>
            </div>
          </sl-card>
        </sl-tooltip>
      </li>
    `;
  }

  composeImageLayer(answer) {
    return html`
      <li
        @click=${this._emitPreviewData}
        class="thumbnail-element"
        draggable="true"
        data-segmentname="${answer.item_name}"
        data-type="${answer.media_type}"
        data-reference="${answer.reference}"
        data-local=${answer.local ? true : false}
      >
        <sl-tooltip>
          <div slot="content">
            Name:
            ${answer.local
              ? html` <strong>${answer.item_name}</strong><br />`
              : html` <strong
                    >${this.cleanDescStringFromPexels(answer.item_name)}</strong
                  ><br />`}
            Media type: <em>${answer.media_type}</em> <br />
          </div>
          <sl-card class="card-image">
            <img
              class="image-thumbnail"
              slot="image"
              draggable="false"
              src=${answer.thumbnail_url}
              alt="${answer.item_name}"
            />
            <div class="card-content ${answer.media_type}">
              <sl-badge>${answer.media_type}</sl-badge>
              ${this.hasMetadata
                ? html` <sl-icon-button
                    class="metadata-preview-btn"
                    parent-ref=${answer.reference}
                    media-type=${answer.media_type}
                    is-local=${answer.local ? true : false}
                    name="info-circle"
                    label="Details"
                  ></sl-icon-button>`
                : ``}
              <sl-icon-button
                class="play-preview-btn"
                name="play-circle"
                label="Riproduci"
              ></sl-icon-button>
            </div>
          </sl-card>
        </sl-tooltip>
      </li>
    `;
  }

  composeThumbnailsTemplate = () => {
    if (this.answerSet) {
      console.debug('answerSet', this.answerSet);
      const generatedTemplate = this.answerSet.map(answer => {
        if (answer.media_type === 'video') {
          return html` ${this.composeVideoLayer(answer)} `;
        }
        if (answer.media_type === 'image') {
          return html` ${this.composeImageLayer(answer)} `;
        }
        if (answer.media_type === 'sound') {
          return html` ${this.composeVideoLayer(answer)} `;
        }
      });

      return html`${generatedTemplate}`;
    }
    return html``;
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

  composeMetadataTemplate() {
    const generatedTemplate = html` <sl-dialog
    label="Item details"
    class="dialog-overview"
  >
    <p><div class="metadata-field">Description</div>${
      this.metadataResponse.description
        ? html` ${this.metadataResponse.description}`
        : html` ${this.cleanDescStringFromPexels(this.metadataResponse.url)}`
    }
    <p><div class="metadata-field">Author</div>${
      this.metadataResponse.userName
    }</p>
    <p><div class="metadata-field">Author page</div>
    <a href=${this.metadataResponse.userProfile} target="_blank">${
      this.metadataResponse.userProfile
    }</a></p>
    <p><div class="metadata-field">Original source</div><a href=${
      this.metadataResponse.url
    } target="_blank">${this.metadataResponse.url}</a></p>
    <p><div class="metadata-field">Media identifier</div> ${
      this.metadataResponse.id
    }</p>
    <p><div class="metadata-field">Native content width</div> ${
      this.metadataResponse.width
    }px</p>
    <p><div class="metadata-field">Native content height</div> ${
      this.metadataResponse.height
    }px</p>
    <sl-button slot="footer" type="primary">Close</sl-button>
  </sl-dialog>`;

    return html`${generatedTemplate}`;
  }

  render() {
    return html`
      ${this.composeHeaderTemplate(this.headerTitle)}
      <ul
        class="thumbnail-list"
        @dragstart=${this._dragStartItemHandler}
        @dragend=${this._onDragEnd}
      >
        <a
          class="media-attribution-header"
          href="https://www.pexels.com"
          target="_blank"
          >Photos and videos provided by Pexels</a
        >
        ${this.answerSet ? html` ${this.composeThumbnailsTemplate()} ` : ''}
        ${this.isLoading ? html` ${this.composeSkeletonThumbnails()} ` : ''}
        <slot name="searchInProgress"></slot>
      </ul>
      ${this.hasMetadata ? html` ${this.composeMetadataTemplate()} ` : ''}
    `;
  }
}
