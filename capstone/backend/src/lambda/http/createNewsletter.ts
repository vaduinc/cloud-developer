import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { saveNewsletter } from '../../serviceLayer/NewsletterService'
import { CreateNewsletterRequest } from '../../requests/CreateNewsletterRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Create-Newsletter')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event CreateNewsletterRequest: ', event)
  
  const userId= getUserId(event)
  
  // TODO check it is not already subscribed
  const parsedBody: CreateNewsletterRequest = JSON.parse(event.body)
  const saveItem = await saveNewsletter(parsedBody, userId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: saveItem
    })
  }
}
