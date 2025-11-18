import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconListDetails } from '@tabler/icons-react'

export function LifecycleSection() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconListDetails className="size-5" />
            <CardTitle>Lifecycle Management</CardTitle>
          </div>
          <CardDescription>
            Track and manage project lifecycles from initiation to completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Active Projects</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all active projects in your pipeline
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Project Stages</h3>
              <p className="text-sm text-muted-foreground">
                Monitor progress across different project stages
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Milestones</h3>
              <p className="text-sm text-muted-foreground">
                Track key milestones and deliverables
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
