import { apiEndpoint } from '../config'
import { Newsletter } from '../types/Newsletter';
import { Publication } from '../types/Publication';
import { CreateNewsletterRequest } from '../types/CreateNewsletterRequest';
import Axios from 'axios'
import { Subscription } from '../types/Subscription';
import { UserProfile } from '../types/UserProfile';

export async function getAllNewsletters(idToken: string): Promise<Newsletter[]> {
  console.log('Fetching all newsletters')

  const response = await Axios.get(`${apiEndpoint}/newsletters/all`, {
    headers: getHeaders(idToken)
  })
  console.log('All Newsletters:', response.data)
  return response.data.data
}

export async function createNewsletter(
  idToken: string,
  newNewsletter: CreateNewsletterRequest
): Promise<Newsletter> {
  const response = await Axios.post(`${apiEndpoint}/newsletters`,  JSON.stringify(newNewsletter), {
    headers: getHeaders(idToken)
  })
  return response.data.data
}

export async function getUploadUrl(
  idToken: string,
  newsletterId: string
): Promise<string> {
  const newNewsletter = {
    "newsletterId": newsletterId
  }
  const response = await Axios.post(`${apiEndpoint}/newsletters/publication`, newNewsletter, {
    headers: getHeaders(idToken)
  })
  return response.data.signedURL
}

export async function getReceivedUserPublicationsByNewsletterId(
  idToken: string,
  newsletterId: string
): Promise<Publication[]> {
  const response = await Axios.get(`${apiEndpoint}/newsletters/publication?newsletterId=${newsletterId}` ,{
    headers: getHeaders(idToken)
  })
  return response.data.data
}

export async function getSubscriptionsByNewsletterId(
  idToken: string,
  newsletterId: string
): Promise<Subscription[]> {

  const response = await Axios.get(`${apiEndpoint}/newsletters/${newsletterId}/subscription`, {
    headers: getHeaders(idToken)
  })
  return response.data.data
}

export async function getUserSubscriptions(
  idToken: string
): Promise<Subscription[]> {

  const response = await Axios.get(`${apiEndpoint}/newsletters/subscription`, {
    headers: getHeaders(idToken)
  })
  return response.data.data
}

export async function getUserProfile(
  idToken: string
): Promise<UserProfile> {

  const response = await Axios.get(`${apiEndpoint}/userprofile`, {
    headers: getHeaders(idToken)
  })
  return response.data.data
}


export async function subscribe2Newsletter(
  idToken: string,
  newsletterId: string | undefined,
  enrolled: boolean,
  subscriptionId: string | undefined
): Promise<Subscription> {

  const subs2news = {
    "newsletterId": newsletterId,
    "enrolled": enrolled,
    "subscriptionId": subscriptionId
  }

  console.log(subs2news)

  const response = await Axios.post(`${apiEndpoint}/newsletters/subscription`,subs2news, {
    headers: getHeaders(idToken)
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
    headers: getHeaders(idToken)
  })
  return response.data
}


export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}


function getHeaders(idToken: string) {
  return  {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  }
}
