import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Publication } from '../models/Publication'
import { createLogger } from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('PUBLICATION-DAO')

const USER_KEY =  'user_'
const NEWSLETTER_KEY = 'newsltt_'
const PUBLICATION_KEY = 'newspublication_'
const KEY_DIVISION = process.env.KEY_DIVISION

export class PublicationDAO {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly newsletterTable = process.env.NEWSLETTER_TABLE,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACH_S3_BUCKET,
        private readonly urlExpiration:number = +process.env.SIGNED_URL_EXPIRATION,
        private readonly GSIName = process.env.INDEX_NAME
        ) {
    }

    /**
     * Returns an array of Publications that belong to the user (userId)
     * 
     * @param userId 
     */
    async getUserPublications (userId: string): Promise<Publication[]>{

      logger.info('Getting getUserPublication ' + userId)

      const result = await this.docClient
      .query({
        TableName: this.newsletterTable,
        IndexName: this.GSIName,
        KeyConditionExpression: 'GSI = :gsi and begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':gsi': `${USER_KEY}${userId}`,
          ':sk': PUBLICATION_KEY
        }
      })
      .promise()

      const items  = result.Items.map((pubs) => { 
        return {
                "userId": userId, 
                "createdAt": pubs.createdAt,
                "attachementURL": pubs.attachementURL,
                "sent": pubs.sent,
                "publicationId": pubs.SK.replace(PUBLICATION_KEY,""),
                "newsletterId": pubs.PK.replace(NEWSLETTER_KEY,"")
               }
      })

      return items as Publication[]
    }

    /**
     * Returns one record that matches newsletterId and  publicationId.
     * 
     * @param newsletterId
     * @param publicationId
     */
    async getPublicationById (newsletterId: string, publicationId: string): Promise<Publication | {}>{

      logger.info('Getting getPublicationById ' + newsletterId + ' : ' + publicationId)

      const result = await this.docClient
      .get({
        TableName: this.newsletterTable,
        Key: {
          'PK': `${NEWSLETTER_KEY}${newsletterId}`,
          'SK': `${PUBLICATION_KEY}${publicationId}`
        }
      })
      .promise()

      if (!result.Item){
        return {}
      }

      return {
              "userId": result.Item.GSI.replace(USER_KEY,""), 
              "createdAt": result.Item.createdAt,
              "attachementURL": result.Item.attachementURL,
              "sent": result.Item.sent,
              "publicationId": result.Item.SK.replace(PUBLICATION_KEY,""),
              "newsletterId": result.Item.PK.replace(NEWSLETTER_KEY,"")
              } as Publication
     
    }


    async createPublication (publication: Publication): Promise<Publication> {

      logger.info(`createPublication ${publication}`)

      const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + publication.newsletterId +KEY_DIVISION+ publication.publicationId
      const creationDate = new Date().toISOString()
      
      const newItem = {
        PK: `${NEWSLETTER_KEY}${publication.newsletterId}`,
        SK: `${PUBLICATION_KEY}${publication.publicationId}`,
        GSI: `${USER_KEY}${publication.userId}`,
        attachementURL: attachmentUrl,
        createdAt: creationDate,
        sent: false
      }
    
      await this.docClient.put({
        TableName: this.newsletterTable,
        Item: newItem
      }).promise()

      publication.attachementURL = attachmentUrl
      publication.createdAt = creationDate

      return publication
    }


    async getUploadUrl (newsletterId: string,publicationId: string): Promise<string> {

      logger.info('Generate upload url ' + publicationId)

      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: `${newsletterId}${KEY_DIVISION}${publicationId}`,
        Expires: this.urlExpiration
      })
    }
}
  