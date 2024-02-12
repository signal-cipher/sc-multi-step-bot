import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || ''
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID || ''
const GOOGLE_SERVICE_ACCOUNT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY as any

export async function POST(req: Request) {
  const { rowIndex, botName, data } = await req.json()

  await appendSpreadsheet(rowIndex, botName, data)

  return new NextResponse(rowIndex)
}

const appendSpreadsheet = async (
  rowIndex: number,
  botName: string,
  data: any
) => {
  console.log('@@@ rowIndex', rowIndex)

  // Auth
  const serviceAccountAuth = new JWT({
    email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: GOOGLE_SERVICE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth) as any

  try {
    await doc.loadInfo()

    // Get sheet
    const sheet = doc.sheetsByIndex[0] // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
    console.log(sheet.title)
    console.log(sheet.rowCount)

    // Read rows
    const rows = await sheet.getRows()

    // Set bot2 value
    rows[rowIndex].set(botName, data)

    // Save bot2 value
    await rows[rowIndex].save()

    return rowIndex
  } catch (error) {
    console.error(error)
  }
}
