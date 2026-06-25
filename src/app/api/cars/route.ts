import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const quarter = searchParams.get('quarter');

  const client = getSupabaseClient();

  if (quarter && year) {
    // Quarterly query: get 3 months of data
    const y = parseInt(year);
    const q = parseInt(quarter);
    const startMonth = (q - 1) * 3 + 1;
    const endMonth = q * 3;

    const { data, error } = await client
      .from('monthly_cars')
      .select('*')
      .eq('year', y)
      .gte('month', startMonth)
      .lte('month', endMonth)
      .order('price', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);
    return NextResponse.json({ data: data || [], quarter: q, year: y });
  }

  if (year && month) {
    const { data, error } = await client
      .from('monthly_cars')
      .select('*')
      .eq('year', parseInt(year))
      .eq('month', parseInt(month))
      .order('price', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);
    return NextResponse.json({ data: data || [], year: parseInt(year), month: parseInt(month) });
  }

  // Get all available months
  const { data, error } = await client
    .from('monthly_cars')
    .select('year, month')
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) throw new Error(`查询失败: ${error.message}`);

  const months = [...new Set((data || []).map((d: { year: number; month: number }) => `${d.year}-${d.month}`))];
  return NextResponse.json({ months });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { year, month, cars } = body;

  if (!year || !month || !cars || !Array.isArray(cars)) {
    return NextResponse.json({ error: 'Missing required fields: year, month, cars' }, { status: 400 });
  }

  const client = getSupabaseClient();

  // Delete existing data for this month
  const { error: deleteError } = await client
    .from('monthly_cars')
    .delete()
    .eq('year', year)
    .eq('month', month);

  if (deleteError) throw new Error(`删除旧数据失败: ${deleteError.message}`);

  // Insert new data
  const rows = cars.map((car: Record<string, string>) => ({
    year,
    month,
    group_name: car.group_name || car.group || '',
    name: car.name || '',
    oem: car.oem || '',
    type: car.type || 'BEV',
    aer: car.aer || '-',
    weight: car.weight || '-',
    consumption: car.consumption || '-',
    battery_type: car.battery_type || car.batteryType || '-',
    battery_capacity: car.battery_capacity || car.batteryCapacity || '-',
    drive_mode: car.drive_mode || car.driveMode || '-',
    price: car.price || '-',
  }));

  const { data, error } = await client
    .from('monthly_cars')
    .insert(rows)
    .select();

  if (error) throw new Error(`插入数据失败: ${error.message}`);
  return NextResponse.json({ data, count: rows.length });
}
