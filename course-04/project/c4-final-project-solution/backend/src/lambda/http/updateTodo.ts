import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.update({
    TableName: todosTable,
    Key:{
      "userId": userId,
      "todoId": todoId
    },
    ConditionExpression: "todoId = :todoId",
    UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
    ExpressionAttributeValues: {
      ":name" : updatedTodo.name,
      ":dueDate" : updatedTodo.dueDate,
      ":done" : updatedTodo.done,
      ":todoId": todoId
    },
    ExpressionAttributeNames: {
      "#n" : "name"
    },
    ReturnValues: "UPDATED_NEW"
  }).promise()

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: ''
  }
  
}

