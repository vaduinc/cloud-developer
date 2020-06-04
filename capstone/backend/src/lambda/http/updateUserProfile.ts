import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { getUserId } from '../utils'
import { CreateProfileRequest } from '../../requests/CreateProfileRequest'
// import { createLogger } from '../../utils/logger'
import { saveUserProfile } from '../../serviceLayer/UserService'

//const logger = createLogger ('Get-All-Todo')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // logger.info('Processing event: ', event)
  // const allTodos = await getAllTodos(getUserId(event))
  //const userId = '1235'
  const userId= getUserId(event)
  const parsedBody: CreateProfileRequest = JSON.parse(event.body)

  const saveItem = await saveUserProfile(parsedBody, userId)
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: saveItem
    })
  }
}
