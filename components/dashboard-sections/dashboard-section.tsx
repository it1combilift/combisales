import { DataTable } from "@/components/data-table";
import data from "@/app/(protected)/dashboard/data.json";
import { SectionCards } from "@/components/section-cards";
// import { UserSessionInfo } from "@/components/user-session-info";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

export function DashboardSection() {
  return (
    <>
      {/* <div className="px-4 lg:px-6">
        <UserSessionInfo />
      </div> */}
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}