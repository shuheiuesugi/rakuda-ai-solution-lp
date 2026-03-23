/**
 * RAKUDA AI SOLUTION - Chatbot Widget
 * Floating action button (FAB) + chat window with keyword-based replies
 */

/**
 * Toggle the chatbot window open/closed.
 */
function toggleChat() {
  var fab = document.getElementById('chatFab');
  var win = document.getElementById('chatWindow');
  if (!fab || !win) return;

  var isOpen = fab.classList.contains('is-open');

  if (isOpen) {
    fab.classList.remove('is-open');
    win.classList.remove('is-open');
  } else {
    fab.classList.add('is-open');
    win.classList.add('is-open');
  }
}

/**
 * Send a quick-action message (preset button).
 * @param {string} text - the quick-action text
 */
function sendQuickChat(text) {
  // Remove quick actions area
  var quickActions = document.getElementById('chatQuickActions');
  if (quickActions) {
    quickActions.style.display = 'none';
  }

  addChatMsg(text, 'user');
  showTyping();

  setTimeout(function () {
    removeTyping();
    var reply = getBotReply(text);
    addChatMsg(reply, 'bot');
  }, 800);
}

/**
 * Send the user's typed message.
 */
function sendChat() {
  var input = document.getElementById('chatInput');
  if (!input) return;

  var text = input.value.trim();
  if (!text) return;

  input.value = '';
  addChatMsg(text, 'user');
  showTyping();

  setTimeout(function () {
    removeTyping();
    var reply = getBotReply(text);
    addChatMsg(reply, 'bot');
  }, 1000);
}

/**
 * Add a message bubble to the chat.
 * @param {string} text - message content (supports HTML)
 * @param {string} who  - "bot" or "user"
 */
function addChatMsg(text, who) {
  var messages = document.getElementById('chatMessages');
  if (!messages) return;

  var bubble = document.createElement('div');
  bubble.className = 'chat-msg chat-msg--' + who;
  bubble.innerHTML = '<div class="chat-bubble">' + text + '</div>';
  messages.appendChild(bubble);

  // Scroll to bottom
  messages.scrollTop = messages.scrollHeight;
}

/**
 * Show the typing indicator.
 */
function showTyping() {
  var typing = document.getElementById('chatTyping');
  if (typing) {
    typing.style.display = 'flex';
  }

  // Also scroll to bottom
  var messages = document.getElementById('chatMessages');
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
}

/**
 * Remove the typing indicator.
 */
function removeTyping() {
  var typing = document.getElementById('chatTyping');
  if (typing) {
    typing.style.display = 'none';
  }
}

/**
 * Get a keyword-based bot reply.
 * @param {string} text - user's message
 * @returns {string} bot reply (HTML)
 */
function getBotReply(text) {
  var t = text.toLowerCase();

  // Pricing
  if (t.indexOf('料金') !== -1 || t.indexOf('価格') !== -1 || t.indexOf('費用') !== -1 || t.indexOf('いくら') !== -1) {
    return '料金プランは3つございます。<br><br>' +
      '<strong>お試しプラン</strong>: 月額5万円〜<br>' +
      '小規模な業務改善からスタート<br><br>' +
      '<strong>標準プラン</strong>: 月額15万円〜<br>' +
      '本格的なAI導入・業務自動化<br><br>' +
      '<strong>フルサポートプラン</strong>: 月額30万円〜<br>' +
      'カスタムAI開発・専任サポート付き<br><br>' +
      '詳しくは無料相談でお見積りいたします。';
  }

  // Services
  if (t.indexOf('できる') !== -1 || t.indexOf('サービス') !== -1 || t.indexOf('何が') !== -1) {
    return 'RAKUDA AI SOLUTIONでは以下のサービスを提供しています。<br><br>' +
      '・<strong>業務プロセスのAI自動化</strong><br>' +
      '・<strong>社内データの活用・分析基盤構築</strong><br>' +
      '・<strong>AIチャットボット・FAQ自動応答</strong><br>' +
      '・<strong>ドキュメント処理の自動化</strong><br>' +
      '・<strong>カスタムAIツールの開発</strong><br><br>' +
      'お客様の課題に合わせて最適なソリューションをご提案します。';
  }

  // Consultation
  if (t.indexOf('相談') !== -1 || t.indexOf('無料') !== -1 || t.indexOf('予約') !== -1) {
    return '無料相談は随時受け付けております！<br><br>' +
      '・所要時間: 約30分<br>' +
      '・オンライン（Zoom）で実施<br>' +
      '・貴社の課題をヒアリングし、AI活用の方向性をご提案<br><br>' +
      'ページ上部の「<strong>無料相談を予約</strong>」ボタンからお気軽にどうぞ。';
  }

  // Timeline
  if (t.indexOf('時間') !== -1 || t.indexOf('期間') !== -1 || t.indexOf('どのくらい') !== -1) {
    return '導入期間の目安は以下の通りです。<br><br>' +
      '・<strong>簡易PoC（概念実証）</strong>: 2〜4週間<br>' +
      '・<strong>本格導入</strong>: 1〜3ヶ月<br>' +
      '・<strong>カスタム開発</strong>: 3〜6ヶ月<br><br>' +
      'まずは小さく始めて効果を実感いただくアプローチを推奨しています。';
  }

  // Track record
  if (t.indexOf('実績') !== -1 || t.indexOf('事例') !== -1) {
    return 'これまで<strong>120社以上</strong>の企業様にAIソリューションを導入してきました。<br><br>' +
      '・製造業: 検品工程のAI自動化で不良率30%削減<br>' +
      '・小売業: 需要予測AIで在庫コスト20%削減<br>' +
      '・サービス業: 問い合わせ対応の60%を自動化<br><br>' +
      '業種・規模を問わず対応可能です。詳しい事例は無料相談でご紹介します。';
  }

  // Security
  if (t.indexOf('セキュリティ') !== -1 || t.indexOf('安全') !== -1 || t.indexOf('情報漏') !== -1) {
    return 'セキュリティ対策には万全を期しています。<br><br>' +
      '・<strong>データ暗号化</strong>（通信時・保管時）<br>' +
      '・<strong>アクセス制御</strong>・監査ログ完備<br>' +
      '・<strong>国内データセンター</strong>での運用も対応<br>' +
      '・<strong>NDA締結</strong>の上でプロジェクトを進行<br>' +
      '・ISO27001相当のセキュリティ基準に準拠<br><br>' +
      '機密情報の取り扱いについてもご安心ください。';
  }

  // Default
  return 'お問い合わせありがとうございます。<br><br>' +
    'ご質問の内容について、専門スタッフが詳しくご案内いたします。<br><br>' +
    '以下のキーワードもお試しください：<br>' +
    '・「料金」- 料金プランについて<br>' +
    '・「サービス」- サービス内容について<br>' +
    '・「実績」- 導入事例について<br><br>' +
    'または「<strong>無料相談を予約</strong>」ボタンから直接ご相談いただけます。';
}

// ── Enter key to send ────────────────────────────────────────────────
document.addEventListener('keydown', function (e) {
  var input = document.getElementById('chatInput');
  if (e.key === 'Enter' && document.activeElement === input) {
    e.preventDefault();
    sendChat();
  }
});
