import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as uuid from 'uuid'
import { getUserId } from '../utils'
// import { createLogger } from '../../utils/logger'
// import { getAllTodos } from '../../businessLogic/todos'

//const logger = createLogger ('Get-All-Todo')

const docClient = new AWS.DynamoDB.DocumentClient()
const newsletterTable = process.env.NEWSLETTER_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // logger.info('Processing event: ', event)
  // const allTodos = await getAllTodos(getUserId(event))
  //const userId = '1235'
  const userId= getUserId(event)
  const newsSubId = uuid.v4()
  const parsedBody = JSON.parse(event.body)

  const newItem = {
    PK: `subs_${parsedBody.newsletterId}`,
    SK: `newssubscription_${newsSubId}`,
    GSI: `user_${userId}`,
    enrolled: true
  }

  await docClient.put({
    TableName: newsletterTable,
    Item: newItem
  }).promise()
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: newItem
    })
  }
}