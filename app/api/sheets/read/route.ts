import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

const GOOGLE_SERVICE_ACCOUNT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY as any

export async function GET(req: Request) {
  const data = await getBotPrompts()

  return new NextResponse(JSON.stringify(data))
}

const getBotPrompts = async () => {
  // Auth
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_SERVICE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const doc = new GoogleSpreadsheet(
    '1sUgfMWBxR3wMjcRy7izqw6r2cBU7flcq9Vrif27Tx7g',
    serviceAccountAuth
  ) as any

  try {
    await doc.loadInfo()

    // Get sheet
    const sheet = doc.sheetsByIndex[0] // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`

    // Read rows
    const rows = await sheet.getRows() // can pass in { limit, offset }

    return {
      bot1: rows[0].get('Bot1'),
      bot2: rows[0].get('Bot2'),
      bot3: rows[0].get('Bot3')
    }
  } catch (error) {
    console.error(error)
  }
}
