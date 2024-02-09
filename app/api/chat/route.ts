import { google } from 'googleapis'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import fetch from 'node-fetch'

import { nanoid } from '@/lib/utils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: Request) {
  const json = await req.json()
  const { messages, previewToken, googleSheetId } = json

  if (previewToken) {
    openai.apiKey = previewToken
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an idea generator bot. Always reply to the user with this message structure no matter what the user says:

Great! Here's a recap of the selected ideas along with their evaluation scores:

1. **Personalized Financial Planning with AI Integration + AI-Powered Debt Management Tools**
   - Develop an AI-integrated financial planning tool that includes personalized debt management strategies, aiding members in reducing debt and reaching their financial goals. 
   - Evaluation: Novelty: 8/10, Feasibility: 8/10, Specificity: 9/10, Impact: 9/10, Workability: 7/10

2. **Enhanced Mobile Banking Experience + Mobile-First Credit Union Experience**
   - Offer a comprehensive financial management suite through a mobile app, making banking more convenient and helping members manage their finances effectively.
   - Evaluation: Novelty: 7/10, Feasibility: 8/10, Specificity: 8/10, Impact: 8/10, Workability: 9/10

3. **Interactive Financial Education Workshops and Webinars + Digital Financial Literacy Games**
   - Combine interactive workshops and webinars with digital financial literacy games to make financial education more engaging, thereby improving financial literacy among members.
   - Evaluation: Novelty: 8/10, Feasibility: 8/10, Specificity: 8/10, Impact: 9/10, Workability: 7/10
   
Thank you for your time! This was a productive session! If you have any other ideas or need further assistance, feel free to ask!`
      },
      ...messages
    ],
    temperature: 0.7,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      // const payload = [title, completion, createdAt]
      const payload = [title, completion]
      console.log('@@@ payload', payload)
      console.log('@@@ messages', messages)

      // await editGoogleSheets(payload)
      await editSheets(payload)
    }
  })

  return new StreamingTextResponse(stream)
}

const editSheets = async (content: any) => {
  console.log('@@@ editSheets')
  const response = await fetch('https://sheetdb.io/api/v1/sg3gr3eo8u6nw', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: [
        {
          ID: 'INCREMENT',
          Bot1: content[1]
        }
      ]
    })
  })
  const data = await response.json()
  console.log('@@@ data', data)

  // Count the number of rows
  const response2 = await fetch('https://sheetdb.io/api/v1/sg3gr3eo8u6nw/count')
  const data2 = (await response2.json()) as any
  console.log('@@@ data2', data2)

  // Trigger the second bot with the first bot's output
  const secondBotPrompt = `You are an idea maximizer and innovation bot. Analyze its novelty, feasibility, specificity, impact, and workability. Additionally, I would appreciate any suggestions or improvements you might have.`
  const secondBotOutput = await triggerBot(content[1], secondBotPrompt)

  // Delete row
  const response3 = await fetch(
    `https://sheetdb.io/api/v1/sg3gr3eo8u6nw/ID/${data2.rows}`,
    {
      method: 'DELETE'
    }
  )
  const data3 = await response3.json()
  console.log('@@@ data3', data3)

  // Update row
  const updateResponse = await fetch(
    'https://sheetdb.io/api/v1/sg3gr3eo8u6nw',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: [
          {
            ID: data2.rows,
            Bot1: content[1],
            Bot2: secondBotOutput
          }
        ]
      })
    }
  )
  const updateData = await updateResponse.json()
  console.log('@@@ updateData', updateData)
}

async function editGoogleSheets(content: any) {
  const CLIENT_ID = ''
  const CLIENT_SECRET = ''
  const REDIRECT_URI = 'http://localhost:3000/auth/google/callback'
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET)
  const accessToken =
    'ya29.a0AfB_byA8MBVUc5-v6olhtg92vVu0DmD3c-kqFzxscveDc-dv4aG8tOkC2hlmbs1ejW_mRjqgwpjonKpL_7NpfecPtICjdCMFuKKZo2rYbkoY-nEqBrgZmWctqZwHOVHKzaNdV2q1U1oFggNHANsbO0MtFIq9OMNdlUxmaCgYKAVASARASFQHGX2Mim9mQOBkZqMh9NvxKOW2aEQ0171'
  oauth2Client.setCredentials({
    access_token: accessToken
  })

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client })

  try {
    // Find the last row with data
    const readOptions = {
      spreadsheetId: '1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0', // The ID of the spreadsheet
      range: 'Sheet1' // The range to check (entire Sheet1)
    }
    const readResponse = await sheets.spreadsheets.values.get(readOptions)
    const numRows = readResponse.data.values
      ? readResponse.data.values.length
      : 0
    const nextRow = numRows + 1 // Next row index

    // Update at the next row
    const updateOptions = {
      spreadsheetId: '1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0', // The ID of the spreadsheet to update
      range: `Sheet1!A${nextRow}`, // Update the range to the next row
      valueInputOption: 'USER_ENTERED', // How the input data should be interpreted
      resource: {
        values: [content] // The new values to apply in the given range
      }
    }

    const updateResponse =
      await sheets.spreadsheets.values.update(updateOptions)

    // Trigger the second bot with the first bot's output
    const secondBotPrompt = `You are an idea maximizer and innovation bot. Analyze its novelty, feasibility, specificity, impact, and workability. Additionally, I would appreciate any suggestions or improvements you might have.`
    const secondBotOutput = await triggerBot(content[1], secondBotPrompt) // Assuming content[1] is the first bot's output
    const secondBotPayload = [secondBotOutput]

    // Write the second bot's output to another cell, e.g., in the next column of the same row
    const updateOptionsForSecondBot = {
      spreadsheetId: '1SGbS_kU8d3Lk_k27MLj5airqIBcMjB23Ed1jMs-t5y0', // The ID of the spreadsheet to update
      range: `Sheet1!C${nextRow}`,
      valueInputOption: 'USER_ENTERED', // How the input data should be interpreted
      resource: {
        values: [secondBotPayload]
      }
    }

    await sheets.spreadsheets.values.update(updateOptionsForSecondBot)

    return updateResponse.data // Contains the response from the update operation
  } catch (error) {
    console.error('The API returned an error: ' + error)
    throw error
  }
}

async function triggerBot(content: any, prompt: any) {
  console.log('@@@ content', content)

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: prompt
      },
      {
        role: 'user',
        content: content
      }
    ],
    temperature: 0.7
  })

  console.log('@@@ completion', completion)
  console.log(
    '@@@ completion.choices[0].message.content',
    completion.choices[0].message.content
  )

  return completion.choices[0].message.content
}
