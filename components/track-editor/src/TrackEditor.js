import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      dragEnd: { type: Boolean },
      timer: { type: Number },
      allTracksElements: { type: Array },
      trackElements: { type: Object },
      actualTime: { type: Number },
      timeSegmentWidth: { type: Number },
      zoomFactor: { type: Number },
      numberOfTrackElements: { type: Number },
    };
  }

  static get styles() {
    return [trackEditorStyles];
  }

  constructor() {
    super();
    this.timelineContainer;
    this.contextMenu;
    this.contextMenuState = 0;
    this.trackEditor;
    this.marker;
    this.zoomFactor = 100;
    this.timeSegmentWidth = 500;
    this.dragEnd = true;
    this.timer = 0;
    this.actualTime = 0;
    this.interval;
    this.numberOfTrackElements = 0;
    this.allTracksElements = [];
    this.trackElements = {};
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

  toggleMenuOnff = activeClass => {
    if (this.contextMenuState !== 0) {
      this.contextMenuState = 0;
      this.contextMenu.classList.remove(activeClass);
    }
  };

  _manageContextMenu(ev) {
    ev.preventDefault();

    const activeClass = 'context-menu--active';

    const toggleMenuOn = () => {
      if (this.contextMenuState !== 1) {
        this.contextMenuState = 1;
        this.contextMenu.classList.add(activeClass);
      }
    };

    const positionContextMenu = () => {
      let positionX = 0;
      let positionY = 0;

      if (ev.pageX || ev.pageY) {
        positionX = ev.pageX;
        positionY = ev.pageY;
      }
      this.contextMenu.style.left = positionX + 'px';
      this.contextMenu.style.top = positionY + 'px';
      const localRef = ev.target.parentNode.getAttribute('localRef');
      const trackRef = ev.target.parentNode.getAttribute('trackRef');
      this.contextMenu.setAttribute('localRef', localRef);
      this.contextMenu.setAttribute('trackRef', trackRef);
    };

    const RESIZER_LEFT = 'resizerLeft';
    const RESIZER_RIGHT = 'resizerRight';
    if (
      ev.target.className === RESIZER_LEFT ||
      ev.target.className === RESIZER_RIGHT ||
      ev.target.className === 'video-row'
    ) {
      toggleMenuOn();
      positionContextMenu();
    } else {
      this.toggleMenuOnff(activeClass);
    }
  }

  firstUpdated() {
    this.trackEditor = this.shadowRoot.querySelector('.track-editor');
    this.createdTracks = this.shadowRoot.querySelectorAll('.track-element');
    this.timelineContainer = this.shadowRoot.querySelector(
      '.timeline-container'
    );
    this.contextMenu = this.shadowRoot.querySelector('.context-menu');
    this.marker = this.shadowRoot.getElementById('marker');

    this.createdTracks.forEach(track => {
      this.trackElements[track.id] = {
        timeStart: 0,
        timeEnd: 0,
        elements: [],
      };
    });
    this.shadowRoot.addEventListener('contextmenu', ev =>
      this._manageContextMenu(ev)
    );
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

    this.allTracksElements.forEach(segment => {
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
    const currentTrackId = ev.currentTarget.id;

    const trackObject = this.trackElements[currentTrackId];

    const data = ev.dataTransfer.getData('text/plain');
    const dataThumbnailSrc = ev.dataTransfer.getData('text/uri-list');

    const dataFromDraggedRes = this.extractDataFromDraggedElement(data);

    const timeSegment = this.createDOMTimeSegment(
      dataFromDraggedRes,
      dataThumbnailSrc
    );

    const duration = timeSegment.getAttribute('duration');

    if (trackObject.elements.length === 0) {
      trackObject.timeStart = Number(trackObject.timeEnd);
      trackObject.timeEnd = Number(duration);
      timeSegment.setAttribute(
        'time-start',
        this.formatTimeFromHoundreths(trackObject.timeStart)
      );
      timeSegment.setAttribute(
        'time-end',
        this.formatTimeFromHoundreths(trackObject.timeEnd)
      );
    } else {
      trackObject.timeStart = Number(trackObject.timeEnd) + 1;
      trackObject.timeEnd += Number(duration);
      timeSegment.setAttribute(
        'time-start',
        this.formatTimeFromHoundreths(trackObject.timeStart)
      );
      timeSegment.setAttribute(
        'time-end',
        this.formatTimeFromHoundreths(trackObject.timeEnd)
      );
    }
    const segmentWidth = duration * (this.zoomFactor / 100);
    timeSegment.style.width = segmentWidth + 'px';

    timeSegment.setAttribute('trackRef', currentTrackId);

    ev.currentTarget.appendChild(timeSegment);
    this.incrementNumberOfTrackElements();
    this.allTracksElements.push(timeSegment);

    const trackElement = this.createObjectForPreviewRequest(timeSegment);
    this.trackElements[currentTrackId].elements.push(trackElement);
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

  createObjectForPreviewRequest(DOMtimeSegment) {
    const localRef = `${DOMtimeSegment.getAttribute('type')}${
      this.numberOfTrackElements
    }`;
    DOMtimeSegment.setAttribute('localRef', localRef);

    const trackElement = {
      localRef: DOMtimeSegment.getAttribute('localRef'),
      trackRef: DOMtimeSegment.getAttribute('trackRef'),
      mediaType: DOMtimeSegment.getAttribute('type'),
      identificator: DOMtimeSegment.getAttribute('reference'),
      timeStart: DOMtimeSegment.getAttribute('time-start'),
      timeEnd: DOMtimeSegment.getAttribute('time-end'),
    };

    return trackElement;
  }

  incrementNumberOfTrackElements() {
    this.numberOfTrackElements = this.numberOfTrackElements + 1;
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
      this.synchroniseMarkerToTime();

      this.actualTime = timeElapsed / 10;
    };

    this.interval = setInterval(clockRunning, 10);
  };

  generateScaleFunction(prevMin, prevMax, newMin, newMax) {
    var offset = newMin - prevMin,
      scale = (newMax - newMin) / (prevMax - prevMin);
    return function (x) {
      return Number(offset + scale * x).toFixed(2);
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
      this.actualTime = fn(traslateValue);
    }
  };

  synchroniseMarkerToTime = () => {
    // TODO: hardcoded width of tracks info element on the left side
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
    this.dispatchEventForPreview();
    this.secondsCounter();
  }

  dispatchEventForPreview() {
    const event = new CustomEvent('track-elements', {
      detail: {
        trackElements: this.trackElements,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _handleTimeStop(ev) {
    // TODO: to be implemented
    console.debug('_handleTimeStop');
    clearInterval(this.interval);
  }

  _handleTimeReset(ev) {
    // TODO: to be implemented
    console.debug('_handleTimeReset');
    this.dispatchEventForPreview();

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
      const minimumSize = 50;

      let original_width = parseFloat(
        getComputedStyle(timeSegment, null)
          .getPropertyValue('width')
          .replace('px', '')
      );
      const track = this.trackEditor;

      let width;
      let original_mouse_pos = ev.pageX;
      let resizeLeft = false;
      let resizeRight = false;
      if (ev.target.className === RESIZER_LEFT) {
        resizeLeft = true;
      } else if (ev.target.className === RESIZER_RIGHT) {
        resizeRight = true;
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

        if (resizeLeft) {
          const startX = timeSegment.offsetLeft + 50;
          const mouseX = ev.pageX;

          width = original_width - (ev.pageX - original_mouse_pos);
        } else if (resizeRight) {
          width = original_width + (ev.pageX - original_mouse_pos);
        }
        // Make resize with left or right resizer element
        if (width > minimumSize) {
          timeSegment.style.width = width + 'px';

          if (resizeLeft) {
            const startX = timeSegment.offsetLeft + 50;

            const mouseX = ev.pageX;
            const translateXValue = mouseX - startX + track.scrollLeft;
            if (translateXValue >= 0) {
              let fn = this.generateScaleFunction(
                0,
                this.timeSegmentWidth,
                0,
                500
              );
              console.warn('width', width);
              timeSegment.style.transform =
                'translateX(' + translateXValue + 'px)';
              timeSegment.setAttribute('datax', translateXValue);
              timeSegment.setAttribute(
                'time-start',
                this.formatTimeFromHoundreths(
                  fn(timeSegment.offsetLeft + translateXValue)
                )
              );
              let noDecimalsScaledWidth = scale(Number(width));
              noDecimalsScaledWidth = Number(noDecimalsScaledWidth).toFixed(0);
              timeSegment.setAttribute('duration', noDecimalsScaledWidth);
            }
          } else if (resizeRight) {
            timeSegment.setAttribute(
              'time-end',
              this.formatTimeFromHoundreths(scale(Number(width)))
            );

            let noDecimalsScaledWidth = scale(Number(width));
            noDecimalsScaledWidth = Number(noDecimalsScaledWidth).toFixed(0);
            timeSegment.setAttribute('duration', noDecimalsScaledWidth);
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
        console.warn('startMoving');
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
        console.warn('stopMoving');

        this.updateTimeSegmentAttributes(timeSegment);
        if (timeSegment.classList.contains('inMotion'));
        timeSegment.classList.remove('inMotion');

        this.shadowRoot.removeEventListener('mousemove', _startMoving);
        this.shadowRoot.removeEventListener('mouseup', _stopMoving);
      };

      this.shadowRoot.addEventListener('mousemove', _startMoving);
      this.shadowRoot.addEventListener('mouseup', _stopMoving);
    }
  };

  updateTimeSegmentAttributes(timeSegment) {
    const localRef = timeSegment.getAttribute('localref');
    const trackId = timeSegment.getAttribute('trackRef');
    const elementsList = this.trackElements[trackId].elements;

    const datax = timeSegment.getAttribute('datax');
    const duration = timeSegment.getAttribute('duration');

    const isEqualToLocalReference = segment => segment.localRef === localRef;

    const currentSegmentIndex = elementsList.findIndex(isEqualToLocalReference);

    const timeStart = this.formatTimeFromHoundreths(datax);
    const timeEnd = this.formatTimeFromHoundreths(
      Number(datax) + Number(duration)
    );

    elementsList[currentSegmentIndex] = {
      ...elementsList[currentSegmentIndex],
      timeStart: timeStart,
      timeEnd: timeEnd,
    };
  }

  _deleteTimeSegment(ev) {
    ev.preventDefault();
    const trackRef = ev.currentTarget.getAttribute('trackRef');
    const localRef = ev.currentTarget.getAttribute('localRef');

    const parent = this.shadowRoot.getElementById(trackRef);

    const child = parent.querySelector(`[localRef=${localRef}]`);

    parent.removeChild(child);
    const activeClass = 'context-menu--active';
    this.toggleMenuOnff(activeClass);

    const elementsList = this.trackElements[trackRef].elements;

    const isEqualToLocalReference = segment => segment.localRef === localRef;

    const currentSegmentIndex = elementsList.findIndex(isEqualToLocalReference);
    elementsList.splice(currentSegmentIndex, 1);
  }

  // FIXME: for separate component test purposes only
  _dragStartItemHandler(ev) {
    this.dragEnd = false;
    const thumnbailElement = ev.target;
    thumnbailElement.classList.add('dragging');

    const itemData = {
      type: thumnbailElement.dataset.type,
      segmentname: thumnbailElement.dataset.segmentname,
      clipstart: thumnbailElement.dataset.clipstart,
      clipend: thumnbailElement.dataset.clipend,
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
              id="videoTrack1"
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
              @dragend=${this._onDragEnd}
            ></div>

            <div
              class="track-element music-track"
              id="musicTrack1"
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
              @dragend=${this._onDragEnd}
            ></div>
          </div>
        </div>
      </section>

      <nav class="context-menu" @click="${this._deleteTimeSegment}">
        <ul>
          <li class="context-option--delete">Delete</li>
        </ul>
      </nav>

      <div style="margin-top: 50px; display:flex; flex-direction: row;">
        <div>
          <img
            class="draggable-media"
            src="https://picsum.photos/id/999/150/200"
            draggable="true"
            alt="example img"
            @dragstart=${this._dragStartItemHandler}
            data-segmentname="filmname"
            data-reference="999"
            data-type="image"
            tabindex="0"
          />
        </div>

        <div>
          <img
            class="draggable-media"
            src="https://picsum.photos/id/555/150/200"
            draggable="true"
            alt="example img"
            @dragstart=${this._dragStartItemHandler}
            data-segmentname="filmname"
            data-reference="555"
            data-type="video"
            data-clipstart="00.01"
            data-clipend="00.50"
            data-duration="1000"
            tabindex="0"
          />
        </div>

        <div>
          <img
            class="draggable-media"
            src="https://picsum.photos/id/444/150/200"
            draggable="true"
            alt="example img"
            @dragstart=${this._dragStartItemHandler}
            data-segmentname="filmname"
            data-reference="444"
            data-type="music"
            data-clipstart="00.01"
            data-clipend="00.50"
            data-duration="1500"
            tabindex="0"
          />
        </div>
      </div>
    `;
  }
}
