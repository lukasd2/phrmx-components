import { html } from 'lit-html';
import '../query-text.js';

export default {
	title: 'QueryText',
	component: 'query-text',
	argTypes: {
		placeholderText: { control: 'text' },
		textColor: { control: 'color' },
		dictionaries: { control: 'object' },
	},
};

const exampleDicts = {
	'@': [
		'Valerio Ciriaci',
		'Alessio Genovese',
		'Paola Rossi',
		'Lilly Wachowski',
	],
	'title:': [
		'Mister Wonderland',
		'L’ultima frontiera',
		'Storie di Valerio',
		'Matrix',
	],
	'nationality:': ['Russia', 'Indonesia', 'Italia', 'Stati Uniti'],
};

function Template({
	placeholderText = 'Esplora i prefissi title:Mister Wonderland, @Valerio e altri...',
	dictionaries = exampleDicts,
	textColor,
	slot,
}) {
	return html`
		<query-text
			style="--query-text-text-color: ${textColor || 'black'}"
			.dictionaries=${dictionaries}
			placeholderText=${placeholderText}
		>
			${slot}
		</query-text>
	`;
}

export const Regular = Template.bind({});

export const CustomPlaceholder = Template.bind({});
CustomPlaceholder.args = {
	placeholderText: 'Custom placeholder text',
};

export const SlottedContent = Template.bind({});
SlottedContent.args = {
	slot: html`<p>Slotted content</p>`,
};
SlottedContent.argTypes = {
	slot: { table: { disable: true } },
};
