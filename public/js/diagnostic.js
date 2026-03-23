/**
 * RAKUDA AI SOLUTION - AI Diagnostic Tool
 * Multi-step questionnaire that scores AI readiness
 * Used on /tools/diagnostic page
 */

var diagState = {
  questions: [],
  answers: [],
  currentIndex: 0,
  email: '',
  submitted: false,
};

// ── Initialization ───────────────────────────────────────────────────

/**
 * Fetch questions from the API and render the first question.
 */
function initDiagnostic() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/diagnostic/questions', true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var data = JSON.parse(xhr.responseText);
        diagState.questions = data.questions || data || [];
        diagState.answers = new Array(diagState.questions.length).fill(null);
        diagState.currentIndex = 0;
        renderQuestion();
        updateProgress();
      } catch (e) {
        showDiagError('質問データの読み込みに失敗しました。');
      }
    } else {
      showDiagError('質問データの取得に失敗しました。ページを再読み込みしてください。');
    }
  };
  xhr.onerror = function () {
    showDiagError('通信エラーが発生しました。インターネット接続をご確認ください。');
  };
  xhr.send();
}

// ── Question Rendering ───────────────────────────────────────────────

/**
 * Render the current question card.
 */
function renderQuestion() {
  var container = document.getElementById('diagQuestionArea');
  if (!container || diagState.questions.length === 0) return;

  var q = diagState.questions[diagState.currentIndex];
  var idx = diagState.currentIndex;
  var total = diagState.questions.length;

  var html = '';
  html += '<div class="diag-question-card">';
  html += '<div class="diag-question-number">Q' + (idx + 1) + ' / ' + total + '</div>';
  html += '<h3 class="diag-question-text">' + escapeHtml(q.text || q.question || '') + '</h3>';
  html += '<div class="diag-options">';

  var options = q.options || q.choices || [];
  options.forEach(function (option, optIdx) {
    var isSelected = diagState.answers[idx] === optIdx;
    var label = typeof option === 'string' ? option : option.text || option.label || '';
    html +=
      '<button class="diag-option' + (isSelected ? ' is-selected' : '') + '"' +
      ' onclick="selectAnswer(' + idx + ', ' + optIdx + ')">' +
      escapeHtml(label) +
      '</button>';
  });

  html += '</div>'; // .diag-options
  html += '</div>'; // .diag-question-card

  // Navigation buttons
  html += '<div class="diag-nav">';
  if (idx > 0) {
    html += '<button class="diag-btn diag-btn--prev" onclick="prevQuestion()">前の質問</button>';
  } else {
    html += '<span></span>';
  }

  if (idx < total - 1) {
    var nextDisabled = diagState.answers[idx] === null ? ' disabled' : '';
    html += '<button class="diag-btn diag-btn--next"' + nextDisabled + ' onclick="nextQuestion()">次の質問</button>';
  } else {
    var submitDisabled = diagState.answers[idx] === null ? ' disabled' : '';
    html += '<button class="diag-btn diag-btn--submit"' + submitDisabled + ' onclick="showEmailStep()">結果を見る</button>';
  }
  html += '</div>'; // .diag-nav

  container.innerHTML = html;
}

/**
 * Select an answer for a given question.
 * @param {number} questionIdx
 * @param {number} optionIdx - 0-3
 */
function selectAnswer(questionIdx, optionIdx) {
  diagState.answers[questionIdx] = optionIdx;
  renderQuestion();
  updateProgress();
}

/**
 * Go to the next question.
 */
function nextQuestion() {
  if (diagState.currentIndex < diagState.questions.length - 1) {
    diagState.currentIndex++;
    renderQuestion();
    updateProgress();
  }
}

/**
 * Go to the previous question.
 */
function prevQuestion() {
  if (diagState.currentIndex > 0) {
    diagState.currentIndex--;
    renderQuestion();
    updateProgress();
  }
}

// ── Progress Bar ─────────────────────────────────────────────────────

/**
 * Update the progress bar.
 */
function updateProgress() {
  var progressBar = document.getElementById('diagProgress');
  var progressText = document.getElementById('diagProgressText');
  if (!progressBar) return;

  var answered = diagState.answers.filter(function (a) { return a !== null; }).length;
  var total = diagState.questions.length;
  var pct = total > 0 ? Math.round((answered / total) * 100) : 0;

  var fill = progressBar.querySelector('.progress-fill');
  if (fill) {
    fill.style.width = pct + '%';
  }

  if (progressText) {
    progressText.textContent = answered + ' / ' + total + ' 回答済み';
  }
}

