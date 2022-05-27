import { css } from 'lit';

export const resultMediaStyles = css`
  :host {
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    flex-direction: column;
    border: solid 1px #e5e7eb;
    border-radius: 3px;
    background-color: white;
    min-width: 20rem;
    max-width: 100%;
  }

  .header {
    margin-bottom: 20px;
  }

  .header__headline {
    text-align: center;
    border-bottom: solid #e5e7eb;
  }

  .header__title {
    font-size: 1.2em;
    margin: 0;
    padding: 20px 0 10px 0;
  }

  .thumbnail-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 1;
    font-size: 0;
    margin: 0 auto;
    list-style: none;
    padding: 0;
    min-height: 300px;
    overflow-y: scroll;
    scrollbar-width: none;
  }

  .thumbnail-list::-webkit-scrollbar {
    display: none;
  }

  .thumbnail-element {
    display: inline-block;
    font-size: 18px;
    margin: 10px 10px 10px 10px;
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.02);
    overflow: hidden;
    border-radius: 10px;
    box-sizing: border-box;
    touch-action: none;
    user-select: none;
    max-height: 170px;
  }

  .thumbnail-element.loading {
    box-shadow: 0 0em 0em 0em rgba(10, 10, 10, 0.1),
      0 0 0 0 rgba(10, 10, 10, 0.02);
  }

  .thumbnail-element.dragging {
    opacity: 0.5;
    transform: scale(0.9);
  }

  .thumbnail-element.loading:hover,
  .thumbnail-element:focus {
    pointer-events: none;
  }

  .thumbnail-element .image-thumbnail {
    transition: 0.5s all ease-in-out;
  }

  .thumbnail-element:focus .image-thumbnail {
    transform: scale(1.2);
  }

  .thumbnail-element:hover,
  .thumbnail-element:focus {
    border-color: #00b4cc;
    box-shadow: 0 0 5px 1px #00b4cc;
  }

  .thumbnail-element:hover .image-thumbnail {
    cursor: grab;
    transform: scale(1.2);
  }

  .thumbnail-element > .thumbnail-tooltip {
    display: none;
  }

  .thumbnail-element:hover > .thumbnail-tooltip {
    position: absolute;
    display: block;
    margin-top: -50px;
  }

  .thumbnail-tooltip {
    opacity: 1;
    background: #3c4446;
    display: flex;
    padding: 20px;
    border-radius: 15px;
    color: #ffffff;
    z-index: 10;
  }

  img {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  img.dragging {
    opacity: 0.5;
    transform: scale(0.8);
  }

  .card-image {
    --padding: var(--sl-spacing-small);
  }

  .card-content {
    display: flex;
    justify-content: space-between;
  }

  .card-content.image sl-badge::part(base) {
    background-color: var(--sl-color-primary-500);
  }

  .card-content.video sl-badge::part(base) {
    background-color: #bd10e0;
  }

  .card-content.audio sl-badge::part(base) {
    background-color: #f5a623;
  }

  .card-image .play-preview-btn::part(base) {
    color: var(--sl-color-gray-100);
    background: var(--sl-color-primary-700);
  }

  .card-image .metadata-preview-btn::part(base) {
    color: var(--sl-color-gray-100);
    background: var(--sl-color-primary-500);
  }

  .image-thumbnail {
    width: 9rem;
    height: 7rem;
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
  }

  .btn-icon {
    font-size: 20px;
  }

  .skeleton-shapes sl-skeleton {
    display: inline-flex;
    width: 162px;
    height: 216px;
  }

  .skeleton-shapes .square::part(indicator) {
    --border-radius: 3px;
  }

  .dialog-overview .metadata-field {
    border: 1px solid #ddd;
    padding: 5px;
    display: inline-flex;
    font-style: italic;
  }
`;
