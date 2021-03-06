import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { History } from 'history'
import { getUploadUrl, uploadFile, getSubscriptionsByNewsletterId } from '../api/api-layer'

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface PublishNewsletterProps {
  match: {
    params: {
      newsletterId: string
    }
  }
  history: History
  auth: Auth
}

interface PublishNewsletterState {
  file: any
  uploadState: UploadState
  subsSize: number
}

export class PublishNewsletter extends React.PureComponent<
  PublishNewsletterProps,
  PublishNewsletterState
> {
  state: PublishNewsletterState = {
    file: undefined,
    uploadState: UploadState.NoUpload,
    subsSize: 0
  }

  async componentDidMount() {
    try {
      const subscriptions = await getSubscriptionsByNewsletterId(this.props.auth.getIdToken(),this.props.match.params.newsletterId)

      const howMany = subscriptions.filter((sub) => sub.enrolled===true)

      this.setState({
        subsSize: howMany.length
      })
    } catch (e) {
      alert(`Failed to fetch subscriptions: ${e.message}`)
    }
  }


  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.newsletterId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      alert('File was uploaded!')
      this.props.history.push(`/`)
    } catch (e) {
      alert('Could not upload a file: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new PDF Newsletter</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="pdf/*"
              placeholder="File to upload"
              onChange={this.handleFileChange}
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
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading file metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        {this.state.subsSize === 0 && <p>No subscriptions for newsletter found yet.</p>}
        {this.state.subsSize !== 0 && (
          <Button
            primary
            loading={this.state.uploadState !== UploadState.NoUpload}
            type="submit"
          >
            Upload
          </Button>
        )}
      </div>
    )
  }
}
