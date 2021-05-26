import { html, fixture, expect } from '@open-wc/testing';

import '../index.js';

describe('QueryUi', () => {
	it('has a rootApiEndpoint', async () => {
		const el = await fixture(html`<query-ui></query-ui>`);

		expect(el.rootApiEndpoint).to.be.a('string');
	});

	it('passes the a11y audit', async () => {
		const el = await fixture(html`<query-ui></query-ui>`);

		await expect(el).shadowDom.to.be.accessible();
	});
});
