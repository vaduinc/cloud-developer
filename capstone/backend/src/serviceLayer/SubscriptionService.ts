import { Subscription } from '../models/Subscription'
import { CreateSubscriptionRequest } from '../requests/CreateSubscriptionRequest'
import { SubscriptionDAO } from '../dataLayer/SubscriptionDAO'
import * as uuid from 'uuid'

const subscriptionDAO = new SubscriptionDAO()

export async function getUserSubscripions(userId: string): Promise<Subscription[]>{
    
    return await subscriptionDAO.getUserSubscriptions(userId)
}

export async function saveSubscription(createSubscriptionRequest: CreateSubscriptionRequest, userId: string): Promise<Subscription>{
    
        return await subscriptionDAO.createSubscription({
            userId: userId,
            newsletterId: createSubscriptionRequest.newsletterId,
            enrolled: true,
            subscriptionId: uuid.v4()
        })
    
}
