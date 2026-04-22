import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { createSurvey } from "../../api/surveyApi";

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  orangeDark: "#E16F0B",
  background: "#E5F0FF",
  white: "#FFFFFF",
  text: "#28283A",
  border: "#E4E4E7",
  muted: "#808392",
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
            <DocumentIcon />
            <span style={styles.brandText}>SURVEYPRO ADMIN PANELI</span>
          </div>

          <div style={styles.headerRight}>
            <button
              style={styles.topButton}
              onClick={() => navigate("/admin/surveys")}
            >
              Anket Listesine Don
            </button>
            <button style={styles.menuButton} aria-label="Menu">
              ...
            </button>
          </div>
        </div>

        <div style={styles.tabHeader}>
          <div style={styles.tabText}>Yeni Anket Olustur</div>
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
                  <button
                    type="button"
                    style={styles.deleteButton}
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={questions.length === 1}
                    title="Soruyu Sil"
                  >
                    X
                  </button>

                  <div style={styles.requiredBox}>
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
              <button style={styles.toolButton} title="Resim">
                IMG
              </button>
              <button style={styles.toolButton} title="Video">
                VID
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

function DocumentIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 3H14L19 8V21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3Z"
        stroke="#5B7FA3"
        strokeWidth="1.8"
        fill="white"
      />
      <path d="M14 3V8H19" stroke="#5B7FA3" strokeWidth="1.8" />
      <path d="M8 12H16" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 15H16" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 18H13" stroke="#5B7FA3" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#FFFFFF",
    margin: 0,
    fontFamily: "Arial, sans-serif",
  },
  panel: {
    minHeight: "100vh",
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  header: {
    height: "102px",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    borderBottom: "1px solid #E4E4E7",
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  brandText: {
    fontSize: "15px",
    fontWeight: 500,
    color: COLORS.text,
    letterSpacing: "0.2px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  topButton: {
    backgroundColor: COLORS.orange,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "7px",
    padding: "11px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  menuButton: {
    border: "none",
    background: "transparent",
    color: COLORS.text,
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: 1,
    padding: "4px 8px",
  },
  tabHeader: {
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "74px",
    borderBottom: "1px solid #E4E4E7",
  },
  tabText: {
    color: COLORS.orange,
    fontSize: "16px",
    fontWeight: 700,
  },
  tabUnderline: {
    marginTop: "6px",
    width: "142px",
    height: "3px",
    backgroundColor: COLORS.orange,
    borderRadius: "999px",
  },
  contentArea: {
    backgroundColor: COLORS.background,
    minHeight: "calc(100vh - 176px)",
    padding: "22px 20px 60px",
  },
  formWrapper: {
    maxWidth: "610px",
    margin: "0 auto",
    position: "relative",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "7px",
    padding: "16px",
    marginBottom: "10px",
    border: "1px solid #E4E4E7",
  },
  fieldLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: COLORS.text,
    marginBottom: "12px",
  },
  underlinedInput: {
    width: "44%",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
  },
  underlinedTextarea: {
    width: "44%",
    minHeight: "28px",
    resize: "none",
    border: "none",
    borderBottom: "1px solid #D6D6DA",
    padding: "10px 0 8px",
    fontSize: "14px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "7px",
    padding: "16px",
    marginTop: "22px",
    border: "1px solid #E4E4E7",
    borderLeft: `4px solid ${COLORS.orange}`,
    position: "relative",
  },
  questionTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
  },
  questionInputArea: {
    flex: 1,
  },
  questionInput: {
    width: "100%",
    border: "none",
    borderBottom: `2px solid ${COLORS.orange}`,
    padding: "8px 8px 10px",
    fontSize: "16px",
    color: COLORS.text,
    outline: "none",
    backgroundColor: "transparent",
  },
  selectBox: {
    width: "182px",
    border: "1px solid #D6D6DA",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    color: COLORS.text,
    backgroundColor: "#FFFFFF",
    outline: "none",
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
    color: "#616371",
  },
  requiredBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
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
    right: "-52px",
    top: "322px",
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
    fontSize: "12px",
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
