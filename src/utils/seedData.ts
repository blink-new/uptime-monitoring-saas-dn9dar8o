import { DatabaseService } from '../services/database'
import { blink } from '../blink/client'

export async function seedSampleData() {
  try {
    const user = await blink.auth.me()
    if (!user) return

    // Check if data already exists
    const existingResources = await DatabaseService.getResources()
    if (existingResources.length > 0) {
      console.log('Sample data already exists')
      return
    }

    console.log('Seeding sample data...')
    
    // Check if database is available
    try {
      await blink.db.resources.list({ where: { userId: user.id }, limit: 1 })
    } catch (error) {
      console.log('Database not available, sample data will be shown from mock data')
      return
    }

    // Create sample resources
    const resource1 = await DatabaseService.createResource({
      name: 'Main Website',
      tags: ['Production', 'Website', 'Critical'],
      status: 'online',
      lastChecked: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      responseTime: 245,
      assignedUserId: user.id
    })

    const resource2 = await DatabaseService.createResource({
      name: 'API Endpoint',
      tags: ['Production', 'API', 'Backend'],
      status: 'warning',
      lastChecked: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      responseTime: 1200,
      assignedUserId: user.id
    })

    const resource3 = await DatabaseService.createResource({
      name: 'SSL Certificate',
      tags: ['Security', 'SSL', 'Production'],
      status: 'offline',
      lastChecked: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      responseTime: 0,
      assignedUserId: user.id
    })

    // Create sample checks
    const check1 = await DatabaseService.createCheck({
      resourceId: resource1.id,
      type: 'uptime',
      name: 'Website Uptime Check',
      criteria: { timeout: 30, expectedStatus: 200 },
      schedule: '*/5 * * * *', // Every 5 minutes
      isActive: true
    })

    const check2 = await DatabaseService.createCheck({
      resourceId: resource2.id,
      type: 'response_time',
      name: 'API Response Time',
      criteria: { maxResponseTime: 1000 },
      schedule: '*/2 * * * *', // Every 2 minutes
      isActive: true
    })

    const check3 = await DatabaseService.createCheck({
      resourceId: resource3.id,
      type: 'ssl',
      name: 'SSL Certificate Expiry',
      criteria: { daysBeforeExpiry: 30 },
      schedule: '0 0 * * *', // Daily at midnight
      isActive: true
    })

    // Create sample events
    await DatabaseService.createEvent({
      resourceId: resource1.id,
      checkId: check1.id,
      type: 'success',
      message: 'Website is responding normally',
      details: { statusCode: 200, responseTime: 245 },
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    })

    await DatabaseService.createEvent({
      resourceId: resource2.id,
      checkId: check2.id,
      type: 'warning',
      message: 'Response time exceeded threshold',
      details: { statusCode: 200, responseTime: 1200, threshold: 1000 },
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
    })

    await DatabaseService.createEvent({
      resourceId: resource3.id,
      checkId: check3.id,
      type: 'failure',
      message: 'SSL certificate check failed',
      details: { error: 'Connection timeout' },
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    })

    // Create sample notification
    await DatabaseService.createNotification({
      resourceId: resource1.id,
      userId: user.id,
      type: 'email',
      conditions: { onFailure: true, onWarning: false },
      isActive: true
    })

    console.log('Sample data seeded successfully!')
  } catch (error) {
    console.error('Error seeding sample data:', error)
  }
}