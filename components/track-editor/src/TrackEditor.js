import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      startTime: { type: Number },
      dragEnd: { type: Boolean },
    };
  }

  static get styles() {
    return [trackEditorStyles];
  }

  constructor() {
    super();
    this.dropVideoArea = '';
    this.dropMusicArea = '';
    this.startTime = 0;
    this.dragEnd = true;
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: TrackEditor successfuly added to the DOM');
  }

  firstUpdated() {
    this.dropVideoArea = this.shadowRoot.querySelector('.video-track');
    this.dropMusicArea = this.shadowRoot.querySelector('.music-track');
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
    if (changedProperties.has('dragEnd')) {
      this._updateDragEnd();
    }
  }

  // FIXME: for separate component test purposes only
  _dragStartItemHandler(ev) {
    this.dragEnd = false;
    const thumnbailElement = ev.target;
    thumnbailElement.classList.add('dragging');

    const itemData = {
      segmenttype: thumnbailElement.dataset.segmenttype,
      segmentname: thumnbailElement.dataset.segmentname,
      start: thumnbailElement.dataset.start,
      end: thumnbailElement.dataset.end,
    };

    ev.dataTransfer.effectAllowed = 'copy';

    ev.dataTransfer.setData('text/plain', JSON.stringify(itemData));
    ev.dataTransfer.setData('text/uri-list', thumnbailElement.src);
  }

  _updateDragEnd() {
    this.shadowRoot
      .querySelectorAll('.draggable-media')
      .forEach(elem => elem.classList.remove('dragging'));
  }

  // FIXME end.

  _onDragEnterHandler(ev) {
    ev.preventDefault();
    if (ev.target.className === 'video-track') {
      this.dropVideoArea.classList.add('hoverWithDrag');
    }
    if (ev.target.className === 'music-track') {
      this.dropMusicArea.classList.add('hoverWithDrag');
    }
  }

  _onDragOverMediaHandler(ev) {
    const isThumbnail = ev.dataTransfer.types.includes('text/uri-list');
    if (isThumbnail) {
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'copy';
    }
  }

  _onDragLeaveHandler(ev) {
    ev.target.classList.remove('hoverWithDrag');
  }

  _onDropMediaHandler(ev) {
    ev.preventDefault();
    this.shadowRoot
      .querySelectorAll('.draggable-media')
      .forEach(column => column.classList.remove('dragging'));
    ev.target.classList.remove('hoverWithDrag');

    const data = ev.dataTransfer.getData('text/plain');
    const dataSrc = ev.dataTransfer.getData('text/uri-list');

    const obj = this.extractDataFromDraggedElement(data);

    const element = document.createElement('div');

    for (const [key, value] of Object.entries(obj)) {
      element.setAttribute(`${key}`, `${value}`);
    }

    element.classList.add('timeline-element');

    const img = document.createElement('img');
    img.src = dataSrc;
    element.appendChild(img);
    ev.target.appendChild(element);
  }

  extractDataFromDraggedElement(data) {
    const obj = JSON.parse(data);
    return obj;
  }

  render() {
    return html`
      <div class="track-editor">
        <div
          class="video-track"
          @dragover="${this._onDragOverMediaHandler}"
          @dragenter="${this._onDragEnterHandler}"
          @dragleave="${this._onDragLeaveHandler}"
          @drop="${this._onDropMediaHandler}"
          @dragend=${this._onDragEnd}
        ></div>
        <div
          class="music-track"
          @dragover="${this._onDragOverMediaHandler}"
          @dragenter="${this._onDragEnterHandler}"
          @dragleave="${this._onDragLeaveHandler}"
          @drop="${this._onDropMediaHandler}"
          @dragend=${this._onDragEnd}
        ></div>
      </div>
      <div style="margin-top: 50px;">
        <img
          class="draggable-media"
          src="https://picsum.photos/id/999/150/200"
          draggable="true"
          alt="example img"
          @dragstart=${this._dragStartItemHandler}
          data-segmentname="filmname"
          data-segmenttype="mp4"
          data-start="00.01"
          data-end="00.50"
          tabindex="0"
        />
      </div>
    `;
  }
}
