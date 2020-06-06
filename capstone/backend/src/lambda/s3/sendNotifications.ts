import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import * as AWS  from 'aws-sdk'
import { getSubscriptionsByNewsletterId } from '../../serviceLayer/SubscriptionService'
import { getUserProfile } from '../../serviceLayer/UserService'
import { UserProfile } from '../../models/UserProfile'

const logger = createLogger ('S3-Event-Publish')
const ses = new AWS.SES({region: 'us-east-1'}) // get this from env or config
const KEY_DIVISION ='---'
const bucketName = process.env.ATTACH_S3_BUCKET

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

    const newsletterId = key.split(KEY_DIVISION)

    const subscriptions = await getSubscriptionsByNewsletterId(newsletterId[0])
    logger.info('subscriptions')
    logger.info(subscriptions)

    const users = await subscriptions.map( (sub) => {return sub.userId} )
    logger.info('users')
    logger.info(users)

    const usersProfiles = await getEmailsFromUsers(users)

    const linkUrl: string = 'https://' + bucketName + '.s3.amazonaws.com/' + key

    const message = `Click here to see news letter 
                    ${linkUrl}`

    await sendEmail(usersProfiles, message)
  }
}


async function getEmailsFromUsers(userIds: string[]): Promise<UserProfile[]> {

  let userProfile = []

  for (const userId of userIds){
      const profile = await getUserProfile(userId)
      userProfile.push(profile)
  }

  logger.info('userProfile')
  logger.info(userProfile)

  return userProfile
}


async function sendEmail(userProfiles: UserProfile[] , content: string){

  const emails = userProfiles.map((profile) => {
    return profile.email
  })

  logger.info('emails')
  logger.info(emails)

  const params = {
    Destination: {
        ToAddresses: emails
    },
    Message: {
        Body: {
            Text: { 
              Data: `Test ${content}`
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
