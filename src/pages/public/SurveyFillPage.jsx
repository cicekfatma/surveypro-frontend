import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../api/axiosInstance";
import { getPublicSurvey, submitPublicSurvey } from "../../api/surveyApi";

const COLORS = {
  primary: "#023E8A",
  orange: "#F48220",
  background: "#E5F0FF",
  text: "#28283A",
  white: "#FFFFFF",
  border: "#D9E3F0",
};

function getYoutubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace("www.", "");

    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (hostname === "youtu.be") {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }
  } catch {
    return "";
  }

  return "";
}

function isDirectVideoUrl(url) {
  if (!url) return false;

  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function SurveyFillPage({ publicKey, onBack }) {
  const [survey, setSurvey] = useState(null);
  const [respondentToken, setRespondentToken] = useState("");
  const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchPublicSurvey = async () => {
      try {
        const data = await getPublicSurvey(publicKey);
        setSurvey(data);
        setRespondentToken(data.respondentToken || "");
      } catch (err) {
        console.error(err);
        setMessage(getApiErrorMessage(err, "Anket yuklenemedi."));
      } finally {
        setLoading(false);
      }
    };

    fetchPublicSurvey();
  }, [publicKey]);

  const handleTextChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { answerText: value },
    }));
  };

  const handleSingleChoiceChange = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { optionId },
    }));
  };

  const handleYesNoChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { boolValue: value },
    }));
  };

  const handleRatingChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ratingValue: value },
    }));
  };

  const handleMultiChoiceChange = (questionId, optionId, checked) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.optionIds || [];
      const optionIds = checked
        ? [...current, optionId]
        : current.filter((id) => id !== optionId);

      return {
        ...prev,
        [questionId]: { optionIds },
      };
    });
  };

  const buildAnswerPayload = () => {
    const payload = [];

    if (!survey?.questions) return payload;

    survey.questions.forEach((question) => {
      const answer = answers[question.id];

      if (!answer) return;

      if (question.questionType === "TEXT") {
        payload.push({
          questionId: question.id,
          answerText: answer.answerText || "",
        });
      }

      if (question.questionType === "SINGLE_CHOICE") {
        payload.push({
          questionId: question.id,
          optionId: answer.optionId,
        });
      }

      if (question.questionType === "MULTI_CHOICE") {
        (answer.optionIds || []).forEach((optionId) => {
          payload.push({
            questionId: question.id,
            optionId,
          });
        });
      }

      if (question.questionType === "YES_NO") {
        payload.push({
          questionId: question.id,
          boolValue: answer.boolValue,
        });
      }

      if (question.questionType === "RATING") {
        payload.push({
          questionId: question.id,
          ratingValue: answer.ratingValue,
        });
      }
    });

    return payload;
  };

  const handleSubmit = async () => {
    if (saving) return;

    setSaving(true);
    setMessage("");

    try {
      await submitPublicSurvey(publicKey, {
        email,
        respondentToken,
        answers: buildAnswerPayload(),
      });

      setMessage("Cevabiniz basariyla kaydedildi.");
    } catch (err) {
      console.error(err);
      setMessage(getApiErrorMessage(err, "Hata olustu."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <h2 style={{ padding: "20px" }}>Yukleniyor...</h2>;
  }

  if (!survey) {
    return <h2 style={{ padding: "20px" }}>Anket bulunamadi.</h2>;
  }

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.header}>
        <div style={styles.brandText}>SURVEYPRO</div>
        {onBack && (
          <button style={styles.topButton} onClick={onBack}>
            Geri Don
          </button>
        )}
      </div>

      <div style={styles.contentArea}>
        <div style={styles.container}>
          <div style={styles.mainCard}>
            <h1 style={styles.title}>{survey.title}</h1>
            <p style={styles.description}>{survey.description}</p>
          </div>

          <div style={styles.mainCard}>
            <label style={styles.label}>E-posta</label>
            <input
              style={styles.input}
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {survey.questions?.map((question) => (
            <div key={question.id} style={styles.questionCard}>
              <h3 style={styles.questionTitle}>
                {question.orderNo}. {question.questionText}
              </h3>

              {question.mediaType === "IMAGE" && question.mediaUrl && (
                <img
                  src={question.mediaUrl}
                  alt="question media"
                  style={styles.image}
                />
              )}

              {question.mediaType === "VIDEO" && question.mediaUrl && (
                <>
                  {isDirectVideoUrl(question.mediaUrl) && (
                    <video
                      controls
                      preload="metadata"
                      style={styles.video}
                      src={question.mediaUrl}
                    >
                      Tarayiciniz video etiketini desteklemiyor.
                    </video>
                  )}

                  {!isDirectVideoUrl(question.mediaUrl) &&
                    getYoutubeEmbedUrl(question.mediaUrl) && (
                      <iframe
                        src={getYoutubeEmbedUrl(question.mediaUrl)}
                        title={`question-video-${question.id}`}
                        style={styles.videoFrame}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    )}

                  {!isDirectVideoUrl(question.mediaUrl) &&
                    !getYoutubeEmbedUrl(question.mediaUrl) && (
                      <p style={styles.mediaFallbackText}>
                        Bu video URL tipi desteklenmiyor. Direkt video dosyasi
                        ya da YouTube embedlenebilir link kullanin.
                      </p>
                    )}
                </>
              )}

              {question.questionType === "TEXT" && (
                <textarea
                  style={styles.textarea}
                  placeholder="Cevabinizi yazin"
                  value={answers[question.id]?.answerText || ""}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                />
              )}

              {question.questionType === "SINGLE_CHOICE" && (
                <div style={styles.optionGroup}>
                  {question.options?.map((option) => (
                    <label key={option.id} style={styles.optionLabel}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        checked={answers[question.id]?.optionId === option.id}
                        onChange={() =>
                          handleSingleChoiceChange(question.id, option.id)
                        }
                      />
                      <span>{option.optionText}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === "MULTI_CHOICE" && (
                <div style={styles.optionGroup}>
                  {question.options?.map((option) => (
                    <label key={option.id} style={styles.optionLabel}>
                      <input
                        type="checkbox"
                        checked={
                          answers[question.id]?.optionIds?.includes(option.id) ||
                          false
                        }
                        onChange={(e) =>
                          handleMultiChoiceChange(
                            question.id,
                            option.id,
                            e.target.checked
                          )
                        }
                      />
                      <span>{option.optionText}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.questionType === "YES_NO" && (
                <div style={styles.optionGroup}>
                  <label style={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id]?.boolValue === true}
                      onChange={() => handleYesNoChange(question.id, true)}
                    />
                    <span>Evet</span>
                  </label>
                  <label style={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={answers[question.id]?.boolValue === false}
                      onChange={() => handleYesNoChange(question.id, false)}
                    />
                    <span>Hayir</span>
                  </label>
                </div>
              )}

              {question.questionType === "RATING" && (
                <div style={styles.ratingGroup}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      style={{
                        ...styles.ratingButton,
                        ...(answers[question.id]?.ratingValue === value
                          ? styles.ratingButtonActive
                          : {}),
                      }}
                      onClick={() => handleRatingChange(question.id, value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={styles.submitArea}>
            <button
              style={styles.submitButton}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Gonderiliyor..." : "Anketi Gonder"}
            </button>
          </div>

          {message && <p style={styles.message}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    height: "84px",
    backgroundColor: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
  },
  brandText: {
    fontSize: "20px",
    fontWeight: 800,
    color: COLORS.primary,
  },
  topButton: {
    border: "none",
    borderRadius: "10px",
    backgroundColor: COLORS.orange,
    color: "#fff",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  contentArea: {
    padding: "24px 16px 40px",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
  },
  mainCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
  },
  title: {
    margin: "0 0 8px",
    color: COLORS.primary,
  },
  description: {
    margin: 0,
    color: COLORS.text,
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: 700,
    color: COLORS.text,
  },
  input: {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
  },
  questionCard: {
    backgroundColor: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
  },
  questionTitle: {
    marginTop: 0,
    marginBottom: "14px",
    color: COLORS.text,
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "12px 14px",
    resize: "vertical",
  },
  optionGroup: {
    display: "grid",
    gap: "10px",
  },
  optionLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: COLORS.text,
  },
  ratingGroup: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  ratingButton: {
    border: `1px solid ${COLORS.border}`,
    borderRadius: "10px",
    backgroundColor: "#fff",
    color: COLORS.text,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  ratingButtonActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
    color: "#fff",
  },
  image: {
    width: "100%",
    maxHeight: "260px",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "14px",
  },
  video: {
    width: "100%",
    maxHeight: "360px",
    borderRadius: "12px",
    marginBottom: "14px",
    backgroundColor: "#000000",
  },
  videoFrame: {
    width: "100%",
    minHeight: "360px",
    border: "none",
    borderRadius: "12px",
    marginBottom: "14px",
    backgroundColor: "#000000",
  },
  mediaFallbackText: {
    marginTop: 0,
    marginBottom: "14px",
    color: COLORS.text,
    backgroundColor: "#F8FAFC",
    border: `1px solid ${COLORS.border}`,
    borderRadius: "12px",
    padding: "12px 14px",
  },
  submitArea: {
    display: "flex",
    justifyContent: "center",
    marginTop: "24px",
  },
  submitButton: {
    border: "none",
    borderRadius: "12px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    padding: "14px 22px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    textAlign: "center",
    fontWeight: 700,
    color: COLORS.primary,
  },
};

export default SurveyFillPage;
