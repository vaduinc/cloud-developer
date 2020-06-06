import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getSubscriptionsByNewsletterId } from '../../serviceLayer/SubscriptionService'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Get-Subscriptions-by-newsletterId')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event getSubscriptionsByNewsletterId: ', event)

  const newsletterId = event.pathParameters.newsletterId
  
  const item = await getSubscriptionsByNewsletterId(newsletterId)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: item
    })
  }
}
