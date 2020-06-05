import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import * as AWS  from 'aws-sdk'

const logger = createLogger ('S3-Event-Publish')
const ses = new AWS.SES({region: 'us-east-1'}) // get this from env or config

export const handler: SNSHandler = async (event: SNSEvent) => {
  //logger.info('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    //logger.info('snsRecord ', snsRecord)
    const s3EventStr = snsRecord.Sns.Message
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }
}

async function processS3Event(s3Event: S3Event) {
  logger.info('Processing s3Event')
  logger.info(s3Event)
  for (const record of s3Event.Records) {
    const key = record.s3.object.key
    logger.info('Processing S3 item with key: ')
    logger.info(key)
    await sendEmail(key)
  }
}

async function sendEmail(example: string){

  const params = {
    Destination: {
        ToAddresses: ["valencia.jaime@yahoo.com"]
    },
    Message: {
        Body: {
            Text: { 
              Data: `Test ${example}`
            }
        },
        Subject: { 
          Data: "Test Email"
        }
    },
    Source: "jaime.vadu@gmail.com"
  }

  const response = await ses.sendEmail(params).promise()
  logger.info(response)

}
