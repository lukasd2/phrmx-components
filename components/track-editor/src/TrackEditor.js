import { LitElement, html } from 'lit-element';

import { trackEditorStyles } from './styles/trackEditorStyles.js';

const MEDIA_TYPES = {
  VIDEO: 'video',
  SOUND: 'sound',
  IMAGE: 'image',
};

const TRACK_TYPES = {
  VIDEO_TRACK: {
    name: 'video-track',
    it: 'traccia video',
    supportedMedia: [MEDIA_TYPES.VIDEO, MEDIA_TYPES.IMAGE],
  },
  SOUND_TRACK: {
    name: 'sound-track',
    it: 'traccia audio',
    supportedMedia: [MEDIA_TYPES.VIDEO, MEDIA_TYPES.SOUND],
  },
};

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      allTracksElements: { type: Array },
      trackElements: { type: Object },
      actualTime: { type: Number },
      timeSegmentWidth: { type: Number },
      zoomFactor: { type: Number },
      numberOfTrackElements: { type: Number },
      segmentsOnTracks: { type: Array },
      goForLaunch: { type: Boolean },
      hasTrackStateChanged: { type: Boolean },
      draggedElementType: { type: String },
      dragEnd: { type: Boolean },
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
    this.actualTime = 0;
    this.clockOpts = {
      timeBegan: null,
      timeStopped: null,
      stoppedDuration: 0,
      interval: null,
    };
    this.numberOfTrackElements = 0;
    this.allTracksElements = [];
    this.trackElements = {};
    this.segmentsOnTracks = [];
    this.startingPreviews = [];
    this.endingPreviews = [];
    this.goForLaunch = false;
    this.hasTrackStateChanged = false;
    this.draggedElementType = '';
  }

  /* LIFECYCLE METHODS */

  connectedCallback() {
    super.connectedCallback();
    // console.debug('DEBUG: TrackEditor successfuly added to the DOM');

    window.addEventListener('mouseup', () => {
      this.shadowRoot.removeEventListener(
        'mousemove',
        this._updateMarkerPosition
      );
    });
  }

  firstUpdated() {
    this.trackEditor = this.shadowRoot.querySelector('.track-editor');
    const createdTracks = this.shadowRoot.querySelectorAll('.track-element');
    this.timelineContainer = this.shadowRoot.querySelector(
      '.timeline-container'
    );
    this.contextMenu = this.shadowRoot.querySelector('.context-menu');
    this.marker = this.shadowRoot.getElementById('marker');

    createdTracks.forEach(track => {
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
    if (changedProperties.has('dragEnd')) {
      this._updateDragEnd();
    }
    if (changedProperties.has('zoomFactor')) {
      this._updateZoom();
    }
    if (changedProperties.has('actualTime')) {
      if (this.startingPreviews[0]) {
        if (this.actualTime + 0.1 >= this.startingPreviews[0].start) {
          const startPlayingObjects = this.startingPreviews[0];
          this.startingPreviews.shift(); // reverse startingPreviews array and make it pop() as it is faster
          this.triggerStartPreview(startPlayingObjects);
        }
      }

      if (this.endingPreviews[0]) {
        if (this.actualTime + 0.1 >= this.endingPreviews[0].end) {
          const endPlayingObjects = this.endingPreviews[0];
          this.endingPreviews.shift(); // reverse endingPreviews array and make it pop() as it is faster
          this.triggerEndPreview(endPlayingObjects);
        }
      }
    }
    if (changedProperties.has('goForLaunch')) {
      if (this.goForLaunch === true) this.secondsCounter(true);
    }
  }

  /* CUSTOM EVENTS */

  triggerStartPreview(playingObjects) {
    const event = new CustomEvent('start-preview', {
      detail: {
        start: playingObjects,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  dispatchEventForPreview() {
    this.orderElementsByStartDate();
    this.makePreviewController();
    // console.debug('TrackEditor: dispatchEventForPreview', this.segmentsOnTracks);
    const event = new CustomEvent('track-elements', {
      detail: {
        trackElements: this.segmentsOnTracks,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  triggerEndPreview(playingObjects) {
    const event = new CustomEvent('end-preview', {
      detail: {
        end: playingObjects,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  dispatchResumePreview() {
    const event = new CustomEvent('resume-preview', {
      detail: {
        resumeMedia: true,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  dispatchStopPreview() {
    const event = new CustomEvent('stop-preview', {
      detail: {
        stopMedia: true,
      },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  /* END OF CUSTOM EVENTS */

  _updateZoom() {
    this.timeSegmentWidth = 500 * (this.zoomFactor / 100);
    this.shadowRoot.host.style.setProperty(
      '--zoom-factor',
      `${this.timeSegmentWidth}px`
    );

    this.allTracksElements.forEach(segment => {
      const transformValue = segment.getAttribute('datax');
      const duration = segment.getAttribute('duration');
      if (duration !== null && duration !== this.timeSegmentWidth) {
        const segmentWidth = duration * (this.zoomFactor / 100);
        segment.style.width = `${segmentWidth}px`;
      }

      const newTransformValue = transformValue * (this.zoomFactor / 100);

      segment.style.transform = `translateX(${newTransformValue}px)`;
    });
  }

  /* EVENT HANDLERS */

  _updateDragEnd() {
    this.shadowRoot
      .querySelectorAll('.draggable-media')
      .forEach(elem => elem.classList.remove('dragging'));
  }

  isMediaTypeDroppable(track) {
    let currentType;
    if (track.getAttribute('data-track') === TRACK_TYPES.VIDEO_TRACK.name) {
      currentType = TRACK_TYPES.VIDEO_TRACK;
    }
    if (track.getAttribute('data-track') === TRACK_TYPES.SOUND_TRACK.name) {
      currentType = TRACK_TYPES.SOUND_TRACK;
    }
    if (currentType.supportedMedia.includes(this.draggedElementType)) {
      return true;
    } else {
      this.createToastAlert(
        `Spiaciente, l'elemento ${this.draggedElementType} non può essere spostato sulla traccia ${currentType.it}`
      );
      return false;
    }
  }

  createToastAlert(
    message,
    type = 'primary',
    icon = 'info-circle',
    duration = 3000
  ) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      type: type,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${this.escapeHtml(message)}
      `,
    });

    document.body.append(alert);
    return alert.toast();
  }

  escapeHtml(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  secondsCounter = (starts = false, stops = false, resets = false) => {
    // Solution inspired by: https://stackoverflow.com/questions/26329900/how-do-i-display-millisecond-in-my-stopwatch. Other solutions are recommended to enhance the precision. For example non-blocking timer thread through a Web Worker.
    const clockRunning = () => {
      const currentTime = new Date();
      const timeElapsed = new Date(
        currentTime - this.clockOpts.timeBegan - this.clockOpts.stoppedDuration
      );
      this.synchroniseMarkerToTime();

      this.actualTime = timeElapsed / 10;
    };

    const start = () => {
      if (this.clockOpts.timeBegan === null) {
        this.clockOpts.timeBegan = new Date();
      } else {
        clearInterval(this.clockOpts.interval);
      }

      if (this.clockOpts.timeStopped !== null) {
        this.clockOpts.stoppedDuration +=
          new Date() - this.clockOpts.timeStopped;
      }

      this.clockOpts.interval = setInterval(clockRunning, 10);
    };
    const stop = () => {
      if (this.clockOpts.interval) {
        this.clockOpts.timeStopped = new Date();
        clearInterval(this.clockOpts.interval);
        this.clockOpts.interval = undefined;
      }
    };

    const reset = () => {
      clearInterval(this.clockOpts.interval);
      this.clockOpts.interval = undefined;
      this.clockOpts.stoppedDuration = 0;
      this.clockOpts.timeBegan = null;
      this.clockOpts.timeStopped = null;
      this.actualTime = 0;
      this.synchroniseMarkerToTime();
    };
    if (starts === true) start();
    if (stops === true) stop();
    if (resets === true) reset();
  };

  generateScaleFunction(prevMin, prevMax, newMin, newMax) {
    const offset = newMin - prevMin,
      scale = (newMax - newMin) / (prevMax - prevMin);
    return function (x) {
      return Number(offset + scale * x).toFixed(2);
    };
  }

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

    const mins = parseInt(time / 100 / 60);
    const secs = parseInt((time / 100) % 60);
    const huns = parseInt(time % 100);
    const output = `${leading0(mins)}${mins}:${leading0(
      secs
    )}${secs}.${leading0(huns)}${huns}`;

    return output;
  }

  orderElementsByStartDate() {
    this.segmentsOnTracks = this.segmentsOnTracks.sort(
      (prev, next) => prev.start - next.start
    );
  }

  orderElementsByEndDate() {
    const orderedByEndDate = this.segmentsOnTracks.sort(
      (prev, next) => prev.end - next.end
    );
    return orderedByEndDate;
  }

  // generates an ordered by starting date array of previews that have to be played in sequence.
  // generates an ordered by ending date array of previews that have to be ended in sequence.

  makePreviewController() {
    this.goForLaunch = false;
    const previews = this.segmentsOnTracks;
    const startsArray = Object.values(
      previews.reduce((trackElement, { start, localRef }) => {
        if (!trackElement[start])
          trackElement[start] = {
            start,
            elements: [],
          };
        trackElement[start].elements.push({
          localRef,
        });
        return trackElement;
      }, {})
    );
    this.startingPreviews = startsArray;

    const closePreview = this.orderElementsByEndDate();
    const endsArray = Object.values(
      closePreview.reduce((trackElement, { end, localRef }) => {
        if (!trackElement[end])
          trackElement[end] = {
            end,
            elements: [],
          };
        trackElement[end].elements.push({
          localRef,
        });
        return trackElement;
      }, {})
    );
    this.endingPreviews = endsArray;
  }

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
      this.contextMenu.style.left = `${positionX}px`;
      this.contextMenu.style.top = `${positionY}px`;
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

  /* EVENT HANDLERS */

  _handleZoom(ev) {
    this.zoomFactor = ev.target.value;
  }

  _handleTimePlay() {
    if (this.hasTrackStateChanged === false) {
      this.dispatchResumePreview();
    } else {
      this.hasTrackStateChanged = false;
      this.dispatchEventForPreview();
    }
  }

  _handleTimeStop() {
    this.goForLaunch = false;
    this.secondsCounter(false, true);
    this.dispatchStopPreview();
  }

  _handleTimeReset() {
    this.goForLaunch = false;
    this.orderElementsByStartDate();
    this.makePreviewController();
    this.secondsCounter(false, false, true);
    this.dispatchStopPreview();
  }

  // By checking on the ev.target a click on the timeline segment can be implemented.

  _handleClickOnTimelineSegment(ev) {
    // console.debug('_handleClickOnTimelineSegment on time segment', ev);
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
        const scale = this.generateScaleFunction(
          0,
          this.timeSegmentWidth,
          0,
          500
        );

        const datax = timeSegment.getAttribute('datax');
        const dataxScaled = datax * (this.zoomFactor / 100);

        if (resizeLeft) {
          width = original_width - (ev.pageX - original_mouse_pos);
        } else if (resizeRight) {
          width = original_width + (ev.pageX - original_mouse_pos);
        }
        if (width > minimumSize) {
          if (resizeLeft) {
            const startX = timeSegment.offsetLeft + 50;

            const mouseX = ev.pageX;
            const translateXValue = mouseX - startX + track.scrollLeft;
            // FIXME: hardcoded left margin of 50px.
            if (translateXValue >= 0 && ev.pageX > 50) {
              const fn = this.generateScaleFunction(
                0,
                this.timeSegmentWidth,
                0,
                500
              );
              timeSegment.style.width = `${width}px`;

              timeSegment.style.transform = `translateX(${translateXValue}px)`;
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
            timeSegment.style.width = `${width}px`;
            timeSegment.setAttribute(
              'time-end',
              this.formatTimeFromHoundreths(
                scale(Number(width) + Number(dataxScaled))
              )
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

        this.updateTimeSegmentAttributes(timeSegment);
        this.hasTrackStateChanged = true;

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
        // FIXME: hardcoded left margin of 50px.
        const startX =
          timeSegment.offsetLeft + 50 + timeSegment.offsetWidth / 2;

        const mouseX = ev.pageX;
        const translateXValue = mouseX - startX + track.scrollLeft;
        if (translateXValue >= 0) {
          let fn = this.generateScaleFunction(0, this.timeSegmentWidth, 0, 500);

          timeSegment.style.transform = `translateX(${translateXValue}px)`;
          timeSegment.setAttribute('datax', fn(translateXValue));
          timeSegment.setAttribute('start', translateXValue);
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
        // This could be a place to implement collisions when moving an element and releasing in on top of another.
        // this.findCollisions(timeSegment); // Can be done like by checking overlapping x coord. values: https://stackoverflow.com/questions/47667827/javascript-check-numeric-range-overlapping-in-array
        this.updateTimeSegmentAttributes(timeSegment);
        this.hasTrackStateChanged = true;
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

    const segmentsOnTracks = this.segmentsOnTracks;

    const datax = timeSegment.getAttribute('datax');
    const duration = timeSegment.getAttribute('duration');

    const isEqualToLocalReference = segment => segment.localRef === localRef;

    const currentSegmentIndex = elementsList.findIndex(isEqualToLocalReference);

    const result = segmentsOnTracks.findIndex(isEqualToLocalReference);

    const timeStart = this.formatTimeFromHoundreths(datax);
    const timeEndInHoundreds = Number(datax) + Number(duration);
    const timeEnd = this.formatTimeFromHoundreths(
      Number(datax) + Number(duration)
    );

    segmentsOnTracks[result] = {
      ...segmentsOnTracks[result],
      start: datax,
      end: timeEndInHoundreds,
      timeStart: timeStart,
      timeEnd: timeEnd,
    };

    const trackStart = this.trackElements[trackId].timeStart;
    const trackEnd = this.trackElements[trackId].timeEnd;

    if (timeStart < trackStart)
      this.trackElements[trackId].timeStart = timeStart;
    if (timeEndInHoundreds > trackEnd || timeEndInHoundreds < trackEnd) {
      this.trackElements[trackId].timeEnd = timeEndInHoundreds;
    }

    elementsList[currentSegmentIndex] = {
      ...elementsList[currentSegmentIndex],
      timeStart: timeStart,
      timeEnd: timeEnd,
    };
  }

  _handleMarkerPress() {
    this.shadowRoot.addEventListener('mousemove', this._updateMarkerPosition);
  }

  _updateMarkerPosition = ev => {
    // FIXME: hardcoded left margin of 50px.
    const startX = this.timelineContainer.getBoundingClientRect().left - 50;
    const mouseX = ev.pageX - this.timelineContainer.offsetLeft;
    const traslateValue = mouseX - startX;
    if (traslateValue >= 0) {
      this.marker.style.transform = `translateX(${traslateValue}px)`;
      const fn = this.generateScaleFunction(0, this.timeSegmentWidth, 0, 500);
      this.actualTime = fn(traslateValue);
    }
  };

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

  _onDragEnterHandler(ev) {
    ev.preventDefault();
    if (
      ev.target.className === `track-element ${TRACK_TYPES.VIDEO_TRACK.name}` ||
      ev.target.className === `track-element ${TRACK_TYPES.SOUND_TRACK.name}`
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

  _onDropMediaHandler(ev) {
    ev.preventDefault();
    this._updateDragEnd();
    ev.currentTarget.classList.remove('hoverWithDrag');

    const validType = this.isMediaTypeDroppable(ev.currentTarget);
    if (!validType) {
      return this.cancelDrop(ev);
    }

    const currentTrackId = ev.currentTarget.id;
    const trackType = ev.currentTarget.getAttribute('data-track');

    const trackObject = this.trackElements[currentTrackId];

    const data = ev.dataTransfer.getData('text/plain');
    const dataThumbnailSrc = ev.dataTransfer.getData('text/uri-list');
    const dataFromDraggedRes = this.extractDataFromDraggedElement(data);

    let timeSegment;
    if (trackType === TRACK_TYPES.VIDEO_TRACK.name) {
      timeSegment = this.createDOMTimeSegment(
        dataFromDraggedRes,
        dataThumbnailSrc
      );
    } else if (trackType === TRACK_TYPES.SOUND_TRACK.name) {
      timeSegment = this.createDOMTimeSegment(dataFromDraggedRes);
    }

    const duration = timeSegment.getAttribute('duration');

    if (trackObject.elements.length === 0) {
      trackObject.timeStart = Number(trackObject.timeEnd);
      trackObject.timeEnd = Number(duration);
      timeSegment.setAttribute(
        'time-start',
        this.formatTimeFromHoundreths(trackObject.timeStart)
      );
      timeSegment.setAttribute('datax', trackObject.timeStart);

      timeSegment.setAttribute('start', trackObject.timeStart);
      timeSegment.setAttribute(
        'time-end',
        this.formatTimeFromHoundreths(trackObject.timeEnd)
      );
    } else {
      trackObject.timeStart = Number(trackObject.timeEnd);
      trackObject.timeEnd += Number(duration);
      timeSegment.setAttribute(
        'time-start',
        this.formatTimeFromHoundreths(trackObject.timeStart)
      );
      timeSegment.setAttribute('start', trackObject.timeStart);
      timeSegment.setAttribute('datax', trackObject.timeStart);

      timeSegment.setAttribute(
        'time-end',
        this.formatTimeFromHoundreths(trackObject.timeEnd)
      );
    }
    const transformValue = trackObject.timeStart * (this.zoomFactor / 100);
    const segmentWidth = duration * (this.zoomFactor / 100);
    timeSegment.style.width = `${segmentWidth}px`;
    timeSegment.style.transform = `translateX(${transformValue}px)`;

    timeSegment.setAttribute('trackRef', currentTrackId);

    ev.currentTarget.appendChild(timeSegment);
    this.incrementNumberOfTrackElements();
    this.allTracksElements.push(timeSegment);

    this.hasTrackStateChanged = true;
    this._handleTimeStop();

    const trackElement = this.createObjectForPreviewRequest(timeSegment);
    this.trackElements[currentTrackId].elements.push(trackElement);
    this.segmentsOnTracks.push(trackElement);
  }

  // Here error handling can be adopted if a not recognised media type is dropped into the tracks

  cancelDrop() {
    console.debug('Generate message about wrong data type');
  }

  extractDataFromDraggedElement(data) {
    const obj = JSON.parse(data);
    return obj;
  }

  createDOMTimeSegment(data, thumbnailSrc) {
    if (arguments.length === 1 || thumbnailSrc === undefined) {
      thumbnailSrc = TRACK_TYPES.SOUND_TRACK;
    }
    const newTimeSegment = document.createElement('div');
    newTimeSegment.classList.add('time-segment');

    const rowSegment = this.createRowSegment(thumbnailSrc);

    newTimeSegment.appendChild(rowSegment);

    if (data.type === MEDIA_TYPES.IMAGE) {
      newTimeSegment.setAttribute('duration', this.timeSegmentWidth);
      const { resizerLeft, resizerRight } = this.createResizersOnSegment();
      newTimeSegment.appendChild(resizerLeft);
      newTimeSegment.appendChild(resizerRight);
    }

    for (const [key, value] of Object.entries(data)) {
      newTimeSegment.setAttribute(`${key}`, `${value}`);
    }
    return newTimeSegment;
  }

  createRowSegment(thumnbailSrc) {
    const rowElement = document.createElement('div');
    rowElement.classList.add('video-row');

    if (thumnbailSrc === TRACK_TYPES.SOUND_TRACK) {
      thumnbailSrc = '/assets/custom/audio-wave.png';
      rowElement.style.background = `url(${thumnbailSrc})`;
      rowElement.style.backgroundPosition = `center `;
      rowElement.style.backgroundRepeat = 'repeat-x ';
    } else {
      rowElement.style.background = `url(${thumnbailSrc}) repeat space`;
      rowElement.style.backgroundPosition = `center `;
      rowElement.style.backgroundRepeat = 'repeat space';
    }
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
      start: DOMtimeSegment.getAttribute('start'),
      end: (
        Number(DOMtimeSegment.getAttribute('start')) +
        Number(DOMtimeSegment.getAttribute('duration'))
      ).toFixed(2),
      duration: DOMtimeSegment.getAttribute('duration'),
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
    this.numberOfTrackElements += 1;
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

    const elementsList = this.trackElements[trackRef].elements; // FIXME seems it does not work properly

    const isEqualToLocalReference = segment => segment.localRef === localRef;

    const currentSegmentIndex = elementsList.findIndex(isEqualToLocalReference);
    elementsList.splice(currentSegmentIndex, 1);

    const segmentIndexForPreview = this.segmentsOnTracks.findIndex(
      isEqualToLocalReference
    );
    this.segmentsOnTracks.splice(segmentIndexForPreview, 1);
    this.hasTrackStateChanged = true;
  }

  toggleMenuOnff = activeClass => {
    if (this.contextMenuState !== 0) {
      this.contextMenuState = 0;
      this.contextMenu.classList.remove(activeClass);
    }
  };

  render() {
    return html`
      <div class="track-controls">
        <div>
          <label for="zoom">Zoom</label>
          <input
            type="range"
            id="zoom"
            name="zoom"
            min="10"
            max="100"
            value="100"
            @input=${this._handleZoom}
          />
        </div>
        <div class="timer-controls">
          <sl-tooltip content="Riproduci">
            <sl-icon-button
              class="timer-button timer__play"
              name="play-circle"
              label="Riproduci"
              @click=${this._handleTimePlay}
            ></sl-icon-button>
          </sl-tooltip>
          <sl-tooltip content="Metti in pausa">
            <sl-icon-button
              class="timer-button timer__pause"
              name="pause-circle"
              label="Metti in pausa"
              @click=${this._handleTimeStop}
            ></sl-icon-button>
          </sl-tooltip>
          <div class="timer-container">
            <span>${this.formatTimeFromHoundreths(this.actualTime)}</span>
          </div>
          <sl-tooltip content="Riproduci dall'inzio">
            <sl-icon-button
              class="timer-button timer__restart"
              name="arrow-repeat"
              label="Riproduci dall'inzio"
              @click=${this._handleTimeReset}
            ></sl-icon-button>
          </sl-tooltip>
        </div>
      </div>
      <section class="tracks">
        <div class="tracks-info">
          <div class="track-type">
            <sl-icon name="camera-reels" label="video track"></sl-icon>
          </div>
          <div class="track-type">
            <sl-icon name="music-note-list" label="video track"></sl-icon>
          </div>
        </div>
        <div
          class="track-editor"
          @click=${this._handleClickOnTimelineSegment}
          @mousedown=${this._handleTimeSegmentResize}
        >
          <div class="timeline-container">
            <div
              id="marker"
              class="timeline-marker"
              @mousedown=${this._handleMarkerPress}
            ></div>
            <div
              class="track-element ${TRACK_TYPES.VIDEO_TRACK.name}"
              id="videoTrack1"
              data-track=${TRACK_TYPES.VIDEO_TRACK.name}
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
            ></div>

            <div
              class="track-element ${TRACK_TYPES.SOUND_TRACK.name}"
              id="musicTrack1"
              data-track=${TRACK_TYPES.SOUND_TRACK.name}
              @dragover="${this._onDragOverMediaHandler}"
              @dragenter="${this._onDragEnterHandler}"
              @dragleave="${this._onDragLeaveHandler}"
              @drop="${this._onDropMediaHandler}"
            ></div>
          </div>
        </div>
      </section>
      <nav class="context-menu" @click="${this._deleteTimeSegment}">
        <ul>
          <li class="context-option--delete">Delete</li>
        </ul>
      </nav>
    `;
  }
}
