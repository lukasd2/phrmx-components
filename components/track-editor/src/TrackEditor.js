import { LitElement, css, html } from 'lit-element';

export class TrackEditor extends LitElement {
  static get properties() {
    return {
      message: { type: String },
    };
  }

  static get styles() {
    return css`
      :host {
        display: grid;
        grid-column: 1/4;
      }
      .video-tracks {
        width: 100%;
        height: 250px;
        background-color: #fff;
        border: 1px solid #1a2b42;
      }
    `;
  }

  constructor() {
    super();
    this.message = 'Drag and Drop medias here!';
  }

  onDropMediaHandler(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text/plain');
    const newDraggedElement = this.createNodeFromDraggedElement(data);

    ev.target.appendChild(newDraggedElement);
    return this.message;
  }

  createNodeFromDraggedElement(data) {
    const createContainer = document.createElement('div');
    const newContent = document.createTextNode(data);
    createContainer.appendChild(newContent);
    return createContainer;
  }

  onDragOverMediaHandler(ev) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  }

  render() {
    return html`
      <div
        id="target"
        @drop="${this.onDropMediaHandler}"
        @dragover="${this.onDragOverMediaHandler}"
        class="video-tracks"
      >
        ${this.message}
      </div>
    `;
  }
}
