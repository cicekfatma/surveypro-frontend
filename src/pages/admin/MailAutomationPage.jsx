import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import {
  getEmailLogs,
  getMailConfig,
  getPendingEmails,
  getReminderCandidates,
  getRespondents,
  importRespondents,
  queueInvitations,
  queueReminderEmails,
  queueWeeklyReport,
  saveMailConfig,
  sendPendingEmails,
} from "../../api/mailApi";
import { getSurveyDetail } from "../../api/surveyApi";
import { clearAuthSession } from "../../auth/session";
import surveyProLogo from "../../assets/surveypro-logo.png";

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  orangeDark: "#E16F0B",
  background: "#F3F3F4",
  text: "#28283A",
  border: "#E4E4E7",
  white: "#FFFFFF",
  muted: "#616371",
  danger: "#B42318",
  success: "#087443",
};
const FONT_FAMILY = '"Poppins", sans-serif';

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={styles.logoutIcon}
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.logs)) return value.logs;
  if (Array.isArray(value?.emails)) return value.emails;
  if (Array.isArray(value?.candidates)) return value.candidates;
  if (Array.isArray(value?.respondents)) return value.respondents;
  return [];
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusStyle(status) {
  if (status === "SENT") {
    return { ...styles.statusPill, ...styles.statusSent };
  }

  if (status === "FAILED") {
    return { ...styles.statusPill, ...styles.statusFailed };
  }

  return { ...styles.statusPill, ...styles.statusPending };
}

function getRespondentStatus(respondent) {
  if (respondent.submittedAt) return "Tamamladi";
  if (respondent.openedAt) return "Acti";
  if (respondent.status === "NOT_OPENED") return "Bekliyor";
  if (respondent.status) return respondent.status;
  return "Bekliyor";
}

function getRespondentStatusStyle(status) {
  if (status === "Tamamladi") {
    return { ...styles.statusPill, ...styles.statusSent };
  }

  if (status === "Acti") {
    return { ...styles.statusPill, ...styles.statusOpened };
  }

  if (status === "Davet gitti") {
    return { ...styles.statusPill, ...styles.statusPending };
  }

  return { ...styles.statusPill, ...styles.statusNeutral };
}

