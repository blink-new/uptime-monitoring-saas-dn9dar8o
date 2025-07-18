import { Resource, Check, Event, Notification } from '../types'

export const mockResources: Resource[] = [
  {
    id: '1',
    name: 'Main Website',
    slug: 'main-website',
    tags: ['Production', 'Website', 'Critical'],
    status: 'online',
    lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    responseTime: 245,
    assignedUserId: 'user1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'API Endpoint',
    slug: 'api-endpoint',
    tags: ['Production', 'API', 'Backend'],
    status: 'warning',
    lastChecked: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    responseTime: 1200,
    assignedUserId: 'user1',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'SSL Certificate',
    slug: 'ssl-certificate',
    tags: ['Security', 'SSL', 'Production'],
    status: 'offline',
    lastChecked: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    responseTime: 0,
    assignedUserId: 'user2',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const mockChecks: Check[] = [
  {
    id: '1',
    resourceId: '1',
    testType: 'uptime',
    name: 'website-uptime-check',
    title: 'Website Uptime Check',
    description: 'Monitor main website availability',
    tags: ['uptime', 'critical'],
    criteria: { timeout: 30, expectedStatus: 200 },
    schedule: '*/5 * * * *', // Every 5 minutes
    isActive: true,
    userId: 'user1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    resourceId: '2',
    testType: 'response_time',
    name: 'api-response-time',
    title: 'API Response Time',
    description: 'Monitor API endpoint response time',
    tags: ['performance', 'api'],
    criteria: { maxResponseTime: 1000 },
    schedule: '*/2 * * * *', // Every 2 minutes
    isActive: true,
    userId: 'user1',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    resourceId: '3',
    testType: 'ssl',
    name: 'ssl-certificate-expiry',
    title: 'SSL Certificate Expiry',
    description: 'Check SSL certificate expiration',
    tags: ['security', 'ssl'],
    criteria: { daysBeforeExpiry: 30 },
    schedule: '0 0 * * *', // Daily at midnight
    isActive: true,
    userId: 'user2',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const mockEvents: Event[] = [
  {
    id: '1',
    resourceId: '1',
    checkId: '1',
    type: 'success',
    message: 'Website is responding normally',
    details: { statusCode: 200, responseTime: 245 },
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    resourceId: '2',
    checkId: '2',
    type: 'warning',
    message: 'Response time exceeded threshold',
    details: { statusCode: 200, responseTime: 1200, threshold: 1000 },
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    resourceId: '3',
    checkId: '3',
    type: 'failure',
    message: 'SSL certificate check failed',
    details: { error: 'Connection timeout' },
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
]

export const mockNotifications: Notification[] = [
  {
    id: '1',
    resourceId: '1',
    userId: 'user1',
    type: 'email',
    conditions: { onFailure: true, onWarning: false },
    isActive: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
]