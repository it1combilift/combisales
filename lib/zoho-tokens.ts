import axios from "axios";
import { prisma } from "./prisma";
import { ZohoTokens } from "@/interfaces/zoho";
import { ZOHO_TOKEN_URL } from "@/constants/constants";

/**
 * Zoho Token Manager
 * Manages Zoho access tokens for making requests to the Zoho CRM API
 */

/**
 * Get valid Zoho tokens for a user
 * If the token is expired, it refreshes it automatically
 */
export async function getValidZohoTokens(
  userId: string
): Promise<ZohoTokens | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: "zoho",
      },
    });

    if (!account || !account.access_token) {
      console.error("No Zoho account found for user:", userId);
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = account.expires_at || 0;

    if (expiresAt > now + 300) {
      return {
        access_token: account.access_token,
        refresh_token: account.refresh_token || undefined,
        expires_at: expiresAt,
        api_domain: account.api_domain || "https://www.zohoapis.com",
      };
    }

    if (!account.refresh_token) {
      console.error("No refresh token available for user:", userId);
      return null;
    }

    console.log("Refreshing expired Zoho token for user:", userId);
    return await refreshZohoToken(account.id, account.refresh_token);
  } catch (error) {
    console.error("Error getting valid Zoho tokens:", error);
    return null;
  }
}

/**
 * Refresh Zoho token using refresh_token
 */
async function refreshZohoToken(
  accountId: string,
  refreshToken: string
): Promise<ZohoTokens | null> {
  try {
    const params = new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: "refresh_token",
    });

    const response = await axios.post(ZOHO_TOKEN_URL, params.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const data = response.data;

    const expiresAt = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        access_token: data.access_token,
        expires_at: expiresAt,
        token_refreshed_at: new Date(),
        token_expires_in: data.expires_in,
      },
    });

    console.log("Zoho token refreshed successfully");

    return {
      access_token: data.access_token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      api_domain: updatedAccount.api_domain || "https://www.zohoapis.com",
    };
  } catch (error) {
    console.error("Error refreshing Zoho token:", error);
    return null;
  }
}

/**
 * Get any valid Zoho tokens from an active user account
 * Useful for admin tasks or cron jobs
 */
export async function getAnyValidZohoTokens(): Promise<{
  tokens: ZohoTokens;
  userId: string;
} | null> {
  try {
    const account = await prisma.account.findFirst({
      where: {
        provider: "zoho",
        NOT: {
          access_token: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            isActive: true,
          },
        },
      },
    });

    if (!account || !account.user.isActive) {
      console.error("No active Zoho account found");
      return null;
    }

    const tokens = await getValidZohoTokens(account.userId);
    if (!tokens) {
      return null;
    }

    return {
      tokens,
      userId: account.userId,
    };
  } catch (error) {
    console.error("Error getting any valid Zoho tokens:", error);
    return null;
  }
}
