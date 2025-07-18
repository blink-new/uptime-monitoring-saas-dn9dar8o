import { Alert, AlertDescription } from './alert'
import { Info } from 'lucide-react'

export function DemoBanner() {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <strong>Demo Mode:</strong> This app is currently running with sample data. 
        All changes are temporary and will reset on page refresh.
      </AlertDescription>
    </Alert>
  )
}