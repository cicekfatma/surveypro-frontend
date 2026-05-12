const DEFAULT_ERROR_MESSAGE = "Beklenmeyen bir hata oluştu.";

const FIELD_LABELS = {
  email: "E-posta",
  password: "Şifre",
  title: "Anket başlığı",
  questionText: "Soru",
  respondentToken: "Katılımcı token",
  answers: "Cevap listesi",
  targetCount: "Hedef kişi sayısı",
};

const FIELD_MESSAGE_TRANSLATIONS = {
  "email:Email is required": "E-posta alanı boş olamaz.",
  "email:Email must be valid": "Lütfen geçerli e-posta adresi giriniz.",
  "email:Invalid email format": "Lütfen geçerli e-posta adresi giriniz.",
  "email:must not be blank": "E-posta alanı boş olamaz.",
  "email:must not be empty": "E-posta alanı boş olamaz.",
  "password:Password is required": "Şifre alanı boş olamaz.",
  "password:must not be blank": "Şifre alanı boş olamaz.",
  "password:must not be empty": "Şifre alanı boş olamaz.",
};

const MESSAGE_TRANSLATIONS = {
  "Email is required": "E-posta alanı boş olamaz.",
  "Email must be valid": "Lütfen geçerli e-posta adresi giriniz.",
  "Invalid email format": "Lütfen geçerli e-posta adresi giriniz.",
  "Password is required": "Şifre alanı boş olamaz.",
  "Invalid credentials": "E-posta veya şifre hatalı.",
  "Survey title is required": "Anket başlığı zorunludur.",
  "Question is required": "Soru zorunludur.",
  "Question text is required": "Soru zorunludur.",
  "Respondent token is required": "Katılımcı token zorunludur.",
  "Answer list is required": "Cevap listesi zorunludur.",
  "Answers are required": "Cevap listesi zorunludur.",
  "must be greater than or equal to 0": "0 veya daha büyük olmalıdır.",
  "must be greater than 0": "0'dan büyük olmalıdır.",
  "Bad Request": "Geçersiz istek.",
};

function translateMessageText(message) {
  return MESSAGE_TRANSLATIONS[message] || message;
}

function translateApiErrorItem(item) {
  const [field, ...messageParts] = item.split(":");

  if (messageParts.length === 0) {
    return translateMessageText(item);
  }

  const trimmedField = field.trim();
  const originalMessage = messageParts.join(":").trim();
  const translatedFieldMessage =
    FIELD_MESSAGE_TRANSLATIONS[`${trimmedField}:${originalMessage}`];

  if (translatedFieldMessage) {
    return translatedFieldMessage;
  }

  const translatedField = FIELD_LABELS[trimmedField] || trimmedField;
  const translatedMessage = translateMessageText(originalMessage);

  return `${translatedField}: ${translatedMessage}`;
}

export function getApiErrorMessage(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallbackMessage ||
    DEFAULT_ERROR_MESSAGE
  );
}

export function splitApiErrorMessage(message) {
  return String(message || DEFAULT_ERROR_MESSAGE)
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getApiErrorMessages(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  return splitApiErrorMessage(getApiErrorMessage(error, fallbackMessage)).map(
    translateApiErrorItem
  );
}

export function getDisplayErrorMessages(message) {
  return splitApiErrorMessage(message).map(translateApiErrorItem);
}
