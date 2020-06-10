import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Loader,
  Segment
} from 'semantic-ui-react'

import { createNewsletter, getAllNewsletters, getUserSubscriptions, subscribe2Newsletter, getUserProfile } from '../api/api-layer'
import Auth from '../auth/Auth'
import { Newsletter } from '../types/Newsletter'
import { Subscription } from '../types/Subscription'
import { UserProfile } from '../types/UserProfile'

interface NewslettersProps {
  auth: Auth
  history: History
}

interface NewsletterState {
  newsletters: Newsletter[]
  newNewsletterTitle: string
  newNewsletterDescription: string
  loadingNewsletters: boolean
  currentUser: UserProfile | null
}

export class Newsletters extends React.PureComponent<NewslettersProps, NewsletterState> {
  state: NewsletterState = {
    newsletters: [],
    newNewsletterTitle: '',
    newNewsletterDescription: '',
    loadingNewsletters: true,
    currentUser: null
  }

  handleShortDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNewsletterTitle: event.target.value })
  }

  handleLongDescChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newNewsletterDescription: event.target.value })
  }

  onPublishButtonClick = (newsletterId: string | undefined) => {
    this.props.history.push(`/newsletter/${newsletterId}/publish`)
  }

  onProfileClick = () => {
    this.props.history.push(`/profile`)
  }

  onNewsletterCreate = async () => {
    try {
      const newNewsletter = await createNewsletter(this.props.auth.getIdToken(), {
        shortDesc: this.state.newNewsletterTitle,
        longDesc: this.state.newNewsletterDescription
      })
      newNewsletter.owner = true
      newNewsletter.subscribed = false

      this.setState({
        newsletters: [...this.state.newsletters, newNewsletter],
        newNewsletterTitle: '',
        newNewsletterDescription: ''
      })
      alert('Newsletter saved. Check the bottom of the list!')
    } catch {
      alert('Newsletter creation failed')
    }
  }

  onSentNewsletters = async (newsletterId: string | undefined) => {
    this.props.history.push(`/received/${newsletterId}`)

  }

  onSubscribeCheck = async (pos: number) => {
    try {
      const newsletter = this.state.newsletters[pos]
      const subscription = await subscribe2Newsletter(this.props.auth.getIdToken(), newsletter.newsletterId, !newsletter.subscribed, newsletter.subscriptionId)
      this.setState({
        newsletters: update(this.state.newsletters, {
          [pos]: { subscribed: { $set: subscription.enrolled }, subscriptionId: { $set: subscription.subscriptionId }  }
        })
      })
    } catch {
      alert('Newsletter subscription failed')
    }
  }

  async componentDidMount() {
    try {
      const newsletters = await getAllNewsletters(this.props.auth.getIdToken())
      const userSubscriptions = await getUserSubscriptions(this.props.auth.getIdToken())
      const userProfile =  await getUserProfile(this.props.auth.getIdToken())
      const mergeData = await this.mergeData(newsletters, userSubscriptions, userProfile.userId)

      console.log('mergeData')
      console.log(mergeData)

      this.setState({
        newsletters: mergeData,
        loadingNewsletters: false, 
        currentUser: userProfile
      })
    } catch (e) {
      alert(`Failed to fetch newsletters: ${e.message}`)
    }
  }

  async mergeData(newsletters: Newsletter[], userSubscriptions: Subscription[], currentUserId: string): Promise<Newsletter[]>{
    return newsletters.map((newsletter) => {
        const mysubs = userSubscriptions.filter((subs) => subs.newsletterId === newsletter.newsletterId)

        let enrolled = false
        let subsid = undefined
        if (mysubs.length !== 0){
          enrolled = mysubs[0].enrolled
          subsid = mysubs[0].subscriptionId
        }
        const myletter = (currentUserId === newsletter.userId)?true:false

        return {
          newsletterId: newsletter.newsletterId,
          longDesc: newsletter.longDesc,
          shortDesc: newsletter.shortDesc,
          userId: newsletter.userId,
          subscribed: enrolled,
          owner: myletter,
          subscriptionId: subsid
        }
    })
  }

  render() {
    return (
      <div>
        <Header as="h1">NEWSLETTERS</Header>
        {(this.state.currentUser!== null &&  (!this.state.currentUser.email || this.state.currentUser.email==="")) && (
          <h1>
            YOU NEED TO SET UP AND EMAIL IF YOU WANT TO SUBSCRIBE TO ANY NEWSLETTERS. 
            Click the icon to set up the profile {this.renderProfile()} <br></br>
            You still will be able to create and publish newsletters without setting up
            and email though. 
          </h1>
        )}

        {this.renderCreateNewsletterInput()}

        {this.renderNewsletters()}
      </div>
    )
  }

  renderCreateNewsletterInput() {
    return (
      <Grid.Row>
        <Grid.Column width={10}>
          <Segment inverted>
            <Input
              fluid
              actionPosition="left"
              placeholder="title..."
              onChange={this.handleShortDescChange}
            />
            <Input
              fluid
              actionPosition="left"
              placeholder="description..."
              onChange={this.handleLongDescChange}
            />
            <br></br>
            <Button primary content='Add Newsletter' onClick={this.onNewsletterCreate} />
          </Segment>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderProfile(){
    return (
      <Button
        icon
        color="blue"
        onClick={() => this.onProfileClick()}
      >
        <Icon name="user" />
      </Button>
    )
  }

  renderNewsletters() {
    if (this.state.loadingNewsletters) {
      return this.renderLoading()
    }

    return this.renderNewslettersList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading NEWSLETTERs
        </Loader>
      </Grid.Row>
    )
  }

  renderNewslettersList() {
    return (
      <Grid padded>
        {this.state.newsletters.map((newsl, pos) => {
          return (
            <Grid.Row key={newsl.newsletterId}>
              <Grid.Column width={3} verticalAlign="middle">
                {(this.state.currentUser!== null &&  (!this.state.currentUser.email || this.state.currentUser.email==="")) && (
                  <span>missing email</span>
                )}
                {(this.state.currentUser!== null && (this.state.currentUser.email && this.state.currentUser.email!=="")) && (
                  <Checkbox
                    onChange={() => this.onSubscribeCheck(pos)}
                    checked={newsl.subscribed}
                  />
                )}
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle">
                {newsl.longDesc}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {newsl.shortDesc}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {(newsl.owner) && (
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onPublishButtonClick(newsl.newsletterId)}
                  >
                    <Icon name="file alternate outline" />
                  </Button>
                )}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="yellow"
                  onClick={() => this.onSentNewsletters(newsl.newsletterId)}
                >
                  <Icon name="numbered list" />
                </Button>
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
