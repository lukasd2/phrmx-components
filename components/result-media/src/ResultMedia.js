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

  // tested solution to be adopted.

  /* _handleTooltipOnMouseover(ev) {
    console.debug('_handleTooltipOnMouseover', ev);
    if (ev.target.tagName === 'IMG') {
      console.warn('Mouseover image element');
      const tooltip = this.shadowRoot.querySelector('.tooltip');
      tooltip.style.display = 'block';
    } else {
      console.log('you moved out');
    }
  } */

  render() {
    return html` <ul class="thumbnail-list">
      ${this.mediaData.map(
        media => html`
          <li
            class="thumbnail-element"
            data-tooltip="Titolo: ${media.mediaTitle}"
            tabindex="0"
          >
            <img
              class="image-thumbnail"
              src=${media.thumbnailUrl}
              alt="${media.mediaTitle}"
            />
          </li>
        `
      )}
    </ul>`;
  }
}
