import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserNewsletters } from '../../serviceLayer/NewsletterService'
import { getUserId } from '../utils'

const logger = createLogger ('Get-User-Newsletter')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event getUserNewsletters: ', event)

  const items = await getUserNewsletters(getUserId(event))

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: items
    })
  }
}
