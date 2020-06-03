import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('Todo-Access-Layer')

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.IMAGES_S3_BUCKET,
        private readonly urlExpiration:number = +process.env.SIGNED_URL_EXPIRATION
        ) {
    }

    async getAllTodos (userId: string): Promise<TodoItem[]>{

      logger.info('Getting all todos')

      const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })
      .promise()

      return result.Items as TodoItem[]
    }

    async createTodo (newItem: TodoItem): Promise<TodoItem> {

      logger.info('Create todo')
      
      await this.docClient.put({
          TableName: this.todosTable,
          Item: newItem
      }).promise()

      return newItem
    }

    async updateTodo (todoItem: TodoItem): Promise<boolean> {
      
      logger.info('Updating todo: '+ todoItem.todoId)

      await this.docClient.update({
        TableName: this.todosTable,
        Key:{
          "userId": todoItem.userId,
          "todoId": todoItem.todoId
        },
        ConditionExpression: "todoId = :todoId",
        UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
        ExpressionAttributeValues: {
          ":name" : todoItem.name,
          ":dueDate" : todoItem.dueDate,
          ":done" : todoItem.done,
          ":todoId": todoItem.todoId
        },
        ExpressionAttributeNames: {
          "#n" : "name"
        },
        ReturnValues: "UPDATED_NEW"
      }).promise()

      return true
    }

    
    async updateTodoURL (todoId: string, userId: string): Promise<boolean> {
      
        logger.info('Updating todo attachment URL: ' + todoId)

        const attachmentUrl: string = 'https://' + this.bucketName + '.s3.amazonaws.com/' + todoId
        const options = {
            TableName: this.todosTable,
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
        await this.docClient.update(options).promise()
  
        return true
      }

    async deleteTodo (todoId: string, userId: string): Promise<boolean>{

      logger.info('Delete todo ' + todoId)

      await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
          "userId": userId,
          "todoId": todoId
        },
        ConditionExpression: "todoId = :todoId",
        ExpressionAttributeValues: {
          ":todoId": todoId
        }
      }).promise()

      return true
    }

    async getUploadUrl (todoId: string): Promise<string> {

      logger.info('Generate upload url' + todoId)
      return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: this.urlExpiration
      })
    }

}
  