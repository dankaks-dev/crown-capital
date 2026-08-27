export type LogicType = 'PROPORTIONAL_ADDITION' | 'FIXED_ADDITION' | 'PROPORTIONAL_DEVALUATION' | 'FIXED_DEVALUATION';

export type Rule = {
  id: string;
  label: string;
  logicType: LogicType;
  behavior: 'STACKABLE' | 'SUPERSEDES';
  low: number;
  high: number;
};

export type ValuationItem = {
  id: string;
  improvementType: string;
  date: string;
  status: string;
  cost: number | null;
  title: string;
};

export const CEILING = 0.25;
export const DEV_CAP = 0.20;

export function bound(rule: Rule, which: 'low' | 'mid' | 'high') {
  if (which === 'low') return rule.low;
  if (which === 'high') return rule.high;
  return (rule.low + rule.high) / 2;
}

export function standalone(rule: Rule, baseline: number, which: 'low' | 'mid' | 'high') {
  const value = bound(rule, which);
  if (rule.logicType === 'PROPORTIONAL_ADDITION' || rule.logicType === 'PROPORTIONAL_DEVALUATION') {
    return baseline * value;
  }
  return value;
}

export function isDevaluation(rule: Rule) {
  return rule.logicType === 'PROPORTIONAL_DEVALUATION' || rule.logicType === 'FIXED_DEVALUATION';
}

function deduplicate(items: ValuationItem[], rules: Record<string, Rule>) {
  const kept: ValuationItem[] = [];
  const newest = new Map<string, ValuationItem>();
  for (const item of items) {
    const rule = rules[item.improvementType];
    if (!rule) continue;
    if (rule.behavior === 'SUPERSEDES') {
      const existing = newest.get(rule.id);
      if (!existing || item.date > existing.date) newest.set(rule.id, item);
    } else {
      kept.push(item);
    }
  }
  for (const item of newest.values()) kept.push(item);
  return kept;
}

export function computePass(baseline: number, items: ValuationItem[], rules: Record<string, Rule>, which: 'low' | 'mid' | 'high') {
  const active = items.filter((item) => item.status === 'active' && item.improvementType && rules[item.improvementType]);
  const chosen = deduplicate(active, rules);

  let grossAdditions = 0;
  let totalDevaluations = 0;

  for (const item of chosen) {
    const rule = rules[item.improvementType];
    const value = standalone(rule, baseline, which);
    if (isDevaluation(rule)) totalDevaluations += value;
    else grossAdditions += value;
  }

  const maxAdditions = baseline * CEILING;
  const cappedAdditions = Math.min(grossAdditions, maxAdditions);
  const ceilingAdjustment = grossAdditions - cappedAdditions;

  const maxDevaluations = baseline * DEV_CAP;
  const cappedDevaluations = Math.min(totalDevaluations, maxDevaluations);

  const finalValue = Math.max(0, baseline + cappedAdditions - cappedDevaluations);
  const uncappedValue = Math.max(0, baseline + grossAdditions - totalDevaluations);

  return {
    grossAdditions,
    cappedAdditions,
    ceilingAdjustment,
    totalDevaluations,
    cappedDevaluations,
    finalValue,
    uncappedValue,
    ceilingBinds: ceilingAdjustment > 0.5,
    itemCount: chosen.length,
  };
}

export function computeValuation(baseline: number, items: ValuationItem[], rules: Record<string, Rule>) {
  return {
    baseline,
    low: computePass(baseline, items, rules, 'low'),
    mid: computePass(baseline, items, rules, 'mid'),
    high: computePass(baseline, items, rules, 'high'),
  };
}

export const money = (value: number) =>
  `£${Math.round(value).toLocaleString('en-GB')}`;
