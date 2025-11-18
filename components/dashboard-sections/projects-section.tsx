import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconFolder } from '@tabler/icons-react'

export function ProjectsSection() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconFolder className="size-5" />
            <CardTitle>Projects</CardTitle>
          </div>
          <CardDescription>
            Manage and organize all your projects in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Project Overview</h3>
              <p className="text-sm text-muted-foreground">
                View all projects with status, timeline, and team members
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Resource Allocation</h3>
              <p className="text-sm text-muted-foreground">
                Manage resources and assignments across projects
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Project Templates</h3>
              <p className="text-sm text-muted-foreground">
                Create and use templates for faster project setup
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
