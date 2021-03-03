import { html, fixture, expect } from '@open-wc/testing';

import '../query-text.js';

describe('QueryText', () => {
	it('has a default placeholderText "Search for anything...', async () => {
		const el = await fixture(html`<query-text></query-text>`);

		expect(el.placeholderText).to.equal('Search for anything...');
	});
	/* 
	it('increases the counter on button click', async () => {
		const el = await fixture(html`<query-text></query-text>`);
		el.shadowRoot.querySelector('button').click();

		expect(el.counter).to.equal(6);
	});

	it('can override the title via attribute', async () => {
		const el = await fixture(
			html`<query-text title="attribute title"></query-text>`
		);

		expect(el.title).to.equal('attribute title');
	}); */

	it('passes the a11y audit', async () => {
		const el = await fixture(html`<query-text></query-text>`);

		await expect(el).shadowDom.to.be.accessible();
	});
});
