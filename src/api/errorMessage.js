const DEFAULT_ERROR_MESSAGE = "Beklenmeyen bir hata oluştu.";
const TOO_MANY_REQUESTS_MESSAGE =
  "Çok fazla istek gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.";

const FIELD_LABELS = {
  startDate: "Ba\u015flang\u0131\u00e7 tarihi",
  endDate: "Biti\u015f tarihi",
  themeColor: "Tema rengi",
  backgroundColor: "Arka plan rengi",
  buttonColor: "Buton rengi",
  fontFamily: "Font",
  mediaUrl: "Medya URL",
  email: "E-posta",
  password: "Şifre",
  title: "Anket başlığı",
  questionText: "Soru",
  optionText: "Seçenek",
  respondentToken: "Katılımcı token",
  answers: "Cevap listesi",
  answerList: "Cevap listesi",
  responses: "Cevap listesi",
  targetCount: "Hedef kişi sayısı",
};

const FIELD_MESSAGE_TRANSLATIONS = {
  "startDate:Survey start date cannot be after end date":
    "Ba\u015flang\u0131\u00e7 tarihi biti\u015f tarihinden sonra olamaz.",
  "themeColor:Theme color must be a valid hex color":
    "Tema rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "backgroundColor:Background color must be a valid hex color":
    "Arka plan rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "buttonColor:Button color must be a valid hex color":
    "Buton rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "fontFamily:Font family is not allowed": "Bu font desteklenmiyor.",
  "mediaUrl:Media URL is not valid": "Medya URL ge\u00e7erli de\u011fil.",
  "email:Email is required": "E-posta alanı boş olamaz.",
  "email:Email must be valid": "Lütfen geçerli e-posta adresi giriniz.",
  "email:Invalid email format": "Lütfen geçerli e-posta adresi giriniz.",
  "email:must not be blank": "E-posta alanı boş olamaz.",
  "email:must not be empty": "E-posta alanı boş olamaz.",
  "password:Password is required": "Şifre alanı boş olamaz.",
  "password:must not be blank": "Şifre alanı boş olamaz.",
  "password:must not be empty": "Şifre alanı boş olamaz.",
  "title:Title is required": "Anket başlığı boş olamaz.",
  "title:Survey title is required": "Anket başlığı boş olamaz.",
  "title:must not be blank": "Anket başlığı boş olamaz.",
  "title:must not be empty": "Anket başlığı boş olamaz.",
  "questionText:Question is required": "Soru alanı boş olamaz.",
  "questionText:Question text is required": "Soru alanı boş olamaz.",
  "questionText:must not be blank": "Soru alanı boş olamaz.",
  "questionText:must not be empty": "Soru alanı boş olamaz.",
  "optionText:Option text is required": "Seçenek alanı boş olamaz.",
  "optionText:Option is required": "Seçenek alanı boş olamaz.",
  "optionText:must not be blank": "Seçenek alanı boş olamaz.",
  "optionText:must not be empty": "Seçenek alanı boş olamaz.",
  "respondentToken:Respondent token is required":
    "Katılımcı bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.",
  "respondentToken:must not be blank":
    "Katılımcı bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.",
  "respondentToken:must not be empty":
    "Katılımcı bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.",
  "answers:Answer list is required": "En az bir cevap gereklidir.",
  "answers:Answers are required": "En az bir cevap gereklidir.",
  "answers:At least one answer is required": "En az bir cevap gereklidir.",
  "answers:At least one answer is required.": "En az bir cevap gereklidir.",
  "answers:must not be empty": "En az bir cevap gereklidir.",
  "answers:must not be null": "En az bir cevap gereklidir.",
  "answerList:Answer list is required": "En az bir cevap gereklidir.",
  "answerList:At least one answer is required": "En az bir cevap gereklidir.",
  "answerList:must not be empty": "En az bir cevap gereklidir.",
  "responses:At least one answer is required": "En az bir cevap gereklidir.",
  "responses:must not be empty": "En az bir cevap gereklidir.",
  "targetCount:must be greater than or equal to 0":
    "Hedef kişi sayısı negatif olamaz.",
  "targetCount:must be greater than 0":
    "Hedef kişi sayısı 0'dan büyük olmalıdır.",
};

