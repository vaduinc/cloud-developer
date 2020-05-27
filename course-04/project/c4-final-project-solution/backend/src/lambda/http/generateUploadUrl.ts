import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'
import { updateTodoAttachment } from '../../businessLogic/todos'

const logger = createLogger('Upload-Att')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  
   // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const url = await updateTodoAttachment(todoId, userId)
  
  return {
    statusCode: 200,
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  
}