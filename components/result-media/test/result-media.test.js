import { html, fixture, expect } from '@open-wc/testing';

import '../index.js';

describe('ResultMedia', () => {
  it('has a default title ', async () => {
    const el = await fixture(html`<result-media></result-media>`);

    expect(el.headerTitle).to.equal('Library of elements');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture(html`<result-media></result-media>`);

    await expect(el).shadowDom.to.be.accessible();
  });
});
