import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
// import { getUserId } from '../utils'
// import { createLogger } from '../../utils/logger'
// import { getAllTodos } from '../../businessLogic/todos'

//const logger = createLogger ('Get-All-Todo')

const docClient = new AWS.DynamoDB.DocumentClient()
const newsletterTable = process.env.NEWSLETTER_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // logger.info('Processing event: ', event)
  // const allTodos = await getAllTodos(getUserId(event))
  const userId = '1235'
  const parsedBody = JSON.parse(event.body)

  const result = await docClient
      .get({
        TableName: newsletterTable,
        Key: {
          'PK': `user_${userId}`,
          'SK': 'userprofile'
        }
      })
      .promise()

  const userProfile = result.Item  

  if (userProfile){

    await docClient.update({
      TableName: newsletterTable,
      Key:{
        "PK": `user_${userId}`,
        "SK": 'userprofile'
      },
      UpdateExpression: "set #n = :name, #l = :last, email = :email",
      ExpressionAttributeValues: {
        ":name" : parsedBody.name,
        ":last" : parsedBody.last,
        ":email" : parsedBody.email
      },
      ExpressionAttributeNames: {
        "#n" : "name",
        "#l" : "last"
      },
      ReturnValues: "UPDATED_NEW"
    }).promise()

  }else{
    const newItem = {
      PK: `user_${userId}`,
      SK: 'userprofile',
      GSI: 'meta',
      name: parsedBody.name,
      last: parsedBody.last,
      email: parsedBody.email
    }

    await docClient.put({
      TableName: newsletterTable,
      Item: newItem
    }).promise()
  }
  
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: userProfile
    })
  }
}
