import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";

export interface ZohoAccount {
  id: string;
  Account_Name: string;
  Account_Number?: string;
  Account_Type?: string;
  Industry?: string;
  Annual_Revenue?: number;
  Phone?: string;
  Fax?: string;
  Website?: string;
  Email?: string;
  Employees?: number;
  Rating?: string;
  Ownership?: string;
  Ticker_Symbol?: string;
  Description?: string;
  Billing_Street?: string;
  Billing_City?: string;
  Billing_State?: string;
  Billing_Code?: string;
  Billing_Country?: string;
  Shipping_Street?: string;
  Shipping_City?: string;
  Shipping_State?: string;
  Shipping_Code?: string;
  Shipping_Country?: string;
  Parent_Account?: {
    name: string;
    id: string;
  };
  Owner?: {
    name: string;
    id: string;
    email: string;
  };
  Created_Time?: string;
  Modified_Time?: string;
  Created_By?: {
    name: string;
    id: string;
  };
  Modified_By?: {
    name: string;
    id: string;
  };
  Tag?: Array<{ name: string }>;
}

export interface ZohoContact {
  id: string;
  First_Name?: string;
  Last_Name: string;
  Full_Name?: string;
  Email?: string;
  Phone?: string;
  Mobile?: string;
  Title?: string;
  Department?: string;
  Account_Name?: {
    name: string;
    id: string;
  };
  Owner?: {
    name: string;
    id: string;
    email: string;
  };
  Mailing_Street?: string;
  Mailing_City?: string;
  Mailing_State?: string;
  Mailing_Zip?: string;
  Mailing_Country?: string;
  Other_Street?: string;
  Other_City?: string;
  Other_State?: string;
  Other_Zip?: string;
  Other_Country?: string;
  Description?: string;
  Created_Time?: string;
  Modified_Time?: string;
  Tag?: Array<{ name: string }>;
}

export interface ZohoCRMResponse<T> {
  data: T[];
  info: {
    page: number;
    per_page: number;
    count: number;
    more_records: boolean;
  };
}

export interface ZohoCRMError {
  code: string;
  details: any;
  message: string;
  status: string;
}

export interface ZohoTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  api_domain: string;
}

export interface AccountsTableProps {
  columns: ColumnDef<ZohoAccount>[];
  data: ZohoAccount[];
  isLoading?: boolean;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  globalFilter?: string;
  setGlobalFilter?: (value: string) => void;
  columnFilters?: ColumnFiltersState;
  setColumnFilters?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}
