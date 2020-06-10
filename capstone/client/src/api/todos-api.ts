import { apiEndpoint } from '../config'
import { Newsletter } from '../types/Newsletter';
import { CreateNewsletterRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';
import { Todos } from '../components/Todos';
import { Subscription } from '../types/Subscription';
import { UserProfile } from '../types/UserProfile';

export async function getAllNewsletters(idToken: string): Promise<Newsletter[]> {
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

export async function createNewsletter(
  idToken: string,
  newTodo: CreateNewsletterRequest
): Promise<Newsletter> {
  const response = await Axios.post(`${apiEndpoint}/newsletters`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
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
): Promise<Subscription[]> {

  const response = await Axios.get(`${apiEndpoint}/newsletters/${todoId}/subscription`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
}

export async function getUserSubscriptions(
  idToken: string
): Promise<Subscription[]> {

  const response = await Axios.get(`${apiEndpoint}/newsletters/subscription`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
}

export async function getUserProfile(
  idToken: string
): Promise<UserProfile> {

  const response = await Axios.get(`${apiEndpoint}/userprofile`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
}


export async function subscribe2Newsletter(
  idToken: string,
  todoId: string | undefined,
  enrolled: boolean,
  subscriptionId: string | undefined
): Promise<Subscription> {

  const subs2news = {
    "newsletterId": todoId,
    "enrolled": enrolled,
    "subscriptionId": subscriptionId
  }

  console.log(subs2news)

  const response = await Axios.post(`${apiEndpoint}/newsletters/subscription`,subs2news, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.data
}

export async function saveProfile(
  idToken: string,
  name: string,
  last: string,
  email: string
): Promise<Subscription> {

  const profle = {
    "name": name,
    "last": last,
    "email": email,
  }
  const response = await Axios.post(`${apiEndpoint}/userprofile`,profle, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data
}


export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
