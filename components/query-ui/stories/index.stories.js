import { html } from 'lit-html';
import '../index.js';

export default {
	title: 'QueryUi',
	component: 'query-ui',
	argTypes: {
		title: { control: 'text' },
	},
};

function Template({ title = 'Hello world' }) {
	return html` <query-ui .title=${title}> </query-ui> `;
}

export const Regular = Template.bind({});

export const CustomTitle = Template.bind({});
CustomTitle.args = {
	title: 'My title',
};
