import axios, { AxiosInstance, AxiosError } from "axios";
import {
  ZohoDeskCreateTicketData,
  ZohoDeskTicketResponse,
  ZohoDeskServiceResult,
  ZohoDeskDepartment,
  ZohoDeskTeam,
  ZohoDeskErrorResponse,
} from "@/interfaces/zoho-desk";
import { ZohoTokens } from "@/interfaces/zoho";

/**
 * Zoho Desk Service
 * Service class to interact with Zoho Desk API
 *
 * API Base URL: https://desk.zoho.{region}/api/v1
 * Documentation: https://desk.zoho.com/DeskAPIDocument
 */
export class ZohoDeskService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private orgId: string;

  constructor(tokens: ZohoTokens, orgId: string) {
    // Extract region from api_domain (e.g., accounts.zoho.eu -> eu)
    const region = this.extractRegion(tokens.api_domain);
    this.baseUrl = `https://desk.zoho.${region}/api/v1`;
    this.orgId = orgId;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Zoho-oauthtoken ${tokens.access_token}`,
        "Content-Type": "application/json",
        orgId: this.orgId,
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ZohoDeskErrorResponse>) => {
        if (error.response?.data) {
          const errorData = error.response.data;
          console.error("[ZohoDeskService] API Error:", {
            status: error.response.status,
            errorCode: errorData.errorCode,
            message: errorData.message,
          });
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Extract region from Zoho api_domain
   * @example "https://accounts.zoho.eu" -> "eu"
   * @example "https://accounts.zoho.com" -> "com"
   */
  private extractRegion(apiDomain: string): string {
    // Handle both full URLs and domain-only formats
    const cleanDomain = apiDomain.replace(/^https?:\/\//, "");
    const match = cleanDomain.match(/zoho\.(\w+)/);
    return match ? match[1] : "com";
  }

  /**
   * Create a new ticket in Zoho Desk
   */
  async createTicket(
    data: ZohoDeskCreateTicketData,
  ): Promise<ZohoDeskTicketResponse> {
    const payload: Record<string, any> = {
      subject: data.subject,
      description: data.description,
      departmentId: data.departmentId,
      contact: {
        email: data.contact.email,
        firstName: data.contact.firstName || undefined,
        lastName: data.contact.lastName || undefined,
      },
      priority: data.priority || "Medium",
      status: data.status || "Open",
      channel: data.channel || "Web",
    };

    // Add optional teamId if provided
    if (data.teamId) {
      payload.teamId = data.teamId;
    }

    // Add email for ticket notifications
    if (data.email) {
      payload.email = data.email;
    }

    // Add category if provided
    if (data.category) {
      payload.category = data.category;
    }

    // Add custom fields if provided
    if (data.customFields && Object.keys(data.customFields).length > 0) {
      payload.cf = data.customFields;
    }

    console.log("[ZohoDeskService] Creating ticket:", {
      subject: payload.subject,
      departmentId: payload.departmentId,
      priority: payload.priority,
      contact: payload.contact.email,
    });

    const response = await this.axiosInstance.post<ZohoDeskTicketResponse>(
      "/tickets",
      payload,
    );

    console.log("[ZohoDeskService] Ticket created successfully:", {
      ticketId: response.data.id,
      ticketNumber: response.data.ticketNumber,
    });

    return response.data;
  }

  /**
   * Get list of departments
   */
  async getDepartments(): Promise<ZohoDeskDepartment[]> {
    const response = await this.axiosInstance.get<{
      data: ZohoDeskDepartment[];
    }>("/departments");
    return response.data.data;
  }

  /**
   * Get list of teams for a department
   */
  async getTeams(departmentId?: string): Promise<ZohoDeskTeam[]> {
    const params: Record<string, string> = {};
    if (departmentId) {
      params.departmentId = departmentId;
    }

    const response = await this.axiosInstance.get<{ data: ZohoDeskTeam[] }>(
      "/teams",
      { params },
    );
    return response.data.data;
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicket(ticketId: string): Promise<ZohoDeskTicketResponse> {
    const response = await this.axiosInstance.get<ZohoDeskTicketResponse>(
      `/tickets/${ticketId}`,
    );
    return response.data;
  }
}

/**
 * Create a ticket in Zoho Desk with error handling
 * Returns a standardized result object
 */
export async function createZohoDeskTicket(
  tokens: ZohoTokens,
  data: ZohoDeskCreateTicketData,
): Promise<ZohoDeskServiceResult> {
  const orgId = process.env.ZOHO_DESK_ORG_ID;

  if (!orgId) {
    console.error("[ZohoDeskService] ZOHO_DESK_ORG_ID not configured");
    return {
      success: false,
      ticketId: null,
      ticketNumber: null,
      error: "Zoho Desk Organization ID not configured",
    };
  }

  try {
    const service = new ZohoDeskService(tokens, orgId);
    const ticket = await service.createTicket(data);

    return {
      success: true,
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      error: null,
    };
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    console.error("[ZohoDeskService] Failed to create ticket:", errorMessage);

    return {
      success: false,
      ticketId: null,
      ticketNumber: null,
      error: errorMessage,
    };
  }
}

/**
 * Extract error message from various error types
 */
function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ZohoDeskErrorResponse>;

    if (axiosError.response?.data?.message) {
      return `Zoho Desk API: ${axiosError.response.data.message}`;
    }

    if (axiosError.response?.status === 401) {
      return "Invalid or expired Zoho Desk authentication token";
    }

    if (axiosError.response?.status === 403) {
      return "No permission to create tickets in Zoho Desk";
    }

    if (axiosError.response?.status === 404) {
      return "Zoho Desk department or resource not found";
    }

    return `Zoho Desk API error: ${axiosError.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error occurred while creating Zoho Desk ticket";
}
