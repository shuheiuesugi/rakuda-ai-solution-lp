const router = require('express').Router();
const db = require('../db');
const { trackConversion } = require('../middleware/tracking');

// Contact form submission
router.post('/contact', (req, res) => {
  const { company, name, email, phone, employee_count, message } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const visitorId = req.cookies.rakuda_visitor;
  const variant = req.cookies.rakuda_variant;

  const result = db.prepare(
    'INSERT INTO leads (company, name, email, phone, employee_count, message, source_lp, ab_variant) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(company, name, email, phone, employee_count, message, variant, variant);

  trackConversion(visitorId, 'contact', variant, variant, { lead_id: result.lastInsertRowid });
  res.json({ success: true, id: result.lastInsertRowid });
});

// Booking submission
router.post('/booking', (req, res) => {
  const { date, time_slot, company, name, email } = req.body;
  if (!email || !date || !time_slot) return res.status(400).json({ error: 'Required fields missing' });

  const visitorId = req.cookies.rakuda_visitor;
  const variant = req.cookies.rakuda_variant;

  const result = db.prepare(
    'INSERT INTO bookings (date, time_slot, company, name, email, source_lp, ab_variant) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(date, time_slot, company, name, email, variant, variant);

  trackConversion(visitorId, 'booking', variant, variant, { booking_id: result.lastInsertRowid });
  res.json({ success: true, id: result.lastInsertRowid });
});

// Diagnostic submission
router.get('/diagnostic/questions', (req, res) => {
  const questions = db.prepare('SELECT * FROM diagnostic_questions ORDER BY sort_order').all();
  res.json(questions.map(q => ({
    ...q,
    options: JSON.parse(q.options)
  })));
});

router.post('/diagnostic', (req, res) => {
  const { answers, email } = req.body;
  if (!answers) return res.status(400).json({ error: 'Answers required' });

  const visitorId = req.cookies.rakuda_visitor;
  const variant = req.cookies.rakuda_variant;

  // Calculate score: each question 0-3 points (index), total max 30, scaled to 100
  const answerArr = typeof answers === 'string' ? JSON.parse(answers) : answers;
  const rawScore = answerArr.reduce((sum, a) => sum + (a || 0), 0);
  const score = Math.round((rawScore / 30) * 100);

  let level, recommendations;
  if (score >= 70) {
    level = '上級';
    recommendations = JSON.stringify([
      'AIによる予測分析の高度化で、さらなる業務最適化が可能です',
      '社内AIプラットフォームの構築で、部門横断の効率化を推進できます',
      'AI活用の社内トレーニング体制の整備で、組織全体のDXを加速させましょう'
    ]);
  } else if (score >= 40) {
    level = '中級';
    recommendations = JSON.stringify([
      '定型業務のRPA+AI自動化で、月間40時間以上の削減が見込めます',
      '社内文書のAI検索システム導入で、情報アクセス時間を90%短縮できます',
      'データ分析のAI活用で、経営判断のスピードと精度を同時に向上できます'
    ]);
  } else {
    level = '初級';
    recommendations = JSON.stringify([
      '請求書・見積書の自動処理から始めると、即効果を実感できます',
      'FAQ自動応答の導入で、問い合わせ対応工数を75%削減できます',
      'まずは無料相談で、御社に最適なAI導入ロードマップを作成しましょう'
    ]);
  }

  const result = db.prepare(
    'INSERT INTO diagnostic_results (visitor_id, email, answers, score, level, recommendations, source_lp) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(visitorId, email || null, JSON.stringify(answerArr), score, level, recommendations, variant);

  trackConversion(visitorId, 'diagnostic', variant, variant, { score, level });
  res.json({ success: true, score, level, recommendations: JSON.parse(recommendations), id: result.lastInsertRowid });
});

// ROI calculation
router.post('/roi-calc', (req, res) => {
  const { industry, employees, monthly_hours, hourly_rate, target_tasks } = req.body;

  const visitorId = req.cookies.rakuda_visitor;
  const variant = req.cookies.rakuda_variant;

  const emp = parseInt(employees) || 10;
  const hours = parseInt(monthly_hours) || 160;
  const rate = parseInt(hourly_rate) || 3000;
  const automationRate = 0.3; // 30% automation potential

  const annualHoursSaved = Math.round(emp * hours * automationRate * 12);
  const annualCostSaved = annualHoursSaved * rate;
  const investmentCost = emp <= 30 ? 3000000 : emp <= 100 ? 8000000 : 15000000;
  const roiMultiple = Math.round((annualCostSaved / investmentCost) * 10) / 10;
  const paybackMonths = Math.round(investmentCost / (annualCostSaved / 12));

  const inputs = { industry, employees: emp, monthly_hours: hours, hourly_rate: rate, target_tasks };
  const results = { annualHoursSaved, annualCostSaved, investmentCost, roiMultiple, paybackMonths };

  const dbResult = db.prepare(
    'INSERT INTO roi_calculations (visitor_id, email, inputs, results, source_lp) VALUES (?, ?, ?, ?, ?)'
  ).run(visitorId, req.body.email || null, JSON.stringify(inputs), JSON.stringify(results), variant);

  trackConversion(visitorId, 'roi', variant, variant, results);
  res.json({ success: true, ...results, id: dbResult.lastInsertRowid });
});

// WP download
router.post('/wp-download', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const visitorId = req.cookies.rakuda_visitor;
  const variant = req.cookies.rakuda_variant;

  // Save as lead
  db.prepare(
    'INSERT INTO leads (email, message, source_lp, ab_variant) VALUES (?, ?, ?, ?)'
  ).run(email, 'WP Download request', variant, variant);

  trackConversion(visitorId, 'wp_download', variant, variant, { email });
  res.json({ success: true, downloadUrl: '/static/wp-ai-guide-2026.pdf' });
});

module.exports = router;
