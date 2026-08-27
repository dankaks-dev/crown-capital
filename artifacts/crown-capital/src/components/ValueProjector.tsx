import { useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import {
  computeValuation, computePass, standalone, isDevaluation, money,
} from '@/lib/valuation';
import type { Rule, ValuationItem } from '@/lib/valuation';

export default function ValueProjector({
  baseline,
  items,
  rules,
  onSaveBaseline,
  onResolve,
  readOnly,
}: {
  baseline: number | null;
  items: ValuationItem[];
  rules: Record<string, Rule>;
  onSaveBaseline: (value: number) => void;
  onResolve: (id: string) => void;
  readOnly: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [whatIfType, setWhatIfType] = useState('');
  const [whatIfCost, setWhatIfCost] = useState('');

  const ruleList = useMemo(() => Object.values(rules).sort((a, b) => a.label.localeCompare(b.label)), [rules]);

  if (baseline === null) {
    return (
      <div className="hv-vp">
        <div className="hv-vp-head">
          <div><p className="pj-kicker">The numbers</p><h2>Value projector</h2></div>
        </div>
        <div className="hv-vp-baseline">
          <p>Add your current estimated property value to start projecting what your improvements may have contributed.</p>
          <label>Current estimated value (£)
            <input type="number" min="0" step="1000" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. 350000" />
          </label>
          <div className="pj-form-actions">
            <button className="pj-primary" onClick={() => { const v = Number(draft); if (v > 0) onSaveBaseline(v); }} disabled={readOnly}>
              Save value
            </button>
          </div>
        </div>
      </div>
    );
  }

  const result = computeValuation(baseline, items, rules);
  const active = items.filter((i) => i.status === 'active' && rules[i.improvementType]);
  const risks = active.filter((i) => isDevaluation(rules[i.improvementType]));

  const whatIfRule = whatIfType ? rules[whatIfType] : null;
  const whatIfMid = whatIfRule ? standalone(whatIfRule, baseline, 'mid') : 0;
  const whatIfLow = whatIfRule ? standalone(whatIfRule, baseline, 'low') : 0;
  const whatIfHigh = whatIfRule ? standalone(whatIfRule, baseline, 'high') : 0;
  const whatIfCostNumber = Number(whatIfCost) || 0;
  const whatIfRoi = whatIfCostNumber > 0 ? (whatIfMid / whatIfCostNumber) * 100 : null;

  return (
    <div className="hv-vp">
      <div className="hv-vp-head">
        <div><p className="pj-kicker">The numbers</p><h2>Value projector</h2></div>
        <button className="pj-outline" onClick={() => onSaveBaseline(0)} disabled={readOnly}>Change baseline</button>
      </div>

      <div className="hv-money">
        <span className="hv-money-label">Estimated property value</span>
        <div className="hv-money-main">{money(result.mid.finalValue)}</div>
        <p className="hv-money-range">
          Range: {money(result.low.finalValue)} – {money(result.high.finalValue)}
        </p>

        <div className="hv-money-waterfall">
          <div className="hv-money-row"><span>Baseline value</span><strong>{money(baseline)}</strong></div>
          <div className="hv-money-row"><span>Improvements logged</span><strong>+{money(result.mid.grossAdditions)}</strong></div>
          {result.mid.ceilingBinds && (
            <div className="hv-money-row"><span>Best-in-street ceiling adjustment</span><strong>−{money(result.mid.ceilingAdjustment)}</strong></div>
          )}
          {result.mid.totalDevaluations > 0 && (
            <div className="hv-money-row"><span>Value at risk</span><strong>−{money(result.mid.cappedDevaluations)}</strong></div>
          )}
          <div className="hv-money-row hv-money-row-total"><span>Estimated value</span><strong>{money(result.mid.finalValue)}</strong></div>
        </div>

        {result.mid.ceilingBinds && (
          <p className="hv-money-note">
            This property has reached the estimated best-in-street ceiling for its area.
            Uncapped range would be {money(result.low.uncappedValue)} – {money(result.high.uncappedValue)}.
          </p>
        )}

        <p className="hv-money-disclaimer">
          This estimate is based on standard UK market heuristics and does not constitute a formal RICS valuation.
          Local market conditions, buyer sentiment, and property condition will ultimately determine sale price.
        </p>
      </div>

      <div className="hv-exposure">
        <div className="hv-exp-card hv-exp-green">
          <span>Estimated equity added</span>
          <strong>+{money(result.mid.cappedAdditions)}</strong>
        </div>
        <div className="hv-exp-card hv-exp-red">
          <span>Estimated value at risk</span>
          <strong>−{money(result.mid.cappedDevaluations)}</strong>
          {risks.length > 0 && (
            <div className="hv-exp-list">
              {risks.map((risk) => (
                <div className="hv-exp-item" key={risk.id}>
                  <span>{risk.title} — {money(standalone(rules[risk.improvementType], baseline, 'mid'))}</span>
                  {!readOnly && <button onClick={() => onResolve(risk.id)}>Mark resolved</button>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="hv-whatif">
        <p className="pj-kicker">Simulate a scenario</p>
        <label>Improvement type
          <select value={whatIfType} onChange={(e) => setWhatIfType(e.target.value)}>
            <option value="">Choose an improvement…</option>
            {ruleList.map((rule) => <option key={rule.id} value={rule.id}>{rule.label}</option>)}
          </select>
        </label>
        <label>Estimated cost (£)
          <input type="number" min="0" value={whatIfCost} onChange={(e) => setWhatIfCost(e.target.value)} placeholder="Optional" />
        </label>
        {whatIfRule && (
          <div className="hv-whatif-result">
            <strong>
              {isDevaluation(whatIfRule) ? '−' : '+'}{money(Math.abs(whatIfMid))}
            </strong>
            <span>Range: {money(Math.abs(whatIfLow))} – {money(Math.abs(whatIfHigh))}</span>
            {whatIfRoi !== null && !isDevaluation(whatIfRule) && (
              <span>Return on investment: {Math.round(whatIfRoi)}%</span>
            )}
            <span>Standalone estimate. Nothing is saved until you log it as an entry.</span>
          </div>
        )}
      </div>
    </div>
  );
}
