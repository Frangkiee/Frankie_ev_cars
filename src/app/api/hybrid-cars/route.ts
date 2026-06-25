import { NextResponse } from "next/server";
import { db } from "@/storage/database/supabase-client";
import { monthlyHybridCars } from "@/storage/database/shared/schema";
import { eq, and, inArray, asc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const quarter = searchParams.get("quarter");

    if (year && month) {
      // Get data for specific month
      const data = await db
        .select()
        .from(monthlyHybridCars)
        .where(
          and(
            eq(monthlyHybridCars.year, parseInt(year)),
            eq(monthlyHybridCars.month, parseInt(month))
          )
        )
        .orderBy(asc(monthlyHybridCars.price));
      return NextResponse.json({ data });
    }

    if (year && quarter) {
      // Get data for specific quarter
      const quarterMonths = {
        "1": [1, 2, 3],
        "2": [4, 5, 6],
        "3": [7, 8, 9],
        "4": [10, 11, 12],
      };
      const months = quarterMonths[quarter as keyof typeof quarterMonths];
      if (!months) {
        return NextResponse.json({ error: "Invalid quarter" }, { status: 400 });
      }
      const data = await db
        .select()
        .from(monthlyHybridCars)
        .where(
          and(
            eq(monthlyHybridCars.year, parseInt(year)),
            inArray(monthlyHybridCars.month, months)
          )
        )
        .orderBy(asc(monthlyHybridCars.month), asc(monthlyHybridCars.price));
      return NextResponse.json({ data });
    }

    if (year) {
      // Get all data for the year
      const data = await db
        .select()
        .from(monthlyHybridCars)
        .where(eq(monthlyHybridCars.year, parseInt(year)))
        .orderBy(asc(monthlyHybridCars.month), asc(monthlyHybridCars.price));
      return NextResponse.json({ data });
    }

    // Get all available months
    const months = await db
      .select({
        year: monthlyHybridCars.year,
        month: monthlyHybridCars.month,
      })
      .from(monthlyHybridCars)
      .groupBy(monthlyHybridCars.year, monthlyHybridCars.month)
      .orderBy(asc(monthlyHybridCars.year), asc(monthlyHybridCars.month));

    return NextResponse.json({
      months: months.map((m) => `${m.year}-${m.month}`),
    });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { year, month, cars } = body;

    if (!year || !month || !cars || !Array.isArray(cars)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Delete existing data for this month
    await db
      .delete(monthlyHybridCars)
      .where(
        and(
          eq(monthlyHybridCars.year, parseInt(year)),
          eq(monthlyHybridCars.month, parseInt(month))
        )
      );

    // Insert new data
    const newCars = cars.map((car: {
      group_name: string;
      name: string;
      oem: string;
      type: string;
      electric_range?: string;
      total_range?: string;
      weight?: string;
      fuel_consumption?: string;
      battery_type?: string;
      battery_capacity?: string;
      drive_mode?: string;
      price: string;
    }) => ({
      year: parseInt(year),
      month: parseInt(month),
      group_name: car.group_name,
      name: car.name,
      oem: car.oem,
      type: car.type,
      electric_range: car.electric_range || "-",
      total_range: car.total_range || "-",
      weight: car.weight || "-",
      fuel_consumption: car.fuel_consumption || "-",
      battery_type: car.battery_type || "-",
      battery_capacity: car.battery_capacity || "-",
      drive_mode: car.drive_mode || "-",
      price: car.price,
    }));

    await db.insert(monthlyHybridCars).values(newCars);

    return NextResponse.json({ success: true, count: newCars.length });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to save data" },
      { status: 500 }
    );
  }
}
