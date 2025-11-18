import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IconUsers } from '@tabler/icons-react'

export function TeamSection() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IconUsers className="size-5" />
            <CardTitle>Team Management</CardTitle>
          </div>
          <CardDescription>
            Manage team members, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Team Members</h3>
              <p className="text-sm text-muted-foreground">
                View and manage all team members and their roles
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Configure access levels and permissions for team members
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Team Performance</h3>
              <p className="text-sm text-muted-foreground">
                Track team productivity and performance metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
