import { api } from './client'
import type { Task } from '../types/task'   

export async function fetchTasks(): Promise<Task[]> {
  
    const { data } = await api.get<Task[]>('/tasks')

    return data.slice(0, 10).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    completed: t.completed,
    priority: t.priority,
    }))
}
//Create new task
export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const { data } = await api.post<Task>('/tasks/', taskData)
  return data
}
//Editing task
export async function updateTask(id: number, partialTask: Partial<Task>): Promise<Task> {
    const {data} = await api.put<Task>(`/tasks/${id}/`, partialTask)
    return data
}
//Delete task
export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}/`)
}
// Mark/Delete all, Delete done 
// export async function bulkTaskAction(action: 'clear_all' | 'complete_all' | 'clear_completed'): Promise<void> {
//   await api.post('/tasks/bulk/', { action })
// }