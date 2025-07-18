import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Play, Pause, Clock, Tag } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Separator } from '../components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { Check } from '../types'
import { DatabaseService } from '../services/database'
import { useChecks } from '../hooks/useDatabase'

const testTypes = [
  { value: 'uptime', label: 'Uptime Check', description: 'Monitor if website is accessible' },
  { value: 'certificate', label: 'SSL Certificate', description: 'Check SSL certificate validity and expiry' },
  { value: 'response_time', label: 'Response Time', description: 'Monitor website response time' },
  { value: 'content', label: 'Content Check', description: 'Verify specific content exists on page' },
  { value: 'ssl', label: 'SSL Security', description: 'Check SSL configuration and security' },
  { value: 'dns', label: 'DNS Resolution', description: 'Monitor DNS resolution time' },
  { value: 'port', label: 'Port Check', description: 'Check if specific ports are open' }
]

const schedulePresets = [
  { value: '*/5 * * * *', label: 'Every 5 minutes' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
  { value: '*/30 * * * *', label: 'Every 30 minutes' },
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 */6 * * *', label: 'Every 6 hours' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: 'custom', label: 'Custom cron expression' }
]

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function Checks() {
  const { checks, loading, refetch: loadChecks } = useChecks()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTestType, setSelectedTestType] = useState<string>('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCheck, setEditingCheck] = useState<Check | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    schedule: '*/15 * * * *',
    customSchedule: '',
    testType: 'uptime' as Check['testType'],
    isActive: true,
    criteria: {}
  })
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: '',
      schedule: '*/15 * * * *',
      customSchedule: '',
      testType: 'uptime',
      isActive: true,
      criteria: {}
    })
    setEditingCheck(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive'
      })
      return
    }

    try {
      const user = await blink.auth.me()
      const schedule = formData.schedule === 'custom' ? formData.customSchedule : formData.schedule
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      const checkData = {
        title: formData.title,
        name: editingCheck ? editingCheck.name : generateSlug(formData.title),
        description: formData.description || undefined,
        tags,
        schedule,
        testType: formData.testType,
        isActive: formData.isActive,
        userId: user.id,
        resourceId: editingCheck?.resourceId || '', // Handle missing resourceId
        criteria: formData.criteria
      }

      try {
        if (editingCheck) {
          await DatabaseService.updateCheck(editingCheck.id, checkData)
          toast({
            title: 'Success',
            description: 'Check updated successfully'
          })
        } else {
          await DatabaseService.createCheck({
            ...checkData,
            resourceId: 'resource_1' // Default resource for demo
          })
          toast({
            title: 'Success',
            description: 'Check created successfully'
          })
        }
      } catch (dbError) {
        // Database not available - show demo message
        toast({
          title: 'Demo Mode',
          description: 'Database not available. This is a demo - changes are not persisted.',
          variant: 'default'
        })
      }

      setIsCreateDialogOpen(false)
      resetForm()
      loadChecks()
    } catch (error) {
      console.error('Failed to save check:', error)
      toast({
        title: 'Error',
        description: 'Failed to save check',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (check: Check) => {
    setEditingCheck(check)
    setFormData({
      title: check.title,
      description: check.description || '',
      tags: check.tags.join(', '),
      schedule: schedulePresets.find(p => p.value === check.schedule) ? check.schedule : 'custom',
      customSchedule: schedulePresets.find(p => p.value === check.schedule) ? '' : check.schedule,
      testType: check.testType,
      isActive: check.isActive,
      criteria: check.criteria
    })
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (checkId: string) => {
    try {
      await DatabaseService.deleteCheck(checkId)
      toast({
        title: 'Success',
        description: 'Check deleted successfully'
      })
      loadChecks()
    } catch (error) {
      console.error('Failed to delete check:', error)
      toast({
        title: 'Demo Mode',
        description: 'Database not available. This is a demo - changes are not persisted.',
        variant: 'default'
      })
    }
  }

  const toggleCheckStatus = async (check: Check) => {
    try {
      await DatabaseService.updateCheck(check.id, {
        isActive: !check.isActive
      })
      toast({
        title: 'Success',
        description: `Check ${!check.isActive ? 'activated' : 'deactivated'}`
      })
      loadChecks()
    } catch (error) {
      console.error('Failed to toggle check status:', error)
      toast({
        title: 'Demo Mode',
        description: 'Database not available. This is a demo - changes are not persisted.',
        variant: 'default'
      })
    }
  }

  // Get all unique tags for filtering
  const allTags = Array.from(new Set(checks.flatMap(check => check.tags)))

  // Filter checks based on search and filters
  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => check.tags.includes(tag))
    
    const matchesTestType = !selectedTestType || check.testType === selectedTestType

    return matchesSearch && matchesTags && matchesTestType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Checks</h1>
          <p className="text-muted-foreground">Manage your monitoring checks and test configurations</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Check
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCheck ? 'Edit Check' : 'Create New Check'}</DialogTitle>
              <DialogDescription>
                {editingCheck ? 'Update your monitoring check configuration' : 'Set up a new monitoring check for your resources'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Website uptime check"
                    required
                  />
                  {formData.title && (
                    <p className="text-xs text-muted-foreground">
                      Slug: {editingCheck ? editingCheck.name : generateSlug(formData.title)}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="testType">Test Type *</Label>
                  <Select value={formData.testType} onValueChange={(value: Check['testType']) => 
                    setFormData(prev => ({ ...prev, testType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {testTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this check monitors..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="production, critical, api (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule *</Label>
                <Select value={formData.schedule} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, schedule: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {schedulePresets.map(preset => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {formData.schedule === 'custom' && (
                  <div className="mt-2">
                    <Input
                      value={formData.customSchedule}
                      onChange={(e) => setFormData(prev => ({ ...prev, customSchedule: e.target.value }))}
                      placeholder="0 */6 * * * (cron expression)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use cron format: minute hour day month weekday
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCheck ? 'Update Check' : 'Create Check'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search checks by title, description, or slug..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedTestType} onValueChange={setSelectedTestType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by test type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All test types</SelectItem>
                  {testTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {allTags.length > 0 && (
                <Select value={selectedTags[0] || ''} onValueChange={(value) => 
                  setSelectedTags(value ? [value] : [])
                }>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checks Grid */}
      {filteredChecks.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
                <Filter className="h-full w-full" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {checks.length === 0 ? 'No checks yet' : 'No checks match your filters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {checks.length === 0 
                  ? 'Create your first monitoring check to get started'
                  : 'Try adjusting your search terms or filters'
                }
              </p>
              {checks.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Check
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChecks.map((check) => (
            <Card key={check.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{check.title}</CardTitle>
                    <CardDescription className="text-xs font-mono text-muted-foreground">
                      {check.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCheckStatus(check)}
                      className="h-8 w-8 p-0"
                    >
                      {check.isActive ? (
                        <Pause className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Play className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(check)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Check</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{check.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(check.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {check.description && (
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{schedulePresets.find(p => p.value === check.schedule)?.label || check.schedule}</span>
                  </div>
                  <Badge variant={check.isActive ? 'default' : 'secondary'}>
                    {check.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {testTypes.find(t => t.value === check.testType)?.label || check.testType}
                  </Badge>
                  
                  {check.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {check.tags.slice(0, 2).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {check.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            +{check.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}