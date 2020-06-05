import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Subscription } from '../models/Subscription'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('SUBSCRIPTION-DAO')

const USER_KEY =  'user_'
const NEWSLETTER_KEY = 'newsltt_'
const SUBSCRIPTION_KEY = 'newssubscription_'

export class SubscriptionDAO {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly newsletterTable = process.env.NEWSLETTER_TABLE,
        private readonly GSIName = process.env.INDEX_NAME
        ) {
    }

    async getUserSubscriptions (userId: string): Promise<Subscription[]>{

      logger.info('Getting getUserSubscriptions ' + userId)

      const result = await this.docClient
      .query({
        TableName: this.newsletterTable,
        IndexName: this.GSIName,
        KeyConditionExpression: 'GSI = :gsi and begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':gsi': `${USER_KEY}${userId}`,
          ':sk': SUBSCRIPTION_KEY
        }
      })
      .promise()

      const items  = result.Items.map((subs) => { 
        return {
                "userId": userId, 
                "enrolled": subs.enrolled,
                "subscriptionId": subs.SK.replace(SUBSCRIPTION_KEY,""),
                "newsletterId": subs.PK.replace(NEWSLETTER_KEY,"")
               }
      })

      return items as Subscription[]
    }


    async createSubscription (subscription: Subscription): Promise<Subscription> {

      logger.info('createSubscription ' + subscription)
      
      const newItem = {
        PK: `${NEWSLETTER_KEY}${subscription.newsletterId}`,
        SK: `${SUBSCRIPTION_KEY}${subscription.subscriptionId}`,
        GSI: `${USER_KEY}${subscription.userId}`,
        enrolled: true
      }
    
      await this.docClient.put({
        TableName: this.newsletterTable,
        Item: newItem
      }).promise()

      return subscription
    }


}
  