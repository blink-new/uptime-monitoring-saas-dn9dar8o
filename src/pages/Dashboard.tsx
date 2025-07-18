import { Server, CheckCircle, AlertTriangle, Clock, Database } from 'lucide-react'
import { StatusCard } from '../components/dashboard/StatusCard'
import { ResourceStatusTable } from '../components/dashboard/ResourceStatusTable'
import { RecentEvents } from '../components/dashboard/RecentEvents'
import { AddResourceForm } from '../components/forms/AddResourceForm'
import { Button } from '../components/ui/button'
import { DemoBanner } from '../components/ui/demo-banner'
import { useResources, useEvents } from '../hooks/useDatabase'
import { seedSampleData } from '../utils/seedData'
import { useState } from 'react'

export function Dashboard() {
  const { resources, refetch: refetchResources } = useResources()
  const { events, refetch: refetchEvents } = useEvents(undefined, 50)
  const [seeding, setSeeding] = useState(false)
  
  // Calculate stats from real data
  const totalResources = resources.length
  const onlineResources = resources.filter(r => r.status === 'online').length
  const warningResources = resources.filter(r => r.status === 'warning').length
  const offlineResources = resources.filter(r => r.status === 'offline').length
  
  const uptime = totalResources > 0 ? ((onlineResources / totalResources) * 100).toFixed(1) : '0'
  
  const avgResponseTime = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + r.responseTime, 0) / resources.length)
    : 0

  const recentFailures = events.filter(e => e.type === 'failure').length

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      await seedSampleData()
      await refetchResources()
      await refetchEvents()
    } catch (error) {
      console.error('Failed to seed data:', error)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      <DemoBanner />
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Monitor your resources and system health</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Total Resources"
          value={totalResources}
          status="neutral"
          icon={<Server className="h-4 w-4" />}
        />
        <StatusCard
          title="System Uptime"
          value={`${uptime}%`}
          change={onlineResources > offlineResources ? '+2.1% from last week' : '-1.2% from last week'}
          status={Number(uptime) > 95 ? 'success' : Number(uptime) > 80 ? 'warning' : 'error'}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatusCard
          title="Avg Response Time"
          value={`${avgResponseTime}ms`}
          change={avgResponseTime < 500 ? 'Excellent performance' : avgResponseTime < 1000 ? 'Good performance' : 'Needs attention'}
          status={avgResponseTime < 500 ? 'success' : avgResponseTime < 1000 ? 'warning' : 'error'}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatusCard
          title="Active Alerts"
          value={warningResources + offlineResources}
          change={recentFailures > 0 ? `${recentFailures} recent failures` : 'All systems normal'}
          status={warningResources + offlineResources === 0 ? 'success' : warningResources > offlineResources ? 'warning' : 'error'}
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ResourceStatusTable />
          {totalResources === 0 && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Get started by adding your first resource or try with sample data</p>
                <Button 
                  onClick={handleSeedData} 
                  disabled={seeding}
                  variant="outline"
                  className="mr-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  {seeding ? 'Loading Sample Data...' : 'Load Sample Data'}
                </Button>
              </div>
              <AddResourceForm />
            </div>
          )}
          

        </div>
        <div>
          <RecentEvents />
        </div>
      </div>
    </div>
  )
}