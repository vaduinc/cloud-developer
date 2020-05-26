import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  console.log('Processing event: ', event)
  const userId= 'mockUser' // TODO get this from JWT later
  const todoId = event.pathParameters.todoId

  await docClient.delete({
    TableName: todosTable,
    Key: {
      "userId": userId,
      "todoId": todoId
    },
    ConditionExpression: "todoId = :todoId",
    ExpressionAttributeValues: {
      ":todoId": todoId
    }
  }).promise()

  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
}
