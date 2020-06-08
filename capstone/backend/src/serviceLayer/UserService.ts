import { UserProfile } from '../models/UserProfile'
import { CreateProfileRequest } from '../requests/CreateProfileRequest'
import { UserDAO } from '../dataLayer/userDAO'
import { getSubscriptionsByNewsletterId } from './SubscriptionService'

const userDAO = new UserDAO()

export async function getUserProfile(userId: string): Promise<UserProfile>{
    
    return await userDAO.getUserProfile(userId)
}

export async function saveUserProfile(CreateProfileRequest: CreateProfileRequest, userId: string): Promise<UserProfile>{
    
    const userProfile = userDAO.getUserProfile

    if (userProfile) {
        return await userDAO.updateUserProfile({
            userId: userId,
            name: CreateProfileRequest.name,
            last: CreateProfileRequest.last,
            email: CreateProfileRequest.email
        })
    }else{
        return await userDAO.createUserProfile({
            userId: userId,
            name: CreateProfileRequest.name,
            last: CreateProfileRequest.last,
            email: CreateProfileRequest.email
        })
    }

}

/**
 * Get full user profiles subscribe to a newsletter
 * 
 * @param newsletterId 
 */
export async function getUserProfileByNewsletterId(newsletterId: string): Promise<UserProfile[]>{
    
    const subscriptions = await getSubscriptionsByNewsletterId(newsletterId)
    const usersId = await subscriptions.map( (sub) => {return sub.userId} )
  
    return await getUserProfilesById(usersId)
}


/**
 * Returns UserProfile collection calling the persistence storage (DynamoDb)
 * using the userIds coming in the input parameter
 * 
 * @param userIds 
 */
export async function getUserProfilesById(userIds: string[]): Promise<UserProfile[]> {

    let userProfile = []
  
    for (const userId of userIds){
        const profile = await getUserProfile(userId)
        userProfile.push(profile)
    }
   
    return userProfile
  }

