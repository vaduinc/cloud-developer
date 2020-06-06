import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateProfileRequest } from '../../requests/CreateProfileRequest'
import { saveUserProfile } from '../../serviceLayer/UserService'
import { createLogger } from '../../utils/logger'

const logger = createLogger ('Create-Newsletter')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event saveUserProfile: ', event)

  const userId= getUserId(event)
  const parsedBody: CreateProfileRequest = JSON.parse(event.body)

  const saveItem = await saveUserProfile(parsedBody, userId)
  
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
