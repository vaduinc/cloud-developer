import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UserProfile } from '../models/UserProfile'
//import { createLogger } from '../utils/logger'

// const AWSXRay = require('aws-xray-sdk')
// const XAWS = AWSXRay.captureAWS(AWS)
//const logger = createLogger('Todo-Access-Layer')

const PK = 'user_'
const SK = 'userprofile'
const GSI =  'meta'

export class UserDAO {

    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly newsletterTable = process.env.NEWSLETTER_TABLE,
        ) {
    }

    async getUserProfile (userId: string): Promise<UserProfile>{

      //logger.info('Getting all todos')

      const result = await this.docClient
      .get({
        TableName: this.newsletterTable,
        Key: {
          'PK': `${PK}${userId}`,
          'SK': 'userprofile'
        }
      })
      .promise()

      return {
              userId: userId,
              name: result.Item.name, 
              last: result.Item.last, 
              email: result.Item.email
             } as UserProfile
    }


    async createUserProfile (userProfile: UserProfile): Promise<UserProfile> {

      //logger.info('Create todo')
      
      const newItem = {
        PK: `${PK}${userProfile.userId}`,
        SK: SK,
        GSI: GSI,
        name: userProfile.name,
        last: userProfile.last,
        email: userProfile.email
      }
  
      await this.docClient.put({
        TableName: this.newsletterTable,
        Item: newItem
      }).promise()

      return userProfile
    }

    async updateUserProfile (userProfile: UserProfile): Promise<UserProfile> {
      
      //logger.info('Updating updateUserProfile: '+ UserProfile.todoId)

      await this.docClient.update({
        TableName: this.newsletterTable,
        Key:{
          "PK": `${PK}${userProfile.userId}`,
          "SK": SK
        },
        UpdateExpression: "set #n = :name, #l = :last, email = :email",
        ExpressionAttributeValues: {
          ":name" : userProfile.name,
          ":last" : userProfile.last,
          ":email" : userProfile.email
        },
        ExpressionAttributeNames: {
          "#n" : "name",
          "#l" : "last"
        },
        ReturnValues: "UPDATED_NEW"
      }).promise()

      return userProfile
    }

}
  