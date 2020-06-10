import { UserProfile } from "../models/UserProfile";
import { createLogger } from './logger'
import * as AWS  from 'aws-sdk'

const logger = createLogger ('S3-Event-Publish')
const ses = new AWS.SES({region: process.env.REGION_SETUP}) 
const SOURCE_ACCOUNT = process.env.SOURCE_ACCOUNT

/**
 * Send 'content' email to a list of recipients (userProfiles) 
 * 
 * @param userProfiles 
 * @param content 
 * @param subject 
 */
export async function send(userProfiles: UserProfile[] , content: string, subject: string){

    const emails = userProfiles.map((profile) => {
      return profile.email
    })

    if(emails.length===0){
      logger.info('no one was actively subscribed to newsletter')
      return
    }
  
    logger.info(emails)
  
    const params = {
      Destination: {
          ToAddresses: emails
      },
      Message: {
          Body: {
              Text: { 
                Data: `${content}`
              }
          },
          Subject: { 
            Data: subject
          }
      },
      Source: SOURCE_ACCOUNT
    }
  
    const response = await ses.sendEmail(params).promise()
    logger.info(response)
  
  }