import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconChartBar } from '@tabler/icons-react'

export function AnalyticsSection() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconChartBar className="size-5" />
            <CardTitle>Analytics Dashboard</CardTitle>
          </div>
          <CardDescription>
            Comprehensive analytics and insights for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Performance Metrics</h3>
              <p className="text-sm text-muted-foreground">
                Key performance indicators and business metrics
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Revenue Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Track revenue trends and forecasts
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">User Engagement</h3>
              <p className="text-sm text-muted-foreground">
                Monitor user activity and engagement patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