// ── Email Step & Submission ──────────────────────────────────────────

/**
 * Show the email input step before submitting.
 */
function showEmailStep() {
  // Check all answered
  var unanswered = diagState.answers.indexOf(null);
  if (unanswered !== -1) {
    diagState.currentIndex = unanswered;
    renderQuestion();
    alert('すべての質問にお答えください。（Q' + (unanswered + 1) + ' が未回答です）');
    return;
  }

  var container = document.getElementById('diagQuestionArea');
  if (!container) return;

  var html = '';
  html += '<div class="diag-email-step">';
  html += '<h3>診断結果をお送りします</h3>';
  html += '<p>メールアドレスを入力すると、詳細な診断レポートもお送りします。（任意）</p>';
  html += '<div class="diag-email-form">';
  html += '<input type="email" id="diagEmail" class="diag-input" placeholder="example@company.com">';
  html += '</div>';
  html += '<div class="diag-nav">';
  html += '<button class="diag-btn diag-btn--prev" onclick="diagState.currentIndex = diagState.questions.length - 1; renderQuestion();">戻る</button>';
  html += '<button class="diag-btn diag-btn--submit" onclick="submitDiagnostic()">診断結果を見る</button>';
  html += '</div>';
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Submit diagnostic answers to the API.
 */
function submitDiagnostic() {
  var emailInput = document.getElementById('diagEmail');
  var email = emailInput ? emailInput.value.trim() : '';

  var data = {
    answers: diagState.answers,
    email: email,
  };

  var submitBtn = document.querySelector('.diag-btn--submit');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '診断中...';
  }

  var xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/diagnostic', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        var result = JSON.parse(xhr.responseText);
        diagState.submitted = true;
        renderResults(result);

        if (typeof trackEvent === 'function') {
          trackEvent('diagnostic_submit', { score: result.score });
        }
      } catch (e) {
        alert('結果の解析に失敗しました。');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '診断結果を見る';
        }
      }
    } else {
      alert('送信に失敗しました。もう一度お試しください。');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = '診断結果を見る';
      }
    }
  };
  xhr.onerror = function () {
    alert('通信エラーが発生しました。');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '診断結果を見る';
    }
  };
  xhr.send(JSON.stringify(data));
}

// ── Results Rendering ────────────────────────────────────────────────

/**
 * Render the diagnostic results page.
 * @param {object} result - { score, level, recommendations, ... }
 */
