import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Newsletter } from '../models/Newsletter'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('NEWSLETTER-DAO')

const USER_KEY =  'user_'
const NEWSLETTER_KEY = 'newsltt_'

export class NewsletterDAO {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly newsletterTable = process.env.NEWSLETTER_TABLE
        ) {
    }

    async getUserNewsletters (userId: string): Promise<Newsletter[]>{

      logger.info('Getting getUserNewsletter ' + userId)

      const result = await this.docClient
      .query({
        TableName: this.newsletterTable,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `${USER_KEY}${userId}`,
          ':sk': NEWSLETTER_KEY
        }
      })
      .promise()

      const items  = result.Items.map((newsletter) => { 
        return {
                "userId": userId, 
                "longDesc": newsletter.longDesc,
                "shortDesc": newsletter.shortDesc,
                "newsletterId": newsletter.PK.replace(NEWSLETTER_KEY,"")
               }
      })

      return items as Newsletter[]
    }


    async createNewsletter (newsletter: Newsletter): Promise<Newsletter> {

      logger.info('createNewsletter ' + newsletter)
      
      const newItem = {
        PK: `${USER_KEY}${newsletter.userId}`,
        SK: `${NEWSLETTER_KEY}${newsletter.newsletterId}`,
        GSI: 'meta',
        shortDesc: newsletter.shortDesc,
        longDesc: newsletter.longDesc
      }
    
      await this.docClient.put({
        TableName: this.newsletterTable,
        Item: newItem
      }).promise()

      return newsletter
    }


}
  