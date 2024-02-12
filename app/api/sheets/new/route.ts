import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'
import { NextResponse } from 'next/server'

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || ''
const SHEET_ID = process.env.NEXT_PUBLIC_SHEET_ID || ''
const GOOGLE_SERVICE_ACCOUNT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || ''
const GOOGLE_SERVICE_PRIVATE_KEY = process.env.GOOGLE_SERVICE_PRIVATE_KEY as any

export async function POST(req: Request) {
  const { data } = await req.json()

  const rowIndex = await appendSpreadsheet(data)

  return new NextResponse(rowIndex as any)
}

const appendSpreadsheet = async (data: any) => {
  console.log('@@@ data', data)

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
    let rows = await sheet.getRows() // can pass in { limit, offset }
    console.log('@@@ rows.length', rows.length)

    // Append row
    const bot1Row = await sheet.addRow({
      Bot1: data
    })

    // Get new row index
    const rowIndex = parseInt(bot1Row.rowNumber) - 2 // -1 for header & -1 for index

    // // Read rows
    // rows = await sheet.getRows()

    // // Set bot2 value
    // rows[rowIndex].set('Bot2', 'sergey@abc.xyz')

    // // Save bot2 value
    // await rows[rowIndex].save()

    return rowIndex
  } catch (error) {
    console.error(error)
  }
}
