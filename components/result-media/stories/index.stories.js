import { html } from 'lit'
import '../index.js'

export default {
  title: 'ResultMedia',
  component: 'result-media',
  argTypes: {
    headerTitle: { control: 'text' },
    textColor: { control: 'color' },
    exampleAnswerSet: { control: 'object' },
    metadataResponse: { control: 'object' },
    hasMetadata: { control: 'boolean' }
  }
}

const exampleAnswerSet = [
  {
    thumbnail_url: 'https://picsum.photos/id/998/150/200',
    item_name: 'Example video item',
    reference: 998,
    duration: 10,
    media_type: 'video'
  },
  {
    thumbnail_url: 'https://picsum.photos/id/994/150/200',
    item_name: 'Example image item',
    reference: 994,
    media_type: 'image'
  },
  {
    thumbnail_url: 'https://picsum.photos/id/997/150/200',
    item_name: 'Example sound item',
    reference: 997,
    duration: 15,
    media_type: 'sound'
  }
]

const exampleMetadataSet = {
  metadata1: 'text1',
  metadata2: 'text2',
  metadata3: 'text3',
  metadata4: 'text4',
  metadata5: 'text5'
}

function Template ({
  headerTitle = 'Library of elements',
  answerSet = exampleAnswerSet,
  hasMetadata = true,
  metadataResponse = exampleMetadataSet,
  textColor
}) {
  return html`
    <result-media
      style="--result-media-text-color: ${textColor || 'black'}"
      headerTitle=${headerTitle}
      .answerSet=${answerSet}
      ?hasMetadata=${hasMetadata}
      .metadataResponse=${metadataResponse}
    >
    </result-media>
  `
}

export const Regular = Template.bind({})

export const CustomTitle = Template.bind({})
CustomTitle.args = {
  headerTitle: 'My custom header'
}
