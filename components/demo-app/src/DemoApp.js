import { LitElement, html, css } from 'lit-element';
import 'query-ui';

export class DemoApp extends LitElement {
  static get properties() {
    return {
      title: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        margin: 0 auto;
      }

      .app-footer {
        font-size: calc(12px + 0.5vmin);
        align-items: center;
      }

      main {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
        grid-column: 1 / 13;
      }

      h1 {
        grid-column: 1/13;
        text-align: center;
      }

      .app-footer a {
        margin-left: 5px;
      }
    `;
  }

  constructor() {
    super();
    this.title = 'My app';
  }

  render() {
    return html`
      <main>
        <h1>${this.title}</h1>
        <query-ui></query-ui>
      </main>

      <p class="app-footer">
        🚽 Made with love by
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/open-wc"
          >open-wc</a
        >.
      </p>
    `;
  }
}
