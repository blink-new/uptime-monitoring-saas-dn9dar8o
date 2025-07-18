import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { ScrollArea } from '../ui/scroll-area'
import { AlertCircle, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Event } from '../../types'
import { useEvents } from '../../hooks/useDatabase'

const getEventIcon = (type: Event['type']) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case 'failure':
      return <AlertCircle className="h-4 w-4 text-red-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-600" />
  }
}

const getEventBadge = (type: Event['type']) => {
  const variants = {
    success: { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    warning: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    failure: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' }
  }
  
  return variants[type] || variants.failure
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export function RecentEvents() {
  const { events, loading, error } = useEvents(undefined, 20)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading events...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error loading events: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No events yet. Events will appear here when checks are executed.
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {events.map((event) => {
                const badgeConfig = getEventBadge(event.type)
                return (
                  <div key={event.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-gray-50/50">
                    <div className="flex-shrink-0 mt-0.5">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={badgeConfig.variant}
                          className={badgeConfig.className}
                        >
                          {event.type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {event.message}
                      </p>
                      {event.details && Object.keys(event.details).length > 0 && (
                        <div className="mt-2 text-xs text-gray-600">
                          {Object.entries(event.details).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}