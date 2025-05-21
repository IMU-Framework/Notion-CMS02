// /notion-cms02/api/notion.js
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DATABASE_ID = process.env.NOTION_DATABASE_ID

export default async function handler(req, res) {
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: { equals: true }
      }
    })

    const cards = response.results.map((page) => {
      const props = page.properties

      const getPlainText = (field) =>
        props[field]?.rich_text?.[0]?.plain_text?.trim() || ''

      const getTitle = () =>
        props['Title']?.title?.[0]?.plain_text?.trim() || 'Untitled'

      const getImage = () =>
        props['Image']?.url || getPlainText('Image') || ''

      const getHex = () => getPlainText('Hex Code')

      const getID = () => {
        const idText = getPlainText('ID')
        const parsed = parseInt(idText, 10)
        return isNaN(parsed) ? 9999 : parsed
      }

      return {
        ID: getID(),
        Title: getTitle(),
        Description: getPlainText('Description'),
        Image: getImage(),
        'Hex Code': getHex(),
        Published: props['Published']?.checkbox === true
      }
    })

    const sortedCards = cards.sort((a, b) => b.ID - a.ID)
    res.status(200).json(sortedCards)
  } catch (error) {
    console.error('Error fetching Notion data:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
