import { html } from 'lit-html';
import '../index.js';

export default {
  title: 'ResultMedia',
  component: 'result-media',
  argTypes: {
    headerTitle: { control: 'text' },
    textColor: { control: 'color' },
  },
};

function Template({ headerTitle = 'Library of elements', textColor }) {
  return html`
    <result-media
      style="--result-media-text-color: ${textColor || 'black'}"
      headerTitle=${headerTitle}
    >
    </result-media>
  `;
}

export const Regular = Template.bind({});

export const CustomTitle = Template.bind({});
CustomTitle.args = {
  headerTitle: 'My custom header',
};