function parseEmails(value) {
  const seen = new Set();

  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean)
    .filter((email) => {
      const normalized = email.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function findInvitationLog(respondent, logs) {
  const invitationLogs = logs.filter((log) => log.emailType === "INVITATION");

  return (
    invitationLogs.find(
      (log) =>
        log.respondentId != null &&
        respondent.id != null &&
        Number(log.respondentId) === Number(respondent.id)
    ) ||
    invitationLogs.find(
      (log) =>
        log.toEmail &&
        respondent.email &&
        log.toEmail.toLowerCase() === respondent.email.toLowerCase()
    ) ||
    null
  );
}

function getInvitationText(invitationLog) {
  if (!invitationLog) return "Hazirlanmadi";

  if (invitationLog.status === "SENT") return "Gonderildi";
  if (invitationLog.status === "PENDING") return "Kuyrukta";
  if (invitationLog.status === "FAILED") return "Basarisiz";

  return invitationLog.status || "Hazirlandi";
}

function InlineMessage({ type = "info", children }) {
  if (!children) return null;

  return (
    <div
      style={{
        ...styles.inlineMessage,
        ...(type === "error" ? styles.inlineError : null),
        ...(type === "success" ? styles.inlineSuccess : null),
      }}
    >
      {children}
    </div>
  );
}

function RespondentsTable({ respondents, logs, loading, error, onRefresh }) {
  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Katilimcilar</h2>
          <p style={styles.cardSubtitle}>
            Davet, acilma, tamamlama ve reminder durumlari
          </p>
        </div>
        <div style={styles.headerButtons}>
          <span style={styles.countPill}>{respondents.length}</span>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onRefresh}
          >
            Yenile
          </button>
        </div>
      </div>

      <InlineMessage type="error">{error}</InlineMessage>

      {loading ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : respondents.length === 0 ? (
        <div style={styles.emptyState}>Katilimci bulunamadi.</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>E-posta</th>
                <th style={styles.th}>Durum</th>
                <th style={styles.th}>Davet</th>
                <th style={styles.th}>Acilma</th>
                <th style={styles.th}>Tamamlama</th>
                <th style={styles.th}>Reminder</th>
              </tr>
            </thead>
            <tbody>
              {respondents.map((respondent, index) => {
                const status = getRespondentStatus(respondent);
                const invitationLog = findInvitationLog(respondent, logs);

                return (
                  <tr
                    key={respondent.id || respondent.email || index}
                    style={styles.tr}
                  >
                    <td style={styles.td}>
                      {respondent.email || respondent.toEmail || "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={getRespondentStatusStyle(status)}>
                        {status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusStyle(invitationLog?.status)}>
                        {getInvitationText(invitationLog)}
                      </span>
                      <div style={styles.queueMeta}>
                        {formatDateTime(
                          invitationLog?.updatedAt || invitationLog?.createdAt
                        )}
                      </div>
                      {invitationLog?.errorMessage && (
                        <div style={styles.errorDetail}>
                          {invitationLog.errorMessage}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {formatDateTime(respondent.openedAt)}
                    </td>
                    <td style={styles.td}>
                      {formatDateTime(respondent.submittedAt)}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.reminderCell}>
                        <span style={styles.countPill}>
                          {respondent.reminderCount ??
                            respondent.sentReminderCount ??
                            0}
                        </span>
                        <span style={styles.queueMeta}>
                          {formatDateTime(respondent.lastRemindedAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RespondentInvitationPanel({ surveyId, onChanged }) {
  const [emailText, setEmailText] = useState("");
  const [importing, setImporting] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emails = useMemo(() => parseEmails(emailText), [emailText]);

  const handleImport = async () => {
    if (importing || emails.length === 0) return;

    try {
      setImporting(true);
      setMessage("");
      setError("");
      const response = await importRespondents(surveyId, emails);
      const importedCount =
        response?.importedCount ?? response?.createdCount ?? emails.length;
      setMessage(`${importedCount} katilimci ice aktarildi.`);
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Katilimcilar ice aktarilamadi."));
    } finally {
      setImporting(false);
    }
  };

  const handleQueueInvitations = async () => {
    if (queueing) return;

    try {
      setQueueing(true);
      setMessage("");
      setError("");
      const response = await queueInvitations(surveyId);
      const queuedCount =
        response?.queuedCount ?? response?.createdCount ?? normalizeList(response).length;
      setMessage(
        queuedCount > 0
          ? `${queuedCount} davet maili kuyruya alindi.`
          : "Davet maili kuyruya alma islemi calistirildi."
      );
      onChanged?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Davetler kuyruya alinamadi."));
    } finally {
      setQueueing(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Katilimcilar ve Davetler</h2>
          <p style={styles.cardSubtitle}>
            E-postalari ice aktar, sonra davet maillerini kuyruya al
          </p>
        </div>
        <span style={styles.countPill}>{emails.length}</span>
      </div>

      <label style={styles.field}>
        <span style={styles.label}>E-posta listesi</span>
        <textarea
          style={styles.textarea}
          value={emailText}
          onChange={(event) => setEmailText(event.target.value)}
          placeholder="ornek1@sirket.com&#10;ornek2@sirket.com"
        />
      </label>

      <div style={styles.actionsRow}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleImport}
          disabled={importing || emails.length === 0}
        >
          {importing ? "Ice aktariliyor..." : "Katilimcilari Ice Aktar"}
        </button>
        <button
          type="button"
          style={styles.secondaryButton}
          onClick={handleQueueInvitations}
          disabled={queueing}
        >
          {queueing ? "Kuyruga aliniyor..." : "Davetleri Hazirla"}
        </button>
      </div>

      <InlineMessage type="success">{message}</InlineMessage>
      <InlineMessage type="error">{error}</InlineMessage>
    </section>
  );
}

function MailConfigPanel({ surveyId }) {
  const [reminderInterval, setReminderInterval] = useState(3);
  const [maxReminders, setMaxReminders] = useState(2);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError("");
        const config = await getMailConfig(surveyId);

        if (isCancelled) return;

        setReminderInterval(config?.reminderInterval ?? 3);
        setMaxReminders(config?.maxReminders ?? 2);
        setIsActive(Boolean(config?.isActive));
      } catch (err) {
        if (!isCancelled) {
          setError(getApiErrorMessage(err, "Mail ayarlari alinamadi."));
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchConfig();

    return () => {
      isCancelled = true;
    };
  }, [surveyId]);

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setMessage("");
      setError("");

      await saveMailConfig(surveyId, {
        reminderInterval: Number(reminderInterval),
        maxReminders: Number(maxReminders),
        isActive,
      });

      setMessage("Mail ayarlari kaydedildi.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Mail ayarlari kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Mail Ayarlari</h2>
          <p style={styles.cardSubtitle}>Hatirlatma periyodu ve otomasyon durumu</p>
        </div>
      </div>

      {loading ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : (
        <div style={styles.formGrid}>
          <label style={styles.field}>
            <span style={styles.label}>Hatirlatma araligi gun</span>
            <input
              type="number"
              min="1"
              value={reminderInterval}
              onChange={(event) => setReminderInterval(event.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Maksimum hatirlatma</span>
            <input
              type="number"
              min="0"
              value={maxReminders}
              onChange={(event) => setMaxReminders(event.target.value)}
              style={styles.input}
            />
          </label>

          <div style={styles.toggleRow}>
            <span style={styles.label}>Otomatik hatirlatma</span>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(event) => setIsActive(event.target.checked)}
                style={styles.switchInput}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: isActive ? COLORS.orange : "#D9D9D9",
                }}
              >
                <span
                  style={{
                    ...styles.sliderKnob,
                    transform: isActive ? "translateX(18px)" : "translateX(0)",
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      )}

      <div style={styles.actionsRow}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleSave}
          disabled={loading || saving}
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      <InlineMessage type="success">{message}</InlineMessage>
      <InlineMessage type="error">{error}</InlineMessage>
    </section>
  );
}

function EmailLogsTable({ logs, loading, error, onRefresh }) {
  const [emailTypeFilter, setEmailTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredLogs = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesType =
        !emailTypeFilter || log.emailType === emailTypeFilter;
      const matchesStatus = !statusFilter || log.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        [log.toEmail, log.subject, log.errorMessage]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [emailTypeFilter, logs, searchText, statusFilter]);

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Email Loglari</h2>
          <p style={styles.cardSubtitle}>Bu ankete ait mail gecmisi</p>
        </div>
        <button type="button" style={styles.secondaryButton} onClick={onRefresh}>
          Yenile
        </button>
      </div>

      <InlineMessage type="error">{error}</InlineMessage>

      {loading ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : logs.length === 0 ? (
        <div style={styles.emptyState}>Email logu bulunamadi.</div>
      ) : (
        <div>
          <div style={styles.filterGrid}>
            <label style={styles.field}>
              <span style={styles.label}>Mail tipi</span>
              <select
                style={styles.input}
                value={emailTypeFilter}
                onChange={(event) => setEmailTypeFilter(event.target.value)}
              >
                <option value="">Tum tipler</option>
                <option value="INVITATION">Invitation</option>
                <option value="REMINDER">Reminder</option>
                <option value="WEEKLY_REPORT">Weekly Report</option>
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Durum</span>
              <select
                style={styles.input}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Tum durumlar</option>
                <option value="PENDING">Pending</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
              </select>
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Arama</span>
              <input
                style={styles.input}
                type="search"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="E-posta, konu veya hata"
              />
            </label>
          </div>

          <div style={styles.filterSummary}>
            {filteredLogs.length} / {logs.length} kayit gosteriliyor
          </div>

          {filteredLogs.length === 0 ? (
            <div style={styles.emptyState}>Filtreye uygun email logu yok.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Tip</th>
                    <th style={styles.th}>Alici</th>
                    <th style={styles.th}>Konu</th>
                    <th style={styles.th}>Durum</th>
                    <th style={styles.th}>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} style={styles.tr}>
                      <td style={styles.td}>{log.emailType || "-"}</td>
                      <td style={styles.td}>{log.toEmail || "-"}</td>
                      <td style={styles.td}>{log.subject || "-"}</td>
                      <td style={styles.td}>
                        <span style={getStatusStyle(log.status)}>
                          {log.status}
                        </span>
                        {log.errorMessage && (
                          <div style={styles.errorDetail}>
                            {log.errorMessage}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        {formatDateTime(log.createdAt || log.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function PendingEmailsPanel({ pendingEmails, loading, error, onRefresh, onSent }) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");

  const handleSendPending = async () => {
    if (sending) return;

    try {
      setSending(true);
      setMessage("");
      setSendError("");
      const response = await sendPendingEmails();
      const sentCount = normalizeList(response).length;
      setMessage(
        sentCount > 0
          ? `${sentCount} pending mail icin gonderim calisti.`
          : "Pending mail gonderimi calistirildi."
      );
      onSent?.();
    } catch (err) {
      setSendError(getApiErrorMessage(err, "Pending mailler gonderilemedi."));
    } finally {
      setSending(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Pending Queue</h2>
          <p style={styles.cardSubtitle}>Gonderim bekleyen mailler</p>
        </div>
        <div style={styles.headerButtons}>
          <button type="button" style={styles.secondaryButton} onClick={onRefresh}>
            Yenile
          </button>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={handleSendPending}
            disabled={sending || loading || pendingEmails.length === 0}
          >
            {sending ? "Gonderiliyor..." : "Pending Gonder"}
          </button>
        </div>
      </div>

      <InlineMessage type="error">{error || sendError}</InlineMessage>
      <InlineMessage type="success">{message}</InlineMessage>

      {loading ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : pendingEmails.length === 0 ? (
        <div style={styles.emptyState}>Bekleyen email yok.</div>
      ) : (
        <div style={styles.compactList}>
          {pendingEmails.map((email) => (
            <div key={email.id} style={styles.queueItem}>
              <div>
                <div style={styles.queueTitle}>{email.toEmail || "-"}</div>
                <div style={styles.queueMeta}>{email.subject || email.emailType}</div>
              </div>
              <span style={getStatusStyle(email.status || "PENDING")}>
                {email.status || "PENDING"}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReminderPanel({ surveyId, candidates, loading, error, onRefresh, onQueued }) {
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("");
  const [queueError, setQueueError] = useState("");

  const handleQueue = async () => {
    if (queueing) return;

    try {
      setQueueing(true);
      setMessage("");
      setQueueError("");
      const response = await queueReminderEmails(surveyId);
      const queuedCount = normalizeList(response).length;
      setMessage(
        queuedCount > 0
          ? `${queuedCount} reminder kuyruya alindi.`
          : "Reminder queue islemi calistirildi."
      );
      onQueued?.();
    } catch (err) {
      setQueueError(getApiErrorMessage(err, "Reminder kuyruya alinamadi."));
    } finally {
      setQueueing(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Reminder Candidates</h2>
          <p style={styles.cardSubtitle}>Hatirlatma maili icin uygun kisiler</p>
        </div>
        <div style={styles.headerButtons}>
          <button type="button" style={styles.secondaryButton} onClick={onRefresh}>
            Yenile
          </button>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={handleQueue}
            disabled={queueing || loading || candidates.length === 0}
          >
            {queueing ? "Kuyruga aliniyor..." : "Reminder Queue"}
          </button>
        </div>
      </div>

      <InlineMessage type="error">{error || queueError}</InlineMessage>
      <InlineMessage type="success">{message}</InlineMessage>

      {loading ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : candidates.length === 0 ? (
        <div style={styles.emptyState}>Reminder adayi yok.</div>
      ) : (
        <div style={styles.compactList}>
          {candidates.map((candidate, index) => (
            <div key={candidate.id || candidate.respondentId || index} style={styles.queueItem}>
              <div>
                <div style={styles.queueTitle}>
                  {candidate.email || candidate.toEmail || candidate.respondentEmail || "-"}
                </div>
                <div style={styles.queueMeta}>
                  Son reminder: {formatDateTime(candidate.lastReminderAt)}
                </div>
              </div>
              <span style={styles.countPill}>
                {candidate.reminderCount ?? candidate.sentReminderCount ?? 0}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WeeklyReportPanel({ surveyId, onQueued }) {
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleQueue = async () => {
    if (queueing) return;

    try {
      setQueueing(true);
      setMessage("");
      setError("");
      await queueWeeklyReport(surveyId);
      setMessage("Haftalik rapor kuyruya alindi.");
      onQueued?.();
    } catch (err) {
      setError(getApiErrorMessage(err, "Haftalik rapor kuyruya alinamadi."));
    } finally {
      setQueueing(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Weekly Report</h2>
          <p style={styles.cardSubtitle}>Admin haftalik rapor maili</p>
        </div>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleQueue}
          disabled={queueing}
        >
          {queueing ? "Kuyruga aliniyor..." : "Haftalik Rapor Queue"}
        </button>
      </div>

      <InlineMessage type="success">{message}</InlineMessage>
      <InlineMessage type="error">{error}</InlineMessage>
    </section>
  );
}

function MailAutomationPage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const [survey, setSurvey] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pendingEmails, setPendingEmails] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [respondents, setRespondents] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [respondentsLoading, setRespondentsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [logsError, setLogsError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [candidatesError, setCandidatesError] = useState("");
  const [respondentsError, setRespondentsError] = useState("");

  const surveyTitle = useMemo(
    () => survey?.title || `Survey #${surveyId}`,
    [survey, surveyId]
  );

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const fetchLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      setLogsError("");
      setLogs(normalizeList(await getEmailLogs(surveyId)));
    } catch (err) {
      setLogs([]);
      setLogsError(getApiErrorMessage(err, "Email loglari alinamadi."));
    } finally {
      setLogsLoading(false);
    }
  }, [surveyId]);

  const fetchPending = useCallback(async () => {
    try {
      setPendingLoading(true);
      setPendingError("");
      setPendingEmails(normalizeList(await getPendingEmails()));
    } catch (err) {
      setPendingEmails([]);
      setPendingError(getApiErrorMessage(err, "Pending queue alinamadi."));
    } finally {
      setPendingLoading(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setCandidatesLoading(true);
      setCandidatesError("");
      setCandidates(normalizeList(await getReminderCandidates(surveyId)));
    } catch (err) {
      setCandidates([]);
      setCandidatesError(getApiErrorMessage(err, "Reminder adaylari alinamadi."));
    } finally {
      setCandidatesLoading(false);
    }
  }, [surveyId]);

  const fetchRespondents = useCallback(async () => {
    try {
      setRespondentsLoading(true);
      setRespondentsError("");
      setRespondents(normalizeList(await getRespondents(surveyId)));
    } catch (err) {
      setRespondents([]);
      setRespondentsError(getApiErrorMessage(err, "Katilimcilar alinamadi."));
    } finally {
      setRespondentsLoading(false);
    }
  }, [surveyId]);

  const refreshMailData = useCallback(() => {
    fetchLogs();
    fetchPending();
    fetchCandidates();
    fetchRespondents();
  }, [fetchCandidates, fetchLogs, fetchPending, fetchRespondents]);

  useEffect(() => {
    let isCancelled = false;

    const fetchPage = async () => {
      try {
        setPageLoading(true);
        setPageError("");
        const data = await getSurveyDetail(surveyId);
        if (!isCancelled) {
          setSurvey(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setPageError(getApiErrorMessage(err, "Anket detayi alinamadi."));
        }
      } finally {
        if (!isCancelled) {
          setPageLoading(false);
        }
      }
    };

    fetchPage();
    refreshMailData();

    return () => {
      isCancelled = true;
    };
  }, [refreshMailData, surveyId]);

  if (pageLoading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Yukleniyor...</div>
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={{ ...styles.statusBox, color: COLORS.danger }}>
            Hata: {pageError}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <div style={styles.brandArea}>
            <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.topButton}
              onClick={() => navigate(`/admin/surveys/${surveyId}`)}
            >
              Anket Detayina Don
            </button>
            <button
              style={styles.topButton}
              onClick={() => navigate("/admin/surveys")}
            >
              Anket Listesine Don
            </button>
            <button
              type="button"
              style={styles.logoutButton}
              onClick={handleLogout}
              aria-label="Cikis Yap"
              title="Cikis Yap"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Mail Otomasyonu</div>
          <div style={styles.tabUnderline} />
        </div>

        <div style={styles.contentArea}>
          <div style={styles.container}>
            <div style={styles.heroCard}>
              <div>
                <div style={styles.kicker}>Survey ID {surveyId}</div>
                <h1 style={styles.title}>{surveyTitle}</h1>
              </div>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={refreshMailData}
              >
                Tumunu Yenile
              </button>
            </div>

            <div style={styles.twoColumn}>
              <MailConfigPanel surveyId={surveyId} />
              <WeeklyReportPanel surveyId={surveyId} onQueued={refreshMailData} />
            </div>

            <RespondentInvitationPanel
              surveyId={surveyId}
              onChanged={refreshMailData}
            />

            <RespondentsTable
              respondents={respondents}
              logs={logs}
              loading={respondentsLoading}
              error={respondentsError}
              onRefresh={fetchRespondents}
            />

            <ReminderPanel
              surveyId={surveyId}
              candidates={candidates}
              loading={candidatesLoading}
              error={candidatesError}
              onRefresh={fetchCandidates}
              onQueued={refreshMailData}
            />

            <PendingEmailsPanel
              pendingEmails={pendingEmails}
              loading={pendingLoading}
              error={pendingError}
              onRefresh={fetchPending}
              onSent={refreshMailData}
            />

            <EmailLogsTable
              logs={logs}
              loading={logsLoading}
              error={logsError}
              onRefresh={fetchLogs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: COLORS.background,
    margin: 0,
    fontFamily: FONT_FAMILY,
  },
  panel: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: COLORS.background,
  },
  header: {
    minHeight: "60px",
    backgroundColor: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "10px 40px",
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logo: {
    width: "154px",
    height: "38px",
    objectFit: "contain",
    display: "block",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "12px",
    flexWrap: "wrap",
  },
  topButton: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    border: "none",
    borderRadius: "999px",
    minHeight: "42px",
    padding: "0 18px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  logoutButton: {
    backgroundColor: "transparent",
    color: COLORS.primary,
    border: "none",
    width: "24px",
    height: "24px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
  },
  logoutIcon: {
    width: "20px",
    height: "20px",
  },
  tabHeader: {
    backgroundColor: COLORS.background,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "36px",
  },
  tabText: {
    color: COLORS.orange,
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1,
    fontFamily: FONT_FAMILY,
  },
  tabUnderline: {
    marginTop: "5px",
    width: "86px",
    height: "2px",
    backgroundColor: COLORS.orange,
    borderRadius: "999px",
  },
  contentArea: {
    backgroundColor: COLORS.background,
    minHeight: "calc(100vh - 96px)",
    padding: "24px 20px 50px",
  },
  container: {
    maxWidth: "1040px",
    margin: "0 auto",
    textAlign: "left",
  },
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    padding: "20px",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  kicker: {
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  title: {
    margin: 0,
    color: COLORS.primary,
    fontSize: "26px",
    lineHeight: 1.2,
    fontWeight: 700,
  },
  twoColumn: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
    gap: "18px",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: "8px",
    padding: "18px",
    border: `1px solid ${COLORS.border}`,
    marginBottom: "18px",
    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
  },
  cardTitle: {
    margin: 0,
    color: COLORS.text,
    fontSize: "18px",
    lineHeight: 1.2,
    fontWeight: 700,
  },
  cardSubtitle: {
    marginTop: "6px",
    color: COLORS.muted,
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "14px",
    alignItems: "end",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "12px",
  },
  filterSummary: {
    color: COLORS.muted,
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "12px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    minHeight: "40px",
    padding: "8px 10px",
    fontSize: "14px",
    color: COLORS.text,
    backgroundColor: COLORS.white,
    fontFamily: FONT_FAMILY,
  },
  textarea: {
    width: "100%",
    minHeight: "132px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    lineHeight: 1.5,
    color: COLORS.text,
    backgroundColor: COLORS.white,
    fontFamily: FONT_FAMILY,
    resize: "vertical",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    minHeight: "40px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    padding: "8px 10px",
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "40px",
    height: "22px",
    flexShrink: 0,
  },
  switchInput: {
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
  },
  slider: {
    position: "absolute",
    cursor: "pointer",
    inset: 0,
    borderRadius: "999px",
    transition: "0.2s",
  },
  sliderKnob: {
    position: "absolute",
    width: "18px",
    height: "18px",
    left: "2px",
    top: "2px",
    backgroundColor: COLORS.white,
    borderRadius: "50%",
    transition: "0.2s",
  },
  actionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "16px",
  },
  headerButtons: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: COLORS.orange,
    color: COLORS.white,
    border: "none",
    borderRadius: "999px",
    minHeight: "38px",
    padding: "0 16px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: "999px",
    minHeight: "38px",
    padding: "0 16px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },
  inlineMessage: {
    marginTop: "12px",
    padding: "10px 12px",
    borderRadius: "6px",
    backgroundColor: "#F6F8FB",
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: 600,
  },
  inlineError: {
    backgroundColor: "#FEF3F2",
    color: COLORS.danger,
  },
  inlineSuccess: {
    backgroundColor: "#ECFDF3",
    color: COLORS.success,
  },
  mutedText: {
    color: COLORS.muted,
    fontSize: "14px",
  },
  emptyState: {
    color: COLORS.muted,
    fontSize: "14px",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: "8px",
    padding: "18px",
    textAlign: "center",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    textAlign: "left",
    padding: "10px",
    color: COLORS.muted,
    borderBottom: `1px solid ${COLORS.border}`,
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: `1px solid ${COLORS.border}`,
  },
  td: {
    padding: "12px 10px",
    color: COLORS.text,
    verticalAlign: "top",
    wordBreak: "break-word",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "4px 9px",
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  statusSent: {
    backgroundColor: "#ECFDF3",
    color: COLORS.success,
  },
  statusFailed: {
    backgroundColor: "#FEF3F2",
    color: COLORS.danger,
  },
  statusPending: {
    backgroundColor: "#FFF7ED",
    color: COLORS.orangeDark,
  },
  statusOpened: {
    backgroundColor: "#EEF4FF",
    color: COLORS.primary,
  },
  statusNeutral: {
    backgroundColor: "#F4F4F5",
    color: COLORS.muted,
  },
  errorDetail: {
    marginTop: "6px",
    color: COLORS.danger,
    fontSize: "12px",
    lineHeight: 1.35,
  },
  compactList: {
    display: "grid",
    gap: "10px",
  },
  queueItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "12px",
    backgroundColor: "#FCFCFD",
  },
  queueTitle: {
    color: COLORS.text,
    fontSize: "14px",
    fontWeight: 700,
    wordBreak: "break-word",
  },
  queueMeta: {
    color: COLORS.muted,
    fontSize: "12px",
    marginTop: "4px",
  },
  countPill: {
    minWidth: "30px",
    height: "30px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FF",
    color: COLORS.primary,
    fontSize: "13px",
    fontWeight: 800,
    flexShrink: 0,
  },
  reminderCell: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default MailAutomationPage;
