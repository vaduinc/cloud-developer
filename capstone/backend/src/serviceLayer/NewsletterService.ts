import { Newsletter } from '../models/Newsletter'
import { CreateNewsletterRequest } from '../requests/CreateNewsletterRequest'
import { NewsletterDAO } from '../dataLayer/NewsletterDAO'
import * as uuid from 'uuid'

const newsletterDAO = new NewsletterDAO()

export async function getAllNewsletters(): Promise<Newsletter[]>{
    
    return await newsletterDAO.getAllNewsletters()
}

export async function getUserNewsletters(userId: string): Promise<Newsletter[]>{
    
    return await newsletterDAO.getUserNewsletters(userId)
}

export async function saveNewsletter(createNewsletterRequest: CreateNewsletterRequest, userId: string): Promise<Newsletter>{
    
        return await newsletterDAO.createNewsletter({
            userId: userId,
            shortDesc: createNewsletterRequest.shortDesc,
            longDesc: createNewsletterRequest.longDesc,
            newsletterId: uuid.v4()
        })
    
}
