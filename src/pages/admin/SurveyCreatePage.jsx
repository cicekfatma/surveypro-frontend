import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDisplayErrorMessages,
  getApiErrorMessage,
} from "../../api/errorMessage";
import {
  createSurvey,
  getSurveyDetail,
  updateSurvey,
} from "../../api/surveyApi";
import { clearAuthSession } from "../../auth/session";
import surveyProLogo from "../../assets/surveypro-logo.png";

const FONT_FAMILY = '"Poppins", sans-serif';

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  orangeDark: "#E16F0B",
  background: "#F3F3F4",
  white: "#FFFFFF",
  text: "#28283A",
  border: "#E4E4E7",
  muted: "#808392",
  shadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
};

const CREATE_SURVEY_REQUEST_KEY_STORAGE = "surveyCreateRequestKey";
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const IMAGE_URL_REGEX = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
const VIDEO_URL_REGEX = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
const ALLOWED_FONTS = [
  "Poppins",
  "Arial",
  "Roboto",
  "Inter",
  "Open Sans",
  "system-ui",
  "sans-serif",
];
const BILSOFT_THEME_TOKENS = [
  {
    name: "Primary",
    colors: ["#003B95", "#0062E0"],
    backgrounds: ["#FFFFFF", "#E5F0FF", "#B0D2FE", "#7CB4FD"],
  },
  {
    name: "Orange",
    colors: ["#F48220"],
    backgrounds: ["#FFFFFF", "#FFF4D8", "#FFEFC7", "#FEE2AB"],
  },
  {
    name: "Teal",
    colors: ["#007D8C", "#01A3AE"],
    backgrounds: ["#FFFFFF", "#CBF1F3", "#9DE2E5", "#6DD4D8"],
  },
  {
    name: "Purple",
    colors: ["#5A11B0", "#9346ED"],
    backgrounds: ["#FFFFFF", "#EEE0FF", "#DABAFF", "#CFADF7"],
  },
  {
    name: "Red",
    colors: ["#B91228"],
    backgrounds: ["#FFFFFF", "#F8D9DF", "#F1B2C0", "#EB8CA0"],
  },
  {
    name: "Yellow",
    colors: [],
    backgrounds: ["#FFFFFF", "#FFEFC7", "#FFD583", "#FFCB7C"],
  },
  {
    name: "Green",
    colors: ["#178541", "#1EA853"],
    backgrounds: ["#FFFFFF", "#ECFCF2", "#B3F2CB", "#7BE8A5"],
  },
  {
    name: "Neutral",
    colors: ["#28283A", "#616371"],
    backgrounds: ["#FFFFFF", "#F3F3F4", "#E4E4E7", "#A6AAB4"],
  },
];
const COLOR_PRESETS = BILSOFT_THEME_TOKENS.flatMap((token) => token.colors);
const ORDERED_COLOR_PRESETS = [
  "#003B95",
  "#0062E0",
  "#007D8C",
  "#01A3AE",
  "#178541",
  "#1EA853",
  "#F48220",
  "#B91228",
  "#5A11B0",
  "#9346ED",
  "#28283A",
  "#616371",
].filter((color) => COLOR_PRESETS.includes(color));
const FONT_SIZE_OPTIONS = [11, 12, 14, 16, 18, 20, 24, 28];

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

function OptionIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={styles.optionIcon}
    >
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={styles.paletteIcon}
    >
      <path d="M12 22a10 10 0 1 1 10-10c0 1.7-1.3 3-3 3h-1.5a1.5 1.5 0 0 0-1.2 2.4l.3.4A2.5 2.5 0 0 1 14.5 22H12Z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="10" cy="6.8" r="1" />
      <circle cx="14" cy="6.8" r="1" />
      <circle cx="16.5" cy="10" r="1" />
    </svg>
  );
}

function createEmptyQuestion(orderNo = 1) {
  return {
    questionText: "",
    questionType: "MULTI_CHOICE",
    orderNo,
    isRequired: true,
    mediaType: "NONE",
    mediaUrl: null,
    options: [
      {
        optionText: "",
        orderNo: 1,
        mediaType: "NONE",
        mediaUrl: null,
      },
    ],
  };
}

function getOrCreateStoredRequestKey() {
  const storedRequestKey = sessionStorage.getItem(
    CREATE_SURVEY_REQUEST_KEY_STORAGE
  );

  if (storedRequestKey) {
    return storedRequestKey;
  }

  const nextRequestKey = crypto.randomUUID();
  sessionStorage.setItem(CREATE_SURVEY_REQUEST_KEY_STORAGE, nextRequestKey);
  return nextRequestKey;
}

function createNextStoredRequestKey() {
  const nextRequestKey = crypto.randomUUID();
  sessionStorage.setItem(CREATE_SURVEY_REQUEST_KEY_STORAGE, nextRequestKey);
  return nextRequestKey;
}

function clearStoredRequestKey() {
  sessionStorage.removeItem(CREATE_SURVEY_REQUEST_KEY_STORAGE);
}

function isYoutubeOrVimeoUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    return [
      "youtube.com",
      "m.youtube.com",
      "youtu.be",
      "vimeo.com",
      "player.vimeo.com",
    ].includes(hostname);
  } catch {
    return false;
  }
}

function isValidHttpUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function getMediaError(mediaType, mediaUrl) {
  const trimmedMediaUrl =
    typeof mediaUrl === "string" ? mediaUrl.trim() : "";

  if (mediaType === "IMAGE" || mediaType === "VIDEO") {
    if (!trimmedMediaUrl) {
      return "Medya URL alani zorunludur.";
    }

    if (!isValidHttpUrl(trimmedMediaUrl)) {
      return "Medya URL http:// veya https:// ile baslamalidir.";
    }
  }

  if (mediaType === "IMAGE" && !IMAGE_URL_REGEX.test(trimmedMediaUrl)) {
    return "Resim URL .jpg, .jpeg, .png, .gif, .webp veya .svg ile bitmelidir.";
  }

  if (
    mediaType === "VIDEO" &&
    !VIDEO_URL_REGEX.test(trimmedMediaUrl) &&
    !isYoutubeOrVimeoUrl(trimmedMediaUrl)
  ) {
    return "Video URL direkt video dosyasi, YouTube veya Vimeo linki olmalidir.";
  }

  if (mediaType === "NONE" && trimmedMediaUrl) {
    return 'Medya tipi "NONE" iken medya URL bos olmalidir.';
  }

  return "";
}

