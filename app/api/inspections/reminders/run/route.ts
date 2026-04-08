import { z } from "zod";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { hasAnyRole } from "@/lib/roles";
import {
  createSuccessResponse,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
} from "@/lib/api-response";
import { runInspectionMonthlyReminders } from "@/lib/inspection-reminders";

const runReminderSchema = z.object({
  force: z.boolean().optional(),
});

function canManageReminder(roles: Role[] | undefined): boolean {
  return hasAnyRole(roles, [Role.ADMIN, Role.INSPECTOR]);
}

function isCronAuthorized(request: Request): boolean {
  const internalSecret = process.env.INSPECTION_REMINDER_CRON_SECRET;
  if (!internalSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${internalSecret}`;
}

export async function POST(request: Request) {
  try {
    const internalCall = isCronAuthorized(request);

    let triggeredBy: string;
    if (internalCall) {
      triggeredBy = "system:cron";
    } else {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return unauthorizedResponse();
      }

      const userRoles = session.user.roles as Role[] | undefined;
      if (!canManageReminder(userRoles)) {
        return unauthorizedResponse();
      }

      triggeredBy = session.user.email || session.user.id || "system:manual";
    }

    const body = await request.json().catch(() => ({}));
    const parsed = runReminderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse("Invalid run payload");
    }

    const result = await runInspectionMonthlyReminders({
      force: parsed.data.force,
      triggeredBy,
    });

    return createSuccessResponse(result);
  } catch (error) {
    return serverErrorResponse("RUN_INSPECTION_REMINDER", error);
  }
}
