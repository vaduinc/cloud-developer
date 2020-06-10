import { Subscription } from '../models/Subscription'
import { SaveSubscriptionRequest } from '../requests/SaveSubscriptionRequest'
import { SubscriptionDAO } from '../dataLayer/SubscriptionDAO'
import * as uuid from 'uuid'

const subscriptionDAO = new SubscriptionDAO()

export async function getUserSubscripions(userId: string): Promise<Subscription[]>{
    
    return await subscriptionDAO.getUserSubscriptions(userId)
}

export async function getSubscriptionsByNewsletterId(newsletterId: string): Promise<Subscription[]>{
    
    return await subscriptionDAO.getSubscriptionsByNewsletterId(newsletterId)
}


export async function saveSubscription(saveSubscriptionRequest: SaveSubscriptionRequest, userId: string): Promise<Subscription>{
    
        return await subscriptionDAO.createSubscription({
            userId: userId,
            newsletterId: saveSubscriptionRequest.newsletterId,
            enrolled: saveSubscriptionRequest.enrolled,
            subscriptionId: saveSubscriptionRequest.subscriptionId?saveSubscriptionRequest.subscriptionId:uuid.v4()
        })
    
}
