import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { History } from 'history'
import { saveProfile, getUserProfile } from '../api/todos-api'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  auth: Auth
  history: History
}

interface EditTodoState {
  name: string
  last: string
  email: string
}

export class Profile extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    name: '',
    last: '',
    email: ''
  }

  async componentDidMount() {

      const userProfile =  await getUserProfile(this.props.auth.getIdToken())

      this.setState({
        name: userProfile.name?userProfile.name:'',
        last: userProfile.last?userProfile.last:'',
        email: userProfile.email?userProfile.email:''
      })
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleLastChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ last: event.target.value })
  }

  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ email: event.target.value })
  }
  
  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.name || !this.state.last ) {
        alert('Name and Last are required')
        return
      }

      const savedProfile = await saveProfile(this.props.auth.getIdToken(), this.state.name, this.state.last, this.state.email)

      // this.setUploadState(UploadState.FetchingPresignedUrl)
      // const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.todoId)

      // this.setUploadState(UploadState.UploadingFile)
      // await uploadFile(uploadUrl, this.state.name)

      alert('Profile saved!')
      this.props.history.push(`/`)
    } catch (e) {
      alert('Could not save Profile: ' + e.message)
    } finally {
      //this.setUploadState(UploadState.NoUpload)
    }
  }

  render() {
    return (
      <div>
        <h1>User Profile</h1>

        {((!this.state.email || this.state.email==="")) && (
          <h1>
            YOU NEED TO SET UP AND EMAIL IF YOU WANT TO SUBSCRIBE TO ANY NEWSLETTERS.
            You still will be able to create and publish newsletters without setting up
            and email though.
          </h1>
        )}

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              type="text"
              placeholder="First name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>

          <Form.Field>
            <label>Last</label>
            <input
              type="text"
              placeholder="Last name"
              value={this.state.last}
              onChange={this.handleLastChange}
            />
          </Form.Field>

          <Form.Field>
            <label>Email</label>
            <input
              type="text"
              placeholder="Email"
              value={this.state.email}
              onChange={this.handleEmailChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        <Button
            type="submit"
          >
           SAVE
        </Button>
      </div>
    )
  }
}
