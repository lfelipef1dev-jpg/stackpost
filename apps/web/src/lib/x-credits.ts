import { getSupabase } from '@/lib/supabase';

// X prepaid credits: $0.015/post, $0.20/post with link
// Billed per use from prepaid credit balance

const X_POST_COST = 0.015;
const X_POST_WITH_LINK_COST = 0.20;

export function calculateXPostCost(content: string): number {
  const hasLink = /\bhttps?:\/\//i.test(content);
  return hasLink ? X_POST_WITH_LINK_COST : X_POST_COST;
}

export async function getXBalance(teamId: string): Promise<number> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('x_credit_balances')
    .select('balance')
    .eq('team_id', teamId)
    .maybeSingle();

  if (error || !data) return 0;
  return data.balance || 0;
}

export async function deductXCredit(teamId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  const supabase = getSupabase();
  const balance = await getXBalance(teamId);

  if (balance < amount) {
    return { success: false, newBalance: balance };
  }

  const newBalance = balance - amount;
  const { error } = await supabase
    .from('x_credit_balances')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('team_id', teamId);

  if (error) return { success: false, newBalance: balance };
  return { success: true, newBalance };
}

export async function addXCredit(teamId: string, amount: number): Promise<{ success: boolean; newBalance: number }> {
  const supabase = getSupabase();
  const balance = await getXBalance(teamId);
  const newBalance = balance + amount;

  const { error } = await supabase
    .from('x_credit_balances')
    .upsert({ team_id: teamId, balance: newBalance, updated_at: new Date().toISOString() }, { onConflict: 'team_id' });

  if (error) return { success: false, newBalance: balance };
  return { success: true, newBalance };
}
