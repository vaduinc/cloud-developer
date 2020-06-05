import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { publishNewsletter , getSignedURL} from '../../serviceLayer/PublicationService'
// import { createLogger } from '../../utils/logger'

//const logger = createLogger ('Get-All-Todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // logger.info('Processing event: ', event)
  const userId= getUserId(event)
  const parsedBody = JSON.parse(event.body)

  const saveItem = await publishNewsletter(parsedBody, userId)
  const signedUrl =  await getSignedURL(saveItem.publicationId)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: saveItem,
      signedURL: signedUrl
    })
  }
}