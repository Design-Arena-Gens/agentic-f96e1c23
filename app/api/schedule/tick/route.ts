import { NextResponse } from 'next/server';
import { processDueTasks, scheduleInitialTasks } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  await scheduleInitialTasks();
  const res = await processDueTasks();
  return NextResponse.json(res);
}
