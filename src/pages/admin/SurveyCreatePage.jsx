import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { createSurvey } from "../../api/surveyApi";
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

function SurveyCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetCount, setTargetCount] = useState(100);
  const [requestKey, setRequestKey] = useState(() => crypto.randomUUID());
  const [saving, setSaving] = useState(false);

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      questionType: "MULTI_CHOICE",
      orderNo: 1,
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
    },
  ]);

  const [message, setMessage] = useState("");

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        questionType: "TEXT",
        orderNo: questions.length + 1,
        isRequired: true,
        mediaType: "NONE",
        mediaUrl: null,
        options: [],
      },
    ]);
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
  };

  const updateOptionField = (questionIndex, optionIndex, value) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex].optionText = value;
    setQuestions(updated);
  };

  const removeQuestion = (questionIndex) => {
    const updated = questions.filter((_, index) => index !== questionIndex);
    const reordered = updated.map((question, index) => ({
      ...question,
      orderNo: index + 1,
    }));
    setQuestions(reordered);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetCount(100);
    setQuestions([
      {
        questionText: "",
        questionType: "MULTI_CHOICE",
        orderNo: 1,
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
      },
    ]);
    setRequestKey(crypto.randomUUID());
  };

  const handleSubmit = async () => {
    if (saving) return;

    setSaving(true);
    setMessage("");

    const body = {
      ownerUserId: 1,
      requestKey,
      title,
      description,
      themeColor: COLORS.orange,
      targetCount: Number(targetCount),
      isActive: true,
      questions,
    };

    try {
      await createSurvey(body);
      setMessage("Anket basariyla olusturuldu.");
      resetForm();
    } catch (err) {
      console.error(err);
      setMessage(getApiErrorMessage(err, "Hata olustu."));
    } finally {
      setSaving(false);
    }
  };

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
              onClick={() => navigate("/admin/surveys")}
            >
              Anket Listesine Don
            </button>
            <button style={styles.menuButton} aria-label="Menu">
              &#8942;
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Yeni Anket</div>
          <div style={styles.tabUnderline} />
        </div>

        <div style={styles.contentArea}>
          <div style={styles.formWrapper}>
            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Anket Basligi</label>
              <input
                style={styles.underlinedInput}
                type="text"
                placeholder="Anket Basligini Giriniz"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Anket Aciklamasi</label>
              <textarea
                style={styles.underlinedTextarea}
                placeholder="Anket Aciklamasini Giriniz"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={styles.infoCard}>
              <label style={styles.fieldLabel}>Hedef Kisi Sayisi</label>
              <input
                style={styles.underlinedInput}
                type="number"
                placeholder="Hedef Kisi Sayisi"
                value={targetCount}
                onChange={(e) => setTargetCount(e.target.value)}
              />
            </div>

            {questions.map((question, questionIndex) => (
              <div key={questionIndex} style={styles.questionCard}>
                <div style={styles.questionTopRow}>
                  <div style={styles.questionInputArea}>
                    <input
                      style={styles.questionInput}
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
                    style={styles.selectBox}
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
                      <input
                        key={optionIndex}
                        style={styles.optionInput}
                        type="text"
                        placeholder={`Secenek ${optionIndex + 1}`}
                        value={option.optionText}
                        onChange={(e) =>
                          updateOptionField(
                            questionIndex,
                            optionIndex,
                            e.target.value
                          )
                        }
                      />
                    ))}

                    <button
                      type="button"
                      style={styles.optionButton}
                      onClick={() => addOption(questionIndex)}
                    >
                      Secenek Ekle
                    </button>
                  </div>
                )}

                <div style={styles.questionBottomRow}>
                  <div style={styles.requiredBox}>
                    <button
                      type="button"
                      style={styles.deleteButton}
                      onClick={() => removeQuestion(questionIndex)}
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
                            ? COLORS.orange
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
              </div>
            ))}

            <div style={styles.floatingTools}>
              <button style={styles.toolButton} onClick={addQuestion} title="Soru Ekle">
                +
              </button>
              <button
                style={{ ...styles.toolButton, ...styles.imageToolButton }}
                title="Resim"
                aria-label="Resim"
              >
                □
              </button>
              <button
                style={{ ...styles.toolButton, ...styles.videoToolButton }}
                title="Video"
                aria-label="Video"
              >
                ▶
              </button>
            </div>

            <div style={styles.saveArea}>
              <button
                style={styles.saveButton}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? "Kaydediliyor..." : "Anketi Kaydet"}
              </button>
            </div>

            {message && <p style={styles.messageText}>{message}</p>}
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
    backgroundColor: COLORS.orange,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    padding: "0 16px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "36px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    lineHeight: 1,
  },
  menuButton: {
    border: "none",
    background: "transparent",
    color: COLORS.text,
    fontSize: "22px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    lineHeight: 1,
    height: "36px",
    width: "24px",
    padding: 0,
    fontWeight: 700,
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
  optionButton: {
    backgroundColor: COLORS.orange,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "5px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "8px",
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
    borderRadius: "7px",
    padding: "12px 18px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  messageText: {
    marginTop: "14px",
    textAlign: "center",
    fontWeight: 700,
    color: COLORS.primary,
  },
};

export default SurveyCreatePage;
