import { InspectionFormSchema } from "@/schemas/inspections";
import { Vehicle } from "@/interfaces/inspection";

export type InspectionFormData = InspectionFormSchema;

export interface InspectionFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: InspectionFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
