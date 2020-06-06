import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getPublicationById } from '../../serviceLayer/PublicationService'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Get-Pubication-By-Id')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event getPublicationById: ', event)
  const publicationId = event.pathParameters.publicationId
  const newsletterId = event.pathParameters.newsletterId
  
  const item = await getPublicationById(newsletterId,publicationId)

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
