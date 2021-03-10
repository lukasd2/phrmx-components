import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      startTime: { type: Number },
      dragEnd: { type: Boolean },
      timer: { type: Number },
      actualTime: { type: Number },
    };
  }

  static get styles() {
    return [trackEditorStyles];
  }

  constructor() {
    super();
    this.dropVideoArea;
    this.dropMusicArea;
    this.marker;
    this.startTime = 0;
    this.dragEnd = true;
    this.timer = 0;
    this.actualTime = 0;
    this.interval;
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: TrackEditor successfuly added to the DOM');
    window.addEventListener('mouseup', () => {
      this.shadowRoot.removeEventListener(
        'mousemove',
        this._updateMarkerPosition
      );
    });
  }

  firstUpdated() {
    this.dropVideoArea = this.shadowRoot.querySelector('.video-track');
    this.dropMusicArea = this.shadowRoot.querySelector('.music-track');
    this.marker = this.shadowRoot.getElementById('marker');
    this.divideIntoTimeSegments();
    /* marker.addEventListener('mousedown', ev => {
      console.log(ev.target.offsetLeft);
      const startX = ev.target.offsetLeft;
      const mouseX = ev.clientX;
      ev.target.style.transform = 'translateX(' + (mouseX - startX) + 'px)';
    }); */

    /*    this.timer = this.shadowRoot.getElementById('timer');
    this.secondsCounter();
    this.divideIntoTimeSegments(this.dropVideoArea); */
  }

  divideIntoTimeSegments() {
    const dropVideoArea = this.dropVideoArea;
    console.log(dropVideoArea);
    console.log(getComputedStyle(dropVideoArea).width);
    const segmentWidth = 500;
    const totalWidth = dropVideoArea.offsetWidth;

    let result = Math.floor(totalWidth / segmentWidth);
    console.log('result', result);

    const newElement = document.createElement('div');
    newElement.classList.add('time-segment');
    newElement.setAttribute('time-start', 0);
    newElement.setAttribute('time-end', 5);
    dropVideoArea.appendChild(newElement);

    let timestart = 5.01;
    let timeend = 10;
    for (let i = 1; i < result; i++) {
      let increment = 5;

      const newElement = document.createElement('div');
      newElement.classList.add('time-segment');
      newElement.setAttribute('time-start', timestart.toFixed(2));
      newElement.setAttribute('time-end', timeend);
      timestart += increment;
      timeend += increment;
      dropVideoArea.appendChild(newElement);
    }
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
    if (ev.target.className === 'time-segment') {
      ev.target.classList.add('hoverWithDrag');
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
    if (ev.target.className === 'time-segment') {
      console.debug('time segment!');
      ev.target.style.background = `url(${dataSrc}) repeat space`;
      ev.target.style.backgroundPosition = `center `;
      ev.target.style.backgroundRepeat = 'repeat space';
      ev.target.classList.add('segment-active');
    } else {
      ev.target.appendChild(element);
    }
  }

  extractDataFromDraggedElement(data) {
    const obj = JSON.parse(data);
    return obj;
  }

  secondsCounter = () => {
    console.log(this.timer);

    this.interval = window.setInterval(() => {
      this.timer += 1;
      this._updateMarkerPosition2();
    }, 10);
  };

  _updateMarkerPosition = ev => {
    const container = this.shadowRoot.querySelector('.timeline-container');
    //console.log(this.marker);
    //const startX = ev.target.offsetLeft;
    const startX = container.getBoundingClientRect().left;
    //problem offset starts from 8/9 px, it should be 0
    //const startX = ev.target.offsetLeft;
    const mouseX = ev.clientX;
    /*     console.log('start', startX);
    console.log('mouseX', mouseX); */
    this.marker.style.transform = 'translateX(' + (mouseX - startX) + 'px)';
    this.actualTime = parseInt(mouseX, 10);
  };

  _updateMarkerPosition2 = () => {
    const container = this.shadowRoot.querySelector('.timeline-container');
    //console.log(this.marker);
    //console.log(ev.target.offsetLeft);
    //const startX = ev.target.offsetLeft;
    const startX = container.getBoundingClientRect().left;
    //problem offset starts from 8/9 px, it should be 0
    //const startX = ev.target.offsetLeft;
    const mouseX = this.timer;
    console.log('start', startX);
    console.log('mouseX', mouseX);
    this.marker.style.transform = 'translateX(' + (mouseX - startX) + 'px)';
    this.actualTime = parseInt(mouseX, 10);
  };

  formatTime(time) {
    console.log(time);
    let houndreds = time;

    let seconds = Math.floor((houndreds / 100) % 60);

    return seconds + ':' + houndreds;
  }

  _handleMarkerPress(ev) {
    console.log(this.dropVideoArea);
    this.shadowRoot.addEventListener('mousemove', this._updateMarkerPosition);
  }

  _handleTimePlay(ev) {
    console.debug('_handleTimePlay');
    this.secondsCounter();
  }

  _handleTimeStop(ev) {
    console.debug('_handleTimeStop');
    clearInterval(this.interval);
  }

  render() {
    return html`
      <div class="timer-controls">
        <input type="button" value="play" @click=${this._handleTimePlay} />
        <input type="button" value="stop" @click=${this._handleTimeStop} />
      </div>
      <h1 id="timer">${this.timer}</h1>
      <h2>${this.formatTime(this.actualTime)}</h2>
      <div class="track-editor">
        <div class="timeline-container">
          <div
            id="marker"
            class="timeline-marker"
            @mousedown=${this._handleMarkerPress}
          ></div>
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
