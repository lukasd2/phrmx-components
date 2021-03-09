import { css } from 'lit-element';

export const trackEditorStyles = css`
  :host {
    display: grid;
    grid-column: 1/13;
  }
  .track-editor {
    width: 100%;
    height: 30vh;
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
    border: 4px dotted salmon;
    background-color: seashell;
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
`;
