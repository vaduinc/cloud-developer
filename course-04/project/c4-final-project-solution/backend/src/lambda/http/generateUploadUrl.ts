import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('upload')
const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration: number = +process.env.SIGNED_URL_EXPIRATION
const docClient = new AWS.DynamoDB.DocumentClient()
const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const todoId = event.pathParameters.todoId
  const userId = getUserId(event)
  
    const url = getUploadUrl(todoId)
  logger.info('getUploadUrl: ', url)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const attachmentUrl: string = 'https://' + bucketName + '.s3.amazonaws.com/' + todoId
  const options = {
      TableName: todosTable,
      Key:{
        "userId": userId,
        "todoId": todoId
      },
      UpdateExpression: "set attachmentUrl = :r",
      ExpressionAttributeValues: {
          ":r": attachmentUrl
      },
      ReturnValues: "UPDATED_NEW"
  }

  await docClient.update(options).promise()
  logger.info("Presigned url generated successfully ", url)

  return {
    statusCode: 200,
    headers: {'Access-Control-Allow-Origin': '*'},
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  
}

function getUploadUrl(todoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })
}

