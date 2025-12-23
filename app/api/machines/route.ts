import { NextResponse } from "next/server";
import machinesData from "@/data/machines.json";

export async function GET() {
  try {
    return NextResponse.json(machinesData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch machines data" },
      { status: 500 }
    );
  }
}