function buildQuestionErrors(questionList) {
  return questionList.reduce((errors, question) => {
    const error = getMediaError(question.mediaType, question.mediaUrl);

    if (error) {
      errors[question.orderNo] = error;
    }

    (question.options || []).forEach((option) => {
      const optionError = getMediaError(option.mediaType, option.mediaUrl);

      if (optionError) {
        errors[`${question.orderNo}-${option.orderNo}`] = optionError;
      }
    });

    return errors;
  }, {});
}

function toDateTimeInputValue(value) {
  if (!value) return "";

  return String(value).slice(0, 16);
}

function getSafeHexColor(value, fallback) {
  return HEX_COLOR_REGEX.test(value) ? value : fallback;
}

function getFontStack(font) {
  if (font === "system-ui" || font === "sans-serif") {
    return `${font}, sans-serif`;
  }

  return `"${font}", sans-serif`;
}

function getThemeTokenByColor(color) {
  return (
    BILSOFT_THEME_TOKENS.find((token) => token.colors.includes(color)) ||
    BILSOFT_THEME_TOKENS[0]
  );
}

function chooseThemeColor(color) {
  const token = getThemeTokenByColor(color);

  return {
    themeColor: color,
    backgroundColor: token.backgrounds[1] || token.backgrounds[0],
  };
}

function getUniqueColors(colors) {
  return [...new Set(colors)];
}

function normalizeMediaItem(item) {
  return {
    ...item,
    mediaType: item.mediaType || "NONE",
    mediaUrl:
      item.mediaType === "NONE"
        ? null
        : typeof item.mediaUrl === "string"
          ? item.mediaUrl.trim()
          : item.mediaUrl,
  };
}

