import axios, { AxiosInstance } from "axios";
import { getValidZohoTokens } from "../lib/zoho-tokens";

import {
  ZohoAccount,
  ZohoContact,
  ZohoCRMResponse,
  ZohoDeal,
  ZohoLead,
  ZohoTask,
  ZohoTokens,
} from "@/interfaces/zoho";

/**
 * Zoho CRM Service
 * Service class to interact with Zoho CRM API
 */
export class ZohoCRMService {
  private tokens: ZohoTokens;
  private baseUrl: string;
  private axiosInstance: AxiosInstance;

  constructor(tokens: ZohoTokens) {
    this.tokens = tokens;
    this.baseUrl = `${tokens.api_domain}/crm/v2`;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Zoho-oauthtoken ${this.tokens.access_token}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Make a GET request to the Zoho CRM API
   */
  private async request<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, {
        params,
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        console.error("Zoho CRM API error:", errorData);

        if (errorData?.code === "NO_PERMISSION") {
          throw new Error(
            "ZOHO_NO_PERMISSION: El usuario no tiene permisos de API habilitados en Zoho CRM. " +
              'Contacte al administrador para habilitar "API Access" en Setup > Security Control > API Settings.',
          );
        }

        throw new Error(
          `Zoho CRM API error: ${errorData?.message || error.message}`,
        );
      }
      throw error;
    }
  }

  /**
   * Get list of accounts from Zoho CRM
   */
  async getAccounts(options?: {
    page?: number;
    per_page?: number;
    sort_order?: "asc" | "desc";
    sort_by?: string;
    fields?: string[];
  }): Promise<ZohoCRMResponse<ZohoAccount>> {
    const params: Record<string, any> = {
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    if (options?.sort_order) params.sort_order = options.sort_order;
    if (options?.sort_by) params.sort_by = options.sort_by;
    if (options?.fields) params.fields = options.fields.join(",");

    return this.request<ZohoCRMResponse<ZohoAccount>>("/Accounts", params);
  }

  /**
   * Get a specific account by ID
   */
  async getAccountById(accountId: string): Promise<ZohoAccount> {
    const response = await this.request<ZohoCRMResponse<ZohoAccount>>(
      `/Accounts/${accountId}`,
    );

    if (!response.data || response.data.length === 0) {
      throw new Error(`Account with ID ${accountId} not found in Zoho CRM`);
    }

    return response.data[0];
  }

  /**
   * Search accounts by multiple fields (Account_Name, Razon_Social, CIF, C_digo_Cliente)
   * Uses OR criteria for comprehensive search
   * Note: Zoho CRM only supports 'starts_with' and 'equals' operators for text fields
   */
  async searchAccounts(
    searchText: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoAccount>> {
    const escapedText = searchText.replace(/[()"']/g, "").trim();

    const criteria = [
      `(Account_Name:starts_with:${escapedText})`,
      `(Razon_Social:starts_with:${escapedText})`,
      `(CIF:starts_with:${escapedText})`,
      `(C_digo_Cliente:starts_with:${escapedText})`,
    ].join("or");

    const params: Record<string, any> = {
      criteria: `(${criteria})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoAccount>>(
      "/Accounts/search",
      params,
    );
  }

  /**
   * Get list of contacts from Zoho CRM
   */
  async getContacts(options?: {
    page?: number;
    per_page?: number;
    sort_order?: "asc" | "desc";
    sort_by?: string;
    fields?: string[];
  }): Promise<ZohoCRMResponse<ZohoContact>> {
    const params: Record<string, any> = {
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    if (options?.sort_order) params.sort_order = options.sort_order;
    if (options?.sort_by) params.sort_by = options.sort_by;
    if (options?.fields) params.fields = options.fields.join(",");

    return this.request<ZohoCRMResponse<ZohoContact>>("/Contacts", params);
  }

  /**
   * Get a specific contact by ID
   */
  async getContactById(contactId: string): Promise<ZohoContact> {
    const response = await this.request<ZohoCRMResponse<ZohoContact>>(
      `/Contacts/${contactId}`,
    );
    if (!response.data || response.data.length === 0) {
      throw new Error(`Contact with ID ${contactId} not found in Zoho CRM`);
    }
    return response.data[0];
  }

  /**
   * Get contacts from a specific account
   */
  async getContactsByAccountId(
    accountId: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoContact>> {
    const params: Record<string, any> = {
      criteria: `(Account_Name:equals:${accountId})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoContact>>(
      "/Contacts/search",
      params,
    );
  }

  /**
   * Search contacts by email
   */
  async searchContactsByEmail(
    email: string,
  ): Promise<ZohoCRMResponse<ZohoContact>> {
    const params = {
      criteria: `(Email:equals:${email})`,
      per_page: 200,
    };

    return this.request<ZohoCRMResponse<ZohoContact>>(
      "/Contacts/search",
      params,
    );
  }

  /**
   * Get list of tasks from Zoho CRM
   */
  async getTasks(options?: {
    page?: number;
    per_page?: number;
    sort_order?: "asc" | "desc";
    sort_by?: string;
    fields?: string[];
  }): Promise<ZohoCRMResponse<ZohoTask>> {
    const params: Record<string, any> = {
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    if (options?.sort_order) params.sort_order = options.sort_order;
    if (options?.sort_by) params.sort_by = options.sort_by;
    if (options?.fields) params.fields = options.fields.join(",");

    return this.request<ZohoCRMResponse<ZohoTask>>("/Tasks", params);
  }

  /**
   * Get a specific task by ID
   */
  async getTaskById(taskId: string): Promise<ZohoTask> {
    const response = await this.request<ZohoCRMResponse<ZohoTask>>(
      `/Tasks/${taskId}`,
    );
    if (!response.data || response.data.length === 0) {
      throw new Error(`Task with ID ${taskId} not found in Zoho CRM`);
    }
    return response.data[0];
  }

  /**
   * Search tasks by Subject
   * Note: Zoho CRM only supports 'starts_with' and 'equals' operators for text fields
   */
  async searchTasks(
    searchText: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoTask>> {
    const escapedText = searchText.replace(/[()"']/g, "").trim();
    const criteria = `(Subject:starts_with:${escapedText})`;

    const params: Record<string, any> = {
      criteria,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoTask>>("/Tasks/search", params);
  }

  /**
   * Get tasks related to a specific account
   */
  async getTasksByAccountId(
    accountId: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoTask>> {
    const params: Record<string, any> = {
      criteria: `(What_Id:equals:${accountId})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoTask>>("/Tasks/search", params);
  }

  /**
   * Get tasks related to a specific contact
   */
  async getTasksByContactId(
    contactId: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoTask>> {
    const params: Record<string, any> = {
      criteria: `(Who_Id:equals:${contactId})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoTask>>("/Tasks/search", params);
  }

  /**
   * Get list of deals (projects) from Zoho CRM
   */
  async getDeals(options?: {
    page?: number;
    per_page?: number;
    sort_order?: "asc" | "desc";
    sort_by?: string;
    fields?: string[];
  }): Promise<ZohoCRMResponse<ZohoDeal>> {
    const params: Record<string, any> = {
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    if (options?.sort_order) params.sort_order = options.sort_order;
    if (options?.sort_by) params.sort_by = options.sort_by;
    if (options?.fields) params.fields = options.fields.join(",");

    return this.request<ZohoCRMResponse<ZohoDeal>>("/Deals", params);
  }

  /**
   * Get a specific deal by ID
   */
  async getDealById(dealId: string): Promise<ZohoDeal> {
    const response = await this.request<ZohoCRMResponse<ZohoDeal>>(
      `/Deals/${dealId}`,
    );
    if (!response.data || response.data.length === 0) {
      throw new Error(`Deal with ID ${dealId} not found in Zoho CRM`);
    }
    return response.data[0];
  }

  /**
   * Search deals by Deal_Name
   */
  async searchDeals(
    searchText: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoDeal>> {
    const escapedText = searchText.replace(/[()"']/g, "").trim();
    const criteria = `(Deal_Name:starts_with:${escapedText})`;

    const params: Record<string, any> = {
      criteria,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoDeal>>("/Deals/search", params);
  }

  /**
   * Get deals related to a specific account
   */
  async getDealsByAccountId(
    accountId: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoDeal>> {
    const params: Record<string, any> = {
      criteria: `(Account_Name:equals:${accountId})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoDeal>>("/Deals/search", params);
  }

  // ==================== LEADS ====================

  /**
   * Get list of leads from Zoho CRM
   */
  async getLeads(options?: {
    page?: number;
    per_page?: number;
    sort_order?: "asc" | "desc";
    sort_by?: string;
    fields?: string[];
  }): Promise<ZohoCRMResponse<ZohoLead>> {
    const params: Record<string, any> = {
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    if (options?.sort_order) params.sort_order = options.sort_order;
    if (options?.sort_by) params.sort_by = options.sort_by;
    if (options?.fields) params.fields = options.fields.join(",");

    return this.request<ZohoCRMResponse<ZohoLead>>("/Leads", params);
  }

  /**
   * Get a specific lead by ID
   */
  async getLeadById(leadId: string): Promise<ZohoLead> {
    const response = await this.request<ZohoCRMResponse<ZohoLead>>(
      `/Leads/${leadId}`,
    );
    if (!response.data || response.data.length === 0) {
      throw new Error(`Lead with ID ${leadId} not found in Zoho CRM`);
    }
    return response.data[0];
  }

  /**
   * Search leads by Company or Last_Name
   */
  async searchLeads(
    searchText: string,
    options?: {
      page?: number;
      per_page?: number;
    },
  ): Promise<ZohoCRMResponse<ZohoLead>> {
    const escapedText = searchText.replace(/[()"']/g, "").trim();
    const criteria = [
      `(Company:starts_with:${escapedText})`,
      `(Last_Name:starts_with:${escapedText})`,
    ].join("or");

    const params: Record<string, any> = {
      criteria: `(${criteria})`,
      page: options?.page || 1,
      per_page: options?.per_page || 200,
    };

    return this.request<ZohoCRMResponse<ZohoLead>>("/Leads/search", params);
  }
}

/**
 * Factory function to create an instance of the Zoho CRM service
 */
export async function createZohoCRMService(
  userId: string,
): Promise<ZohoCRMService | null> {
  try {
    const tokens = await getValidZohoTokens(userId);
    if (!tokens) {
      console.error("Could not get valid Zoho tokens for user:", userId);
      return null;
    }

    return new ZohoCRMService(tokens);
  } catch (error) {
    console.error("Error creating Zoho CRM service:", error);
    return null;
  }
}
