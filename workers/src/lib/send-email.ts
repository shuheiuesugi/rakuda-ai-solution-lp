const RESEND_API_URL = "https://api.resend.com/emails";
const NOTIFY_TO = "info@rakuda-ai.com";
const FROM = "RAKUDA AI SOLUTION <noreply@rakuda-ai.com>";

interface EmailPayload {
  subject: string;
  html: string;
}

export async function sendNotificationEmail(
  apiKey: string,
  payload: EmailPayload
): Promise<void> {
  try {
    await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [NOTIFY_TO],
        subject: payload.subject,
        html: payload.html,
      }),
    });
  } catch (err) {
    // メール送信失敗はログのみ。フォーム送信自体は成功させる
    console.error("Email notification failed:", err);
  }
}

export function buildContactEmailHtml(data: {
  email: string;
  company?: string | null;
  name?: string | null;
  phone?: string | null;
  size?: string | null;
  message?: string | null;
  source_page?: string | null;
}): EmailPayload {
  const rows = [
    ["メール", data.email],
    ["会社名", data.company],
    ["氏名", data.name],
    ["電話番号", data.phone],
    ["企業規模", data.size],
    ["メッセージ", data.message],
    ["流入ページ", data.source_page],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:bold;border:1px solid #e5e7eb;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(String(v))}</td></tr>`)
    .join("");

  return {
    subject: `【RAKUDA AI SOLUTION】新規お問い合わせ — ${data.company || data.email}`,
    html: `<h2>新規お問い合わせがありました</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px;">${rows}</table>
<p style="margin-top:16px;color:#6b7280;font-size:13px;">このメールはRAKUDA AI SOLUTIONのフォームから自動送信されています。</p>`,
  };
}

export function buildBookingEmailHtml(data: {
  email: string;
  date: string;
  time: string;
  company?: string | null;
  name?: string | null;
  source_page?: string | null;
}): EmailPayload {
  const rows = [
    ["日時", `${data.date} ${data.time}`],
    ["メール", data.email],
    ["会社名", data.company],
    ["氏名", data.name],
    ["流入ページ", data.source_page],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:8px 12px;font-weight:bold;border:1px solid #e5e7eb;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;">${escapeHtml(String(v))}</td></tr>`)
    .join("");

  return {
    subject: `【RAKUDA AI SOLUTION】新規予約 — ${data.date} ${data.time} ${data.company || data.email}`,
    html: `<h2>新規予約がありました</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px;">${rows}</table>
<p style="margin-top:16px;color:#6b7280;font-size:13px;">このメールはRAKUDA AI SOLUTIONのフォームから自動送信されています。</p>`,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