const MESSAGE_TRANSLATIONS = {
  "Survey has not started yet": "Anket hen\u00fcz ba\u015flamad\u0131.",
  "Survey has ended": "Anketin s\u00fcresi doldu.",
  "Survey is not active": "Anket aktif de\u011fil.",
  "Survey start date cannot be after end date":
    "Ba\u015flang\u0131\u00e7 tarihi biti\u015f tarihinden sonra olamaz.",
  "Theme color must be a valid hex color":
    "Tema rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "Background color must be a valid hex color":
    "Arka plan rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "Button color must be a valid hex color":
    "Buton rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "Font family is not allowed": "Bu font desteklenmiyor.",
  "Media URL is not valid": "Medya URL ge\u00e7erli de\u011fil.",
  "Email is required": "E-posta alanı boş olamaz.",
  "Email must not be blank": "E-posta alanı boş olamaz.",
  "Email must not be empty": "E-posta alanı boş olamaz.",
  "Email must be valid": "Lütfen geçerli e-posta adresi giriniz.",
  "Invalid email format": "Lütfen geçerli e-posta adresi giriniz.",
  "Password is required": "Şifre alanı boş olamaz.",
  "Invalid credentials": "E-posta veya şifre hatalı.",
  "Survey already submitted": "Bu anket daha önce gönderilmiş.",
  "This survey has already been submitted": "Bu anket daha önce gönderilmiş.",
  "Response already submitted": "Bu anket daha önce gönderilmiş.",
  "Already submitted": "Bu anket daha önce gönderilmiş.",
  "Title is required": "Anket başlığı boş olamaz.",
  "Survey title is required": "Anket başlığı boş olamaz.",
  "Question is required": "Soru alanı boş olamaz.",
  "Question text is required": "Soru alanı boş olamaz.",
  "Option text is required": "Seçenek alanı boş olamaz.",
  "Option is required": "Seçenek alanı boş olamaz.",
  "Respondent token is required":
    "Katılımcı bilgisi eksik. Lütfen sayfayı yenileyip tekrar deneyin.",
  "Answer list is required": "En az bir cevap gereklidir.",
  "Answers are required": "En az bir cevap gereklidir.",
  "At least one answer is required": "En az bir cevap gereklidir.",
  "At least one answer is required.": "En az bir cevap gereklidir.",
  "must be greater than or equal to 0": "0 veya daha büyük olmalıdır.",
  "must be greater than 0": "0'dan büyük olmalıdır.",
  "Bad Request": "Geçersiz istek.",
};

function normalizeMessageKey(message) {
  return message.trim().replace(/\.$/, "").toLowerCase();
}

const NORMALIZED_MESSAGE_TRANSLATIONS = {
  "survey has not started yet": "Anket hen\u00fcz ba\u015flamad\u0131.",
  "survey has ended": "Anketin s\u00fcresi doldu.",
  "survey is not active": "Anket aktif de\u011fil.",
  "survey start date cannot be after end date":
    "Ba\u015flang\u0131\u00e7 tarihi biti\u015f tarihinden sonra olamaz.",
  "theme color must be a valid hex color":
    "Tema rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "background color must be a valid hex color":
    "Arka plan rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "button color must be a valid hex color":
    "Buton rengi ge\u00e7erli bir hex renk olmal\u0131d\u0131r.",
  "font family is not allowed": "Bu font desteklenmiyor.",
  "media url is not valid": "Medya URL ge\u00e7erli de\u011fil.",
  "email is required": "E-posta alanı boş olamaz.",
  "email must not be blank": "E-posta alanı boş olamaz.",
  "email must not be empty": "E-posta alanı boş olamaz.",
  "email must be valid": "Lütfen geçerli e-posta adresi giriniz.",
  "invalid email format": "Lütfen geçerli e-posta adresi giriniz.",
  "invalid credentials": "E-posta veya şifre hatalı.",
  "survey already submitted": "Bu anket daha önce gönderilmiş.",
  "this survey has already been submitted": "Bu anket daha önce gönderilmiş.",
  "response already submitted": "Bu anket daha önce gönderilmiş.",
  "already submitted": "Bu anket daha önce gönderilmiş.",
  "at least one answer is required": "En az bir cevap gereklidir.",
};

function getFieldKey(fieldPath) {
  return fieldPath
    .trim()
    .replace(/\[\d+\]/g, "")
    .split(".")
    .filter(Boolean)
    .at(-1);
}

function translateMessageText(message) {
  return (
    MESSAGE_TRANSLATIONS[message] ||
    NORMALIZED_MESSAGE_TRANSLATIONS[normalizeMessageKey(message)] ||
    message
  );
}

function translateApiErrorItem(item) {
  const [field, ...messageParts] = item.split(":");

  if (messageParts.length === 0) {
    return translateMessageText(item);
  }

  const fieldKey = getFieldKey(field);
  const originalMessage = messageParts.join(":").trim();
  const translatedFieldMessage =
    FIELD_MESSAGE_TRANSLATIONS[`${fieldKey}:${originalMessage}`];

  if (translatedFieldMessage) {
    return translatedFieldMessage;
  }

  const translatedField = FIELD_LABELS[fieldKey] || field.trim();
  const translatedMessage = translateMessageText(originalMessage);

  return `${translatedField}: ${translatedMessage}`;
}

export function getApiErrorMessage(error, fallbackMessage = DEFAULT_ERROR_MESSAGE) {
  if (error?.response?.status === 429) {
    return TOO_MANY_REQUESTS_MESSAGE;
  }

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
