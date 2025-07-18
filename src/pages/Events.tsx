import { useState, useMemo } from 'react'
import { Search, Filter, Calendar, Tag, AlertCircle, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover'
import { Calendar as CalendarComponent } from '../components/ui/calendar'
import { format } from 'date-fns'
import { cn } from '../lib/utils'
import { useEvents, useResources, useChecks } from '../hooks/useDatabase'
import { Event } from '../types'

interface EventFilters {
  search: string
  resource: string
  check: string
  status: string
  tags: string[]
  dateFrom: Date | undefined
  dateTo: Date | undefined
}

export function Events() {
  const { events, loading: eventsLoading } = useEvents()
  const { resources } = useResources()
  const { checks } = useChecks()
  
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    resource: '',
    check: '',
    status: '',
    tags: [],
    dateFrom: undefined,
    dateTo: undefined
  })

  // Get all unique tags from resources and checks
  const allTags = useMemo(() => {
    const resourceTags = resources.flatMap(r => r.tags)
    const checkTags = checks.flatMap(c => c.tags)
    return Array.from(new Set([...resourceTags, ...checkTags]))
  }, [resources, checks])

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const resource = resources.find(r => r.id === event.resourceId)
      const check = checks.find(c => c.id === event.checkId)
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesMessage = event.message.toLowerCase().includes(searchLower)
        const matchesResource = resource?.name.toLowerCase().includes(searchLower)
        const matchesCheck = check?.title.toLowerCase().includes(searchLower)
        
        if (!matchesMessage && !matchesResource && !matchesCheck) {
          return false
        }
      }

      // Resource filter
      if (filters.resource && event.resourceId !== filters.resource) {
        return false
      }

      // Check filter
      if (filters.check && event.checkId !== filters.check) {
        return false
      }

      // Status filter
      if (filters.status && event.type !== filters.status) {
        return false
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const resourceTags = resource?.tags || []
        const checkTags = check?.tags || []
        const eventTags = [...resourceTags, ...checkTags]
        
        const hasMatchingTag = filters.tags.some(tag => eventTags.includes(tag))
        if (!hasMatchingTag) {
          return false
        }
      }

      // Date range filter
      const eventDate = new Date(event.timestamp)
      if (filters.dateFrom && eventDate < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && eventDate > filters.dateTo) {
        return false
      }

      return true
    })
  }, [events, resources, checks, filters])

  const getStatusIcon = (type: Event['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'failure':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (type: Event['type']) => {
    switch (type) {
      case 'success':
        return 'default'
      case 'warning':
        return 'secondary'
      case 'failure':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      resource: '',
      check: '',
      status: '',
      tags: [],
      dateFrom: undefined,
      dateTo: undefined
    })
  }

  const hasActiveFilters = filters.search || filters.resource || filters.check || filters.status || 
    filters.tags.length > 0 || filters.dateFrom || filters.dateTo

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">Monitor and search through all system events</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events, resources, or checks..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resource} onValueChange={(value) => setFilters(prev => ({ ...prev, resource: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                {resources.map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Check and Tags Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={filters.check} onValueChange={(value) => setFilters(prev => ({ ...prev, check: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by check" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Checks</SelectItem>
                {checks.map(check => (
                  <SelectItem key={check.id} value={check.id}>
                    {check.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter(t => t !== tag)
                          : [...prev.tags, tag]
                      }))
                    }}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Date Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? format(filters.dateFrom, "PPP") : "From date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateFrom: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateTo && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {filters.dateTo ? format(filters.dateTo, "PPP") : "To date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters(prev => ({ ...prev, dateTo: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </p>
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && <Badge variant="secondary">Search: {filters.search}</Badge>}
            {filters.status && <Badge variant="secondary">Status: {filters.status}</Badge>}
            {filters.resource && (
              <Badge variant="secondary">
                Resource: {resources.find(r => r.id === filters.resource)?.name}
              </Badge>
            )}
            {filters.check && (
              <Badge variant="secondary">
                Check: {checks.find(c => c.id === filters.check)?.title}
              </Badge>
            )}
            {filters.tags.map(tag => (
              <Badge key={tag} variant="secondary">Tag: {tag}</Badge>
            ))}
            {filters.dateFrom && <Badge variant="secondary">From: {format(filters.dateFrom, "MMM d")}</Badge>}
            {filters.dateTo && <Badge variant="secondary">To: {format(filters.dateTo, "MMM d")}</Badge>}
          </div>
        )}
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {eventsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more events."
                  : "No events have been recorded yet."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map(event => {
            const resource = resources.find(r => r.id === event.resourceId)
            const check = checks.find(c => c.id === event.checkId)
            
            return (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getStatusBadgeVariant(event.type)}>
                            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(event.timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        
                        <h3 className="font-medium text-foreground mb-1">
                          {event.message}
                        </h3>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Resource: <span className="font-medium">{resource?.name || 'Unknown'}</span></span>
                          <span>Check: <span className="font-medium">{check?.title || 'Unknown'}</span></span>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {resource?.tags.map(tag => (
                            <Badge key={`resource-${tag}`} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {check?.tags.map(tag => (
                            <Badge key={`check-${tag}`} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        {/* Event Details */}
                        {Object.keys(event.details).length > 0 && (
                          <div className="bg-muted/50 rounded-lg p-3 mt-3">
                            <h4 className="text-sm font-medium text-foreground mb-2">Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              {Object.entries(event.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}