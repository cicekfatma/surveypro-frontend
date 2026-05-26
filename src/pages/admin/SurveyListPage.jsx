import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import Header from "../../components/common/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TabBar from "../../components/common/TabBar";
import {
  activateSurvey,
  archiveSurvey,
  getSurveys,
  getSurveysPage,
} from "../../services/surveyService";
import { styles } from "../../styles/surveyListStyles";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const ACTIVE_FILTER_OPTIONS = [
  { value: "", label: "Tüm Anketler" },
  { value: "true", label: "Aktif" },
  { value: "false", label: "Pasif" },
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

function SurveyListPage() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [isActive, setIsActive] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [statusConfirmSurvey, setStatusConfirmSurvey] = useState(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isSizeMenuOpen, setIsSizeMenuOpen] = useState(false);

  const displayTotalPages = totalPages || 1;
  const paginationItems = getPaginationItems(page, displayTotalPages);
  const isFirstPage = page === 0;
  const isLastPage = page + 1 >= displayTotalPages;
  const activeFilterLabel =
    ACTIVE_FILTER_OPTIONS.find((option) => option.value === isActive)?.label ||
    "Tüm Anketler";

  const loadSurveys = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSurveysPage({
        page,
        size,
        isActive,
        createdFrom,
        createdTo,
      });

      setSurveys(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch {
      try {
        const fallbackParams = {
          page: 0,
          size: 50,
        };

        if (isActive !== "") fallbackParams.isActive = isActive === "true";
        if (createdFrom) fallbackParams.createdFrom = createdFrom;
        if (createdTo) fallbackParams.createdTo = createdTo;

        const fallbackSurveys = await getSurveys(fallbackParams);
        const startIndex = page * size;
        setSurveys(fallbackSurveys.slice(startIndex, startIndex + size));
        setTotalPages(Math.ceil(fallbackSurveys.length / size));
        setTotalElements(fallbackSurveys.length);
      } catch (fallbackErr) {
        setSurveys([]);
        setTotalPages(0);
        setTotalElements(0);
        setError(getApiErrorMessage(fallbackErr, "Anketler yüklenemedi."));
      }
    } finally {
      setLoading(false);
    }
  }, [createdFrom, createdTo, isActive, page, size]);

  useEffect(() => {
    loadSurveys();
  }, [loadSurveys]);

  const handleActiveChange = (value) => {
    setIsActive(value);
    setPage(0);
  };

  const handleCreatedFromChange = (value) => {
    setCreatedFrom(value);
    setPage(0);
  };

  const handleCreatedToChange = (value) => {
    setCreatedTo(value);
    setPage(0);
  };

  const handleSizeChange = (value) => {
    setSize(value);
    setPage(0);
  };

  const handleResetFilters = () => {
    setIsActive("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(0);
  };

  const handleStatusToggle = (survey) => {
    setStatusConfirmSurvey(survey);
  };

  const handleCancelStatusToggle = () => {
    setStatusConfirmSurvey(null);
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusConfirmSurvey) {
      return;
    }

    const survey = statusConfirmSurvey;
    const nextIsActive = !survey.isActive;

    try {
      setStatusUpdatingId(survey.id);
      setError("");
      setStatusConfirmSurvey(null);
      if (nextIsActive) {
        await activateSurvey(survey.id);
      } else {
        await archiveSurvey(survey.id);
      }
      await loadSurveys();
    } catch (err) {
      setError(getApiErrorMessage(err, "Anket durumu güncellenemedi."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const statusConfirmTitle = statusConfirmSurvey?.isActive
    ? "Anket pasife alinsin mi?"
    : "Anket tekrar aktif hale getirilsin mi?";

  const statusConfirmText = statusConfirmSurvey?.isActive
    ? "Public linkten yeni cevap kabul edilmeyecek."
    : "Public link tekrar cevap kabul edebilir.";

  const renderContent = () => {
    if (loading && surveys.length === 0) {
      return (
        <div style={styles.tableLoading}>
          <LoadingSpinner />
        </div>
      );
    }

    if (surveys.length === 0) {
      return <div style={styles.emptyCard}>Anket bulunamadı.</div>;
    }

    return (
      <div
        style={{
          ...styles.tableWrap,
          ...(loading ? styles.tableWrapLoading : null),
        }}
      >
        <table style={styles.table}>
          <colgroup>
            <col style={styles.titleColumn} />
            <col style={styles.descriptionColumn} />
            <col style={styles.targetColumn} />
            <col style={styles.statusColumn} />
            <col style={styles.actionsColumn} />
          </colgroup>
          <thead>
            <tr>
              <th style={styles.th}>Başlık</th>
              <th style={styles.th}>Açıklama</th>
              <th style={styles.th}>Hedef</th>
              <th style={styles.th}>Durum</th>
              <th style={styles.th}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id} style={styles.tr}>
                <td style={styles.td}>{survey.title || "-"}</td>
                <td style={styles.td}>{survey.description || "-"}</td>
                <td style={styles.td}>{survey.targetCount ?? 0}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.statusPill,
                      ...(survey.isActive
                        ? styles.statusActive
                        : styles.statusPassive),
                    }}
                  >
                    {survey.isActive ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.tableActions}>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() => navigate(`/admin/surveys/${survey.id}`)}
                    >
                      Detay
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() =>
                        navigate(`/admin/surveys/${survey.id}/edit`)
                      }
                    >
                      Düzenle
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() =>
                        navigate(`/admin/surveys/${survey.id}/results`)
                      }
                    >
                      Sonuçlar
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() =>
                        navigate(`/admin/surveys/${survey.id}/dashboard`)
                      }
                    >
                      Panel
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() => navigate(`/admin/surveys/${survey.id}/mail`)}
                    >
                      Mail Otomasyonu
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                      }}
                      onClick={() => navigate(`/survey/${survey.publicKey}`)}
                    >
                      Public Test
                    </button>
                    <button
                      style={{
                        ...styles.smallActionButton,
                        ...styles.tableActionButton,
                        ...(survey.isActive
                          ? styles.archiveActionButton
                          : styles.activateActionButton),
                        ...(statusUpdatingId === survey.id
                          ? styles.actionButtonDisabled
                          : null),
                      }}
                      disabled={statusUpdatingId === survey.id}
                      onClick={() => handleStatusToggle(survey)}
                    >
                      {statusUpdatingId === survey.id
                        ? "Isleniyor"
                        : survey.isActive
                          ? "Pasife Al"
                          : "Aktif Et"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={{ ...styles.statusBox, color: "#b42318" }}>
            Hata: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.panel}>
        <Header onCreateSurvey={() => navigate("/admin/surveys/create")} />
        <TabBar />

        <div style={styles.contentArea}>
          <div style={styles.listWrapper}>
            <div style={styles.filterCard}>
              <div style={styles.filterGrid}>
                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Durum</label>
                  <div
                    style={styles.dropdownWrap}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsStatusMenuOpen(false);
                      }
                    }}
                  >
                    <button
                      type="button"
                      style={styles.dropdownButton}
                      onClick={() => setIsStatusMenuOpen((isOpen) => !isOpen)}
                      disabled={loading}
                      aria-haspopup="listbox"
                      aria-expanded={isStatusMenuOpen}
                    >
                      <span>{activeFilterLabel}</span>
                      <span style={styles.dropdownChevron} aria-hidden="true" />
                    </button>

                    {isStatusMenuOpen && (
                      <div style={styles.dropdownMenu} role="listbox">
                        {ACTIVE_FILTER_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            style={{
                              ...styles.dropdownOption,
                              ...(option.value === isActive
                                ? styles.dropdownOptionActive
                                : null),
                            }}
                            role="option"
                            aria-selected={option.value === isActive}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setIsStatusMenuOpen(false);
                              handleActiveChange(option.value);
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Oluşturma Başlangıç</label>
                  <input
                    style={styles.filterInput}
                    type="date"
                    value={createdFrom}
                    onChange={(event) =>
                      handleCreatedFromChange(event.target.value)
                    }
                    disabled={loading}
                  />
                </div>

                <div style={styles.filterField}>
                  <label style={styles.filterLabel}>Oluşturma Bitiş</label>
                  <input
                    style={styles.filterInput}
                    type="date"
                    value={createdTo}
                    onChange={(event) => handleCreatedToChange(event.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={styles.filterActions}>
                <button
                  style={styles.filterResetButton}
                  onClick={handleResetFilters}
                  disabled={loading}
                >
                  Temizle
                </button>
              </div>
            </div>

            <div style={styles.listCard}>
              <div style={styles.listCardHeader}>
                <div>
                  <h2 style={styles.listCardTitle}>Anketler</h2>
                </div>
                <span style={styles.countPill}>{totalElements}</span>
              </div>

              {renderContent()}

              <div style={styles.paginationFooter}>
                <span style={styles.paginationTotal}>
                  Toplam anket: {totalElements}
                </span>

                <div style={styles.paginationControls}>
                  <button
                    type="button"
                    style={{
                      ...styles.paginationButton,
                      ...(isFirstPage || loading
                        ? styles.paginationButtonDisabled
                        : null),
                    }}
                    disabled={isFirstPage || loading}
                    onClick={() => setPage(0)}
                    aria-label="Ilk sayfa"
                    title="Ilk sayfa"
                  >
                    &lt;&lt;
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.paginationButton,
                      ...(isFirstPage || loading
                        ? styles.paginationButtonDisabled
                        : null),
                    }}
                    disabled={isFirstPage || loading}
                    onClick={() => setPage((current) => current - 1)}
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
                      onClick={() => setPage(item)}
                      aria-current={item === page ? "page" : undefined}
                    >
                      {item + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    style={{
                      ...styles.paginationButton,
                      ...(isLastPage || loading
                        ? styles.paginationButtonDisabled
                        : null),
                    }}
                    disabled={isLastPage || loading}
                    onClick={() => setPage((current) => current + 1)}
                    aria-label="Sonraki sayfa"
                    title="Sonraki sayfa"
                  >
                    &gt;
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.paginationButton,
                      ...(isLastPage || loading
                        ? styles.paginationButtonDisabled
                        : null),
                    }}
                    disabled={isLastPage || loading}
                    onClick={() => setPage(displayTotalPages - 1)}
                    aria-label="Son sayfa"
                    title="Son sayfa"
                  >
                    &gt;&gt;
                  </button>
                </div>

                <label style={styles.pageSizeField}>
                  <span style={styles.filterLabel}>Sayfada göster</span>
                  <div
                    style={styles.pageSizeMenuWrap}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsSizeMenuOpen(false);
                      }
                    }}
                  >
                    <button
                      type="button"
                      style={styles.pageSizeSelectButton}
                      onClick={() => setIsSizeMenuOpen((isOpen) => !isOpen)}
                      disabled={loading}
                      aria-haspopup="listbox"
                      aria-expanded={isSizeMenuOpen}
                    >
                      <span>{size}</span>
                      <span style={styles.dropdownChevron} aria-hidden="true" />
                    </button>

                    {isSizeMenuOpen && (
                      <div style={styles.pageSizeMenu} role="listbox">
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            style={{
                              ...styles.pageSizeOption,
                              ...(option === size
                                ? styles.pageSizeOptionActive
                                : null),
                            }}
                            role="option"
                            aria-selected={option === size}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setIsSizeMenuOpen(false);
                              handleSizeChange(option);
                            }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {statusConfirmSurvey && (
        <div style={styles.modalOverlay} role="presentation">
          <div
            style={styles.confirmDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="survey-status-confirm-title"
          >
            <h2 id="survey-status-confirm-title" style={styles.confirmTitle}>
              {statusConfirmTitle}
            </h2>
            <p style={styles.confirmText}>{statusConfirmText}</p>
            <div style={styles.confirmActions}>
              <button
                type="button"
                style={styles.confirmPrimaryButton}
                onClick={handleConfirmStatusToggle}
              >
                Tamam
              </button>
              <button
                type="button"
                style={styles.confirmSecondaryButton}
                onClick={handleCancelStatusToggle}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SurveyListPage;

