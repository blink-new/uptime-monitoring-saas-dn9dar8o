import { useState } from 'react'
import { useResources } from '../hooks/useDatabase'
import { Resource } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { DemoBanner } from '../components/ui/demo-banner'
import { useToast } from '../hooks/use-toast'
import { Plus, Search, Edit, Trash2, Monitor, Loader2, X } from 'lucide-react'

export function Resources() {
  const { resources, loading, createResource, updateResource, deleteResource } = useResources()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tags: [] as string[],
    tagInput: ''
  })

  // Filter resources based on search term (name and tags)
  const filteredResources = resources.filter(resource => {
    const searchLower = searchTerm.toLowerCase()
    const matchesName = resource.name.toLowerCase().includes(searchLower)
    const matchesTags = resource.tags.some(tag => 
      tag.toLowerCase().includes(searchLower)
    )
    return matchesName || matchesTags
  })

  const resetForm = () => {
    setFormData({
      name: '',
      tags: [],
      tagInput: ''
    })
    setEditingResource(null)
  }

  const addTag = () => {
    const tag = formData.tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        tagInput: ''
      }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await createResource({
        name: formData.name,
        tags: formData.tags,
        status: 'offline',
        lastChecked: '',
        responseTime: 0,
        assignedUserId: ''
      })
      
      toast({
        title: 'Success',
        description: 'Resource created successfully'
      })
      
      resetForm()
      setIsCreateDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create resource',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      name: resource.name,
      tags: [...resource.tags],
      tagInput: ''
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingResource) return
    
    setIsSubmitting(true)
    
    try {
      await updateResource(editingResource.id, {
        name: formData.name,
        tags: formData.tags
      })
      
      toast({
        title: 'Success',
        description: 'Resource updated successfully'
      })
      
      resetForm()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update resource',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (resource: Resource) => {
    try {
      await deleteResource(resource.id)
      toast({
        title: 'Success',
        description: 'Resource deleted successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: Resource['status']) => {
    const variants = {
      online: 'bg-green-100 text-green-800 border-green-200',
      offline: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    
    return (
      <Badge className={`${variants[status]} border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DemoBanner />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground">Manage your monitored resources</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Resource Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Website"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags"
                      value={formData.tagInput}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                      placeholder="Add a tag..."
                      onKeyPress={handleTagInputKeyPress}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Resource
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search resources by name or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resources ({filteredResources.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search term or check different tags'
                  : 'Get started by adding your first resource to monitor'
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Resource
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Response Time</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResources.map((resource) => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">{resource.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length === 0 && (
                            <span className="text-muted-foreground text-sm">No tags</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        {resource.responseTime > 0 ? `${resource.responseTime}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        {resource.lastChecked 
                          ? new Date(resource.lastChecked).toLocaleString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(resource)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Resource</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                  <Label htmlFor="edit-name">Resource Name</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="edit-tags">Tags</Label>
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <Input
                                        id="edit-tags"
                                        value={formData.tagInput}
                                        onChange={(e) => setFormData(prev => ({ ...prev, tagInput: e.target.value }))}
                                        placeholder="Add a tag..."
                                        onKeyPress={handleTagInputKeyPress}
                                      />
                                      <Button type="button" onClick={addTag} variant="outline">
                                        Add
                                      </Button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {formData.tags.map((tag) => (
                                          <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                            <button
                                              type="button"
                                              onClick={() => removeTag(tag)}
                                              className="ml-1 hover:text-red-600"
                                            >
                                              <X className="h-3 w-3" />
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={resetForm}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Resource
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{resource.name}"? This action cannot be undone.
                                  All associated checks and events will also be removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(resource)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}