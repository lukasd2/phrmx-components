import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      dragEnd: { type: Boolean },
      timer: { type: Number },
      trackElements: { type: Array },
      actualTime: { type: Number },
      timeSegmentWidth: { type: Number },
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
  }

  firstUpdated() {
    this.trackEditor = this.shadowRoot.querySelector('.track-editor');
    this.createdTracks = this.shadowRoot.querySelectorAll('.track-element');
    this.timelineContainer = this.shadowRoot.querySelector(
      '.timeline-container'
    );
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

  _onDragEnterHandler(ev) {
    ev.preventDefault();
    if (
      ev.target.className === 'track-element video-track' ||
      ev.target.className === 'track-element music-track'
    ) {
      ev.target.classList.add('hoverWithDrag');
    }
    if (
      ev.target.className === 'time-segment' ||
      ev.target.className === 'video-row'
    ) {
      ev.currentTarget.classList.add('hoverWithDrag');
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
    this._updateDragEnd();

    ev.currentTarget.classList.remove('hoverWithDrag');
    console.warn(ev.currentTarget);
    const data = ev.dataTransfer.getData('text/plain');
    const dataThumbnailSrc = ev.dataTransfer.getData('text/uri-list');

    const dataFromDraggedRes = this.extractDataFromDraggedElement(data);

    const timeSegment = this.createDOMTimeSegment(
      dataFromDraggedRes,
      dataThumbnailSrc
    );

    ev.currentTarget.appendChild(timeSegment);

    this.trackElements.push(timeSegment);
  }

  extractDataFromDraggedElement(data) {
    const obj = JSON.parse(data);
    return obj;
  }

  createDOMTimeSegment(data, thumbnailSrc) {
    const newTimeSegment = document.createElement('div');
    newTimeSegment.classList.add('time-segment');

    const dataType = data.type;
    if (dataType === 'image') {
      newTimeSegment.setAttribute('duration', this.timeSegmentWidth);
    }

    for (const [key, value] of Object.entries(data)) {
      newTimeSegment.setAttribute(`${key}`, `${value}`);
    }

    newTimeSegment.setAttribute('time-start', this.timeStart);
    newTimeSegment.setAttribute('time-end', this.timeEnd);
    newTimeSegment.setAttribute('draggable', true);

    this.timeStart = this.timeStart + 5;
    this.timeEnd = this.timeEnd + 5;

    const rowSegment = this.createRowSegment(thumbnailSrc);
    const { resizerLeft, resizerRight } = this.createResizersOnSegment();

    newTimeSegment.appendChild(rowSegment);
    newTimeSegment.appendChild(resizerLeft);
    newTimeSegment.appendChild(resizerRight);

    return newTimeSegment;
  }

  createRowSegment(thumnbailSrc) {
    const rowElement = document.createElement('div');

    rowElement.classList.add('video-row');
    rowElement.style.background = `url(${thumnbailSrc}) repeat space`;
    rowElement.style.backgroundPosition = `center `;
    rowElement.style.backgroundRepeat = 'repeat space';

    return rowElement;
  }

  createResizersOnSegment() {
    const resizerRight = document.createElement('div');
    resizerRight.classList.add('resizerRight');
    const resizerLeft = document.createElement('div');
    resizerLeft.classList.add('resizerLeft');
    return { resizerLeft, resizerRight };
  }

  secondsCounter = () => {
    //https://stackoverflow.com/questions/26329900/how-do-i-display-millisecond-in-my-stopwatch
    let timeBegan = null;
    let timeStopped = null;
    let stoppedDuration = 0;

    if (timeBegan === null) {
      timeBegan = new Date();
    } else {
      clearInterval(this.interval);
    }

    if (timeStopped !== null) {
      stoppedDuration += new Date() - timeStopped;
    }

    const clockRunning = () => {
      let currentTime = new Date();
      let timeElapsed = new Date(currentTime - timeBegan);
      this._updateMarkerPosition2();

      this.actualTime = timeElapsed / 10;
    };

    this.interval = setInterval(clockRunning, 10);
  };

  generateScaleFunction(prevMin, prevMax, newMin, newMax) {
    var offset = newMin - prevMin,
      scale = (newMax - newMin) / (prevMax - prevMin);
    return function (x) {
      return (offset + scale * x).toFixed(2);
    };
  }

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

  _updateMarkerPosition2 = () => {
    const startX = this.timelineContainer.getBoundingClientRect().left - 50;

    const mouseX = this.actualTime;
    const newMouseX = mouseX * (this.zoomFactor / 100);

    this.marker.style.transform = 'translateX(' + (newMouseX - startX) + 'px)';
    this.actualTime = parseInt(newMouseX, 10);
  };

  formatTimeFromHoundreths(time) {
    const leading0 = number => (number < 10 ? '0' : '');

    let mins = parseInt(time / 100 / 60);
    let secs = parseInt((time / 100) % 60);
    let huns = parseInt(time % 100);
    let output = `${leading0(mins)}${mins}:${leading0(secs)}${secs}.${leading0(
      huns
    )}${huns}`;

    return output;
  }

  _handleMarkerPress(ev) {
    this.shadowRoot.addEventListener('mousemove', this._updateMarkerPosition);
  }

  _handleTimePlay(ev) {
    console.debug('_handleTimePlay');
    this.secondsCounter();
  }

  _handleTimeStop(ev) {
    // TODO: to be implemented
    console.debug('_handleTimeStop');
    clearInterval(this.interval);
  }

  _handleTimeReset(ev) {
    // TODO: to be implemented
    console.debug('_handleTimeReset');
    clearInterval(this.interval);
  }

  _handleZoom(ev) {
    console.debug('_handleZoom: ', ev.target.value);
    this.zoomFactor = ev.target.value;
  }

  _handleFocus(ev) {
    console.debug('_handleFocusClick on time segment', ev);

    /*  console.debug('_handleTimeSegmentResize', ev.target);
    if (ev.target.className === 'video-row') {
      const row = ev.target;
      row.style.border = '1px solid red';
    } */
  }

  _handleTimeSegmentResize = ev => {
    ev.preventDefault();
    const RESIZER_LEFT = 'resizerLeft';
    const RESIZER_RIGHT = 'resizerRight';
    if (
      ev.target.className === RESIZER_LEFT ||
      ev.target.className === RESIZER_RIGHT
    ) {
      const timeSegment = ev.target.parentNode;
      const minimumSize = 10;

      let original_width = parseFloat(
        getComputedStyle(timeSegment, null)
          .getPropertyValue('width')
          .replace('px', '')
      );

      let original_x = timeSegment.getBoundingClientRect().left + 50;
      let width;
      let original_mouse_pos = ev.pageX;
      let enlarge;
      if (ev.target.className === RESIZER_LEFT) {
        enlarge = false;
      } else if (ev.target.className === RESIZER_RIGHT) {
        enlarge = true;
      }

      if (!timeSegment.classList.contains('inMotion')) {
        timeSegment.classList.add('inMotion');
      }

      const _startTimeSegmentResize = ev => {
        let scale = this.generateScaleFunction(
          0,
          this.timeSegmentWidth,
          0,
          500
        );
        const startX = timeSegment.getAttribute('datax');

        if (!enlarge) {
          width = original_width - (ev.pageX - original_mouse_pos);
        } else {
          width = original_width + (ev.pageX - original_mouse_pos);
        }
        if (width > minimumSize) {
          //timeSegment.style.setProperty('--default-lenght', width + 'px');

          timeSegment.style.width = width + 'px';
          if (!enlarge && startX >= 0) {
            timeSegment.style.left = ev.pageX - original_mouse_pos + 'px';
            /*     let translateXValue = original_x + (ev.pageX - original_mouse_pos);
            console.warn(translateXValue);
            timeSegment.style.transform = `translateX(${translateXValue}px)`; */
            let test = Number(startX) + Number(ev.pageX - original_mouse_pos);
            timeSegment.setAttribute(
              'time-start',
              this.formatTimeFromHoundreths(scale(test))
            );
            //timeSegment.setAttribute('datax', ev.pageX - 50);
          } else {
            /* timeSegment.setAttribute(
            'time-start',
            this.formatTimeFromHoundreths(
              fn(timeSegment.offsetLeft + translateXValue)
            )
          ); */
            let test = Number(width) + Number(startX);

            timeSegment.setAttribute(
              'time-end',
              this.formatTimeFromHoundreths(scale(test))
            );
            timeSegment.setAttribute('duration', Number(width));
          }
        }
      };

      const _stopResize = () => {
        if (timeSegment.classList.contains('inMotion'));
        timeSegment.classList.remove('inMotion');

        this.shadowRoot.removeEventListener(
          'mousemove',
          _startTimeSegmentResize
        );
      };

      this.shadowRoot.addEventListener('mousemove', _startTimeSegmentResize);
      this.shadowRoot.addEventListener('mouseup', _stopResize);
    } else if (ev.target.className === 'video-row') {
      const track = this.trackEditor;

      const timeSegment = ev.target.parentNode;
      if (!timeSegment.classList.contains('inMotion')) {
        timeSegment.classList.add('inMotion');
      }

      const _startMoving = ev => {
        const startX =
          timeSegment.offsetLeft + 50 + timeSegment.offsetWidth / 2;

        const mouseX = ev.pageX;
        const translateXValue = mouseX - startX + track.scrollLeft;
        if (translateXValue >= 0) {
          let fn = this.generateScaleFunction(0, this.timeSegmentWidth, 0, 500);

          timeSegment.style.transform = 'translateX(' + translateXValue + 'px)';
          timeSegment.setAttribute('datax', translateXValue);
          timeSegment.setAttribute(
            'time-start',
            this.formatTimeFromHoundreths(
              fn(timeSegment.offsetLeft + translateXValue)
            )
          );
          timeSegment.setAttribute(
            'time-end',
            this.formatTimeFromHoundreths(
              fn(
                translateXValue +
                  timeSegment.offsetLeft +
                  timeSegment.offsetWidth
              )
            )
          );
        }
      };

      const _stopMoving = () => {
        if (timeSegment.classList.contains('inMotion'));
        timeSegment.classList.remove('inMotion');

        this.shadowRoot.removeEventListener('mousemove', _startMoving);
      };

      this.shadowRoot.addEventListener('mousemove', _startMoving);
      this.shadowRoot.addEventListener('mouseup', _stopMoving);
    }
  };

  // FIXME: for separate component test purposes only
  _dragStartItemHandler(ev) {
    this.dragEnd = false;
    const thumnbailElement = ev.target;
    thumnbailElement.classList.add('dragging');

    const itemData = {
      type: thumnbailElement.dataset.type,
      segmentname: thumnbailElement.dataset.segmentname,
      clipStart: thumnbailElement.dataset.clipStart,
      clipEnd: thumnbailElement.dataset.clipEnd,
      duration: thumnbailElement.dataset.duration,
      reference: thumnbailElement.dataset.reference,
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
        <input type="button" value="reset" @click=${this._handleTimeReset} />
      </div>
      <h1 id="timer">${this.timer}</h1>
      <h2>${this.formatTimeFromHoundreths(this.actualTime)}</h2>
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
          data-reference="id1"
          data-type="image"
          tabindex="0"
        />
      </div>

      <div style="margin-top: 50px;">
        <img
          class="draggable-media"
          src="https://picsum.photos/id/555/150/200"
          draggable="true"
          alt="example img"
          @dragstart=${this._dragStartItemHandler}
          data-segmentname="filmname"
          data-reference="id2"
          data-type="video"
          data-clipStart="00.01"
          data-clipEnd="00.50"
          data-duration="1000"
          tabindex="0"
        />
      </div>

      <div style="margin-top: 50px;">
        <img
          class="draggable-media"
          src="https://picsum.photos/id/444/150/200"
          draggable="true"
          alt="example img"
          @dragstart=${this._dragStartItemHandler}
          data-segmentname="filmname"
          data-reference="id3"
          data-type="music"
          data-clipStart="00.01"
          data-clipEnd="00.50"
          data-duration="1500"
          tabindex="0"
        />
      </div>
    `;
  }
}
