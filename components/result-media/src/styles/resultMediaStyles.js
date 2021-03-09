import { css } from 'lit-element';

export const resultMediaStyles = css`
  :host {
    grid-column: 5/13;
    border: 1px solid black;
    border-radius: 5px;
    padding: 20px;
  }

  .thumbnail-list {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;

    list-style: none;
    padding: 0;
    margin: 0;
    min-height: 250px;
    flex-wrap: wrap;
  }

  .thumbnail-element {
    margin: 10px 10px 10px 10px;
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
  }

  .thumbnail-element:hover,
  .thumbnail-element:focus {
    border: solid 1px #00b4cc;
    box-shadow: 0 0 5px 1px #00b4cc;
  }

  .thumbnail-element:hover .image-thumbnail {
    cursor: pointer;
    transform: scale(1.3);
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

  .image-thumbnail {
    max-height: 100%;
    min-width: 100%;
    object-fit: cover;
    vertical-align: bottom;
    border-radius: 10px;
  }

  img {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  img.dragging {
    opacity: 0.5;
    transform: scale(0.8);
  }
`;
