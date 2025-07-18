import { useState, useEffect, useCallback } from 'react'
import { DatabaseService } from '../services/database'
import { Resource, Check, Event, Notification } from '../types'
import { blink } from '../blink/client'

// Hook for managing resources
export function useResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DatabaseService.getResources()
      setResources(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }, [])

  const createResource = useCallback(async (resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newResource = await DatabaseService.createResource(resource)
      setResources(prev => [newResource, ...prev])
      return newResource
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resource')
      throw err
    }
  }, [])

  const updateResource = useCallback(async (id: string, updates: Partial<Resource>) => {
    try {
      const updatedResource = await DatabaseService.updateResource(id, updates)
      setResources(prev => prev.map(r => r.id === id ? updatedResource : r))
      return updatedResource
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resource')
      throw err
    }
  }, [])

  const deleteResource = useCallback(async (id: string) => {
    try {
      await DatabaseService.deleteResource(id)
      setResources(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resource')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  return {
    resources,
    loading,
    error,
    refetch: fetchResources,
    createResource,
    updateResource,
    deleteResource
  }
}

// Hook for managing checks
export function useChecks(resourceId?: string) {
  const [checks, setChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChecks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DatabaseService.getChecks(resourceId)
      setChecks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch checks')
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  const createCheck = useCallback(async (check: Omit<Check, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCheck = await DatabaseService.createCheck(check)
      setChecks(prev => [newCheck, ...prev])
      return newCheck
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create check')
      throw err
    }
  }, [])

  const updateCheck = useCallback(async (id: string, updates: Partial<Check>) => {
    try {
      const updatedCheck = await DatabaseService.updateCheck(id, updates)
      setChecks(prev => prev.map(c => c.id === id ? updatedCheck : c))
      return updatedCheck
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update check')
      throw err
    }
  }, [])

  const deleteCheck = useCallback(async (id: string) => {
    try {
      await DatabaseService.deleteCheck(id)
      setChecks(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete check')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchChecks()
  }, [fetchChecks])

  return {
    checks,
    loading,
    error,
    refetch: fetchChecks,
    createCheck,
    updateCheck,
    deleteCheck
  }
}

// Hook for managing events
export function useEvents(resourceId?: string, limit: number = 50) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DatabaseService.getEvents(resourceId, limit)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [resourceId, limit])

  const createEvent = useCallback(async (event: Omit<Event, 'id'>) => {
    try {
      const newEvent = await DatabaseService.createEvent(event)
      setEvents(prev => [newEvent, ...prev.slice(0, limit - 1)])
      return newEvent
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event')
      throw err
    }
  }, [limit])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent
  }
}

// Hook for managing notifications
export function useNotifications(resourceId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await DatabaseService.getNotifications(resourceId)
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }, [resourceId])

  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newNotification = await DatabaseService.createNotification(notification)
      setNotifications(prev => [newNotification, ...prev])
      return newNotification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification')
      throw err
    }
  }, [])

  const updateNotification = useCallback(async (id: string, updates: Partial<Notification>) => {
    try {
      const updatedNotification = await DatabaseService.updateNotification(id, updates)
      setNotifications(prev => prev.map(n => n.id === id ? updatedNotification : n))
      return updatedNotification
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification')
      throw err
    }
  }, [])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await DatabaseService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    createNotification,
    updateNotification,
    deleteNotification
  }
}

// Hook for authentication state
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  return { user, loading }
}