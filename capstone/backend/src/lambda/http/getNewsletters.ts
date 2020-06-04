import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { getUserId } from '../utils'
// import { createLogger } from '../../utils/logger'
// import { getAllTodos } from '../../businessLogic/todos'

//const logger = createLogger ('Get-All-Todo')

const docClient = new AWS.DynamoDB.DocumentClient()
const newsletterTable = process.env.NEWSLETTER_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // logger.info('Processing event: ', event)
  // const allTodos = await getAllTodos(getUserId(event))
  // const userId = '1234'
  const userId= getUserId(event)

  const result = await docClient
      .query({
        TableName: newsletterTable,
        KeyConditionExpression: 'PK = :pk and begins_with(SK, :sk)',
        ExpressionAttributeValues: {
          ':pk': `user_${userId}`,
          ':sk': 'newsltt'
        }
      })
      .promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: result.Items
    })
  }
}
