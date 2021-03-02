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
    min-height: 50vh;
    flex-wrap: wrap;
    margin: 0.25em;
  }

  .thumbnail-element {
    margin: 0.5em 0.8em 0.5em 0.8em;
    box-shadow: 0 0.5em 1em -0.125em rgba(10, 10, 10, 0.1),
      0 0 0 1px rgba(10, 10, 10, 0.02);
    width: 100px;
    height: 120px;
    overflow: hidden;
    border-radius: 10px;
    box-sizing: border-box;

  }

  .thumbnail-element .image-thumbnail {
    transition: 0.5s all ease-in-out;
  }

  .thumbnail-element:focus .image-thumbnail {
    transform: scale(1.3);
    border: solid 1px #00b4cc;
    box-shadow: 0 0 5px 1px #00b4cc;
  }

  .thumbnail-element:hover {
    border: solid 1px #00b4cc;
    box-shadow: 0 0 5px 1px #00b4cc;
  }

  .thumbnail-element:hover .image-thumbnail {
    cursor: pointer;
    transform: scale(1.3);
  }

  .image-thumbnail {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
    border-radius: 10px;
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
