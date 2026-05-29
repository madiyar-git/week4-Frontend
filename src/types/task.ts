export interface Task {
  id: number
  title: string
  description?: string // знак вопроса означает, что поле необязательное
  completed: boolean
  priority: 'low' | 'medium' | 'high' // литерал 
}

//TODO export interface NewTask extends Task: Omit<id | title>