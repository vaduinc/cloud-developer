import { Publication } from '../models/Publication'
import { CreatePublicationRequest } from '../requests/CreatePublicationRequest'
import { PublicationDAO } from '../dataLayer/PublicationDAO'
import * as uuid from 'uuid'

const publicationDAO = new PublicationDAO()

export async function publishNewsletter(createPublicationRequest: CreatePublicationRequest, userId: string): Promise<Publication>{
    
    return await publicationDAO.createPublication({
        userId: userId,
        newsletterId: createPublicationRequest.newsletterId,
        publicationId: uuid.v4()
    })
   
}

export async function getSignedURL(publicationId: string): Promise<string>{

    return await publicationDAO.getUploadUrl(publicationId)

}