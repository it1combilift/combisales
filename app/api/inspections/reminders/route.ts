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
import {
  getInspectionReminderSettings,
  updateInspectionReminderSettings,
} from "@/lib/inspection-reminders";
import { prisma } from "@/lib/prisma";

const updateReminderSettingsSchema = z.object({
  isEnabled: z.boolean(),
  frequency: z.enum(["MONTHLY", "WEEKLY"]),
  dayOfMonth: z.number().int().min(1).max(31),
  weeklyDay: z.number().int().min(1).max(7),
  sendTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  timezone: z.string().min(1),
});

function ensureManagerRole(roles: Role[] | undefined): boolean {
  return hasAnyRole(roles, [Role.ADMIN, Role.INSPECTOR]);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const userRoles = session.user.roles as Role[] | undefined;
    if (!ensureManagerRole(userRoles)) {
      return unauthorizedResponse();
    }

    const [settings, lastDispatch] = await Promise.all([
      getInspectionReminderSettings(),
      prisma.inspectionReminderDispatchLog.findFirst({
        orderBy: { startedAt: "desc" },
      }),
    ]);

    return createSuccessResponse({
      settings,
      lastDispatch,
    });
  } catch (error) {
    return serverErrorResponse("FETCH_INSPECTION_REMINDER_SETTINGS", error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const userRoles = session.user.roles as Role[] | undefined;
    if (!ensureManagerRole(userRoles)) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const parsed = updateReminderSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return badRequestResponse("Invalid reminder settings payload");
    }

    const settings = await updateInspectionReminderSettings(
      parsed.data,
      session.user.id,
    );

    return createSuccessResponse({ settings });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid")) {
      return badRequestResponse(error.message);
    }

    return serverErrorResponse("UPDATE_INSPECTION_REMINDER_SETTINGS", error);
  }
}
