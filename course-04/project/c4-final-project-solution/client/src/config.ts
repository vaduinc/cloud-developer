// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it

// User: jaimetest@vaduinc.com		
// Password: Jaimetest123

// User: anotheruser@vaduinc.com
// Password: Anotheruser123

const apiId = 'w1g7a8b6uk'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-1kjne1kz.auth0.com',            // Auth0 domain
  clientId: 'S5D44Ilt2Ge4s57rhaaZUmMyNZ6rRiwQ',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}