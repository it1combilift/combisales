import { ColumnDef, ColumnFiltersState } from "@tanstack/react-table";

// ==================== ZOHO ACCOUNT INTERFACE ====================
export interface ZohoAccount {
  // Identificación
  id: string;
  Account_Name: string;
  Account_Number?: string;
  Razon_Social?: string;
  CIF?: string;
  C_digo_Cliente?: string;

  // Clasificación
  Account_Type?: string;
  Industry?: string;
  Sub_Sector?: string;

  // Contacto
  Phone?: string;
  Fax?: string;
  Website?: string;
  Correo_electr_nico?: string;
  Email?: string;

  // Dirección de facturación
  Billing_Street?: string;
  Billing_City?: string;
  Billing_State?: string;
  Billing_Code?: string;
  Billing_Country?: string;

  // Dirección de envío
  Shipping_Street?: string;
  Shipping_City?: string;
  Shipping_State?: string;
  Shipping_Code?: string;
  Shipping_Country?: string;

  // Geolocalización (Deals in Google Maps plugin)
  dealsingooglemaps__Latitude?: string;
  dealsingooglemaps__Longitude?: string;
  dealsingooglemaps__Last_Call_ID?: string;
  dealsingooglemaps__Last_Call_Date?: string;
  dealsingooglemaps__Last_Event_ID?: string;
  dealsingooglemaps__Last_Event_Date?: string;
  dealsingooglemaps__Last_Task_ID?: string;
  dealsingooglemaps__Last_Task_Date?: string;

  // Propietario y creador
  Owner?: {
    name: string;
    id: string;
    email: string;
  };
  Created_By?: {
    name: string;
    id: string;
    email?: string;
  };
  Modified_By?: {
    name: string;
    id: string;
    email?: string;
  };
  Propietario_Original?: string | null;

  // Cuenta padre
  Parent_Account?: {
    name: string;
    id: string;
  } | null;

  // Fechas
  Created_Time?: string;
  Modified_Time?: string;
  Last_Activity_Time?: string;

  // Estados y flags booleanos
  Cliente_con_Equipo?: boolean;
  Cuenta_Nacional?: boolean;
  Cliente_Books?: boolean;
  Condiciones_Especiales?: boolean;
  Proyecto_abierto?: boolean;
  Revisado?: boolean;
  Localizaciones_multiples?: boolean;
  Locked__s?: boolean;

  // Otros campos
  Description?: string;
  Annual_Revenue?: number;
  Employees?: number;
  Rating?: string;
  Ownership?: string;
  Ticker_Symbol?: string;
  Tipo_de_pedido?: string | null;
  Estado_de_la_Cuenta?: string | null;
  Comunidad_Aut_noma?: string | null;
  Divisi_n_de_M_xico?: string | null;
  Fuente_de_Importaci_n?: string | null;
  Territories?: string | null;

  // Layout
  Layout?: {
    display_label: string;
    name: string;
    id: string;
  };
  $layout_id?: {
    display_label: string;
    name: string;
    id: string;
  };

  // Campos de sistema ZOHO
  $currency_symbol?: string;
  $field_states?: string | null;
  $state?: string;
  $process_flow?: boolean;
  $locked_for_me?: boolean;
  $approved?: boolean;
  $approval?: {
    delegate: boolean;
    takeover: boolean;
    approve: boolean;
    reject: boolean;
    resubmit: boolean;
  };
  $editable?: boolean;
  $zia_owner_assignment?: string | null;
  $is_duplicate?: boolean;
  $review_process?: {
    approve: boolean;
    reject: boolean;
    resubmit: boolean;
  };
  $review?: string | null;
  $orchestration?: boolean;
  $in_merge?: boolean;
  $approval_state?: string;
  forced_currency?: string | null;
  Record_Image?: string | null;

  // Tags
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
