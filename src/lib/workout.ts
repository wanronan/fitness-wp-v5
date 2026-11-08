export function parseSetCount(value: string): number {
  const m = value.match(/^(\d+)x/i);
  return m ? Number(m[1]) : 0;
}

export function parseRepTarget(value: string): { min: number; max: number } {
  const body = value.split('x')[1] || '';
  const nums = body.match(/\d+/g)?.map(Number) || [];
  if (!nums.length) return { min: 0, max: 0 };
  return { min: nums[0], max: nums[1] ?? nums[0] };
}

export function restSeconds(value: string): number {
  const nums = value.match(/\d+/g)?.map(Number) || [];
  if (!nums.length) return 60;
  return nums.length > 1 ? nums[1] : nums[0];
}

export function formatSeconds(total: number): string {
  const safe = Math.max(0, total);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function todayWeekday(): string {
  return ['domingo','segunda','terca','quarta','quinta','sexta','sabado'][new Date().getDay()];
}
