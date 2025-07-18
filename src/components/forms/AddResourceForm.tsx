import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { useResources } from '../../hooks/useDatabase'
import { useAuth } from '../../hooks/useDatabase'
import { Loader2, X, Plus } from 'lucide-react'

interface AddResourceFormProps {
  onSuccess?: () => void
}

export function AddResourceForm({ onSuccess }: AddResourceFormProps) {
  const { user } = useAuth()
  const { createResource } = useResources()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    tags: [] as string[]
  })
  const [currentTag, setCurrentTag] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      await createResource({
        name: formData.name,
        tags: formData.tags,
        status: 'offline',
        lastChecked: '',
        responseTime: 0,
        assignedUserId: user.id
      })
      
      // Reset form
      setFormData({
        name: '',
        tags: []
      })
      setCurrentTag('')
      
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create resource:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Resource</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  placeholder="e.g., Production, HR, Critical"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTag}
                  disabled={!currentTag.trim() || formData.tags.includes(currentTag.trim())}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Resource
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}