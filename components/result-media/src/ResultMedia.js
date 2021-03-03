import { html, LitElement } from 'lit-element';
import { resultMediaStyles } from './styles/resultMediaStyles.js';

export class ResultMedia extends LitElement {
  static get styles() {
    return [resultMediaStyles];
  }

  static get properties() {
    return {
      answerSet: { type: Array },
    };
  }

  constructor() {
    super();
    this.answerSet = [];
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: ResultMedia successfuly added to the DOM');
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
  }

  // tested solution to be adopted.

  /*  _handleTooltipOnMouseover(ev) {
    console.debug('_handleTooltipOnMouseover', ev);
    if (ev.target.tagName === 'IMG') {
      console.warn('Mouseover image element');
      const tooltip = this.shadowRoot.querySelector('.tooltip');
      tooltip.style.display = 'block'; 
    } else {
      console.log('you moved out');
    }
  } */
  _dragStartItemHandler(ev) {
    const parentElement = ev.target.parentElement;
    const thumnbailElement = ev.target;

    if (parentElement.tagName === 'LI') {
      let itemData = {
        segmenttype: parentElement.dataset.segmenttype,
        segmentname: parentElement.dataset.segmentname,
        start: parentElement.dataset.start,
        end: parentElement.dataset.end,
      };

      ev.dataTransfer.setData('text/plain', JSON.stringify(itemData));
      ev.dataTransfer.setData('text/uri-list', thumnbailElement.src);
    }
  }
  composeThumbnailsTemplate = () => {
    if (this.answerSet) {
      console.log('searchResults appeared', this.answerSet);
      const generatedTemplate = this.answerSet.map(
        answer => html`
          <li
            class="thumbnail-element"
            draggable="true"
            data-segmentname="${answer.film_name}"
            data-segmenttype="mp4"
            data-start="${answer.start}"
            data-end="${answer.start}"
            tabindex="0"
          >
            <span class="thumbnail-tooltip">Titolo: ${answer.film_name}</span>
            <img
              class="image-thumbnail"
              src=${answer.thumbnail_url}
              alt="${answer.film_name}"
            />
          </li>
        `
      );
      return html`${generatedTemplate}`;
    }
  };

  render() {
    return html` <ul
      class="thumbnail-list"
      @dragstart=${this._dragStartItemHandler}
    >
      ${this.answerSet ? html` ${this.composeThumbnailsTemplate()} ` : ''}
    </ul>`;
  }
}
