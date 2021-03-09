import { LitElement, html, css } from 'lit-element';
import 'query-ui';
import 'track-editor';

export class DemoApp extends LitElement {
  static get properties() {
    return {
      title: { type: String },
      dragEnd: { type: Boolean },
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        margin: 0 auto;
      }

      h1 {
        grid-column: 1/13;
        text-align: center;
      }
    `;
  }

  constructor() {
    super();
    this.title = 'Demo APP: Components integration';
  }

  render() {
    return html`
      <h1>${this.title}</h1>
      <query-ui></query-ui>
      <track-editor></track-editor>
    `;
  }
}
