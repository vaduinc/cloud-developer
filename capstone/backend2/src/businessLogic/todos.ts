import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { TodoAccess } from '../dataLayer/todoAccess'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId: string): Promise<TodoItem[]>{
    
    return await todoAccess.getAllTodos(userId)
}

export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<TodoItem>{
    
    const todoId = uuid.v4()

    return await todoAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false
    })
}

export async function updateTodo(todoId: string, userId: string, updatedTodo: UpdateTodoRequest): Promise<boolean>{

    return await todoAccess.updateTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        name: updatedTodo.name,
        dueDate: updatedTodo.dueDate,
        done: updatedTodo.done
    })
}

export async function updateTodoAttachment(todoId: string, userId: string): Promise<string>{

    const url = await todoAccess.getUploadUrl(todoId)

    await todoAccess.updateTodoURL(todoId , userId)

    return url
}

export async function deleteTodo(todoId: string, userId: string): Promise<boolean>{
    return await todoAccess.deleteTodo(todoId, userId)
}
