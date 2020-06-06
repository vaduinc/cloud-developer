import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { getUserPublications } from '../../serviceLayer/PublicationService'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Get-All-Pubications')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event getUserPublications: ', event)
  
  const item = await getUserPublications(getUserId(event))

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
