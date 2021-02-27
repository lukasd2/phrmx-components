import { html, LitElement } from 'lit-element';

import { resultMediaStyles } from './styles/resultMediaStyles.js';

export class ResultMedia extends LitElement {
  static get styles() {
    return [resultMediaStyles];
  }

  static get properties() {
    return {
      mediaData: { type: Array },
    };
  }

  constructor() {
    super();
    this.mediaData = [
      {
        thumbnailUrl: 'https://picsum.photos/id/999/150/200',
        mediaTitle: 'ExampleTitle1',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/998/150/200',
        mediaTitle: 'ExampleTitle2',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/997/150/200',
        mediaTitle: 'ExampleTitle3',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/996/150/200',
        mediaTitle: 'ExampleTitle4',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/995/150/200',
        mediaTitle: 'ExampleTitle4',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/994/150/200',
        mediaTitle: 'ExampleTitle4',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/993/150/200',
        mediaTitle: 'ExampleTitle4',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
      {
        thumbnailUrl: 'https://picsum.photos/id/992/150/200',
        mediaTitle: 'ExampleTitle4',
        mediaDescription:
          'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione veritatis odit neque consequatur. Corporis qui excepturi maiores voluptatum ratione aliquam.',
      },
    ];
  }

  render() {
    return html` <ul class="thumbnail-list">
      ${this.mediaData.map(
        media => html`
          <li class="thumbnail-element">
            <img
              class="image-thumbnail"
              src=${media.thumbnailUrl}
              alt="Placeholder"
            />
          </li>
        `
      )}
    </ul>`;
  }
}
