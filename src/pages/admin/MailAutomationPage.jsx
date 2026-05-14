import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import {
  getEmailLogs,
  getEmailLogsPage,
  getMailConfig,
  getPendingEmails,
  getPendingEmailsPage,
  getReminderCandidates,
  getReminderCandidatesPage,
  getRespondents,
  getRespondentsPage,
  importRespondents,
  previewRespondentImport,
  queueInvitations,
  queueReminderEmails,
  queueWeeklyReport,
  retryFailedEmail,
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

function matchesRespondentStatus(respondent, status) {
  if (status === "ALL") return true;
  if (status === "SUBMITTED") {
    return Boolean(respondent.submittedAt || respondent.status === "SUBMITTED");
  }
  if (status === "OPENED_NOT_SUBMITTED") {
    return Boolean(
      !respondent.submittedAt &&
        (respondent.openedAt || respondent.status === "OPENED_NOT_SUBMITTED")
    );
  }
  if (status === "NOT_OPENED") {
    return Boolean(
      !respondent.openedAt &&
        !respondent.submittedAt &&
        (!respondent.status || respondent.status === "NOT_OPENED")
    );
  }
  return true;
}

function matchesEmailLogFilters(log, status, emailType) {
  const matchesStatus = !status || log.status === status;
  const matchesType = !emailType || log.emailType === emailType;
  return matchesStatus && matchesType;
}

function parseEmails(value) {
  const seen = new Set();

  return parseEmailEntries(value)
    .filter((email) => {
      const normalized = email.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
}

function parseEmailEntries(value) {
  return value
    .split(/[\s,;]+/)
    .map((email) => email.trim())
    .filter(Boolean);
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

const RESPONDENT_STATUS_OPTIONS = [
  { value: "ALL", label: "Tum durumlar" },
  { value: "NOT_OPENED", label: "Acilmayanlar" },
  { value: "OPENED_NOT_SUBMITTED", label: "Acan ama tamamlamayan" },
  { value: "SUBMITTED", label: "Tamamlayanlar" },
];

const EMAIL_TYPE_OPTIONS = [
  { value: "", label: "Tum mail turleri" },
  { value: "INVITATION", label: "Davet" },
  { value: "REMINDER", label: "Hatirlatma" },
  { value: "WEEKLY_REPORT", label: "Haftalik Rapor" },
];

const EMAIL_STATUS_OPTIONS = [
  { value: "", label: "Tum durumlar" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "SENT", label: "Gonderildi" },
  { value: "FAILED", label: "Basarisiz" },
];

function getPaginationItems(currentPage, totalPages) {
  const pageCount = Math.max(totalPages, 1);
  const current = Math.min(Math.max(currentPage, 0), pageCount - 1);

  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index);
  }

  const start = Math.min(Math.max(current - 2, 0), pageCount - 5);
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function RespondentsTable({
  respondents,
  logs,
  loading,
  error,
  onRefresh,
  page,
  size,
  status,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
  onStatusChange,
}) {
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const pageSizeButtonRef = useRef(null);
  const displayTotalPages = totalPages || 1;
  const paginationItems = getPaginationItems(page, displayTotalPages);
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= displayTotalPages;
  const pageSizeOptions = [5, 10, 20];

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
          <span style={styles.countPill}>{totalElements}</span>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onRefresh}
            disabled={loading}
          >
            Yenile
          </button>
        </div>
      </div>

      <div style={styles.filterGrid}>
        <div
          style={styles.field}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsStatusMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Katilimci durumu</span>
          <div style={styles.statusMenuWrap}>
            <button
              type="button"
              style={styles.statusSelectButton}
              onClick={() => setIsStatusMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isStatusMenuOpen}
            >
              <span>
                {RESPONDENT_STATUS_OPTIONS.find(
                  (option) => option.value === status
                )?.label || "Tum durumlar"}
              </span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isStatusMenuOpen && (
              <div style={styles.statusMenu} role="listbox">
                {RESPONDENT_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.statusOption,
                      ...(option.value === status
                        ? styles.statusOptionActive
                        : null),
                    }}
                    role="option"
                    aria-selected={option.value === status}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsStatusMenuOpen(false);
                      onStatusChange(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <InlineMessage type="error">{error}</InlineMessage>

      {loading && respondents.length === 0 ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : respondents.length === 0 ? (
        <div style={styles.emptyState}>Katilimci bulunamadi.</div>
      ) : (
        <div
          style={{
            ...styles.tableWrap,
            ...(loading ? styles.tableWrapLoading : null),
          }}
        >
          <table style={styles.table}>
            <colgroup>
              <col style={styles.respondentEmailColumn} />
              <col style={styles.respondentStatusColumn} />
              <col style={styles.respondentInviteColumn} />
              <col style={styles.respondentDateColumn} />
              <col style={styles.respondentDateColumn} />
              <col style={styles.respondentReminderColumn} />
            </colgroup>
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

      <div style={styles.paginationFooter}>
        <span style={styles.paginationTotal}>Toplam: {totalElements}</span>

        <div style={styles.paginationControls}>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(0, event.currentTarget)}
            aria-label="Ilk sayfa"
            title="Ilk sayfa"
          >
            &lt;&lt;
          </button>

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(page - 1, event.currentTarget)}
            aria-label="Onceki sayfa"
            title="Onceki sayfa"
          >
            &lt;
          </button>

          {paginationItems.map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.paginationButton,
                ...(item === page ? styles.paginationButtonActive : null),
                ...(loading ? styles.paginationButtonDisabled : null),
                }}
                disabled={loading}
                onClick={(event) => onPageChange(item, event.currentTarget)}
                aria-current={item === page ? "page" : undefined}
              >
                {item + 1}
            </button>
          ))}

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) => onPageChange(page + 1, event.currentTarget)}
            aria-label="Sonraki sayfa"
            title="Sonraki sayfa"
          >
            &gt;
          </button>

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) =>
              onPageChange(displayTotalPages - 1, event.currentTarget)
            }
            aria-label="Son sayfa"
            title="Son sayfa"
          >
            &gt;&gt;
          </button>
        </div>

        <div
          style={styles.pageSizeField}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsSizeMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Sayfada goster</span>
          <div style={styles.pageSizeMenuWrap}>
            <button
              ref={pageSizeButtonRef}
              type="button"
              style={styles.pageSizeSelectButton}
              onClick={() => setIsSizeMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isSizeMenuOpen}
            >
              <span>{size}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isSizeMenuOpen && (
              <div style={styles.pageSizeMenu} role="listbox">
                {pageSizeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    style={{
                      ...styles.pageSizeOption,
                      ...(option === size ? styles.pageSizeOptionActive : null),
                    }}
                    role="option"
                    aria-selected={option === size}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsSizeMenuOpen(false);
                      onSizeChange(option, pageSizeButtonRef.current);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RespondentInvitationPanel({ surveyId, onChanged }) {
  const [emailText, setEmailText] = useState("");
  const [preview, setPreview] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emails = useMemo(() => parseEmails(emailText), [emailText]);
  const emailEntries = useMemo(() => parseEmailEntries(emailText), [emailText]);
  const previewImportableEmails = preview?.importableEmails || [];
  const previewInvalidEmails = preview?.invalidEmails || [];
  const previewDuplicateEmails = preview?.duplicateEmails || [];
  const previewExistingEmails = preview?.existingEmails || [];

  const handleEmailTextChange = (event) => {
    setEmailText(event.target.value);
    setPreview(null);
    setSelectedEmails([]);
    setMessage("");
    setError("");
  };

  const handlePreview = async () => {
    if (previewing || emailEntries.length === 0) return;

    try {
      setPreviewing(true);
      setMessage("");
      setError("");
      const data = await previewRespondentImport(surveyId, emailEntries);
      const importableEmails = data?.importableEmails || [];
      setPreview(data);
      setSelectedEmails(importableEmails);
      setMessage("Onizleme tamamlandi.");
    } catch (err) {
      setPreview(null);
      setSelectedEmails([]);
      setError(getApiErrorMessage(err, "Onizleme alinamadi."));
    } finally {
      setPreviewing(false);
    }
  };

  const removeSelectedEmail = (email) => {
    setSelectedEmails((current) => current.filter((item) => item !== email));
  };

  const handleImport = async () => {
    if (importing || selectedEmails.length === 0) return;

    try {
      setImporting(true);
      setMessage("");
      setError("");
      const response = await importRespondents(surveyId, selectedEmails);
      const importedCount =
        response?.importedCount ?? response?.createdCount ?? selectedEmails.length;
      setMessage(`${importedCount} katilimci ice aktarildi.`);
      setEmailText("");
      setPreview(null);
      setSelectedEmails([]);
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

      <div style={styles.importLayout}>
        <label style={styles.importField}>
          <span style={styles.label}>E-posta listesi</span>
          <textarea
            style={styles.importTextarea}
            value={emailText}
            onChange={handleEmailTextChange}
            placeholder="ornek1@sirket.com&#10;ornek2@sirket.com"
          />
        </label>
      </div>

      {preview && (
        <div style={styles.previewPanel}>
          <div style={styles.previewSummaryGrid}>
            <div style={styles.previewSummaryItem}>
              <strong style={styles.previewSummaryValue}>
                {preview.importableCount ?? previewImportableEmails.length}
              </strong>
              <span style={styles.previewSummaryLabel}>kisi eklenebilir</span>
            </div>
            <div style={styles.previewSummaryItem}>
              <strong style={styles.previewSummaryValue}>
                {preview.existingCount ?? previewExistingEmails.length}
              </strong>
              <span style={styles.previewSummaryLabel}>kisi zaten listede</span>
            </div>
            <div style={styles.previewSummaryItem}>
              <strong style={styles.previewSummaryValue}>
                {preview.duplicateCount ?? previewDuplicateEmails.length}
              </strong>
              <span style={styles.previewSummaryLabel}>tekrar eden e-posta</span>
            </div>
            <div style={styles.previewSummaryItem}>
              <strong style={styles.previewSummaryValue}>
                {preview.invalidCount ?? previewInvalidEmails.length}
              </strong>
              <span style={styles.previewSummaryLabel}>hatali e-posta</span>
            </div>
          </div>

          <div style={styles.previewSections}>
            <PreviewEmailSection
              title="Eklenecek kisiler"
              emails={selectedEmails}
              emptyText="Eklenecek kisi yok."
              removable
              onRemove={removeSelectedEmail}
            />
            <PreviewEmailSection
              title="Zaten ekli olanlar"
              emails={previewExistingEmails}
              emptyText="Zaten ekli e-posta yok."
            />
            <PreviewEmailSection
              title="Tekrar edenler"
              emails={previewDuplicateEmails}
              emptyText="Tekrar eden e-posta yok."
            />
            <PreviewEmailSection
              title="Hatali e-postalar"
              emails={previewInvalidEmails}
              emptyText="Hatali e-posta yok."
            />
          </div>
        </div>
      )}

      <div style={styles.importActionsRow}>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={preview ? handleImport : handlePreview}
          disabled={
            preview
              ? importing || selectedEmails.length === 0
              : previewing || emailEntries.length === 0
          }
        >
          {preview
            ? importing
              ? "Ekleniyor..."
              : `Secili ${selectedEmails.length} Katilimciyi Ekle`
            : previewing
              ? "Onizleniyor..."
              : "Onizle"}
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

function PreviewEmailSection({
  title,
  emails,
  emptyText,
  removable = false,
  onRemove,
}) {
  return (
    <div style={styles.previewSection}>
      <div style={styles.previewSectionTitle}>{title}</div>
      {emails.length === 0 ? (
        <div style={styles.previewEmpty}>{emptyText}</div>
      ) : (
        <div style={styles.previewEmailList}>
          {emails.map((email) => (
            <div key={email} style={styles.previewEmailRow}>
              <span style={styles.previewEmailText}>{email}</span>
              {removable && (
                <button
                  type="button"
                  style={styles.previewRemoveButton}
                  onClick={() => onRemove?.(email)}
                  aria-label={`${email} kaldir`}
                  title="Kaldir"
                >
                  x
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
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

function EmailLogsTable({
  logs,
  loading,
  error,
  onRefresh,
  page,
  size,
  status,
  emailType,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
  onStatusChange,
  onEmailTypeChange,
  onRetried,
}) {
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [retryMessage, setRetryMessage] = useState("");
  const [retryError, setRetryError] = useState("");
  const pageSizeButtonRef = useRef(null);
  const displayTotalPages = totalPages || 1;
  const paginationItems = getPaginationItems(page, displayTotalPages);
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= displayTotalPages;
  const pageSizeOptions = [5, 10, 20];
  const selectedStatusLabel =
    EMAIL_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
    "Tum durumlar";
  const selectedTypeLabel =
    EMAIL_TYPE_OPTIONS.find((option) => option.value === emailType)?.label ||
    "Tum mail turleri";

  const handleRetryEmail = async (emailLogId) => {
    if (!emailLogId || retryingId) return;

    try {
      setRetryingId(emailLogId);
      setRetryMessage("");
      setRetryError("");
      await retryFailedEmail(emailLogId);
      setRetryMessage("Mail tekrar kuyruğa alındı.");
      onRetried?.();
    } catch (err) {
      setRetryError(
        getApiErrorMessage(err, "Mail tekrar kuyruğa alınamadı.")
      );
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Email Loglari</h2>
          <p style={styles.cardSubtitle}>Bu ankete ait mail gecmisi</p>
        </div>
        <div style={styles.headerButtons}>
          <span style={styles.countPill}>{totalElements}</span>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={onRefresh}
            disabled={loading}
          >
            Yenile
          </button>
        </div>
      </div>

      <InlineMessage type="error">{error}</InlineMessage>
      <InlineMessage type="success">{retryMessage}</InlineMessage>
      <InlineMessage type="error">{retryError}</InlineMessage>

      <div style={styles.filterGrid}>
        <div
          style={styles.field}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsTypeMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Mail turu</span>
          <div style={styles.statusMenuWrap}>
            <button
              type="button"
              style={styles.statusSelectButton}
              onClick={() => setIsTypeMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isTypeMenuOpen}
            >
              <span>{selectedTypeLabel}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isTypeMenuOpen && (
              <div style={styles.statusMenu} role="listbox">
                {EMAIL_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.statusOption,
                      ...(option.value === emailType
                        ? styles.statusOptionActive
                        : null),
                    }}
                    role="option"
                    aria-selected={option.value === emailType}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsTypeMenuOpen(false);
                      onEmailTypeChange(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={styles.field}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsStatusMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Durum</span>
          <div style={styles.statusMenuWrap}>
            <button
              type="button"
              style={styles.statusSelectButton}
              onClick={() => setIsStatusMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isStatusMenuOpen}
            >
              <span>{selectedStatusLabel}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isStatusMenuOpen && (
              <div style={styles.statusMenu} role="listbox">
                {EMAIL_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    style={{
                      ...styles.statusOption,
                      ...(option.value === status
                        ? styles.statusOptionActive
                        : null),
                    }}
                    role="option"
                    aria-selected={option.value === status}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsStatusMenuOpen(false);
                      onStatusChange(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : logs.length === 0 ? (
        <div style={styles.emptyState}>Email logu bulunamadi.</div>
      ) : (
        <div
          style={{
            ...styles.tableWrap,
            ...(loading ? styles.tableWrapLoading : null),
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Alici</th>
                <th style={styles.th}>Tip</th>
                <th style={styles.th}>Durum</th>
                <th style={styles.th}>Konu</th>
                <th style={styles.th}>Olusturma</th>
                <th style={styles.th}>Guncelleme</th>
                <th style={styles.th}>Hata</th>
                <th style={styles.th}>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={log.id || `${log.toEmail}-${index}`} style={styles.tr}>
                  <td style={styles.td}>{log.toEmail || "-"}</td>
                  <td style={styles.td}>{log.emailType || "-"}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(log.status)}>
                      {log.status || "-"}
                    </span>
                  </td>
                  <td style={styles.td}>{log.subject || "-"}</td>
                  <td style={styles.td}>{formatDateTime(log.createdAt)}</td>
                  <td style={styles.td}>{formatDateTime(log.updatedAt)}</td>
                  <td style={styles.td}>
                    {log.errorMessage ? (
                      <div style={styles.errorDetail}>{log.errorMessage}</div>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td style={styles.td}>
                    {log.status === "FAILED" ? (
                      <button
                        type="button"
                        style={styles.retryButton}
                        disabled={retryingId === log.id}
                        onClick={() => handleRetryEmail(log.id)}
                      >
                        {retryingId === log.id
                          ? "Aliniyor..."
                          : "Tekrar Kuyruga Al"}
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.paginationFooter}>
        <span style={styles.paginationTotal}>Toplam: {totalElements}</span>

        <div style={styles.paginationControls}>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(0, event.currentTarget)}
            aria-label="Ilk sayfa"
            title="Ilk sayfa"
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(page - 1, event.currentTarget)}
            aria-label="Onceki sayfa"
            title="Onceki sayfa"
          >
            &lt;
          </button>

          {paginationItems.map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.paginationButton,
                ...(item === page ? styles.paginationButtonActive : null),
                ...(loading ? styles.paginationButtonDisabled : null),
              }}
              disabled={loading}
              onClick={(event) => onPageChange(item, event.currentTarget)}
              aria-current={item === page ? "page" : undefined}
            >
              {item + 1}
            </button>
          ))}

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) => onPageChange(page + 1, event.currentTarget)}
            aria-label="Sonraki sayfa"
            title="Sonraki sayfa"
          >
            &gt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) =>
              onPageChange(displayTotalPages - 1, event.currentTarget)
            }
            aria-label="Son sayfa"
            title="Son sayfa"
          >
            &gt;&gt;
          </button>
        </div>

        <div
          style={styles.pageSizeField}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsSizeMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Sayfada goster</span>
          <div style={styles.pageSizeMenuWrap}>
            <button
              ref={pageSizeButtonRef}
              type="button"
              style={styles.pageSizeSelectButton}
              onClick={() => setIsSizeMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isSizeMenuOpen}
            >
              <span>{size}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isSizeMenuOpen && (
              <div style={styles.pageSizeMenu} role="listbox">
                {pageSizeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    style={{
                      ...styles.pageSizeOption,
                      ...(option === size ? styles.pageSizeOptionActive : null),
                    }}
                    role="option"
                    aria-selected={option === size}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsSizeMenuOpen(false);
                      onSizeChange(option, pageSizeButtonRef.current);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PendingEmailsPanel({
  pendingEmails,
  loading,
  error,
  onRefresh,
  onSent,
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
}) {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [sendError, setSendError] = useState("");
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const pageSizeButtonRef = useRef(null);
  const displayTotalPages = totalPages || 1;
  const paginationItems = getPaginationItems(page, displayTotalPages);
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= displayTotalPages;
  const pageSizeOptions = [5, 10, 20];

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
          <span style={styles.countPill}>{totalElements}</span>
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
        <div
          style={{
            ...styles.tableWrap,
            ...(loading ? styles.tableWrapLoading : null),
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Survey ID</th>
                <th style={styles.th}>Alici</th>
                <th style={styles.th}>Tip</th>
                <th style={styles.th}>Konu</th>
                <th style={styles.th}>Olusturma</th>
              </tr>
            </thead>
            <tbody>
              {pendingEmails.map((email, index) => (
                <tr key={email.id || `${email.toEmail}-${index}`} style={styles.tr}>
                  <td style={styles.td}>{email.surveyId || "-"}</td>
                  <td style={styles.td}>{email.toEmail || "-"}</td>
                  <td style={styles.td}>{email.emailType || "-"}</td>
                  <td style={styles.td}>{email.subject || "-"}</td>
                  <td style={styles.td}>{formatDateTime(email.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.paginationFooter}>
        <span style={styles.paginationTotal}>
          Toplam bekleyen: {totalElements}
        </span>

        <div style={styles.paginationControls}>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(0, event.currentTarget)}
            aria-label="Ilk sayfa"
            title="Ilk sayfa"
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(page - 1, event.currentTarget)}
            aria-label="Onceki sayfa"
            title="Onceki sayfa"
          >
            &lt;
          </button>

          {paginationItems.map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.paginationButton,
                ...(item === page ? styles.paginationButtonActive : null),
                ...(loading ? styles.paginationButtonDisabled : null),
              }}
              disabled={loading}
              onClick={(event) => onPageChange(item, event.currentTarget)}
              aria-current={item === page ? "page" : undefined}
            >
              {item + 1}
            </button>
          ))}

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) => onPageChange(page + 1, event.currentTarget)}
            aria-label="Sonraki sayfa"
            title="Sonraki sayfa"
          >
            &gt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) =>
              onPageChange(displayTotalPages - 1, event.currentTarget)
            }
            aria-label="Son sayfa"
            title="Son sayfa"
          >
            &gt;&gt;
          </button>
        </div>

        <div
          style={styles.pageSizeField}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsSizeMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Sayfada goster</span>
          <div style={styles.pageSizeMenuWrap}>
            <button
              ref={pageSizeButtonRef}
              type="button"
              style={styles.pageSizeSelectButton}
              onClick={() => setIsSizeMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isSizeMenuOpen}
            >
              <span>{size}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isSizeMenuOpen && (
              <div style={styles.pageSizeMenu} role="listbox">
                {pageSizeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    style={{
                      ...styles.pageSizeOption,
                      ...(option === size ? styles.pageSizeOptionActive : null),
                    }}
                    role="option"
                    aria-selected={option === size}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsSizeMenuOpen(false);
                      onSizeChange(option, pageSizeButtonRef.current);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReminderPanel({
  surveyId,
  candidates,
  loading,
  error,
  onRefresh,
  onQueued,
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  onSizeChange,
}) {
  const [queueing, setQueueing] = useState(false);
  const [message, setMessage] = useState("");
  const [queueError, setQueueError] = useState("");
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);
  const pageSizeButtonRef = useRef(null);
  const displayTotalPages = totalPages || 1;
  const paginationItems = getPaginationItems(page, displayTotalPages);
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= displayTotalPages;
  const pageSizeOptions = [5, 10, 20];

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
          <span style={styles.countPill}>{totalElements}</span>
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

      {loading && candidates.length === 0 ? (
        <div style={styles.mutedText}>Yukleniyor...</div>
      ) : candidates.length === 0 ? (
        <div style={styles.emptyState}>Reminder adayi yok.</div>
      ) : (
        <div
          style={{
            ...styles.tableWrap,
            ...(loading ? styles.tableWrapLoading : null),
          }}
        >
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>E-posta</th>
                <th style={styles.th}>Durum</th>
                <th style={styles.th}>Acilma</th>
                <th style={styles.th}>Tamamlama</th>
                <th style={styles.th}>Reminder</th>
                <th style={styles.th}>Son Reminder</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr
                  key={candidate.id || candidate.respondentId || index}
                  style={styles.tr}
                >
                  <td style={styles.td}>
                    {candidate.email ||
                      candidate.toEmail ||
                      candidate.respondentEmail ||
                      "-"}
                  </td>
                  <td style={styles.td}>{candidate.status || "-"}</td>
                  <td style={styles.td}>{formatDateTime(candidate.openedAt)}</td>
                  <td style={styles.td}>{formatDateTime(candidate.submittedAt)}</td>
                  <td style={styles.td}>
                    <span style={styles.countPill}>
                      {candidate.reminderCount ??
                        candidate.sentReminderCount ??
                        0}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {formatDateTime(
                      candidate.lastRemindedAt || candidate.lastReminderAt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={styles.paginationFooter}>
        <span style={styles.paginationTotal}>Toplam aday: {totalElements}</span>

        <div style={styles.paginationControls}>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(0, event.currentTarget)}
            aria-label="Ilk sayfa"
            title="Ilk sayfa"
          >
            &lt;&lt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isFirstPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isFirstPage || loading}
            onClick={(event) => onPageChange(page - 1, event.currentTarget)}
            aria-label="Onceki sayfa"
            title="Onceki sayfa"
          >
            &lt;
          </button>

          {paginationItems.map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...styles.paginationButton,
                ...(item === page ? styles.paginationButtonActive : null),
                ...(loading ? styles.paginationButtonDisabled : null),
              }}
              disabled={loading}
              onClick={(event) => onPageChange(item, event.currentTarget)}
              aria-current={item === page ? "page" : undefined}
            >
              {item + 1}
            </button>
          ))}

          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) => onPageChange(page + 1, event.currentTarget)}
            aria-label="Sonraki sayfa"
            title="Sonraki sayfa"
          >
            &gt;
          </button>
          <button
            type="button"
            style={{
              ...styles.paginationButton,
              ...(isLastPage || loading ? styles.paginationButtonDisabled : null),
            }}
            disabled={isLastPage || loading}
            onClick={(event) =>
              onPageChange(displayTotalPages - 1, event.currentTarget)
            }
            aria-label="Son sayfa"
            title="Son sayfa"
          >
            &gt;&gt;
          </button>
        </div>

        <div
          style={styles.pageSizeField}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsSizeMenuOpen(false);
            }
          }}
        >
          <span style={styles.label}>Sayfada goster</span>
          <div style={styles.pageSizeMenuWrap}>
            <button
              ref={pageSizeButtonRef}
              type="button"
              style={styles.pageSizeSelectButton}
              onClick={() => setIsSizeMenuOpen((isOpen) => !isOpen)}
              disabled={loading}
              aria-haspopup="listbox"
              aria-expanded={isSizeMenuOpen}
            >
              <span>{size}</span>
              <span style={styles.pageSizeChevron} aria-hidden="true" />
            </button>

            {isSizeMenuOpen && (
              <div style={styles.pageSizeMenu} role="listbox">
                {pageSizeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    style={{
                      ...styles.pageSizeOption,
                      ...(option === size ? styles.pageSizeOptionActive : null),
                    }}
                    role="option"
                    aria-selected={option === size}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIsSizeMenuOpen(false);
                      onSizeChange(option, pageSizeButtonRef.current);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
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
      setMessage("Haftalik anket raporu kuyruga alindi.");
      onQueued?.();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Haftalik anket raporu kuyruga alinamadi.")
      );
    } finally {
      setQueueing(false);
    }
  };

  return (
    <section style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <h2 style={styles.cardTitle}>Haftalik Anket Raporu</h2>
          <p style={styles.cardSubtitle}>
            Bu ankete ait son 7 gunluk rapor mailini kuyruga alir.
          </p>
        </div>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={handleQueue}
          disabled={queueing}
        >
          {queueing
            ? "Kuyruga aliniyor..."
            : "Haftalik Anket Raporunu Kuyruga Al"}
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
  const preservedScrollYRef = useRef(null);
  const preservedAnchorRef = useRef(null);
  const [survey, setSurvey] = useState(null);
  const [logs, setLogs] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [pendingEmails, setPendingEmails] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [respondents, setRespondents] = useState([]);
  const [respondentPage, setRespondentPage] = useState(0);
  const [respondentSize, setRespondentSize] = useState(5);
  const [respondentStatus, setRespondentStatus] = useState("ALL");
  const [respondentTotalPages, setRespondentTotalPages] = useState(0);
  const [respondentTotalElements, setRespondentTotalElements] = useState(0);
  const [candidatePage, setCandidatePage] = useState(0);
  const [candidateSize, setCandidateSize] = useState(5);
  const [candidateTotalPages, setCandidateTotalPages] = useState(0);
  const [candidateTotalElements, setCandidateTotalElements] = useState(0);
  const [emailLogPage, setEmailLogPage] = useState(0);
  const [emailLogSize, setEmailLogSize] = useState(5);
  const [emailLogStatus, setEmailLogStatus] = useState("");
  const [emailLogType, setEmailLogType] = useState("");
  const [emailLogTotalPages, setEmailLogTotalPages] = useState(0);
  const [emailLogTotalElements, setEmailLogTotalElements] = useState(0);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingSize, setPendingSize] = useState(5);
  const [pendingTotalPages, setPendingTotalPages] = useState(0);
  const [pendingTotalElements, setPendingTotalElements] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [emailLogsLoading, setEmailLogsLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [respondentsLoading, setRespondentsLoading] = useState(false);
  const [pageError, setPageError] = useState("");
  const [emailLogsError, setEmailLogsError] = useState("");
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
      setLogs(normalizeList(await getEmailLogs(surveyId)));
    } catch (err) {
      setLogs([]);
      console.error(err);
    }
  }, [surveyId]);

  const fetchEmailLogs = useCallback(async () => {
    try {
      setEmailLogsLoading(true);
      setEmailLogsError("");
      const data = await getEmailLogsPage(surveyId, {
        page: emailLogPage,
        size: emailLogSize,
        status: emailLogStatus,
        emailType: emailLogType,
      });
      setEmailLogs(data.content || []);
      setEmailLogTotalPages(data.totalPages || 0);
      setEmailLogTotalElements(data.totalElements || 0);
    } catch {
      try {
        const fallbackLogs = normalizeList(await getEmailLogs(surveyId));
        const filteredLogs = fallbackLogs.filter((log) =>
          matchesEmailLogFilters(log, emailLogStatus, emailLogType)
        );
        const startIndex = emailLogPage * emailLogSize;

        setEmailLogs(filteredLogs.slice(startIndex, startIndex + emailLogSize));
        setEmailLogTotalPages(Math.ceil(filteredLogs.length / emailLogSize));
        setEmailLogTotalElements(filteredLogs.length);
        setEmailLogsError("");
      } catch (fallbackErr) {
        setEmailLogs([]);
        setEmailLogTotalPages(0);
        setEmailLogTotalElements(0);
        setEmailLogsError(
          getApiErrorMessage(fallbackErr, "Email loglari alinamadi.")
        );
      }
    } finally {
      setEmailLogsLoading(false);
    }
  }, [
    emailLogPage,
    emailLogSize,
    emailLogStatus,
    emailLogType,
    surveyId,
  ]);

  const fetchPending = useCallback(async () => {
    try {
      setPendingLoading(true);
      setPendingError("");
      const data = await getPendingEmailsPage({
        page: pendingPage,
        size: pendingSize,
      });
      setPendingEmails(data.content || []);
      setPendingTotalPages(data.totalPages || 0);
      setPendingTotalElements(data.totalElements || 0);
    } catch {
      try {
        const fallbackPending = normalizeList(await getPendingEmails());
        const startIndex = pendingPage * pendingSize;
        setPendingEmails(
          fallbackPending.slice(startIndex, startIndex + pendingSize)
        );
        setPendingTotalPages(Math.ceil(fallbackPending.length / pendingSize));
        setPendingTotalElements(fallbackPending.length);
        setPendingError("");
      } catch (fallbackErr) {
        setPendingEmails([]);
        setPendingTotalPages(0);
        setPendingTotalElements(0);
        setPendingError(getApiErrorMessage(fallbackErr, "Pending queue alinamadi."));
      }
    } finally {
      setPendingLoading(false);
    }
  }, [pendingPage, pendingSize]);

  const fetchCandidates = useCallback(async () => {
    try {
      setCandidatesLoading(true);
      setCandidatesError("");
      const data = await getReminderCandidatesPage(surveyId, {
        page: candidatePage,
        size: candidateSize,
      });
      setCandidates(data.content || []);
      setCandidateTotalPages(data.totalPages || 0);
      setCandidateTotalElements(data.totalElements || 0);
    } catch {
      try {
        const fallbackCandidates = normalizeList(
          await getReminderCandidates(surveyId)
        );
        const startIndex = candidatePage * candidateSize;
        setCandidates(
          fallbackCandidates.slice(startIndex, startIndex + candidateSize)
        );
        setCandidateTotalPages(
          Math.ceil(fallbackCandidates.length / candidateSize)
        );
        setCandidateTotalElements(fallbackCandidates.length);
        setCandidatesError("");
      } catch (fallbackErr) {
        setCandidates([]);
        setCandidateTotalPages(0);
        setCandidateTotalElements(0);
        setCandidatesError(
          getApiErrorMessage(fallbackErr, "Reminder adaylari alinamadi.")
        );
      }
    } finally {
      setCandidatesLoading(false);
    }
  }, [candidatePage, candidateSize, surveyId]);

  const fetchRespondents = useCallback(async () => {
    try {
      setRespondentsLoading(true);
      setRespondentsError("");
      const data = await getRespondentsPage(surveyId, {
        page: respondentPage,
        size: respondentSize,
        status: respondentStatus,
      });
      setRespondents(data.content || []);
      setRespondentTotalPages(data.totalPages || 0);
      setRespondentTotalElements(data.totalElements || 0);
    } catch {
      try {
        const fallbackRespondents = normalizeList(await getRespondents(surveyId));
        const filteredRespondents = fallbackRespondents.filter((respondent) =>
          matchesRespondentStatus(respondent, respondentStatus)
        );
        const startIndex = respondentPage * respondentSize;
        const pageRespondents = filteredRespondents.slice(
          startIndex,
          startIndex + respondentSize
        );

        setRespondents(pageRespondents);
        setRespondentTotalPages(
          Math.ceil(filteredRespondents.length / respondentSize)
        );
        setRespondentTotalElements(filteredRespondents.length);
        setRespondentsError("");
      } catch (fallbackErr) {
        setRespondents([]);
        setRespondentTotalPages(0);
        setRespondentTotalElements(0);
        setRespondentsError(
          getApiErrorMessage(fallbackErr, "Katilimcilar alinamadi.")
        );
      }
    } finally {
      setRespondentsLoading(false);
    }
  }, [respondentPage, respondentSize, respondentStatus, surveyId]);

  const refreshMailData = useCallback(() => {
    fetchLogs();
    fetchEmailLogs();
    fetchPending();
    fetchCandidates();
    fetchRespondents();
  }, [
    fetchCandidates,
    fetchEmailLogs,
    fetchLogs,
    fetchPending,
    fetchRespondents,
  ]);

  const refreshRespondentsAfterChange = useCallback(() => {
    fetchLogs();
    fetchEmailLogs();
    fetchPending();

    if (candidatePage === 0) {
      fetchCandidates();
    } else {
      setCandidatePage(0);
    }

    if (respondentPage === 0) {
      fetchRespondents();
    } else {
      setRespondentPage(0);
    }
  }, [
    fetchCandidates,
    fetchEmailLogs,
    fetchLogs,
    fetchPending,
    fetchRespondents,
    candidatePage,
    respondentPage,
  ]);

  const refreshAfterEmailRetry = useCallback(() => {
    fetchEmailLogs();
    fetchPending();
    fetchLogs();
  }, [fetchEmailLogs, fetchLogs, fetchPending]);

  const handleRespondentStatusChange = useCallback((nextStatus) => {
    setRespondentStatus(nextStatus);
    setRespondentPage(0);
  }, []);

  const preserveScrollPosition = useCallback((update, anchor) => {
    preservedScrollYRef.current = window.scrollY;
    preservedAnchorRef.current = anchor
      ? {
          element: anchor,
          top: anchor.getBoundingClientRect().top,
        }
      : null;
    update();
  }, []);

  const handleRespondentSizeChange = useCallback(
    (nextSize, anchor) => {
      preserveScrollPosition(() => {
        setRespondentSize(nextSize);
        setRespondentPage(0);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handleRespondentPageChange = useCallback(
    (nextPage, anchor) => {
      preserveScrollPosition(() => {
        setRespondentPage(nextPage);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handleCandidateSizeChange = useCallback(
    (nextSize, anchor) => {
      preserveScrollPosition(() => {
        setCandidateSize(nextSize);
        setCandidatePage(0);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handleCandidatePageChange = useCallback(
    (nextPage, anchor) => {
      preserveScrollPosition(() => {
        setCandidatePage(nextPage);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handleEmailLogStatusChange = useCallback((nextStatus) => {
    setEmailLogStatus(nextStatus);
    setEmailLogPage(0);
  }, []);

  const handleEmailLogTypeChange = useCallback((nextType) => {
    setEmailLogType(nextType);
    setEmailLogPage(0);
  }, []);

  const handleEmailLogSizeChange = useCallback(
    (nextSize, anchor) => {
      preserveScrollPosition(() => {
        setEmailLogSize(nextSize);
        setEmailLogPage(0);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handleEmailLogPageChange = useCallback(
    (nextPage, anchor) => {
      preserveScrollPosition(() => {
        setEmailLogPage(nextPage);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handlePendingSizeChange = useCallback(
    (nextSize, anchor) => {
      preserveScrollPosition(() => {
        setPendingSize(nextSize);
        setPendingPage(0);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  const handlePendingPageChange = useCallback(
    (nextPage, anchor) => {
      preserveScrollPosition(() => {
        setPendingPage(nextPage);
      }, anchor);
    },
    [preserveScrollPosition]
  );

  useLayoutEffect(() => {
    if (preservedScrollYRef.current == null && !preservedAnchorRef.current) {
      return;
    }

    const anchor = preservedAnchorRef.current;

    if (anchor?.element?.isConnected) {
      const nextTop = anchor.element.getBoundingClientRect().top;
      window.scrollBy({
        top: nextTop - anchor.top,
        behavior: "auto",
      });
    } else if (preservedScrollYRef.current != null) {
      window.scrollTo({
        top: preservedScrollYRef.current,
        behavior: "auto",
      });
    }

    if (
      !respondentsLoading &&
      !candidatesLoading &&
      !emailLogsLoading &&
      !pendingLoading
    ) {
      preservedScrollYRef.current = null;
      preservedAnchorRef.current = null;
    }
  }, [
    candidates,
    candidatesLoading,
    emailLogs,
    emailLogsLoading,
    pendingEmails,
    pendingLoading,
    respondents,
    respondentsLoading,
  ]);

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

    return () => {
      isCancelled = true;
    };
  }, [surveyId]);

  useEffect(() => {
    fetchLogs();
    fetchPending();
    fetchCandidates();
  }, [fetchCandidates, fetchLogs, fetchPending]);

  useEffect(() => {
    fetchRespondents();
  }, [fetchRespondents]);

  useEffect(() => {
    fetchEmailLogs();
  }, [fetchEmailLogs]);

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
              onChanged={refreshRespondentsAfterChange}
            />

            <RespondentsTable
              respondents={respondents}
              logs={logs}
              loading={respondentsLoading}
              error={respondentsError}
              onRefresh={fetchRespondents}
              page={respondentPage}
              size={respondentSize}
              status={respondentStatus}
              totalPages={respondentTotalPages}
              totalElements={respondentTotalElements}
              onPageChange={handleRespondentPageChange}
              onSizeChange={handleRespondentSizeChange}
              onStatusChange={handleRespondentStatusChange}
            />

            <ReminderPanel
              surveyId={surveyId}
              candidates={candidates}
              loading={candidatesLoading}
              error={candidatesError}
              onRefresh={fetchCandidates}
              onQueued={refreshRespondentsAfterChange}
              page={candidatePage}
              size={candidateSize}
              totalPages={candidateTotalPages}
              totalElements={candidateTotalElements}
              onPageChange={handleCandidatePageChange}
              onSizeChange={handleCandidateSizeChange}
            />

            <PendingEmailsPanel
              pendingEmails={pendingEmails}
              loading={pendingLoading}
              error={pendingError}
              onRefresh={fetchPending}
              onSent={refreshMailData}
              page={pendingPage}
              size={pendingSize}
              totalPages={pendingTotalPages}
              totalElements={pendingTotalElements}
              onPageChange={handlePendingPageChange}
              onSizeChange={handlePendingSizeChange}
            />

            <EmailLogsTable
              logs={emailLogs}
              loading={emailLogsLoading}
              error={emailLogsError}
              onRefresh={fetchEmailLogs}
              page={emailLogPage}
              size={emailLogSize}
              status={emailLogStatus}
              emailType={emailLogType}
              totalPages={emailLogTotalPages}
              totalElements={emailLogTotalElements}
              onPageChange={handleEmailLogPageChange}
              onSizeChange={handleEmailLogSizeChange}
              onStatusChange={handleEmailLogStatusChange}
              onEmailTypeChange={handleEmailLogTypeChange}
              onRetried={refreshAfterEmailRetry}
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
    maxWidth: "1280px",
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
  statusMenuWrap: {
    position: "relative",
  },
  statusSelectButton: {
    width: "100%",
    minHeight: "48px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "0 16px",
    backgroundColor: COLORS.white,
    color: COLORS.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  },
  statusMenu: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    padding: "6px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    backgroundColor: COLORS.white,
    boxShadow: "0 12px 28px rgba(16, 24, 40, 0.16)",
    zIndex: 6,
  },
  statusOption: {
    width: "100%",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "transparent",
    color: COLORS.text,
    padding: "11px 12px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },
  statusOptionActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  importLayout: {
    maxWidth: "820px",
  },
  importField: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  importActionsRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "16px",
    maxWidth: "820px",
    flexWrap: "wrap",
  },
  previewPanel: {
    marginTop: "18px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "14px",
    backgroundColor: "#FCFCFD",
  },
  previewSummaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "10px",
    marginBottom: "14px",
  },
  previewSummaryItem: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "10px 12px",
    backgroundColor: COLORS.white,
  },
  previewSummaryValue: {
    display: "block",
    color: COLORS.primary,
    fontSize: "20px",
    lineHeight: 1,
    fontWeight: 800,
  },
  previewSummaryLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 600,
    marginTop: "6px",
  },
  previewSections: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  previewSection: {
    minWidth: 0,
  },
  previewSectionTitle: {
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  previewEmpty: {
    color: COLORS.muted,
    fontSize: "12px",
    border: `1px dashed ${COLORS.border}`,
    borderRadius: "7px",
    padding: "10px",
    backgroundColor: COLORS.white,
  },
  previewEmailList: {
    display: "grid",
    gap: "6px",
    maxHeight: "170px",
    overflowY: "auto",
  },
  previewEmailRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    minHeight: "32px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "7px",
    padding: "6px 8px 6px 10px",
    backgroundColor: COLORS.white,
  },
  previewEmailText: {
    minWidth: 0,
    color: COLORS.text,
    fontSize: "12px",
    fontWeight: 600,
    wordBreak: "break-word",
  },
  previewRemoveButton: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "#FEF3F2",
    color: COLORS.danger,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    flexShrink: 0,
    fontFamily: FONT_FAMILY,
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
  importTextarea: {
    width: "100%",
    minHeight: "118px",
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
  tableWrapLoading: {
    opacity: 0.65,
    pointerEvents: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  respondentEmailColumn: {
    width: "21%",
  },
  respondentStatusColumn: {
    width: "10%",
  },
  respondentInviteColumn: {
    width: "12%",
  },
  respondentDateColumn: {
    width: "19%",
  },
  respondentReminderColumn: {
    width: "19%",
  },
  emailLogRecipientColumn: {
    width: "19%",
  },
  emailLogTypeColumn: {
    width: "10%",
  },
  emailLogStatusColumn: {
    width: "7%",
  },
  emailLogSubjectColumn: {
    width: "27%",
  },
  emailLogDateColumn: {
    width: "12%",
  },
  emailLogSmallColumn: {
    width: "6%",
  },
  emailLogActionColumn: {
    width: "7%",
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
  retryButton: {
    backgroundColor: "#E5F0FF",
    color: COLORS.primary,
    border: "none",
    borderRadius: "999px",
    minHeight: "32px",
    padding: "0 12px",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    whiteSpace: "nowrap",
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
  paginationFooter: {
    display: "grid",
    alignItems: "center",
    gridTemplateColumns: "1fr auto 1fr",
    gap: "14px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: `1px solid ${COLORS.border}`,
  },
  paginationControls: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  paginationButton: {
    width: "24px",
    height: "24px",
    borderRadius: "999px",
    border: "none",
    backgroundColor: "transparent",
    color: COLORS.muted,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    boxShadow: "none",
  },
  paginationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    color: COLORS.white,
    boxShadow: "0 6px 14px rgba(2, 62, 138, 0.24)",
  },
  paginationButtonDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  paginationTotal: {
    color: COLORS.text,
    fontSize: "13px",
    fontWeight: 800,
    justifySelf: "start",
  },
  pageSizeField: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    justifySelf: "end",
  },
  pageSizeMenuWrap: {
    position: "relative",
  },
  pageSizeSelectButton: {
    width: "76px",
    minHeight: "36px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "8px",
    padding: "6px 10px",
    backgroundColor: COLORS.white,
    color: COLORS.text,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
  },
  pageSizeChevron: {
    width: "7px",
    height: "7px",
    borderRight: `2px solid ${COLORS.muted}`,
    borderBottom: `2px solid ${COLORS.muted}`,
    transform: "rotate(45deg) translateY(-2px)",
    flexShrink: 0,
  },
  pageSizeMenu: {
    position: "absolute",
    right: 0,
    bottom: "calc(100% + 8px)",
    width: "76px",
    padding: "5px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    backgroundColor: COLORS.white,
    boxShadow: "0 12px 28px rgba(16, 24, 40, 0.16)",
    zIndex: 5,
  },
  pageSizeOption: {
    width: "100%",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "transparent",
    color: COLORS.text,
    padding: "8px 10px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
  },
  pageSizeOptionActive: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
};

export default MailAutomationPage;
