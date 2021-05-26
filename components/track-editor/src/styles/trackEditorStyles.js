import { css } from 'lit-element';

export const trackEditorStyles = css`
  :host {
    display: grid;
    grid-column: 1/13;
    overflow-x: hidden;
    --zoom-factor: 0px;
  }

  .track-controls {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .timer-controls {
    font-size: 1.5rem;
    width: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .timer-container {
    margin: 1em;
    display: flex;
    width: 100px;
  }

  .timer-controls .timer-button {
    border: solid 1px #e5e7eb;
    border-radius: 6px;
  }

  .track-editor {
    background-color: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
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
    font-size: 2.5rem;
    display: flex;
    flex-direction: column;
    width: 50px;
    align-items: center;
  }

  .tracks-info .track-type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 50%;
  }

  .video-track {
    display: flex;
    flex-direction: row;
    height: 130px;
    background-color: aliceblue;
    align-items: center;
    position: relative;
  }
  .sound-track {
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 130px;
    background-color: aliceblue;
    position: relative;
  }
  .video-track.hoverWithDrag img {
    pointer-events: none;
  }
  .sound-track.hoverWithDrag img {
    pointer-events: none;
  }
  .hoverWithDrag {
    box-sizing: border-box;
    border: 4px dotted #ecb483;
    background-color: #ffdcbd;
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
    width: 15000px;
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
    position: absolute;
    /* width: calc(var(--default-lenght) - var(--zoom-factor)); */
    width: var(--zoom-factor);
    align-items: center;
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
    font-size: 12px;
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
    font-size: 12px;
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
    margin: 10px 0;
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
    background: rgba(255, 255, 255, 0.3);
    width: 25px;
    height: 75%;
    top: 0px;
    left: 0px;
    cursor: w-resize;
    margin: auto;
    bottom: 0px;
  }
  .resizerRight {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    user-select: none;
    width: 25px;
    height: 75%;
    top: 0px;
    right: 0px;
    cursor: w-resize;
    margin: auto;
    bottom: 0px;
  }

  .context-menu {
    display: none;
    position: absolute;
    z-index: 999;
    border: 1px solid gray;
    border-radius: 5px;
    background-color: #fff;
    padding: 25px;
    font-size: 1.2em;
    font-weight: bold;
  }
  .context-menu--active {
    display: block;
  }

  .context-menu > ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .context-menu:hover {
    background-color: tomato;
    cursor: pointer;
    color: #fff;
  }

  .context-option--delete {
    width: 100%;
  }
`;
