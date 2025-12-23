export interface Machine {
  id: string;
  description: string;
  options: string | null;
  serialNumber: string;
  available: boolean;
  status: "Operativa" | "NO Operativa";
  insured: boolean;
  location: string;
  usageHours: number;
  usageHoursDate: string;
  dealer: string | null;
  history: string | null;
  hasPhotos: boolean;
  hasTraveller: boolean;
  hasCE: boolean;
  height: string | null;
  image: string;
}

export interface MachinesMetadata {
  lastUpdated: string;
  totalMachines: number;
  availableMachines: number;
  operativeMachines: number;
}

export interface MachinesResponse {
  machines: Machine[];
  metadata: MachinesMetadata;
}
