(() => {
  'use strict';
  const MODEL = window.SHOULD_I_USE_ML_MODEL;
  if (!MODEL) throw new Error('Model file is missing.');

  const FEATURES = {
    data_scale: { label: 'Amount of data', positive: 'You have enough past examples to learn from', negative: 'There may not be enough data to learn much' },
    prediction_repetition: { label: 'How often it runs', positive: 'The decision happens often enough for automation to matter', negative: 'This decision does not happen very often' },
    target_quality: { label: 'Target quality', positive: 'The outcome is clear enough to measure', negative: 'The thing you want to predict is not clearly defined' },
    pattern_complexity: { label: 'Problem complexity', positive: 'Simple rules may miss useful patterns', negative: 'A simple rule may already describe the problem' },
    rule_solution: { label: 'Simple rules', positive: 'Rules leave a lot of the problem unsolved', negative: 'Simple rules already solve most of it' },
    generalization_need: { label: 'New cases', positive: 'The system must handle cases it has never seen', negative: 'A lookup or fixed rule may be enough' },
    feedback_loop: { label: 'Feedback', positive: 'You will see outcomes and can check the model later', negative: 'You may not know when the model gets worse' },
    sql_sufficiency: { label: 'Simple analysis', positive: 'SQL or a dashboard will not solve the main problem', negative: 'SQL, a dashboard, or a calculation may already solve it' },
    ai_pressure: { label: 'Pressure to use ML', positive: 'The problem seems to come before the method', negative: 'ML may have been chosen before the problem was clear' },
    distribution_stability: { label: 'Future data', positive: 'Future data may look enough like the past to learn from it', negative: 'The world may change faster than the model can keep up' },
  };

  const $ = (s) => document.querySelector(s);
  const form = $('#mlForm');
  const resultSection = $('#resultSection');
  const quizSection = $('#quizSection');
  const sigmoid = (x) => 1 / (1 + Math.exp(-x));

  function getValues() {
    return Object.fromEntries(MODEL.features.map(name => {
      const el = form.querySelector(`input[name="${name}"]:checked`);
      return [name, Number(el ? el.value : 2)];
    }));
  }

  function rawScore(values) {
    return MODEL.features.reduce((z, name) => z + MODEL.coefficients[name] * values[name], MODEL.intercept);
  }

  function probability(values) { return sigmoid(rawScore(values)); }

  function contributions(values) {
    return MODEL.features.map(name => {
      const coeff = MODEL.coefficients[name];
      const centered = coeff * (values[name] - 2);
      return { name, value: values[name], centered, meta: FEATURES[name] };
    });
  }

  function pickSummary(p, v) {
    if (v.ai_pressure >= 3 && (v.rule_solution >= 3 || v.sql_sufficiency >= 3)) {
      return ['The method came first', 'Someone seems to want ML more than the problem needs it.'];
    }
    if (v.data_scale <= 1 && v.pattern_complexity >= 3) {
      return ['Small data, big problem', 'The problem is complex, but the dataset is tiny. That is a rough combination.'];
    }
    if (v.rule_solution >= 3 && v.sql_sufficiency >= 3) {
      return ['Probably a simpler system', 'Rules, SQL, or a dashboard may get you most of the way there.'];
    }
    if (v.target_quality <= 1) {
      return ['No clear target yet', 'Before choosing a model, decide what success actually means and how to measure it.'];
    }
    if (v.distribution_stability <= 1 && v.feedback_loop <= 1) {
      return ['Hard to trust over time', 'The data changes a lot and you will rarely see whether predictions were right.'];
    }
    if (p >= 0.78) {
      return ['A real prediction problem', 'ML looks reasonable here. Start simple and make it beat a boring baseline.'];
    }
    if (p >= 0.55) {
      return ['Worth a small experiment', 'ML may help, but you should compare it with a simple baseline first.'];
    }
    if (p >= 0.35) {
      return ['Could go either way', 'Try the simple version first. You may find that you do not need ML.'];
    }
    return ['Probably not an ML problem', 'This looks more like rules, analytics, or ordinary software.'];
  }

  function verdictFor(p) {
    if (p >= 0.78) return ['PROBABLY YES', 'ML looks worth trying.', 'You have a repeated prediction problem, a measurable target, and enough reason to learn from past data. Start with a simple baseline.'];
    if (p >= 0.55) return ['MAYBE YES', 'ML could be useful.', 'There is enough here to test it, but not enough to skip a simpler approach.'];
    if (p >= 0.35) return ['MAYBE', 'Try the simple solution first.', 'Build the rule, SQL query, or basic regression first. Then see what is still missing.'];
    return ['PROBABLY NO', 'You probably do not need ML.', 'A rule, calculation, dashboard, or normal software may solve this more clearly and cheaply.'];
  }

  function nextStepFor(p, v) {
    if (v.target_quality <= 1) return '<strong>Try this first:</strong> Write down exactly what you want to predict and how you will know whether a prediction was right.';
    if (v.sql_sufficiency >= 3) return '<strong>Try this first:</strong> Build the SQL, dashboard, or calculation. Only add ML if there is a clear gap left.';
    if (v.rule_solution >= 3) return '<strong>Try this first:</strong> Build the rule based version and measure how well it works.';
    if (v.distribution_stability <= 1) return '<strong>Try this first:</strong> Test on later time periods, not just a random split, and decide how you will notice drift.';
    if (p >= 0.55) return '<strong>Try this first:</strong> Use a simple baseline such as logistic regression, linear regression, or a small tree.';
    return '<strong>Try this first:</strong> Describe the decision, the target, and the simplest non-ML solution in one paragraph.';
  }

  function renderEvidence(values) {
    const cs = contributions(values).sort((a, b) => Math.abs(b.centered) - Math.abs(a.centered));
    const positives = cs.filter(x => x.centered > 0.03).slice(0, 4);
    const negatives = cs.filter(x => x.centered < -0.03).slice(0, 4);
    const maxAbs = Math.max(...cs.map(x => Math.abs(x.centered)), 0.01);

    const make = (x, negative = false) => {
      const width = Math.max(8, Math.round(Math.abs(x.centered) / maxAbs * 100));
      const note = negative ? x.meta.negative : x.meta.positive;
      return `<div class="evidence-item ${negative ? 'negative' : ''}"><div class="evidence-head"><b>${x.meta.label}</b><span>${x.centered > 0 ? '+' : ''}${x.centered.toFixed(2)}</span></div><div class="evidence-bar"><i style="width:${width}%"></i></div><div class="evidence-note">${note}</div></div>`;
    };

    $('#forEvidence').innerHTML = positives.length ? positives.map(x => make(x)).join('') : '<p class="tiny">Nothing strongly pushed the result toward ML.</p>';
    $('#againstEvidence').innerHTML = negatives.length ? negatives.map(x => make(x, true)).join('') : '<p class="tiny">Nothing strongly pushed the result away from ML.</p>';
  }

  function equation(values) {
    const parts = MODEL.features.map(name => `${MODEL.coefficients[name].toFixed(3)} x ${values[name]}  // ${FEATURES[name].label}`);
    return `z = ${MODEL.intercept.toFixed(3)}\n  + ${parts.join('\n  + ')}\n\nP(ML) = 1 / (1 + exp(-z))`;
  }

  function updateUrl(values) {
    const params = new URLSearchParams();
    MODEL.features.forEach(name => params.set(name, String(values[name])));
    try { history.replaceState(null, '', `${location.pathname}?${params.toString()}#result`); } catch (_) {}
  }

  function loadUrl() {
    const params = new URLSearchParams(location.search);
    let found = false;
    MODEL.features.forEach(name => {
      const val = params.get(name);
      if (val !== null && /^[0-4]$/.test(val)) {
        const input = form.querySelector(`input[name="${name}"][value="${val}"]`);
        if (input) { input.checked = true; found = true; }
      }
    });
    return found;
  }

  function render(values, scroll = true) {
    const p = probability(values);
    const pct = Math.round(p * 100);
    const [status, title, copy] = verdictFor(p);
    const [summary, sentence] = pickSummary(p, values);
    $('#stamp').textContent = status;
    $('#probability').textContent = `${pct}%`;
    $('#meterFill').style.width = `${pct}%`;
    $('#verdictTitle').textContent = title;
    $('#verdictCopy').textContent = copy;
    $('#summary').textContent = summary;
    $('#sentence').textContent = sentence;
    $('#nextStep').innerHTML = nextStepFor(p, values);
    $('#equation').textContent = equation(values);
    renderEvidence(values);
    resultSection.classList.remove('hidden');
    updateUrl(values);
    window.__lastVerdict = { values, p, pct, status, title, copy, summary, sentence };
    if (scroll) resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', e => { e.preventDefault(); render(getValues()); });
  $('#editBtn').addEventListener('click', () => quizSection.scrollIntoView({ behavior: 'smooth' }));

  $('#shareBtn').addEventListener('click', async () => {
    const v = window.__lastVerdict;
    if (!v) return;
    const text = `Should I use ML?\n${v.pct}% chance ML is worth trying.\n${v.title}\n${location.href}`;
    try {
      await navigator.clipboard.writeText(text);
      const button = $('#shareBtn');
      const old = button.textContent;
      button.textContent = 'Copied';
      setTimeout(() => { button.textContent = old; }, 1500);
    } catch { window.prompt('Copy result:', text); }
  });

  $('#cardBtn').addEventListener('click', () => {
    const v = window.__lastVerdict;
    if (!v) return;
    const canvas = $('#shareCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f2f2ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111111';
    ctx.fillRect(60, 58, 1080, 2);
    ctx.font = '600 22px Helvetica, Arial, sans-serif';
    ctx.fillText('SHOULD I USE ML?', 60, 104);
    ctx.fillStyle = '#df4b24';
    ctx.font = '500 150px Helvetica, Arial, sans-serif';
    ctx.fillText(`${v.pct}%`, 55, 280);
    ctx.fillStyle = '#111111';
    ctx.font = '500 50px Helvetica, Arial, sans-serif';
    wrapText(ctx, v.title, 60, 375, 1040, 58);
    ctx.font = '600 18px Helvetica, Arial, sans-serif';
    ctx.fillText(v.summary.toUpperCase(), 60, 535);
    ctx.fillStyle = '#666660';
    ctx.font = '16px Helvetica, Arial, sans-serif';
    ctx.fillText('Ten questions about whether ML is worth trying.', 60, 580);
    const a = document.createElement('a');
    a.download = `should-i-use-ml-${v.pct}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let yy = y;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) { ctx.fillText(line, x, yy); line = word; yy += lineHeight; }
      else { line = test; }
    }
    if (line) ctx.fillText(line, x, yy);
  }

  const dialog = $('#aboutDialog');
  $('#aboutBtn').addEventListener('click', () => dialog.showModal());
  $('#closeDialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  const m = MODEL.metrics;
  $('#metrics').innerHTML = [
    ['ROC AUC', m.roc_auc.toFixed(3)],
    ['Accuracy', `${Math.round(m.accuracy_0_5 * 100)}%`],
    ['Test cases', m.holdout_rows.toLocaleString()],
  ].map(([k, v]) => `<div class="metric"><b>${v}</b><span>${k}</span></div>`).join('');

  if (loadUrl()) render(getValues(), false);
})();