function SurveyCreatePage() {
  const navigate = useNavigate();
  const { surveyId } = useParams();
  const isEditMode = Boolean(surveyId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCount, setTargetCount] = useState(100);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [themeColor, setThemeColor] = useState(COLORS.orange);
  const [backgroundColor, setBackgroundColor] = useState(COLORS.white);
  const [buttonColor, setButtonColor] = useState(COLORS.primary);
  const [questionFontFamily, setQuestionFontFamily] = useState("Poppins");
  const [bodyFontFamily, setBodyFontFamily] = useState("Poppins");
  const [questionFontSize, setQuestionFontSize] = useState(16);
  const [bodyFontSize, setBodyFontSize] = useState(14);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [openThemeSelect, setOpenThemeSelect] = useState(null);
  const [requestKey, setRequestKey] = useState(() =>
    isEditMode ? crypto.randomUUID() : getOrCreateStoredRequestKey()
  );
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(1);
  const [questionErrors, setQuestionErrors] = useState({});

  const [questions, setQuestions] = useState([createEmptyQuestion()]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const handleLogout = () => {
    if (!isEditMode) {
      clearStoredRequestKey();
    }
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    let isCancelled = false;

    const fetchSurvey = async () => {
      try {
        setLoading(true);
        setMessage("");
        setMessageType("info");
        const data = await getSurveyDetail(surveyId);

        if (isCancelled) {
          return;
        }

        setTitle(data.title || "");
        setDescription(data.description || "");
        setTargetCount(data.targetCount ?? 100);
        setIsActive(data.isActive ?? true);
        setStartDate(toDateTimeInputValue(data.startDate));
        setEndDate(toDateTimeInputValue(data.endDate));
        setThemeColor(data.themeColor || COLORS.orange);
        setBackgroundColor(data.backgroundColor || COLORS.white);
        setButtonColor(data.buttonColor || COLORS.primary);
        const nextFontFamily = ALLOWED_FONTS.includes(data.fontFamily)
          ? data.fontFamily
          : "Poppins";
        setQuestionFontFamily(nextFontFamily);
        setBodyFontFamily(nextFontFamily);

        const nextQuestions =
          data.questions?.length > 0
            ? data.questions.map((question) => ({
                ...question,
                mediaType: question.mediaType || "NONE",
                mediaUrl: question.mediaUrl ?? null,
                options:
                  question.questionType === "MULTI_CHOICE"
                    ? (question.options || []).map((option, index) => ({
                        ...option,
                        orderNo: option.orderNo ?? index + 1,
                        mediaType: option.mediaType || "NONE",
                        mediaUrl: option.mediaUrl ?? null,
                      }))
                    : question.options || [],
              }))
            : [createEmptyQuestion()];

        setQuestions(nextQuestions);
        setSelectedQuestionId(nextQuestions[0]?.orderNo ?? null);
        setQuestionErrors(buildQuestionErrors(nextQuestions));
      } catch (err) {
        console.error(err);
        if (!isCancelled) {
          setMessage(getApiErrorMessage(err, "Anket detayi alinamadi."));
          setMessageType("error");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchSurvey();

    return () => {
      isCancelled = true;
    };
  }, [isEditMode, surveyId]);

  const addQuestion = () => {
    const nextQuestion = {
      questionText: "",
      questionType: "TEXT",
      orderNo: questions.length + 1,
      isRequired: true,
      mediaType: "NONE",
      mediaUrl: null,
      options: [],
    };

    setQuestions([...questions, nextQuestion]);
    setSelectedQuestionId(nextQuestion.orderNo);
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;

    if (field === "questionType" && value !== "MULTI_CHOICE") {
      updated[index].options = [];
    }

    if (
      field === "questionType" &&
      value === "MULTI_CHOICE" &&
      updated[index].options.length === 0
    ) {
      updated[index].options = [
        {
          optionText: "",
          orderNo: 1,
          mediaType: "NONE",
          mediaUrl: null,
        },
      ];
    }

    setQuestions(updated);
    setQuestionErrors(buildQuestionErrors(updated));
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push({
      optionText: "",
      orderNo: updated[questionIndex].options.length + 1,
      mediaType: "NONE",
      mediaUrl: null,
    });
    setQuestions(updated);
    setQuestionErrors(buildQuestionErrors(updated));
  };

  const updateOptionField = (questionIndex, optionIndex, field, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex][field] = value;

    if (field === "mediaType") {
      updated[questionIndex].options[optionIndex].mediaUrl =
        value === "NONE"
          ? null
          : (updated[questionIndex].options[optionIndex].mediaUrl ?? "");
    }

    setQuestions(updated);
    setQuestionErrors(buildQuestionErrors(updated));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    const remainingOptions = updated[questionIndex].options
      .filter((_, index) => index !== optionIndex)
      .map((option, index) => ({
        ...option,
        orderNo: index + 1,
      }));

    updated[questionIndex].options = remainingOptions;
    setQuestions(updated);
    setQuestionErrors(buildQuestionErrors(updated));
  };

  const removeQuestion = (questionIndex) => {
    const removedQuestion = questions[questionIndex];
    const updated = questions.filter((_, index) => index !== questionIndex);
    const reordered = updated.map((question, index) => ({
      ...question,
      orderNo: index + 1,
    }));

    setQuestions(reordered);
    setQuestionErrors(buildQuestionErrors(reordered));

    if (reordered.length === 0) {
      setSelectedQuestionId(null);
      return;
    }

    if (selectedQuestionId === removedQuestion.orderNo) {
      setSelectedQuestionId(
        reordered[Math.min(questionIndex, reordered.length - 1)].orderNo
      );
      return;
    }

    if (selectedQuestionId > removedQuestion.orderNo) {
      setSelectedQuestionId(selectedQuestionId - 1);
    }
  };

  const assignMediaTypeToSelectedQuestion = (mediaType) => {
    if (selectedQuestionId == null) return;

    setQuestions((currentQuestions) =>
      {
        const updatedQuestions = currentQuestions.map((question) =>
        question.orderNo === selectedQuestionId
          ? {
              ...question,
              mediaType,
              mediaUrl:
                mediaType === "NONE"
                  ? null
                  : (question.mediaUrl ?? ""),
            }
          : question
      );

        setQuestionErrors(buildQuestionErrors(updatedQuestions));
        return updatedQuestions;
      }
    );
  };

  const updateQuestionMediaUrl = (questionId, mediaUrl) => {
    setQuestions((currentQuestions) =>
      {
        const updatedQuestions = currentQuestions.map((question) =>
        question.orderNo === questionId
          ? {
              ...question,
              mediaUrl,
            }
          : question
      );

        setQuestionErrors(buildQuestionErrors(updatedQuestions));
        return updatedQuestions;
      }
    );
  };

  const clearQuestionMedia = (questionId) => {
    setQuestions((currentQuestions) =>
      {
        const updatedQuestions = currentQuestions.map((question) =>
        question.orderNo === questionId
          ? {
              ...question,
              mediaType: "NONE",
              mediaUrl: null,
            }
          : question
      );

        setQuestionErrors(buildQuestionErrors(updatedQuestions));
        return updatedQuestions;
      }
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetCount(100);
    setIsActive(true);
    setStartDate("");
    setEndDate("");
    setThemeColor(COLORS.orange);
    setBackgroundColor(COLORS.white);
    setButtonColor(COLORS.primary);
    setQuestionFontFamily("Poppins");
    setBodyFontFamily("Poppins");
    setQuestionFontSize(16);
    setBodyFontSize(14);
    setIsThemePanelOpen(false);
    setOpenThemeSelect(null);
    setQuestions([createEmptyQuestion()]);
    setQuestionErrors({});
    setSelectedQuestionId(1);
    setRequestKey(createNextStoredRequestKey());
  };

  const handleSubmit = async () => {
    if (saving) return;

    setMessage("");
    setMessageType("info");
    const nextQuestionErrors = buildQuestionErrors(questions);
    const normalizedStartDate = startDate ? startDate.trim() : "";
    const normalizedEndDate = endDate ? endDate.trim() : "";

    setQuestionErrors(nextQuestionErrors);

    if (
      normalizedStartDate &&
      normalizedEndDate &&
      new Date(normalizedStartDate) > new Date(normalizedEndDate)
    ) {
      setMessage("Baslangic tarihi bitis tarihinden sonra olamaz.");
      setMessageType("error");
      return;
    }

    if (normalizedEndDate && new Date(normalizedEndDate) < new Date()) {
      setMessage("Bitis tarihi gecmiste olamaz.");
      setMessageType("error");
      return;
    }

    if (
      !HEX_COLOR_REGEX.test(themeColor) ||
      !HEX_COLOR_REGEX.test(backgroundColor) ||
      !HEX_COLOR_REGEX.test(buttonColor)
    ) {
      setMessage("Tema renkleri #RRGGBB formatinda olmalidir.");
      setMessageType("error");
      return;
    }

    if (
      !ALLOWED_FONTS.includes(questionFontFamily) ||
      !ALLOWED_FONTS.includes(bodyFontFamily)
    ) {
      setMessage("Bu font desteklenmiyor.");
      setMessageType("error");
      return;
    }

    if (Object.keys(nextQuestionErrors).length > 0) {
      setMessage("Medya alanlarindaki hatalari duzeltmeden kaydedemezsiniz.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const normalizedQuestions = questions.map((question) => ({
      ...normalizeMediaItem(question),
      options: (question.options || []).map(normalizeMediaItem),
    }));

    const body = {
      title,
      description,
      startDate: normalizedStartDate || null,
      endDate: normalizedEndDate || null,
      themeColor,
      backgroundColor,
      buttonColor,
      fontFamily: bodyFontFamily,
      targetCount: Number(targetCount),
      isActive,
      questions: normalizedQuestions,
    };

    try {
      if (isEditMode) {
        await updateSurvey(surveyId, body);
        setMessage("Anket basariyla guncellendi.");
        setMessageType("success");
      } else {
        await createSurvey({
          requestKey,
          ...body,
        });
        setMessage("Anket basariyla olusturuldu.");
        setMessageType("success");
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setMessage(getApiErrorMessage(err, "Hata olustu."));
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.panel}>
          <div style={styles.statusBox}>Yukleniyor...</div>
        </div>
      </div>
    );
  }

  const safeThemeColor = getSafeHexColor(themeColor, COLORS.orange);
  const safeBackgroundColor = getSafeHexColor(backgroundColor, COLORS.background);
  const safeButtonColor = getSafeHexColor(buttonColor, COLORS.primary);
  const selectedThemeToken = getThemeTokenByColor(safeThemeColor);
  const liveFontFamily = getFontStack(bodyFontFamily);
  const liveQuestionFontFamily = getFontStack(questionFontFamily);
  const liveTextStyle = {
    fontFamily: liveFontFamily,
    fontSize: `${bodyFontSize}px`,
  };
  const liveQuestionStyle = {
    fontFamily: liveQuestionFontFamily,
    fontSize: `${questionFontSize}px`,
    borderBottom: `2px solid ${safeThemeColor}`,
  };
  const renderThemeSelect = (id, value, options, onChange, isCompact = false) => (
    <div
      style={{
        ...styles.themeSelectWrapper,
        ...(isCompact ? styles.themeSelectWrapperCompact : null),
      }}
    >
      <button
        type="button"
        style={styles.themeSelectButton}
        onClick={() =>
          setOpenThemeSelect((currentId) => (currentId === id ? null : id))
        }
      >
        <span style={styles.themeSelectValue}>{value}</span>
        <span style={styles.themeSelectArrow}>⌄</span>
      </button>
      {openThemeSelect === id && (
        <div style={styles.themeSelectMenu}>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              style={{
                ...styles.themeSelectOption,
                ...(option === value ? styles.themeSelectOptionActive : null),
              }}
              onClick={() => {
                onChange(option);
                setOpenThemeSelect(null);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        ...styles.pageWrapper,
        backgroundColor: safeBackgroundColor,
        fontFamily: liveFontFamily,
      }}
    >
      <div
        style={{
          ...styles.panel,
          backgroundColor: safeBackgroundColor,
        }}
      >
        <div style={styles.header}>
          <div style={styles.brandArea}>
            <img src={surveyProLogo} alt="SurveyPro logo" style={styles.logo} />
          </div>

          <div style={styles.headerRight}>
            <button
              type="button"
              style={{
                ...styles.themeButton,
                color: isThemePanelOpen ? safeThemeColor : COLORS.primary,
                borderColor: isThemePanelOpen ? safeThemeColor : COLORS.border,
              }}
              onClick={() => setIsThemePanelOpen(true)}
              aria-label="Tema"
              title="Tema"
            >
              <PaletteIcon />
            </button>
            <button
              style={styles.topButton}
              onClick={() => {
                if (!isEditMode) {
                  clearStoredRequestKey();
                }
                navigate("/admin/surveys");
              }}
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
          <div
            style={{
              ...styles.tabText,
              color: safeThemeColor,
              fontFamily: liveFontFamily,
              fontSize: `${Math.max(13, bodyFontSize)}px`,
            }}
          >
            {isEditMode ? "Anket Duzenle" : "Yeni Anket"}
          </div>
          <div
            style={{
              ...styles.tabUnderline,
              backgroundColor: safeThemeColor,
            }}
          />
        </div>

        {isThemePanelOpen && (
          <div style={styles.themePanel}>
            <div style={styles.themePanelHeader}>
              <div style={styles.themePanelTitle}>
                <PaletteIcon />
                <span>Tema</span>
              </div>
              <button
                type="button"
                style={styles.themePanelClose}
                onClick={() => setIsThemePanelOpen(false)}
                aria-label="Tema panelini kapat"
                title="Kapat"
              >
                ×
              </button>
            </div>

            <div style={styles.themePanelSection}>
              <div style={styles.themeSectionTitle}>Metin stili</div>
              {[
                [
                  "Soru",
                  questionFontFamily,
                  setQuestionFontFamily,
                  questionFontSize,
                  setQuestionFontSize,
                ],
                [
                  "Metin",
                  bodyFontFamily,
                  setBodyFontFamily,
                  bodyFontSize,
                  setBodyFontSize,
                ],
              ].map(([label, selectedFont, setSelectedFont, size, setSize]) => (
                <div key={label} style={styles.themeTextRow}>
                  <label style={styles.themeControlLabel}>{label}</label>
                  <div style={styles.themeTextControls}>
                    {renderThemeSelect(
                      `${label}-font`,
                      selectedFont,
                      ALLOWED_FONTS,
                      setSelectedFont
                    )}
                    {renderThemeSelect(
                      `${label}-size`,
                      size,
                      FONT_SIZE_OPTIONS,
                      setSize,
                      true
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.themePanelSection}>
              <div style={styles.themeSectionTitle}>Renk</div>
              <div style={styles.colorPalette}>
                {ORDERED_COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    style={{
                      ...styles.roundColorButton,
                      backgroundColor: color,
                    }}
                    onClick={() => {
                      const nextTheme = chooseThemeColor(color);
                      setThemeColor(nextTheme.themeColor);
                      setBackgroundColor(nextTheme.backgroundColor);
                    }}
                    aria-label={`Vurgu rengini ${color} yap`}
                    title={color}
                  >
                    {safeThemeColor === color && (
                      <span style={styles.colorCheck}>✓</span>
                    )}
                  </button>
                ))}
                <input
                  style={styles.inlineColorInput}
                  type="color"
                  value={safeThemeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  aria-label="Ozel vurgu rengi"
                />
              </div>

              <div style={styles.backgroundChoiceRow}>
                <span style={styles.backgroundChoiceLabel}>Arka plan</span>
                {getUniqueColors(selectedThemeToken.backgrounds).map((color) => (
                  <button
                    key={`${selectedThemeToken.name}-${color}`}
                    type="button"
                    style={{
                      ...styles.backgroundColorButton,
                      backgroundColor: color,
                    }}
                    onClick={() => setBackgroundColor(color)}
                    aria-label={`Arka plan rengini ${color} yap`}
                    title={color}
                  >
                    {safeBackgroundColor === color && (
                      <span style={styles.backgroundCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div style={styles.themeSubsectionTitle}>Buton rengi</div>
              <div style={styles.buttonColorPalette}>
                {ORDERED_COLOR_PRESETS.map((color) => (
                  <button
                    key={`button-${color}`}
                    type="button"
                    style={{
                      ...styles.buttonColorPreset,
                      backgroundColor: color,
                    }}
                    onClick={() => setButtonColor(color)}
                    aria-label={`Buton rengini ${color} yap`}
                    title={color}
                  >
                    {safeButtonColor === color && (
                      <span style={styles.colorCheck}>✓</span>
                    )}
                  </button>
                ))}
              </div>
              <div style={styles.colorControl}>
                <input
                  style={styles.colorPicker}
                  type="color"
                  value={safeButtonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                />
                <input
                  style={styles.colorTextInput}
                  value={buttonColor}
                  onChange={(e) => setButtonColor(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            ...styles.contentArea,
            backgroundColor: safeBackgroundColor,
          }}
        >
          <div style={styles.formWrapper}>
            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Anket Basligi</label>
              <input
                style={{ ...styles.underlinedInput, ...liveTextStyle }}
                type="text"
                placeholder="Anket Basligini Giriniz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Anket Aciklamasi</label>
              <textarea
                style={{ ...styles.underlinedTextarea, ...liveTextStyle }}
                placeholder="Anket Aciklamasini Giriniz"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Hedef Kisi Sayisi</label>
              <input
                style={{ ...styles.underlinedInput, ...liveTextStyle }}
                type="number"
                placeholder="Hedef Kisi Sayisi"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
              />
            </div>

            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Anket Tarihleri</label>
              <div style={styles.splitFieldRow}>
                <div style={styles.splitField}>
                  <span style={styles.helperLabel}>Baslangic</span>
                  <input
                    style={{ ...styles.underlinedInput, ...liveTextStyle }}
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div style={styles.splitField}>
                  <span style={styles.helperLabel}>Bitis</span>
                  <input
                    style={{ ...styles.underlinedInput, ...liveTextStyle }}
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div style={styles.infoCard}>
              <div style={styles.activeRow}>
                <label style={styles.fieldLabel}>Anket Aktifligi</label>
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={styles.switchInput}
                  />
                  <span
                    style={{
                      ...styles.slider,
                      backgroundColor: isActive ? safeButtonColor : "#D9D9D9",
                    }}
                  >
                    <span
                      style={{
                        ...styles.sliderKnob,
                        transform: isActive
                          ? "translateX(16px)"
                          : "translateX(0px)",
                      }}
                    />
                  </span>
                </label>
              </div>
            </div>

            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                style={{
                  ...styles.questionCard,
                  borderLeft: `4px solid ${safeThemeColor}`,
                  ...(selectedQuestionId === question.orderNo
                    ? {
                        ...styles.selectedQuestionCard,
                        borderColor: safeThemeColor,
                        boxShadow: `0 10px 28px ${safeThemeColor}2E`,
                      }
                    : null),
                }}
                onClick={() => setSelectedQuestionId(question.orderNo)}
              >
                <div style={styles.questionTopRow}>
                  <div style={styles.questionInputArea}>
                    <input
                      style={{ ...styles.questionInput, ...liveQuestionStyle }}
                      type="text"
                      placeholder="Soru"
                      value={question.questionText}
                      onChange={(e) =>
                        updateQuestionField(
                          questionIndex,
                          "questionText",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <select
                    style={{ ...styles.selectBox, ...liveTextStyle }}
                    value={question.questionType}
                    onChange={(e) =>
                      updateQuestionField(
                        questionIndex,
                        "questionType",
                        e.target.value
                      )
                    }
                  >
                    <option value="TEXT">Metin</option>
                    <option value="MULTI_CHOICE">Coktan Secmeli</option>
                    <option value="YES_NO">Evet / Hayir</option>
                    <option value="RATING">Puanlama</option>
                  </select>
                </div>

                {question.questionType === "MULTI_CHOICE" && (
                  <div style={styles.optionsArea}>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} style={styles.optionBlock}>
                        <div style={styles.optionRow}>
                        <OptionIcon />
                        <input
                          style={{ ...styles.optionInput, ...liveTextStyle }}
                          type="text"
                          placeholder={`Secenek ${optionIndex + 1}`}
                          value={option.optionText}
                          onChange={(e) =>
                            updateOptionField(
                              questionIndex,
                              optionIndex,
                              "optionText",
                              e.target.value
                            )
                          }
                        />
                        <button
                          type="button"
                          style={styles.optionActionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            addOption(questionIndex);
                          }}
                          title="Secenek Ekle"
                          aria-label="Secenek Ekle"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 5V19"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M5 12H19"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          style={styles.optionActionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(questionIndex, optionIndex);
                          }}
                          disabled={question.options.length === 1}
                          title="Secenegi Sil"
                          aria-label="Secenegi Sil"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 7H20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M9.5 3.5H14.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M18 7L17.3 18.2C17.23 19.24 16.37 20.05 15.33 20.05H8.67C7.63 20.05 6.77 19.24 6.7 18.2L6 7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10 11V16"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M14 11V16"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                        </div>
                        {(option.mediaType === "IMAGE" ||
                          option.mediaType === "VIDEO") && (
                          <div style={styles.optionMediaRow}>
                            <input
                              style={{
                                ...styles.optionMediaInput,
                                ...liveTextStyle,
                              }}
                              type="url"
                              placeholder={
                                option.mediaType === "IMAGE"
                                  ? "https://ornek.com/secenek.jpg"
                                  : "https://ornek.com/secenek.mp4"
                              }
                              value={option.mediaUrl ?? ""}
                              onChange={(e) =>
                                updateOptionField(
                                  questionIndex,
                                  optionIndex,
                                  "mediaUrl",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                        <div style={styles.optionMediaTools}>
                          <select
                            style={styles.optionMediaSelect}
                            value={option.mediaType || "NONE"}
                            onChange={(e) =>
                              updateOptionField(
                                questionIndex,
                                optionIndex,
                                "mediaType",
                                e.target.value
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="NONE">Medya Yok</option>
                            <option value="IMAGE">Resim</option>
                            <option value="VIDEO">Video</option>
                          </select>
                        </div>
                        {questionErrors[
                          `${question.orderNo}-${option.orderNo}`
                        ] && (
                          <p style={styles.optionErrorText}>
                            {
                              questionErrors[
                                `${question.orderNo}-${option.orderNo}`
                              ]
                            }
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(question.mediaType === "IMAGE" ||
                  question.mediaType === "VIDEO") && (
                  <div style={styles.mediaFieldArea}>
                    <div style={styles.mediaFieldHeader}>
                      <label style={styles.mediaFieldLabel}>
                        {question.mediaType === "IMAGE"
                          ? "Resim URL"
                          : "Video URL"}
                      </label>
                      <button
                        type="button"
                        style={styles.clearMediaButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          clearQuestionMedia(question.orderNo);
                        }}
                      >
                        Medyayi Kaldir
                      </button>
                    </div>
                    <input
                      style={styles.mediaUrlInput}
                      type="url"
                      placeholder={
                        question.mediaType === "IMAGE"
                          ? "https://ornek.com/resim.jpg"
                          : "https://ornek.com/video.mp4"
                      }
                      value={question.mediaUrl ?? ""}
                      onChange={(e) =>
                        updateQuestionMediaUrl(
                          question.orderNo,
                          e.target.value
                        )
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                <div style={styles.questionBottomRow}>
                  <div style={styles.requiredBox}>
                    <button
                      type="button"
                      style={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeQuestion(questionIndex);
                      }}
                      disabled={questions.length === 1}
                      title="Soruyu Sil"
                      aria-label="Soruyu Sil"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 7H20"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.5 3.5H14.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M18 7L17.3 18.2C17.23 19.24 16.37 20.05 15.33 20.05H8.67C7.63 20.05 6.77 19.24 6.7 18.2L6 7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 11V16"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 11V16"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                    <span style={styles.requiredText}>Required</span>
                    <label style={styles.switch}>
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={(e) =>
                          updateQuestionField(
                            questionIndex,
                            "isRequired",
                            e.target.checked
                          )
                        }
                        style={styles.switchInput}
                      />
                      <span
                      style={{
                        ...styles.slider,
                        backgroundColor: question.isRequired
                            ? safeButtonColor
                            : "#D9D9D9",
                        }}
                      >
                        <span
                          style={{
                            ...styles.sliderKnob,
                            transform: question.isRequired
                              ? "translateX(16px)"
                              : "translateX(0px)",
                          }}
                        />
                      </span>
                    </label>
                  </div>
                </div>

                {questionErrors[question.orderNo] && (
                  <p style={styles.questionErrorText}>
                    {questionErrors[question.orderNo]}
                  </p>
                )}
              </div>
            ))}

            <div style={styles.floatingTools}>
              <button
                type="button"
                style={styles.toolButton}
                onClick={addQuestion}
                title="Soru Ekle"
              >
                +
              </button>
              <button
                type="button"
                style={{
                  ...styles.toolButton,
                  ...styles.imageToolButton,
                  ...(selectedQuestionId == null ? styles.disabledToolButton : null),
                }}
                onClick={() => assignMediaTypeToSelectedQuestion("IMAGE")}
                title="Resim"
                aria-label="Resim"
                disabled={selectedQuestionId == null}
              >
                □
              </button>
              <button
                type="button"
                style={{
                  ...styles.toolButton,
                  ...styles.videoToolButton,
                  ...(selectedQuestionId == null ? styles.disabledToolButton : null),
                }}
                onClick={() => assignMediaTypeToSelectedQuestion("VIDEO")}
                title="Video"
                aria-label="Video"
                disabled={selectedQuestionId == null}
              >
                ▶
              </button>
            </div>

            <div style={styles.saveArea}>
              <button
                style={{
                  ...styles.saveButton,
                  backgroundColor: safeButtonColor,
                  fontFamily: liveFontFamily,
                  fontSize: `${Math.max(14, bodyFontSize)}px`,
                }}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : isEditMode
                    ? "Anketi Guncelle"
                    : "Anketi Kaydet"}
              </button>
            </div>

            {message &&
              (messageType === "error" ? (
                <div style={styles.errorMessageBox} role="alert">
                  {getDisplayErrorMessages(message).map((item, index) => (
                    <div key={`${item}-${index}`}>{item}</div>
                  ))}
                </div>
              ) : (
                <p style={styles.messageText}>{message}</p>
              ))}
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
    overflow: "hidden",
  },
  header: {
    height: "60px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 18px 0 36px",
    boxSizing: "border-box",
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
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
    marginLeft: "auto",
    gap: "10px",
  },
  tabHeader: {
    backgroundColor: "#F3F3F4",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    height: "36px",
    paddingBottom: "4px",
    boxSizing: "border-box",
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
    width: "64px",
    height: "2px",
    backgroundColor: COLORS.orange,
    borderRadius: "999px",
  },
  topButton: {
    backgroundColor: COLORS.primary,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "999px",
    minHeight: "42px",
    padding: "0 20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "42px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    lineHeight: 1,
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
  themeButton: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E4E7",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
  },
  paletteIcon: {
    width: "20px",
    height: "20px",
  },
  logoutIcon: {
    width: "20px",
    height: "20px",
  },
  themePanel: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "280px",
    maxWidth: "calc(100vw - 24px)",
    height: "100vh",
    backgroundColor: "#FFFFFF",
    borderLeft: "1px solid #D6D6DA",
    boxShadow: "-8px 0 24px rgba(15, 23, 42, 0.16)",
    zIndex: 20,
    overflowY: "auto",
    fontFamily: FONT_FAMILY,
  },
  themePanelHeader: {
    height: "64px",
    padding: "0 18px 0 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #E4E4E7",
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.08)",
    boxSizing: "border-box",
  },
  themePanelTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
    color: COLORS.text,
    fontSize: "16px",
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
  },
  themePanelClose: {
    width: "32px",
    height: "32px",
    border: "none",
    backgroundColor: "transparent",
    color: "#5F6368",
    fontSize: "30px",
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  themePanelSection: {
    padding: "22px 20px",
    borderBottom: "1px solid #E4E4E7",
  },
  themeSectionTitle: {
    color: COLORS.text,
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "18px",
    fontFamily: FONT_FAMILY,
  },
  themeSubsectionTitle: {
    color: COLORS.text,
    fontSize: "14px",
    fontWeight: 700,
    margin: "20px 0 14px",
    textAlign: "center",
    fontFamily: FONT_FAMILY,
  },
  themeTextRow: {
    marginBottom: "18px",
  },
  themeControlLabel: {
    display: "block",
    color: COLORS.text,
    fontSize: "14px",
    marginBottom: "10px",
    fontFamily: FONT_FAMILY,
  },
  themeTextControls: {
    display: "grid",
    gridTemplateColumns: "1fr 74px",
    gap: "8px",
  },
  themePanelSelect: {
    width: "100%",
    height: "41px",
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    padding: "0 10px",
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    fontFamily: FONT_FAMILY,
  },
  themeSizeSelect: {
    width: "60px",
    height: "41px",
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    padding: "0 8px",
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    fontSize: "14px",
    outline: "none",
    fontFamily: FONT_FAMILY,
  },
  themeSelectWrapper: {
    position: "relative",
    minWidth: 0,
  },
  themeSelectWrapperCompact: {
    width: "74px",
  },
  themeSelectButton: {
    width: "100%",
    height: "50px",
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    backgroundColor: "#FFFFFF",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    padding: "0 12px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: FONT_FAMILY,
    boxSizing: "border-box",
  },
  themeSelectValue: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  themeSelectArrow: {
    color: COLORS.text,
    fontSize: "18px",
    lineHeight: 1,
    flexShrink: 0,
  },
  themeSelectMenu: {
    position: "absolute",
    top: "calc(100% + 2px)",
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: "#FFFFFF",
    border: "1px solid #C9CDD2",
    borderRadius: "4px",
    boxShadow: "0 8px 18px rgba(15, 23, 42, 0.14)",
    overflow: "hidden",
  },
  themeSelectOption: {
    width: "100%",
    minHeight: "36px",
    border: "none",
    backgroundColor: "#FFFFFF",
    color: COLORS.text,
    display: "flex",
    alignItems: "center",
    padding: "0 14px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "left",
    fontFamily: FONT_FAMILY,
  },
  themeSelectOptionActive: {
    backgroundColor: COLORS.primary,
    color: "#FFFFFF",
    fontWeight: 700,
  },
  colorPalette: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 24px)",
    gap: "8px",
    marginBottom: "18px",
  },
  roundColorButton: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 800,
  },
  inlineColorInput: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "50%",
    padding: 0,
    cursor: "pointer",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  colorCheck: {
    color: "#FFFFFF",
    lineHeight: 1,
  },
  backgroundChoiceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "20px 0 18px",
  },
  backgroundChoiceLabel: {
    color: COLORS.text,
    fontSize: "14px",
    marginRight: "4px",
    fontFamily: FONT_FAMILY,
  },
  backgroundColorButton: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "1px solid #D6D6DA",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: COLORS.text,
    fontSize: "16px",
    fontWeight: 800,
  },
  backgroundCheck: {
    lineHeight: 1,
  },
  buttonColorPalette: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 24px)",
    gap: "8px",
    marginBottom: "12px",
  },
  buttonColorPreset: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    border: "none",
    padding: 0,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: 800,
  },
  contentArea: {
    backgroundColor: COLORS.background,
    minHeight: "calc(100vh - 96px)",
    padding: "18px 20px 60px",
  },
  formWrapper: {
    maxWidth: "700px",
    margin: "0 auto",
    position: "relative",
    paddingRight: "72px",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "18px 24px 16px",
    marginBottom: "12px",
    border: "1px solid #E4E4E7",
    boxShadow: COLORS.shadow,
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: "12px",
  },
  activeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
  },
  splitFieldRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
  },
  splitField: {
    minWidth: 0,
  },
  helperLabel: {
    display: "block",
    color: COLORS.muted,
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "2px",
  },
  themeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px 18px",
  },
  themeField: {
    minWidth: 0,
  },
  colorControl: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    borderBottom: "1px solid #D6D6DA",
    paddingBottom: "6px",
  },
  colorPicker: {
    width: "24px",
    height: "24px",
    border: "none",
    borderRadius: "50%",
    backgroundColor: "transparent",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
    overflow: "hidden",
  },
  colorTextInput: {
    width: "100%",
    border: "none",
    padding: "8px 0",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: FONT_FAMILY,
  },
  themeSelect: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: FONT_FAMILY,
  },
  presetRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "14px",
  },
  colorPreset: {
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    border: "2px solid transparent",
    cursor: "pointer",
    padding: 0,
  },
  underlinedInput: {
    width: "100%",
    maxWidth: "560px",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    fontFamily: FONT_FAMILY,
  },
  underlinedTextarea: {
    width: "100%",
    maxWidth: "560px",
    minHeight: "32px",
    resize: "none",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    overflow: "hidden",
    fontFamily: FONT_FAMILY,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "8px",
    padding: "14px 14px 14px 16px",
    marginTop: "22px",
    border: "1px solid #E4E4E7",
    borderLeft: `4px solid ${COLORS.orange}`,
    position: "relative",
    boxShadow: COLORS.shadow,
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  selectedQuestionCard: {
    borderColor: COLORS.orange,
    boxShadow: "0 10px 28px rgba(244, 130, 32, 0.18)",
  },
  questionTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  questionInputArea: {
    flex: 1,
    minWidth: 0,
  },
  questionInput: {
    width: "100%",
    border: "none",
    borderBottom: `2px solid ${COLORS.orange}`,
    padding: "10px 10px 12px",
    fontSize: "16px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "#F7F7F8",
  },
  selectBox: {
    width: "204px",
    border: "1px solid #D6D6DA",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    outline: "none",
    height: "40px",
  },
  optionsArea: {
    marginTop: "18px",
  },
  optionBlock: {
    marginBottom: "10px",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  optionInput: {
    width: "100%",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    marginBottom: "8px",
  },
  optionIcon: {
    width: "18px",
    height: "18px",
    color: COLORS.primary,
    flexShrink: 0,
    marginBottom: "8px",
  },
  optionActionButton: {
    border: "none",
    background: "transparent",
    color: "#616371",
    width: "20px",
    height: "20px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0,
    marginBottom: "8px",
  },
  optionMediaTools: {
    display: "flex",
    justifyContent: "flex-end",
    margin: "-2px 0 6px 28px",
  },
  optionMediaSelect: {
    width: "132px",
    border: "1px solid #E4E4E7",
    borderRadius: "6px",
    padding: "7px 8px",
    fontSize: "12px",
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    outline: "none",
    fontFamily: FONT_FAMILY,
  },
  optionMediaRow: {
    margin: "0 0 6px 28px",
  },
  optionMediaInput: {
    width: "100%",
    border: "1px solid #D6D6DA",
    borderRadius: "6px",
    padding: "9px 10px",
    fontSize: "13px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
  },
  mediaFieldArea: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid #E4E4E7",
  },
  mediaFieldHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
  },
  mediaFieldLabel: {
    fontSize: "14px",
    fontWeight: 700,
    color: COLORS.text,
  },
  mediaUrlInput: {
    width: "100%",
    border: "1px solid #D6D6DA",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
    fontFamily: FONT_FAMILY,
  },
  clearMediaButton: {
    border: "none",
    backgroundColor: "transparent",
    color: COLORS.orangeDark,
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  questionBottomRow: {
    marginTop: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #E4E4E7",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#616371",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    width: "20px",
    height: "20px",
  },
  requiredBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  requiredText: {
    fontSize: "14px",
    color: COLORS.text,
  },
  switch: {
    position: "relative",
    display: "inline-block",
    width: "36px",
    height: "20px",
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
    backgroundColor: "#D9D9D9",
    borderRadius: "999px",
    transition: "0.2s",
  },
  sliderKnob: {
    position: "absolute",
    height: "16px",
    width: "16px",
    left: "2px",
    top: "2px",
    backgroundColor: "#FFFFFF",
    borderRadius: "50%",
    transition: "0.2s",
  },
  floatingTools: {
    position: "absolute",
    right: "8px",
    top: "404px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E4E4E7",
    borderRadius: "8px",
    padding: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  toolButton: {
    width: "32px",
    height: "32px",
    borderRadius: "6px",
    border: "1px solid #E4E4E7",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    fontSize: "16px",
    color: COLORS.text,
    lineHeight: 1,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  disabledToolButton: {
    opacity: 0.45,
    cursor: "not-allowed",
  },
  imageToolButton: {
    fontSize: 0,
    color: "transparent",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Crect x='4' y='5' width='16' height='14' rx='2.5' fill='none' stroke='%2328283A' stroke-width='1.7'/%3E%3Ccircle cx='9' cy='10' r='1.6' fill='%2328283A'/%3E%3Cpath d='M6.5 17L11 12.5L13.8 15.3L15.5 13.6L18 16.1' fill='none' stroke='%2328283A' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "16px 16px",
  },
  videoToolButton: {
    fontSize: 0,
    color: "transparent",
    backgroundImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24'%3E%3Crect x='4' y='6' width='11' height='12' rx='2.5' fill='none' stroke='%2328283A' stroke-width='1.7'/%3E%3Cpath d='M15 10L19.5 7.5V16.5L15 14' fill='none' stroke='%2328283A' stroke-width='1.7' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M9.2 10.2L12 12L9.2 13.8V10.2Z' fill='%2328283A'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "16px 16px",
  },
  saveArea: {
    display: "flex",
    justifyContent: "center",
    marginTop: "36px",
  },
  saveButton: {
    backgroundColor: COLORS.orange,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "9999px",
    minHeight: "44px",
    padding: "0 24px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    marginTop: "14px",
    textAlign: "center",
    fontWeight: 700,
    color: COLORS.primary,
  },
  errorMessageBox: {
    marginTop: "14px",
    backgroundColor: "#FEF3F2",
    border: "1px solid #FECDCA",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#B42318",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.5,
    fontFamily: FONT_FAMILY,
  },
  statusBox: {
    padding: "24px",
    fontSize: "18px",
    fontWeight: 600,
  },
  questionErrorText: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#B42318",
    fontSize: "13px",
    fontWeight: 600,
  },
  optionErrorText: {
    margin: "0 0 6px 28px",
    color: "#B42318",
    fontSize: "12px",
    fontWeight: 600,
  },
};

export default SurveyCreatePage;
