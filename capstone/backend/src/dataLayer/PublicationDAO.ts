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

export class PublicationDAO {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly newsletterTable = process.env.NEWSLETTER_TABLE,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACH_S3_BUCKET,
        private readonly urlExpiration:number = +process.env.SIGNED_URL_EXPIRATION
        ) {
    }

    async createPublication (publication: Publication): Promise<Publication> {

      logger.info(`createPublication ${publication}`)

      const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + publication.publicationId
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


    async getUploadUrl (publicationId: string): Promise<string> {

      logger.info('Generate upload url ' + publicationId)

      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: publicationId,
        Expires: this.urlExpiration
      })
    }
}
  