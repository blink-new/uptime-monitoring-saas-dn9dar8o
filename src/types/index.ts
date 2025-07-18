export interface Resource {
  id: string
  name: string // display name
  slug?: string // immutable slug format (optional for backward compatibility)
  tags: string[]
  status: 'online' | 'offline' | 'warning'
  lastChecked: string
  responseTime: number
  assignedUserId: string
  createdAt: string
  updatedAt: string
}

export interface Check {
  id: string
  name: string // immutable slug format
  title: string
  description?: string
  tags: string[]
  schedule: string // cron expression
  testType: 'uptime' | 'certificate' | 'response_time' | 'content' | 'ssl' | 'dns' | 'port'
  resourceId: string // required reference to resource
  criteria: Record<string, any>
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  resourceId: string
  checkId: string
  type: 'success' | 'failure' | 'warning'
  message: string
  details: Record<string, any>
  timestamp: string
}

export interface Notification {
  id: string
  resourceId: string
  userId: string
  type: 'email' | 'webhook'
  conditions: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName: string
  role: 'admin' | 'user'
}