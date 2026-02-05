/**
 * Zoho Desk API Interfaces
 * Types for interacting with Zoho Desk API
 */

// ==================== TICKET INTERFACES ====================

export interface ZohoDeskTicketContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ZohoDeskCreateTicketData {
  subject: string;
  description: string;
  departmentId: string;
  contact: ZohoDeskTicketContact;
  priority?: ZohoDeskPriority;
  status?: ZohoDeskTicketStatus;
  channel?: ZohoDeskChannel;
  category?: string;
  email?: string;
  teamId?: string;
  customFields?: Record<string, string>;
}

export interface ZohoDeskTicketResponse {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  statusType: string;
  priority: string;
  channel: string;
  createdTime: string;
  modifiedTime: string;
  departmentId: string;
  contactId?: string;
  email?: string;
  webUrl?: string;
}

export interface ZohoDeskErrorResponse {
  errorCode: string;
  message: string;
}

// ==================== ENUMS & TYPES ====================

export type ZohoDeskPriority = "High" | "Medium" | "Low";

export type ZohoDeskTicketStatus =
  | "Open"
  | "On Hold"
  | "Escalated"
  | "Closed"
  | "Resolved";

export type ZohoDeskChannel =
  | "Email"
  | "Phone"
  | "Web"
  | "Chat"
  | "Forums"
  | "Twitter"
  | "Facebook";

// ==================== DEPARTMENT INTERFACES ====================

export interface ZohoDeskDepartment {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
}

export interface ZohoDeskDepartmentListResponse {
  data: ZohoDeskDepartment[];
}

// ==================== TEAM INTERFACES ====================

export interface ZohoDeskTeam {
  id: string;
  name: string;
  description?: string;
}

export interface ZohoDeskTeamListResponse {
  data: ZohoDeskTeam[];
}

// ==================== SERVICE RESPONSE ====================

export interface ZohoDeskServiceResult {
  success: boolean;
  ticketId: string | null;
  ticketNumber: string | null;
  error: string | null;
}

// ==================== CATEGORY TO PRIORITY MAPPING ====================

export const HELP_CATEGORY_TO_PRIORITY: Record<string, ZohoDeskPriority> = {
  bug: "High",
  technical: "High",
  feature: "Medium",
  question: "Low",
  other: "Medium",
};
