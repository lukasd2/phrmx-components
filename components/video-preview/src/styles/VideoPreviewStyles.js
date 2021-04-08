import { css } from 'lit-element';

export const videoPreviewStyles = css`
  :host {
    grid-column: 1/7;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
  }

  .preview-header {
    display: flex;
    justify-content: center;
  }

  .videoEditorTitle {
    text-align: center;
    padding: 1em;
    display: flex;
    flex-direction: row;
    align-items: baseline;
  }

  .media-board-wrapper {
    position: relative;
    margin: auto;
  }

  .media-board-element {
    background: rgb(255, 255, 255) none repeat scroll 0% 0%;
    box-shadow: var(--sl-shadow-x-large);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-board-inner {
    width: 500px;
    height: 500px;
    position: relative;
    margin: auto;
  }

  .media-board-inner__scale {
    transform: scale(0.5);
    transform-origin: 0px 0px 0px;
  }

  .image-player-container {
    position: absolute;
    width: 1000px;
    height: 1000px;
    z-index: 20;
    opacity: 0;
    visibility: hidden;
  }

  .video-player-container {
    position: absolute;
    width: 1000px;
    height: 1000px;
    z-index: 20;
    opacity: 0;
    visibility: hidden;
  }

  .video-player-content {
    width: 100%;
    height: 100%;
  }

  .image-player-content {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-image: url('https://picsum.photos/id/999/500/500');
  }

  .image-player-content2 {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center center;
    background-image: url('https://picsum.photos/id/950/500/500');
  }

  .loading-screen {
    width: 100%;
    height: 100%;
    font-size: 2em;
    text-align: center;
    background-color: red;
  }
  .loading-part {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }
  .spinner__loading {
    font-size: 6rem;
    --stroke-width: 6px;
  }
  .spinner__caption {
    padding-top: 5px;
  }
`;
