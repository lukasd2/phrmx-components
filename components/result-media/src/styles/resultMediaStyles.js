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
    margin: 1em;
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.02);
  }

  .thumbnail-element .image-thumbnail {
    transition: all 0.3s;
    transform: scale(1);
  }

  .thumbnail-element:focus .image-thumbnail {
    transform: scale(1.1);
    border: solid 1px #00b4cc;
    box-shadow: 0 0 5px 1px #00b4cc;
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

  [data-tooltip]::before {
    content: attr(data-tooltip);
    position: absolute;
    opacity: 0;
    transition: all 0.15s ease;
    padding: 10px;
    color: #f4f4f4;
    max-width: 100px;
    border-radius: 10px;
    box-shadow: 2px 2px 1px silver;
    z-index: 10;
  }

  [data-tooltip]:hover::before {
    opacity: 1;
    background: #00b4cc;
    margin-top: -80px;
    margin-left: 20px;
  }
`;
