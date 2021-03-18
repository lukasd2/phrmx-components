import { css } from 'lit-element';

export const trackEditorStyles = css`
  :host {
    display: grid;
    grid-column: 1/13;
    overflow-x: hidden;
    --zoom-factor: 0px;
  }

  .track-editor {
    background-color: #fff;
    border: 2px solid #1a2b42;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100px;
    width: 100%;
    overflow-x: scroll;
  }

  img {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  img.dragging {
    opacity: 0.5;
    transform: scale(0.8);
  }

  .tracks {
    display: flex;
    flex-direction: row;
    overflow: auto;
  }

  .tracks-info {
    display: flex;
    flex-direction: column;
    width: 50px;
    justify-content: center;
  }

  .tracks-info .track-type {
    height: 150px;
  }

  .video-track {
    display: flex;
    flex-direction: row;
    height: 150px;
    background-color: aliceblue;
    align-items: center;
  }
  .music-track {
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 150px;
    background-color: lightsalmon;
  }
  .video-track.hoverWithDrag img {
    pointer-events: none;
  }
  .music-track.hoverWithDrag img {
    pointer-events: none;
  }
  .hoverWithDrag {
    box-sizing: border-box;
    border: 4px dotted white;
    background-color: tomato;
  }
  .timeline-element {
    width: 75px;
    height: 90%;
    background-color: red;
    margin: 0px 5px;
    display: flex;
  }

  .timeline-element img {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
  }

  .timeline-container {
    position: relative;
    height: 100%;
    width: 10000px;
  }

  .timeline-marker {
    position: absolute;
    top: -10px;
    bottom: 0px;
    width: 4px;
    background: rgb(16, 85, 250) none repeat scroll 0% 0%;
    pointer-events: all;
    cursor: pointer;
    z-index: 100;
  }

  .time-segment {
    display: flex;
    height: 100%;
    /* width: calc(var(--default-lenght) - var(--zoom-factor)); */
    width: var(--zoom-factor);
    align-items: center;
    position: relative;
    --default-lenght: 500px;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .time-segment::before {
    display: none;
    content: attr(time-start);
    top: -10px;
    position: absolute;
    left: -20px;
    pointer-events: none;
    background: #292f33;
    font-size: 11px;
    color: #fff;
    padding: 5px;
    width: 50px;
    text-align: center;
  }

  .time-segment::after {
    display: none;
    content: attr(time-end);
    top: -10px;
    position: absolute;
    right: -20px;
    pointer-events: none;
    background: #292f33;
    font-size: 11px;
    color: #fff;
    padding: 5px;
    width: 50px;
    text-align: center;
  }

  .time-segment.inMotion::before {
    display: block;
  }

  .time-segment.inMotion::after {
    display: block;
  }

  .time-segment.segment-active {
    cursor: move;
  }

  .track-element {
    margin: 20px 0;
  }

  .time-segment:hover {
    cursor: move;
  }

  .video-row {
    height: 75%;
    width: 100%;
    border-radius: 10px;
    position: relative;
  }

  .video-row.selected {
    border: 4px solid blue;
  }

  #zoom {
    /* direction: rtl; */
  }

  .resizerLeft {
    position: absolute;
    user-select: none;
    background: blue;
    width: 25px;
    height: 75%;
    top: 0px;
    left: 10px;
    cursor: w-resize;
    margin: auto;
    bottom: 0px;
  }
  .resizerRight {
    position: absolute;
    background: red;
    user-select: none;
    width: 25px;
    height: 75%;
    top: 0px;
    right: 10px;
    cursor: w-resize;
    margin: auto;
    bottom: 0px;
  }
`;