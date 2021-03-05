import { html, fixture, expect } from '@open-wc/testing';

import '../track-editor.js';

describe('TrackEditor', () => {
  /* it('has a default title "Hey there" and counter 5', async () => {
    const el = await fixture(html`<track-editor></track-editor>`);

    expect(el.title).to.equal('Hey there');
    expect(el.counter).to.equal(5);
  });
 */

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<track-editor></track-editor>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
