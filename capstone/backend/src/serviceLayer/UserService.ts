import { UserProfile } from '../models/UserProfile'
import { CreateProfileRequest } from '../requests/CreateProfileRequest'
import { UserDAO } from '../dataLayer/userDAO'

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
