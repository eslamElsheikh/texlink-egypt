export interface SanitizeResult {
  cleanText: string;
  containsContactInfo: boolean;
  detectedTypes: string[];
  warningMessage?: string;
}

// Regex patterns for Egyptian mobile numbers and evasion tactics
const EGYPT_PHONE_REGEX =
  /(?:(?:\+?20|0020)?[\s.-]?)?(?:0?1[0125])[\s.-]?(?:\d[\s.-]?){8}/g;

// Spaced digit sequences (e.g. 0 1 0 1 2 3 4 5 6 7 8)
const SPspaced_DIGITS_REGEX = /(?:0\s*1\s*[0125])(?:\s*\d){8}/g;

// Email regex
const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// URL / Social links
const URL_REGEX =
  /(?:https?:\/\/|www\.)[^\s]+|(?:wa\.me|t\.me|facebook\.com|instagram\.com)\/[^\s]+/gi;

// Arabic spoken numbers evasion (e.g. زيرو عشره أو صفر واحد صفر)
const ARABIC_DIGIT_WORDS_REGEX =
  /(?:زيرو|صفر)[\s-]*(?:واحد|عشرة|عشره|حداشر|اتناشر|تلاتاشر|خمسة|خمسه|اتنين|تلاتة|تلاته|أربعة|اربعه)[\s-]*(?:واحد|صفر|اتنين|تلاتة|أربعة|خمسة|ستة|سبعة|تمانية|تسعة){6,}/gi;

export function sanitizeMessageContent(
  text: string,
  isContactAllowed: boolean
): SanitizeResult {
  if (isContactAllowed) {
    return {
      cleanText: text,
      containsContactInfo: false,
      detectedTypes: [],
    };
  }

  let cleanText = text;
  const detectedTypes: string[] = [];

  const MASK_REPLACEMENT =
    "[تم حجب بيانات التواصل لحماية المعاملة - تظهر تلقائياً بعد قبول عرض السعر]";

  // Check and mask Egyptian phone numbers
  if (EGYPT_PHONE_REGEX.test(cleanText) || SPspaced_DIGITS_REGEX.test(cleanText)) {
    detectedTypes.push("PHONE_NUMBER");
    cleanText = cleanText
      .replace(EGYPT_PHONE_REGEX, MASK_REPLACEMENT)
      .replace(SPspaced_DIGITS_REGEX, MASK_REPLACEMENT);
  }

  // Check and mask Emails
  if (EMAIL_REGEX.test(cleanText)) {
    detectedTypes.push("EMAIL");
    cleanText = cleanText.replace(EMAIL_REGEX, MASK_REPLACEMENT);
  }

  // Check and mask URLs / Social links
  if (URL_REGEX.test(cleanText)) {
    detectedTypes.push("URL");
    cleanText = cleanText.replace(URL_REGEX, MASK_REPLACEMENT);
  }

  // Check Arabic word digits
  if (ARABIC_DIGIT_WORDS_REGEX.test(cleanText)) {
    detectedTypes.push("ARABIC_WORDS");
    cleanText = cleanText.replace(ARABIC_DIGIT_WORDS_REGEX, MASK_REPLACEMENT);
  }

  const containsContactInfo = detectedTypes.length > 0;

  return {
    cleanText,
    containsContactInfo,
    detectedTypes,
    warningMessage: containsContactInfo
      ? "تنبيه: تم حجب أرقام الهواتف والروابط الخارجية تلقائياً. تظهر بيانات التواصل الرسمية للطرفين فور قبول عرض السعر."
      : undefined,
  };
}
