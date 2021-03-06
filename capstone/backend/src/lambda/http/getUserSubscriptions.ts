import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { getUserSubscripions } from '../../serviceLayer/SubscriptionService'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Create-Newsletter')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  logger.info('Processing event getUserSubscripions: ', event)

  const items = await getUserSubscripions(getUserId(event))

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
