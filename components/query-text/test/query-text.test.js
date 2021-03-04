import { html, fixture, should, expect } from '@open-wc/testing';

import '../query-text.js';
import { QueryText } from '../src/QueryText.js';

describe('QueryText', () => {
	it('has a default placeholderText "Search for anything...', async () => {
		const el = await fixture(html`<query-text></query-text>`);

		expect(el.placeholderText).to.equal('Search for anything...');
	});

	const instanceTest = {
		placeholderText: 'Placeholder text test',
		testDictionary: {
			'@': ['Alice Dee', 'John Brown'],
			'title:': ['Matrix', 'Lost'],
		},
	};

	it('Overrides default properties when instatiated with attributes', async () => {
		const el = await fixture(
			html`<query-text
				placeholderText=${instanceTest.placeholderText}
				.dictionaries=${instanceTest.testDictionary}
				mintextInputLenght="3"
				maxAutocompleteSuggestions="5"
			></query-text>`
		);

		expect(el.placeholderText).to.equal(instanceTest.placeholderText);
		expect(el.dictionaries).to.equal(instanceTest.testDictionary);
		expect(el.mintextInputLenght).to.equal(3);
		expect(el.maxAutocompleteSuggestions).to.equal(5);
	});

	it('initalize with empty text input and does not show autocomplete suggestions', async () => {
		const el = await fixture(
			html`<query-text
				.dictionaries=${instanceTest.testDictionary}
			></query-text>`
		);

		const autocompleteSuggestions = el.shadowRoot.querySelector(
			'.search-results'
		);

		expect(el.textInput).to.equal('');
		expect(autocompleteSuggestions.children).to.have.lengthOf(0);
	});

	it('extracts array of prefixes from test dictionary', async () => {
		const newInstance = new QueryText();
		newInstance.dictionaries = instanceTest.testDictionary;

		const extractPrefixes = newInstance.extractPrefixesFromDictionaries();
		expect(extractPrefixes).to.be.an('array').that.includes('@', 'title:');
	});

	it('passes the a11y audit', async () => {
		const el = await fixture(html`<query-text></query-text>`);

		await expect(el).shadowDom.to.be.accessible();
	});
});
