import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      startTime: { type: Number },
      dragEnd: { type: Boolean },
      timer: { type: Number },
      trackElements: { type: Array },
      actualTime: { type: Number },
      timeSegmentWidth: { type: Number },
      timeLineContainerWidth: { type: Number },
      zoomFactor: { type: Number },
      timeEnd: { type: Number },
      timeStart: { type: Number },
    };
  }

  static get styles() {
    return [trackEditorStyles];
  }

  constructor() {
    super();
    this.timelineContainer;
    this.trackEditor;
    this.marker;
    this.zoomFactor = 100;
    this.timeSegmentWidth = 500;
    this.timeLineContainerWidth;
    this.startTime = 0;
    this.dragEnd = true;
    this.timer = 0;
    this.actualTime = 0;
    this.interval;
    this.trackElements = [];
    this.timeStart = 0.01;
    this.timeEnd = 5.0;
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
    window.addEventListener('mouseup', () => {
      this.shadowRoot.removeEventListener(
        'mousemove',
        this._startTimeSegmentResize
      );
    });
  }

  firstUpdated() {
    this.trackEditor = this.shadowRoot.querySelector('.track-editor');
    this.createdTracks = this.shadowRoot.querySelectorAll('.track-element');
    this.timelineContainer = this.shadowRoot.querySelector(
      '.timeline-container'
    );
    this.timeLineContainerWidth = this.timelineContainer.offsetWidth;
    this.marker = this.shadowRoot.getElementById('marker');

    this.createdTracks.forEach(track => {});
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
    if (changedProperties.has('dragEnd')) {
      this._updateDragEnd();
    }
    if (changedProperties.has('zoomFactor')) {
      this._updateZoom();
    }
  }

  _updateZoom() {
    this.timeSegmentWidth = 500 * (this.zoomFactor / 100);
    this.transformValue = this.zoomFactor / 100;

    this.shadowRoot.host.style.setProperty(
      '--zoom-factor',
      this.timeSegmentWidth + 'px'
    );

    this.trackElements.forEach(segment => {
      // problem cannot reassing attribute in this loop. Also it is complex to getComputedStyle of translateX
      const transformValue = segment.getAttribute('datax');
      const duration = segment.getAttribute('duration');
      console.warn(duration);
      if (duration !== null && duration !== this.timeSegmentWidth) {
        let segmentWidth = duration * (this.zoomFactor / 100);
        segment.style.width = segmentWidth + 'px';
      }

      const newTransformValue = transformValue * (this.zoomFactor / 100);

      segment.style.transform = `translateX(${newTransformValue}px)`;
    });
  }

  _updateDragEnd() {
    this.shadowRoot
      .querySelectorAll('.draggable-media')
      .forEach(elem => elem.classList.remove('dragging'));
  }

  // FIXME end.

  _onDragEnterHandler(ev) {
    ev.preventDefault();
    if (
      ev.target.className === 'track-element video-track' ||
      ev.target.className === 'track-element music-track'
    ) {
      ev.target.classList.add('hoverWithDrag');
    }
    if (ev.target.className === 'time-segment') {
      ev.target.classList.add('hoverWithDrag');
    }
  }

  _onDragOverMediaHandler(ev) {
    const isThumbnail = ev.dataTransfer.types.includes('text/uri-list');
    if (isThumbnail) {
      ev.preventDefault('_onDragOverMediaHandler');
      ev.dataTransfer.dropEffect = 'copy';
    }
  }

  _onDragLeaveHandler(ev) {
    ev.target.classList.remove('hoverWithDrag');
  }

  _onDropMediaHandler(ev) {
    ev.preventDefault();
    this.removeDraggingEffectsFromElements();
    ev.target.classList.remove('hoverWithDrag');

    const data = ev.dataTransfer.getData('text/plain');
    const dataSrc = ev.dataTransfer.getData('text/uri-list');

    const dataFromDrag = this.extractDataFromDraggedElement(data);

    const timeSegment = this.createTimeSegment();
    const rowSegment = this.createRowSegment(dataFromDrag, dataSrc);

    //const resizer = document.createElement('div');
    const resizerRight = document.createElement('div');
    resizerRight.classList.add('resizerRight');
    const resizerLeft = document.createElement('div');
    resizerLeft.classList.add('resizerLeft');
    //rowSegment.appendChild(resizerRight);
    //rowSegment.appendChild(resizerLeft);

    //resizer.classList.add('resizer');

    timeSegment.appendChild(rowSegment);
    timeSegment.appendChild(resizerLeft);
    timeSegment.appendChild(resizerRight);

    ev.target.appendChild(timeSegment);

    this.trackElements.push(timeSegment);
  }

  removeDraggingEffectsFromElements() {
    this.shadowRoot
      .querySelectorAll('.draggable-media')
      .forEach(column => column.classList.remove('dragging'));
  }

  extractDataFromDraggedElement(data) {
    const obj = JSON.parse(data);
    return obj;
  }

  createTimeSegment() {
    const newElement = document.createElement('div');
    newElement.classList.add('time-segment');
    newElement.setAttribute('time-start', this.timeStart);
    newElement.setAttribute('time-end', this.timeEnd);
    //newElement.setAttribute('duration', this.timeSegmentWidth);
    newElement.setAttribute('draggable', true);
    this.timeStart = this.timeStart + 5;
    this.timeEnd = this.timeEnd + 5;
    return newElement;
  }

  createRowSegment(data, thumnbailSrc) {
    const rowElement = document.createElement('div');

    for (const [key, value] of Object.entries(data)) {
      rowElement.setAttribute(`${key}`, `${value}`);
    }

    rowElement.classList.add('video-row');
    rowElement.style.background = `url(${thumnbailSrc}) repeat space`;
    rowElement.style.backgroundPosition = `center `;
    rowElement.style.backgroundRepeat = 'repeat space';

    return rowElement;
  }

  secondsCounter = () => {
    const startTime = Date.now();
    this.interval = window.setInterval(() => {
      //this.timer += 1;
      this._updateMarkerPosition2();
      const elapsedTime = Date.now() - startTime;
      const time = (elapsedTime / 1000).toFixed(2);
      this.timer = time;
      this.actualTime = elapsedTime / 10;
    }, 100);
  };

  _updateMarkerPosition = ev => {
    // TODO: hardcoded width of tracks info element on the left side
    const startX = this.timelineContainer.getBoundingClientRect().left - 50;
    const mouseX = ev.pageX - this.timelineContainer.offsetLeft;
    const traslateValue = mouseX - startX;
    if (traslateValue >= 0) {
      this.marker.style.transform = `translateX(${traslateValue}px)`;
      let fn = this.generateScaleFunction(0, this.timeSegmentWidth, 0, 500);
      console.log(fn(traslateValue));
      this.actualTime = fn(traslateValue);
    }
  };

  generateScaleFunction(prevMin, prevMax, newMin, newMax) {
    var offset = newMin - prevMin,
      scale = (newMax - newMin) / (prevMax - prevMin);
    return function (x) {
      return offset + scale * x;
    };
  }

  _updateMarkerPosition2 = () => {
    const container = this.shadowRoot.querySelector('.timeline-container');
    //const startX = ev.target.offsetLeft;
    const startX = container.getBoundingClientRect().left;
    //problem offset starts from 8/9 px, it should be 0
    //const startX = ev.target.offsetLeft;
    const mouseX = this.actualTime;
    this.marker.style.transform = 'translateX(' + (mouseX - startX) + 'px)';
    this.actualTime = parseInt(mouseX, 10);
    //this.actualTime = parseInt(mouseX);
  };

  formatTime(time) {
    let houndreds = time;

    let seconds = Math.floor((houndreds / 100) % 60);

    return seconds + '.' + houndreds.toFixed(0);
  }

  _handleMarkerPress(ev) {
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

  _handleZoom(ev) {
    console.debug('_handleZoom: ', ev.target.value);
    this.zoomFactor = ev.target.value;
  }

  _handleFocus(ev) {
    console.debug('_handleTimeSegmentResize', ev);

    console.debug('_handleTimeSegmentResize', ev.target);
    if (ev.target.className === 'video-row') {
      const row = ev.target;
      row.style.border = '1px solid red';
    }
  }

  _handleTimeSegmentResize = ev => {
    ev.preventDefault();

    if (
      ev.target.className === 'resizerLeft' ||
      ev.target.className === 'resizerRight'
    ) {
      const timeSegment = ev.target.parentNode;
      const minimumSize = 10;

      let original_width = parseFloat(
        getComputedStyle(timeSegment, null)
          .getPropertyValue('width')
          .replace('px', '')
      );

      let original_mouse_x = ev.pageX;

      window.addEventListener('mousemove', _startTimeSegmentResize);
      window.addEventListener('mouseup', _stopResize);
      timeSegment.addEventListener('mouseup', this._stopTimeSegmentResize);
      timeSegment.addEventListener('mouseout', this._stopTimeSegmentResize);

      function _startTimeSegmentResize(ev) {
        const width = original_width + (ev.pageX - original_mouse_x);

        if (width > minimumSize) {
          const startX = timeSegment.offsetLeft;
          console.warn(startX);

          //timeSegment.style.setProperty('--default-lenght', width + 'px');
          timeSegment.style.width = width + 'px';
          timeSegment.setAttribute('time-start', this.timeStart);
          timeSegment.setAttribute('duration', width);
          timeSegment.setAttribute('time-end', this.timeEnd);
        }
      }

      function _stopResize() {
        window.removeEventListener('mousemove', _startTimeSegmentResize);
      }
    } else if (ev.target.className === 'video-row') {
      const track = this.trackEditor;

      const timeSegment = ev.target.parentNode;

      window.addEventListener('mousemove', _startMoving);
      window.addEventListener('mouseup', _stopMoving);

      function _startMoving(ev) {
        const startX =
          timeSegment.offsetLeft + 50 + timeSegment.offsetWidth / 2;

        const mouseX = ev.pageX;
        const translateXValue = mouseX - startX + track.scrollLeft;
        if (translateXValue >= 0) {
          timeSegment.style.transform = 'translateX(' + translateXValue + 'px)';
          timeSegment.setAttribute('datax', translateXValue);
        }
      }

      function _stopMoving() {
        window.removeEventListener('mousemove', _startMoving);
      }
    }
  };

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

  render() {
    return html`
      <div class="timer-controls">
        <input type="button" value="play" @click=${this._handleTimePlay} />
        <input type="button" value="stop" @click=${this._handleTimeStop} />
      </div>
      <h1 id="timer">${this.timer}</h1>
      <h2>${this.formatTime(this.actualTime)}</h2>
      <div>
        <input
          type="range"
          id="zoom"
          name="zoom"
          min="10"
          max="100"
          value="100"
          @input=${this._handleZoom}
        />
        <label for="zoom">Zoom</label>
      </div>
      <section class="tracks">
        <div class="tracks-info">
          <div class="track-type">video</div>
          <div class="track-type">video</div>
          <div class="track-type">music</div>
        </div>
        <div
          class="track-editor"
          @click=${this._handleFocus}
          @mousedown=${this._handleTimeSegmentResize}
        >
          <div class="timeline-container">
            <div
              id="marker"
              class="timeline-marker"
              @mousedown=${this._handleMarkerPress}
            ></div>
            <div
              class="track-element video-track"
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
              @dragend=${this._onDragEnd}
            ></div>
            <div
              class="track-element video-track"
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
              @dragend=${this._onDragEnd}
            ></div>
            <div
              class="track-element music-track"
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
              @dragend=${this._onDragEnd}
            ></div>
          </div>
        </div>
      </section>

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
