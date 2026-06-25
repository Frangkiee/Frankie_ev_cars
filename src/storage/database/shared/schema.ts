import { pgTable, serial, timestamp, varchar, integer, text, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const monthlyCars = pgTable(
  "monthly_cars",
  {
    id: serial().primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    group_name: varchar("group_name", { length: 100 }).notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    oem: varchar("oem", { length: 200 }).notNull(),
    type: varchar("type", { length: 50 }).notNull().default("BEV"),
    aer: varchar("aer", { length: 100 }).notNull().default("-"),
    weight: varchar("weight", { length: 100 }).notNull().default("-"),
    consumption: varchar("consumption", { length: 100 }).notNull().default("-"),
    battery_type: varchar("battery_type", { length: 50 }).notNull().default("-"),
    battery_capacity: varchar("battery_capacity", { length: 100 }).notNull().default("-"),
    drive_mode: varchar("drive_mode", { length: 50 }).notNull().default("-"),
    price: varchar("price", { length: 100 }).notNull().default("-"),
    created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("monthly_cars_year_month_idx").on(table.year, table.month),
    index("monthly_cars_group_name_idx").on(table.group_name),
  ]
);
