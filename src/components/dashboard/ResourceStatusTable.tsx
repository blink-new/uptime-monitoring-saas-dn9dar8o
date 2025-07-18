import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Button } from '../ui/button'
import { MoreHorizontal, Loader2, Tag } from 'lucide-react'
import { Resource } from '../../types'
import { useResources } from '../../hooks/useDatabase'

const getStatusBadge = (status: Resource['status']) => {
  const variants = {
    online: { variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    warning: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    offline: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' }
  }
  
  return variants[status] || variants.offline
}

const formatLastChecked = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export function ResourceStatusTable() {
  const { resources, loading, error } = useResources()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading resources...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Error loading resources: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Status</CardTitle>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No resources found. Add your first resource to start monitoring.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Response Time</TableHead>
                <TableHead>Last Checked</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => {
                const statusConfig = getStatusBadge(resource.status)
                return (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Tag className="mr-1 h-3 w-3" />
                            Resource ID: {resource.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusConfig.variant}
                        className={statusConfig.className}
                      >
                        {resource.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={resource.responseTime > 1000 ? 'text-yellow-600' : 'text-green-600'}>
                        {resource.responseTime}ms
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {resource.lastChecked ? formatLastChecked(resource.lastChecked) : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}