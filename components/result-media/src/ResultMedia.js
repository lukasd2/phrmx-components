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
    this.answerSet = [
      {
        thumbnail_url: 'https://picsum.photos/id/999/150/200',
        film_name: 'Mattis.avi',
        start: 0.3027,
        stop: 1.2742,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/998/150/200',
        film_name: 'InEstRisus.avi',
        start: 0.7541,
        stop: 1.613,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/997/150/200',
        film_name: 'EuSapienCursus.avi',
        start: 0.3034,
        stop: 1.7323,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/996/150/200',
        film_name: 'DolorVel.mp3',
        start: 0.1617,
        stop: 1.8253,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/995/150/200',
        film_name: 'AcTellus.avi',
        start: 0.3547,
        stop: 1.9371,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/994/150/200',
        film_name: 'VestibulumAnteIpsum.avi',
        start: 0.6928,
        stop: 1.486,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/993/150/200',
        film_name: 'ErosVestibulumAc.mp3',
        start: 0.2201,
        stop: 1.9599,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/992/150/200',
        film_name: 'DisParturientMontes.mp3',
        start: 0.6717,
        stop: 1.7109,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/991/150/200',
        film_name: 'InHacHabitasse.mp3',
        start: 0.6197,
        stop: 1.9317,
      },
      {
        thumbnail_url: 'https://picsum.photos/id/990/150/200',
        film_name: 'FeugiatNon.mov',
        start: 0.245,
        stop: 1.1917,
      },
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    console.debug('DEBUG: ResultMedia successfuly added to the DOM');
  }

  updated(changedProperties) {
    console.debug('changedProperty', changedProperties); // logs previous values
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

  composeThumbnailsTemplate = () => {
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
      ${this.answerSet ? html` ${this.composeThumbnailsTemplate()} ` : ''}
    </ul>`;
  }
}
