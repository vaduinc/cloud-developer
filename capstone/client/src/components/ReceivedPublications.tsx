import * as React from 'react'
import { Grid, Divider, Loader, Checkbox } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getReceivedUserPublicationsByNewsletterId } from '../api/api-layer'
import { Publication } from '../types/Publication'
import { History } from 'history'

interface ReceivedPublicationsProps {
  match: {
    params: {
      newsletterId: string
    }
  }
  auth: Auth
}

interface ReceivedPublicationsState {
   publicationsReceived : Publication[]
   loading: boolean
}

export class ReceivedPublications extends React.PureComponent<
  ReceivedPublicationsProps,
  ReceivedPublicationsState
> {
  state: ReceivedPublicationsState = {
    publicationsReceived :[],
    loading: true
  }

  async componentDidMount() {

      const received =  await getReceivedUserPublicationsByNewsletterId(this.props.auth.getIdToken(),this.props.match.params.newsletterId)

      this.setState({
        publicationsReceived :received,
        loading: false
      })
  }

  render() {
    return (
      <div>
        <h1>Pubications Received</h1>

        {this.renderNewsletters()}
      </div>
    )
  }

  renderNewsletters() {
    if (this.state.loading) {
      return this.renderLoading()
    }

    return this.renderNewslettersList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading data...
        </Loader>
      </Grid.Row>
    )
  }


  renderNewslettersList() {

    if (this.state.publicationsReceived.length===0){
      return (<div><h1>YOU HAVEN'T RECEIVED ANY PUBLICATIONS YET !</h1> <h3>Newsletter id {this.props.match.params.newsletterId}</h3></div>)
    }

    return (
      <Grid padded>
        {this.state.publicationsReceived.map((newsl, pos) => {
          return (
            <Grid.Row key={newsl.publicationId}>
              <Grid.Column width={3} verticalAlign="middle">
                <Checkbox
                  disabled
                  checked={newsl.sent}
                />
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle">
                {newsl.createdAt}
              </Grid.Column>
              <Grid.Column width={6} floated="right">
                <a target="_blank" href={newsl.attachementURL}>Click here to see document</a>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
