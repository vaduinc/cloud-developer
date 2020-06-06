import { Publication } from '../models/Publication'
import { CreatePublicationRequest } from '../requests/CreatePublicationRequest'
import { PublicationDAO } from '../dataLayer/PublicationDAO'
import * as uuid from 'uuid'

const publicationDAO = new PublicationDAO()

export async function getUserPublications(userId: string): Promise<Publication[]>{
    
    return await publicationDAO.getUserPublications(userId)
}

export async function getPublicationById(newsletterId: string, publicationId: string): Promise<Publication>{
    
    return await publicationDAO.getPublicationById(newsletterId, publicationId)
}

export async function publishNewsletter(createPublicationRequest: CreatePublicationRequest, userId: string): Promise<Publication>{
    
    return await publicationDAO.createPublication({
        userId: userId,
        newsletterId: createPublicationRequest.newsletterId,
        publicationId: uuid.v4()
    })
}

export async function getSignedURL(newsletterId: string, publicationId: string): Promise<string>{

    return await publicationDAO.getUploadUrl(newsletterId, publicationId)

}