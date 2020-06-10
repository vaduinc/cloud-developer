/**
 * Fields in a request to create a Subscription for a user
 */
export interface SaveSubscriptionRequest {
    newsletterId: string
    enrolled: boolean
    subscriptionId?: string
  }
  