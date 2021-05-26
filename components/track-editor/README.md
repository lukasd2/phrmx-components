# \<track-editor> Web Component based on Lit

Reusable Web Component based on LitElement. Adds the functionality of dragging and arranging media elements inside tracks simlarly to video-editing software.
It renders one or multiple tracks with the support of Drag and Drop API. Media types like images, videos and audio can be dropped and arranged inside the tracks. Every track has a temporal dimension, media types can be resized (zoomed-in/out) based on their duration thanks to a scaling function. Supports play, pause, and reset functions as Custom Events. A context menu can be opened to delete the elements.
Simple resize feature is enabled for images.

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i track-editor
```

## Usage

Basic instantiation:

```html
<script type="module">
  import 'track-editor/index.js';
</script>

<track-editor></track-editor>
```

More complex instantiation (refer to implementation section for the explanation of the attributes and properties):

```html
<script type="module">
  import 'track-editor/index.js';
</script>

<track-editor
  ?goForLaunch="${this.goForLauch}"
  draggedElementType="${this.draggedElementType}"
></track-editor>
```

## Quickstart

Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
By default it will start on http://localhost:8000/demo/ using the local Web Dev Server (@web/dev-server in `package.json` devDependencies).

## Dependencies

Please refer to the component `package.json` for the updated listed of dependecies with their versions.

- "lit-element"
- "lit-html"
- "@shoelace-style/shoelace" | Shoelace [https://shoelace.style/]. Limited to components: Alert [https://shoelace.style/components/alert], Tooltip [https://shoelace.style/components/tooltip], Icon Button [https://shoelace.style/components/icon-button] and Icon [https://shoelace.style/components/icon]

## Implementation details

- Scaling function

By default the scale factor equals to 100 which results in 100px = 1second and so on with the minimum scale factor of 10 which equals to 10px = 1second.

- List of all TrackEditor class properties. Refer to Lit Reactive properties for more details about the reactive update cycle [https://lit.dev/docs/components/properties/]. Also the difference between attributes and properties [https://open-wc.org/guides/knowledge/attributes-and-properties/].

```javascript
this.contextMenu; // DOM reference to the context menu (right click on the timelineContainer)
this.contextMenuState = 0; // Open or close state, 0 === closed, 1 === open
this.trackEditor; // DOM reference to the trackEditor. Wraps the descending elements. It applies flex positioning. Parent of the timelineContainer.
this.timelineContainer; // DOM reference to the timelineContainer (containing all the tracks) direct child of trackEditor implements position relative that is needed for the overflow (making horizonal scroll).
this.marker; // DOM reference to the time marker which is synchronised to the temporal dimension of trackEditor.
this.zoomFactor = 100; // Default zoom (scale) factor
this.timeSegmentWidth = 500; // Default segment width in pixels where 500px is equal to 5 seconds. This was adopted since it is the default value when images gets dragged into the track. It gets scaled with the zoom factor
this.dragEnd = true; // indicates that an incoming drag operation was ended (useful for removing associated classes which indicate a draggable state)
this.actualTime = 0; // timer counter in milliseconds (then it can be traslated into a mm/ss/msms format)
this.clockOpts = {
  // clock operations to keep track for pauses, resets etc.
  timeBegan: null,
  timeStopped: null,
  stoppedDuration: 0,
  interval: null,
};
this.numberOfTrackElements = 0; // keeps track of the number of inserted elements into the track. Used for assigning a unique local ref for each element,
this.allTracksElements = []; // array of inserted elements within ANY existing track. Used to update the scaling factor for all elements.
this.trackElements = {}; // object containing each separate track identified by its id. For example {videoTrackRef = {timeStart: Number, timeEnd: Number, elements: [] }, {...}, ... }. Used to detect when a track finishes so new elements can be appended at the end of it.
this.segmentsOnTracks = []; // all track elements merged into one array. It is sent away from the component when users click on "play". It contains all the information useful for requesting the items from an API.
this.startingPreviews = []; // synchronized with the clock indicates the current item(s) to be played
this.endingPreviews = []; // synchronized with the clock indicates the current item(s) to be stopped
this.goForLaunch = false; // indicates that the clock can start (useful for checking that some async operations have finished)
this.hasTrackStateChanged = false; // indicates if any change was made since the last clock operation
this.draggedElementType = ''; // used to prevent errors when users drag different types of media into tracks. For example it is used to generate an error message when users try to put an image media into an audio track etc.
```

Anytime these attributes/properties can be checked (and changed) via the browser console

```javascript
cost trackEditor = document.querySelector('track-editor');
trackEditor; // dumps the state of the component
```

- Custom Events

#### @fires start-preview

Sends an array of track elements that have to be displayed (via the "play" button) syncronised with the track-editor clock.

#### @fires resume-preview

Sends a boolean indicating that the current track elements have to be resumed (played after a "pause" action) syncronised with the track-editor clock.

#### @fires end-preview

Sends an array of track elements that have to be ended (preview end, after a "pause" action) syncronised with the track-editor clock.

#### @fires stop-preview

Sends a boolean indicating that the current track elements have to be stopped (via the "stop" button) syncronised with the track-editor clock.

#### @fires track-elements

Contains an array of all track-elements which can be previewed, requested etc. by other components.

An example of track-elements array:

```javascript
[{
  "start": "0",
  "end": "700",
  "duration": "700",
  "localRef": "video1",
  "trackRef": "videoTrack1",
  "mediaType": "video",
  "identificator": "857195",
  "timeStart": "00:00.00",
  "timeEnd": "00:07.00"
}
{
  "start": "700",
  "end": "3300.00",
  "duration": "2600",
  "localRef": "video2",
  "trackRef": "videoTrack1",
  "mediaType": "video",
  "identificator": "856666",
  "timeStart": "00:07.00",
  "timeEnd": "00:33.00"
}]
```

## Linting with ESLint, Prettier, and Types

To scan the project for linting errors, run

```bash
npm run lint
```

You can lint with ESLint and Prettier individually as well

```bash
npm run lint:eslint
```

```bash
npm run lint:prettier
```

To automatically fix many linting errors, run

```bash
npm run format
```

You can format using ESLint and Prettier individually as well

```bash
npm run format:eslint
```

```bash
npm run format:prettier
```

## Testing with Web Test Runner

To run the suite of Web Test Runner tests, run

```bash
npm run test
```

To run the tests in watch mode (for &lt;abbr title=&#34;test driven development&#34;&gt;TDD&lt;/abbr&gt;, for example), run

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to reduce the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.
