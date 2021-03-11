import { css } from 'lit-element';

export const trackEditorStyles = css`
  :host {
    display: grid;
    grid-column: 1/13;
  }
  .track-editor {
    width: 100%;
    height: 33vh;
    background-color: #fff;
    border: 2px solid #1a2b42;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-height: 100px;
  }

  img {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  img.dragging {
    opacity: 0.5;
    transform: scale(0.8);
  }
  .video-track {
    display: flex;
    flex-direction: row;
    height: 50%;
    background-color: aliceblue;
    align-items: center;
  }
  .music-track {
    display: flex;
    align-items: center;
    flex-direction: row;
    height: 50%;
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
    flex: 1;
    border-right: 2px solid aqua;
    align-items: center;
  }
  .time-segment.segment-active {
    cursor: move;
  }

  .time-segment.segment-active:hover {
  }

  .video-row {
    height: 75%;
    width: 100%;
    border-radius: 10px;
  }

  .video-row.selected {
    border: 4px solid blue;
  }
`;
