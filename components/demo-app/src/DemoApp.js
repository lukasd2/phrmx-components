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
    this.dragEnd = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('drag-end-event', this._onDragEnd);
  }

  _onDragEnd(ev) {
    console.debug('_handleDragEnd', ev.detail.dragEnd);
    this.dragEnd = ev.detail.dragEnd;
  }

  render() {
    return html`
      <h1>${this.title}</h1>
      <query-ui></query-ui>
      <track-editor ?dragEnd=${this.dragEnd}></track-editor>
    `;
  }
}
