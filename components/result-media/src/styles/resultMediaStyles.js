import { css } from 'lit-element';

export const resultMediaStyles = css`
  :host {
    grid-column: 5/13;
    border: 1px solid black;
    border-radius: 5px;
    padding: 25px;
  }

  .thumbnail-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: space-between;
    min-height: 50vh;
    flex-wrap: wrap;
    margin: 0.25em;
  }

  .thumbnail-element {
    margin: 1.5em;
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.02);
  }

  .thumbnail-element .image-thumbnail {
    transition: all 0.3s;
    transform: scale(1);
  }

  .thumbnail-element:hover .image-thumbnail {
    cursor: pointer;
    transform: scale(1.1);
  }

  .image-thumbnail {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
    border-radius: 0.3rem;
  }
`;
