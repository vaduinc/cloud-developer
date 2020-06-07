import { SNSHandler, SNSEvent, S3Event } from 'aws-lambda'
import 'source-map-support/register'
import { createLogger } from '../../utils/logger'
import { send } from '../../utils/emailSender'
import { getSubscriptionsByNewsletterId } from '../../serviceLayer/SubscriptionService'
import { getUserProfile } from '../../serviceLayer/UserService'
import { UserProfile } from '../../models/UserProfile'

const logger = createLogger ('S3-Event-Publish')
const KEY_DIVISION =process.env.KEY_DIVISION
const bucketName = process.env.ATTACH_S3_BUCKET

/**
 * Entry point of lambda when a file is uploaded to the S3 bucket
 * 
 * @param event
 */
export const handler: SNSHandler = async (event: SNSEvent) => {
  logger.info('Processing SNS event ', JSON.stringify(event))
  for (const snsRecord of event.Records) {
    const s3EventStr = snsRecord.Sns.Message
    const s3Event = JSON.parse(s3EventStr)

    await processS3Event(s3Event)
  }
}

/**
 * Process each of the files uploaded
 * 
 * @param s3Event 
 */
async function processS3Event(s3Event: S3Event) {
  logger.info(s3Event)
  for (const record of s3Event.Records) {
    const key = record.s3.object.key
    logger.info(key)

    const newsletterId = key.split(KEY_DIVISION)

    const subscriptions = await getSubscriptionsByNewsletterId(newsletterId[0])
    logger.info(subscriptions)

    const users = await subscriptions.map( (sub) => {return sub.userId} )
    logger.info(users)

    const usersProfiles = await getEmailsFromUsers(users)
    
    await send(usersProfiles, prepareMessage(key), 'Capstone Newsletter')
  }
}


/**
 * Create simple email body message using the 'key' input parameter
 * to create link to file in S3 bucket
 * 
 * @param key 
 */
function prepareMessage(key: string): string {

  const linkUrl: string = 'https://' + bucketName + '.s3.amazonaws.com/' + key

  return `
            There is a new publication for your newsletter subscription.

            Click here to see it
            ${linkUrl}`
}

/**
 * Returns UserProfile collection calling the persistence storage (DynamoDb)
 * using the userIds coming in the input parameter
 * 
 * @param userIds 
 */
async function getEmailsFromUsers(userIds: string[]): Promise<UserProfile[]> {

  let userProfile = []

  for (const userId of userIds){
      const profile = await getUserProfile(userId)
      userProfile.push(profile)
  }

  logger.info(userProfile)

  return userProfile
}