function renderResults(result) {
  var container = document.getElementById('diagQuestionArea');
  if (!container) return;

  var score = result.score || 0;
  var maxScore = result.maxScore || 100;
  var level = result.level || '';
  var recommendations = result.recommendations || [];

  var pct = Math.round((score / maxScore) * 100);

  // Determine level color
  var levelColor = '#6c757d';
  if (pct >= 80) levelColor = '#28a745';
  else if (pct >= 60) levelColor = '#17a2b8';
  else if (pct >= 40) levelColor = '#ffc107';
  else levelColor = '#dc3545';

  var html = '';
  html += '<div class="diag-results">';

  // Score circle
  html += '<div class="diag-score-section">';
  html += '<div class="diag-score-circle" id="diagScoreCircle">';
  html += '<svg viewBox="0 0 120 120" class="diag-score-svg">';
  html += '<circle cx="60" cy="60" r="54" class="diag-score-bg" />';
  html += '<circle cx="60" cy="60" r="54" class="diag-score-fill" ' +
    'stroke="' + levelColor + '" ' +
    'stroke-dasharray="' + Math.round(339.292 * pct / 100) + ' 339.292" ' +
    'id="diagScoreFill" />';
  html += '</svg>';
  html += '<div class="diag-score-value">';
  html += '<span class="diag-score-number" id="diagScoreNumber">0</span>';
  html += '<span class="diag-score-unit">/ ' + maxScore + '</span>';
  html += '</div>';
  html += '</div>'; // .diag-score-circle

  // Level badge
  html += '<div class="diag-level-badge" style="background:' + levelColor + ';">' + escapeHtml(level) + '</div>';
  html += '</div>'; // .diag-score-section

  // Recommendations
  if (recommendations.length > 0) {
    html += '<div class="diag-recommendations">';
    html += '<h3>改善のご提案</h3>';
    html += '<div class="diag-rec-list">';

    recommendations.slice(0, 3).forEach(function (rec, i) {
      var title = typeof rec === 'string' ? rec : rec.title || '';
      var desc = typeof rec === 'object' ? rec.description || '' : '';
      html += '<div class="diag-rec-item">';
      html += '<div class="diag-rec-number">' + (i + 1) + '</div>';
      html += '<div class="diag-rec-content">';
      html += '<h4>' + escapeHtml(title) + '</h4>';
      if (desc) {
        html += '<p>' + escapeHtml(desc) + '</p>';
      }
      html += '</div>';
      html += '</div>';
    });

    html += '</div>'; // .diag-rec-list
    html += '</div>'; // .diag-recommendations
  }

  // CTA buttons
  html += '<div class="diag-cta">';
  html += '<button class="diag-btn diag-btn--primary" onclick="openBooking()">無料相談を予約する</button>';
  html += '<button class="diag-btn diag-btn--secondary" onclick="shareDiagResult(' + score + ')">結果をシェアする</button>';
  html += '<button class="diag-btn diag-btn--outline" onclick="retakeDiagnostic()">もう一度診断する</button>';
  html += '</div>';

  html += '</div>'; // .diag-results

  container.innerHTML = html;

  // Hide progress bar
  var progressBar = document.getElementById('diagProgress');
  if (progressBar) progressBar.style.display = 'none';
  var progressText = document.getElementById('diagProgressText');
  if (progressText) progressText.style.display = 'none';

  // Animate score number
  animateScore(score);
}

/**
 * Animate the score counter from 0 to target.
 * @param {number} target
 */
function animateScore(target) {
  var el = document.getElementById('diagScoreNumber');
  if (!el) return;

  var current = 0;
  var duration = 1500; // ms
  var stepTime = 20;
  var steps = Math.ceil(duration / stepTime);
  var increment = target / steps;

  var timer = setInterval(function () {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.round(current);
  }, stepTime);
}

/**
 * Share the diagnostic result (basic Web Share API or fallback).
 * @param {number} score
 */
function shareDiagResult(score) {
  var text = 'RAKUDA AI SOLUTION のAI活用診断で ' + score + ' 点を獲得しました！あなたの会社のAI活用度を診断してみませんか？';
  var url = location.href;

  if (navigator.share) {
    navigator.share({
      title: 'AI活用度診断結果',
      text: text,
      url: url,
    }).catch(function () {
      // User cancelled or error — silently ignore
    });
  } else {
    // Fallback: copy to clipboard
    var fullText = text + ' ' + url;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText).then(function () {
        alert('結果をクリップボードにコピーしました。');
      });
    } else {
      prompt('以下のテキストをコピーしてシェアしてください:', fullText);
    }
  }
}

/**
 * Reset and retake the diagnostic.
 */
function retakeDiagnostic() {
  diagState.answers = new Array(diagState.questions.length).fill(null);
  diagState.currentIndex = 0;
  diagState.submitted = false;

  // Restore progress bar
  var progressBar = document.getElementById('diagProgress');
  if (progressBar) progressBar.style.display = '';
  var progressText = document.getElementById('diagProgressText');
  if (progressText) progressText.style.display = '';

  renderQuestion();
  updateProgress();
}

// ── Error Display ────────────────────────────────────────────────────

/**
 * Show an error message in the diagnostic area.
 * @param {string} message
 */
function showDiagError(message) {
  var container = document.getElementById('diagQuestionArea');
  if (!container) return;

  container.innerHTML =
    '<div class="diag-error">' +
    '<p>' + escapeHtml(message) + '</p>' +
    '<button class="diag-btn" onclick="initDiagnostic()">再読み込み</button>' +
    '</div>';
}

// ── Utility ──────────────────────────────────────────────────────────

/**
 * Escape HTML entities to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Auto-init on page load ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  // Only init if the diagnostic container exists on the page
  if (document.getElementById('diagQuestionArea')) {
    initDiagnostic();
  }
});
