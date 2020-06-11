import { Publication } from '../models/Publication'
import { CreatePublicationRequest } from '../requests/CreatePublicationRequest'
import { PublicationDAO } from '../dataLayer/PublicationDAO'
import * as uuid from 'uuid'

const publicationDAO = new PublicationDAO()

export async function getUserPublications(userId: string, newsletterId?: string): Promise<Publication[]>{
    
    const rows =  await publicationDAO.getUserPublications(userId)

    if (newsletterId){
        return rows.filter((row) => row.newsletterId===newsletterId)
    }else{
        return rows 
    }
    
}

export async function getPublicationById(newsletterId: string, publicationId: string): Promise<Publication | {}>{
    
    return await publicationDAO.getPublicationById(newsletterId, publicationId)
}

export async function updatePublicationStatus(newsletterId: string, publicationId: string, sentStatus: boolean): Promise<void>{
    
    await publicationDAO.updatePublicationStatus(newsletterId, publicationId, sentStatus)
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