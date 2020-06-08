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
  Image,
  Loader
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'
import { parseUserId } from '../auth/utils'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  currentUserId: string
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    currentUserId: ''
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (newsletterId: string | undefined) => {
    this.props.history.push(`/todos/${newsletterId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string | undefined) => {
    // try {
    //   await deleteTodo(this.props.auth.getIdToken(), todoId)
    //   this.setState({
    //     todos: this.state.todos.filter(todo => todo.todoId != todoId)
    //   })
    // } catch {
    //   alert('Todo deletion failed')
    // }
  }

  onTodoCheck = async (pos: number) => {
    // try {
    //   const todo = this.state.todos[pos]
    //   await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
    //     name: todo.name,
    //     dueDate: todo.dueDate,
    //     done: !todo.done
    //   })
    //   this.setState({
    //     todos: update(this.state.todos, {
    //       [pos]: { done: { $set: !todo.done } }
    //     })
    //   })
    // } catch {
    //   alert('Todo deletion failed')
    // }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false, 
        currentUserId: parseUserId(this.props.auth.getIdToken())
      })
    } catch (e) {
      alert(`Failed to fetch newsletter: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">NEWSLETTERS</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.newsletterId}>
              <Grid.Column width={3} verticalAlign="middle">
                <h1>empty</h1>
              </Grid.Column>
              <Grid.Column width={7} verticalAlign="middle">
                {todo.longDesc}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.shortDesc}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                {(this.state.currentUserId === todo.userId) && (
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(todo.newsletterId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                )}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.newsletterId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {/* {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )} */}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
