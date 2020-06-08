import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo';
import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';
import { Todos } from '../components/Todos';

export async function getTodos(idToken: string): Promise<Todo[]> {
  console.log('Fetching all newsletters')

  const response = await Axios.get(`${apiEndpoint}/newsletters/all`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data.data
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  // const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newTodo), {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${idToken}`
  //   }
  // })
  // return response.data.item
  return new Promise(()=> {} )
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  // await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedTodo), {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${idToken}`
  //   }
  // })
  return new Promise(()=> "")
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  // await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${idToken}`
  //   }
  // })
  return new Promise(()=> "")
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const newNewsletter = {
    "newsletterId": todoId
  }
  const response = await Axios.post(`${apiEndpoint}/newsletters/publication`, newNewsletter, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.signedURL
}


export async function getSubscriptionsByNewsletterId(
  idToken: string,
  todoId: string
): Promise<string> {

  const response = await Axios.get(`${apiEndpoint}/newsletters/${todoId}/subscription`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
}



export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
