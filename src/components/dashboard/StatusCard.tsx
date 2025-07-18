import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

interface StatusCardProps {
  title: string
  value: string | number
  change?: string
  status?: 'success' | 'warning' | 'error' | 'neutral'
  icon?: React.ReactNode
}

export function StatusCard({ title, value, change, status = 'neutral', icon }: StatusCardProps) {
  const statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const changeColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    neutral: 'text-gray-600'
  }

  return (
    <Card className={cn('transition-all hover:shadow-md', statusColors[status])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className={cn('text-xs mt-1', changeColors[status])}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}