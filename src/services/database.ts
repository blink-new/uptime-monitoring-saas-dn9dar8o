import { blink } from '../blink/client'
import { Resource, Check, Event, Notification } from '../types'
import { mockResources, mockChecks, mockEvents, mockNotifications } from '../data/mockData'

// Database service functions using Blink SDK
export class DatabaseService {
  // Check if database is available
  private static async isDatabaseAvailable(): Promise<boolean> {
    try {
      // Try a simple query to test database availability
      await blink.db.resources.list({ limit: 1 })
      return true
    } catch (error) {
      // Database not available, use mock data
      console.log('Database not available, using mock data. This is normal for demo purposes.')
      return false
    }
  }

  // Resources
  static async getResources(): Promise<Resource[]> {
    try {
      const user = await blink.auth.me()
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Using mock data for demo purposes
        return mockResources.map(resource => ({
          ...resource,
          assignedUserId: user.id
        }))
      }

      const resources = await blink.db.resources.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
      
      return resources.map(this.mapResourceFromDb)
    } catch (error) {
      // Fallback to mock data
      try {
        const user = await blink.auth.me()
        return mockResources.map(resource => ({
          ...resource,
          assignedUserId: user.id
        }))
      } catch (authError) {
        // If auth also fails, return mock data with default user
        return mockResources.map(resource => ({
          ...resource,
          assignedUserId: 'demo-user'
        }))
      }
    }
  }

  static async createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>): Promise<Resource> {
    try {
      const user = await blink.auth.me()
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulating resource creation for demo
        const now = new Date().toISOString()
        return {
          id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...resource,
          assignedUserId: resource.assignedUserId || user.id,
          createdAt: now,
          updatedAt: now
        }
      }

      const now = new Date().toISOString()
      const newResource = await blink.db.resources.create({
        id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        name: resource.name,
        slug: resource.slug || resource.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        tags: JSON.stringify(resource.tags),
        status: resource.status,
        lastChecked: resource.lastChecked,
        responseTime: resource.responseTime,
        assignedUserId: resource.assignedUserId,
        createdAt: now,
        updatedAt: now
      })
      
      return this.mapResourceFromDb(newResource)
    } catch (error) {
      // Fallback: simulate creation
      try {
        const user = await blink.auth.me()
        const now = new Date().toISOString()
        return {
          id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...resource,
          assignedUserId: resource.assignedUserId || user.id,
          createdAt: now,
          updatedAt: now
        }
      } catch (authError) {
        // If auth also fails, return with default user
        const now = new Date().toISOString()
        return {
          id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...resource,
          assignedUserId: resource.assignedUserId || 'demo-user',
          createdAt: now,
          updatedAt: now
        }
      }
    }
  }

  static async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulate update for demo
        const now = new Date().toISOString()
        return {
          id,
          name: updates.name || 'Updated Resource',
          slug: updates.slug || 'updated-resource',
          tags: updates.tags || [],
          status: updates.status || 'offline',
          lastChecked: updates.lastChecked || '',
          responseTime: updates.responseTime || 0,
          assignedUserId: updates.assignedUserId || 'demo-user',
          createdAt: now,
          updatedAt: now
        }
      }

      const updatedResource = await blink.db.resources.update(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      
      return this.mapResourceFromDb(updatedResource)
    } catch (error) {
      // Fallback: simulate update
      const now = new Date().toISOString()
      return {
        id,
        name: updates.name || 'Updated Resource',
        slug: updates.slug || 'updated-resource',
        tags: updates.tags || [],
        status: updates.status || 'offline',
        lastChecked: updates.lastChecked || '',
        responseTime: updates.responseTime || 0,
        assignedUserId: updates.assignedUserId || 'demo-user',
        createdAt: now,
        updatedAt: now
      }
    }
  }

  static async deleteResource(id: string): Promise<void> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulate deletion for demo
        console.log(`Simulated deletion of resource ${id}`)
        return
      }

      await blink.db.resources.delete(id)
    } catch (error) {
      // Fallback: simulate deletion
      console.log(`Simulated deletion of resource ${id} (database unavailable)`)
    }
  }

  // Checks
  static async getChecks(resourceId?: string): Promise<Check[]> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Using mock checks for demo
        console.log('Database not available, using mock checks data for demo purposes.')
        let checks = [...mockChecks] // Create a copy
        if (resourceId) {
          checks = checks.filter(check => check.resourceId === resourceId)
        }
        return checks
      }

      const user = await blink.auth.me()
      const whereClause = resourceId 
        ? { userId: user.id, resourceId }
        : { userId: user.id }
      
      const checks = await blink.db.checks.list({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
      
      return checks.map(this.mapCheckFromDb)
    } catch (error) {
      // Fallback to mock data
      console.log('Using mock checks data (database unavailable)', error)
      let checks = [...mockChecks] // Create a copy
      if (resourceId) {
        checks = checks.filter(check => check.resourceId === resourceId)
      }
      return checks
    }
  }

  static async createCheck(check: Omit<Check, 'id' | 'createdAt' | 'updatedAt'>): Promise<Check> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulate check creation for demo
        const user = await blink.auth.me()
        const now = new Date().toISOString()
        return {
          id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...check,
          userId: user.id,
          createdAt: now,
          updatedAt: now
        }
      }

      const user = await blink.auth.me()
      const now = new Date().toISOString()
      
      const newCheck = await blink.db.checks.create({
        id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        resourceId: check.resourceId,
        testType: check.testType,
        name: check.name,
        title: check.title || check.name,
        description: check.description,
        tags: JSON.stringify(check.tags || []),
        criteria: JSON.stringify(check.criteria),
        schedule: check.schedule,
        isActive: check.isActive ? 1 : 0,
        createdAt: now,
        updatedAt: now
      })
      
      return this.mapCheckFromDb(newCheck)
    } catch (error) {
      // Fallback: simulate creation
      try {
        const user = await blink.auth.me()
        const now = new Date().toISOString()
        return {
          id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...check,
          userId: user.id,
          createdAt: now,
          updatedAt: now
        }
      } catch (authError) {
        // If auth also fails, return with default user
        const now = new Date().toISOString()
        return {
          id: `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...check,
          userId: 'demo-user',
          createdAt: now,
          updatedAt: now
        }
      }
    }
  }

  static async updateCheck(id: string, updates: Partial<Check>): Promise<Check> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulate update for demo
        const now = new Date().toISOString()
        return {
          id,
          resourceId: updates.resourceId || 'resource_1',
          testType: updates.testType || 'uptime',
          name: updates.name || 'updated-check',
          title: updates.title || 'Updated Check',
          description: updates.description || '',
          tags: updates.tags || [],
          criteria: updates.criteria || {},
          schedule: updates.schedule || '*/15 * * * *',
          isActive: updates.isActive !== undefined ? updates.isActive : true,
          userId: 'demo-user',
          createdAt: now,
          updatedAt: now
        }
      }

      const updateData: any = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      if (updates.criteria) {
        updateData.criteria = JSON.stringify(updates.criteria)
      }
      
      if (updates.tags) {
        updateData.tags = JSON.stringify(updates.tags)
      }
      
      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive ? 1 : 0
      }
      
      const updatedCheck = await blink.db.checks.update(id, updateData)
      return this.mapCheckFromDb(updatedCheck)
    } catch (error) {
      // Fallback: simulate update
      const now = new Date().toISOString()
      return {
        id,
        resourceId: updates.resourceId || 'resource_1',
        testType: updates.testType || 'uptime',
        name: updates.name || 'updated-check',
        title: updates.title || 'Updated Check',
        description: updates.description || '',
        tags: updates.tags || [],
        criteria: updates.criteria || {},
        schedule: updates.schedule || '*/15 * * * *',
        isActive: updates.isActive !== undefined ? updates.isActive : true,
        userId: 'demo-user',
        createdAt: now,
        updatedAt: now
      }
    }
  }

  static async deleteCheck(id: string): Promise<void> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Simulate deletion for demo
        console.log(`Simulated deletion of check ${id}`)
        return
      }

      await blink.db.checks.delete(id)
    } catch (error) {
      // Fallback: simulate deletion
      console.log(`Simulated deletion of check ${id} (database unavailable)`)
    }
  }

  // Events
  static async getEvents(resourceId?: string, limit: number = 50): Promise<Event[]> {
    try {
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Using mock events for demo
        console.log('Database not available, using mock events data for demo purposes.')
        let events = [...mockEvents] // Create a copy
        if (resourceId) {
          events = events.filter(event => event.resourceId === resourceId)
        }
        return events.slice(0, limit)
      }

      const user = await blink.auth.me()
      const whereClause = resourceId 
        ? { userId: user.id, resourceId }
        : { userId: user.id }
      
      const events = await blink.db.events.list({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        limit
      })
      
      return events.map(this.mapEventFromDb)
    } catch (error) {
      // Fallback to mock data
      console.log('Using mock events data (database unavailable)', error)
      let events = [...mockEvents] // Create a copy
      if (resourceId) {
        events = events.filter(event => event.resourceId === resourceId)
      }
      return events.slice(0, limit)
    }
  }

  static async createEvent(event: Omit<Event, 'id'>): Promise<Event> {
    const user = await blink.auth.me()
    
    const newEvent = await blink.db.events.create({
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      resourceId: event.resourceId,
      checkId: event.checkId,
      type: event.type,
      message: event.message,
      details: JSON.stringify(event.details),
      timestamp: event.timestamp
    })
    
    return this.mapEventFromDb(newEvent)
  }

  // Notifications
  static async getNotifications(resourceId?: string): Promise<Notification[]> {
    try {
      const user = await blink.auth.me()
      const dbAvailable = await this.isDatabaseAvailable()
      
      if (!dbAvailable) {
        // Using mock notifications for demo
        let notifications = mockNotifications.map(notification => ({
          ...notification,
          userId: user.id
        }))
        if (resourceId) {
          notifications = notifications.filter(notification => notification.resourceId === resourceId)
        }
        return notifications
      }

      const whereClause = resourceId 
        ? { userId: user.id, resourceId }
        : { userId: user.id }
      
      const notifications = await blink.db.notifications.list({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      })
      
      return notifications.map(this.mapNotificationFromDb)
    } catch (error) {
      // Fallback to mock data
      console.log('Using mock notifications data (database unavailable)')
      try {
        const user = await blink.auth.me()
        let notifications = mockNotifications.map(notification => ({
          ...notification,
          userId: user.id
        }))
        if (resourceId) {
          notifications = notifications.filter(notification => notification.resourceId === resourceId)
        }
        return notifications
      } catch (authError) {
        // If auth also fails, return mock data with default user
        let notifications = mockNotifications.map(notification => ({
          ...notification,
          userId: 'demo-user'
        }))
        if (resourceId) {
          notifications = notifications.filter(notification => notification.resourceId === resourceId)
        }
        return notifications
      }
    }
  }

  static async createNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const user = await blink.auth.me()
    const now = new Date().toISOString()
    
    const newNotification = await blink.db.notifications.create({
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      resourceId: notification.resourceId,
      notificationUserId: notification.userId,
      type: notification.type,
      conditions: JSON.stringify(notification.conditions),
      isActive: notification.isActive ? 1 : 0,
      createdAt: now,
      updatedAt: now
    })
    
    return this.mapNotificationFromDb(newNotification)
  }

  static async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    if (updates.conditions) {
      updateData.conditions = JSON.stringify(updates.conditions)
    }
    
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive ? 1 : 0
    }
    
    const updatedNotification = await blink.db.notifications.update(id, updateData)
    return this.mapNotificationFromDb(updatedNotification)
  }

  static async deleteNotification(id: string): Promise<void> {
    await blink.db.notifications.delete(id)
  }

  // Mapping functions to convert database format to app format
  private static mapResourceFromDb(dbResource: any): Resource {
    return {
      id: dbResource.id,
      name: dbResource.name,
      slug: dbResource.slug,
      tags: JSON.parse(dbResource.tags || '[]'),
      status: dbResource.status,
      lastChecked: dbResource.lastChecked || '',
      responseTime: dbResource.responseTime || 0,
      assignedUserId: dbResource.assignedUserId,
      createdAt: dbResource.createdAt,
      updatedAt: dbResource.updatedAt
    }
  }

  private static mapCheckFromDb(dbCheck: any): Check {
    return {
      id: dbCheck.id,
      resourceId: dbCheck.resourceId,
      testType: dbCheck.testType || dbCheck.type, // Handle both field names
      name: dbCheck.name,
      title: dbCheck.title || dbCheck.name,
      description: dbCheck.description,
      tags: JSON.parse(dbCheck.tags || '[]'),
      criteria: JSON.parse(dbCheck.criteria || '{}'),
      schedule: dbCheck.schedule,
      isActive: Number(dbCheck.isActive) > 0,
      userId: dbCheck.userId,
      createdAt: dbCheck.createdAt,
      updatedAt: dbCheck.updatedAt
    }
  }

  private static mapEventFromDb(dbEvent: any): Event {
    return {
      id: dbEvent.id,
      resourceId: dbEvent.resourceId,
      checkId: dbEvent.checkId,
      type: dbEvent.type,
      message: dbEvent.message,
      details: JSON.parse(dbEvent.details || '{}'),
      timestamp: dbEvent.timestamp
    }
  }

  private static mapNotificationFromDb(dbNotification: any): Notification {
    return {
      id: dbNotification.id,
      resourceId: dbNotification.resourceId,
      userId: dbNotification.notificationUserId,
      type: dbNotification.type,
      conditions: JSON.parse(dbNotification.conditions || '{}'),
      isActive: Number(dbNotification.isActive) > 0,
      createdAt: dbNotification.createdAt,
      updatedAt: dbNotification.updatedAt
    }
  }
}