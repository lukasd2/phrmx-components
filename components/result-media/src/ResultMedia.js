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
    this.updateSearchResults();
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
    if (changedProperties.has('answerSet')) {
      this.updateSearchResults();
    }
  }

  updateSearchResults() {
    if (!this.answerSet || this.answerSet.length === 0) return null;
    console.log(this.answerSet);
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

  composeSearchResultsTemplate = () => {
    if (this.answerSet) {
      console.log('searchResults appeared', this.answerSet);
      const generatedTemplate = this.answerSet.map(
        answer => html`
          <li
            class="thumbnail-element"
            data-tooltip="Titolo: ${answer.film_name}"
            data-start="${answer.start}"
            data-end="${answer.start}"
            tabindex="0"
          >
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
    return html` <ul class="thumbnail-list">
      ${this.answerSet ? html` ${this.composeSearchResultsTemplate()} ` : ''}
    </ul>`;
  }
}
