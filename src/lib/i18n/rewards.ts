import { Locale } from "./translations";

/**
 * Intelligent reward name translator for client notifications & push templates.
 * Ensures embedded {rewardName} inside French & Spanish sentences is localized
 * instead of displaying raw Moroccan Darija / Arabic terms like "قهوة فابور".
 */
export function getLocalizedRewardName(
  rewardName: string | null | undefined,
  locale: Locale
): string {
  if (!rewardName || !rewardName.trim()) {
    if (locale === "fr") return "votre récompense";
    if (locale === "es") return "tu recompensa";
    return "مكافأتك";
  }

  const raw = rewardName.trim();

  // If locale is Arabic, sanitize Darija slang "فابور" to standard Arabic "مجانية"
  if (locale === "ar") {
    return raw.replace(/فابور/g, "مجاناً").trim();
  }

  const lower = raw.toLowerCase();

  // 1. Coffee / Café
  if (/قهوة|كافي|coffee|café|espresso|اسبريسو/i.test(lower)) {
    return locale === "fr" ? "un café offert" : "un café gratis";
  }

  // 2. Cappuccino
  if (/كابتشينو|cappuccino/i.test(lower)) {
    return locale === "fr" ? "un cappuccino offert" : "un capuchino gratis";
  }

  // 3. Tea / Thé
  if (/شاي|أتاي|atay|the|thé|tea/i.test(lower)) {
    return locale === "fr" ? "un thé à la menthe offert" : "un té a la menta gratis";
  }

  // 4. Meal / Sandwich / Burger / Food
  if (/وجبة|سندويتش|برجر|بيتزا|طاجين|بلا|food|repas|plat|burger|pizza|sandwich/i.test(lower)) {
    return locale === "fr" ? "un repas offert" : "una comida gratis";
  }

  // 5. Haircut / Coupe / Coiffure
  if (/حلاقة|كوب|تصفيف|coiffure|haircut|coupe/i.test(lower)) {
    return locale === "fr" ? "une coupe offerte" : "un corte gratis";
  }

  // 6. Car Wash / Lavage
  if (/غسيل|لافاج|lavage|car wash|غسل/i.test(lower)) {
    return locale === "fr" ? "un lavage complet offert" : "un lavado completo gratis";
  }

  // 7. Dessert / Pâtisserie / Gâteau
  if (/تحلية|حلوى|حلوة|كيك|طارت|dessert|gateau|gâteau|patisserie|pâtisserie/i.test(lower)) {
    return locale === "fr" ? "un dessert offert" : "un postre gratis";
  }

  // 8. Juice / Smoothie / Drink
  if (/عصير|مشروب|سموذي|jus|juice|smoothie|boisson/i.test(lower)) {
    return locale === "fr" ? "une boisson offerte" : "una bebida gratis";
  }

  // 9. Breakfast / Petit Déjeuner
  if (/فطور|إفطار|كرواصة|كرواسون|petit déjeuner|breakfast/i.test(lower)) {
    return locale === "fr" ? "un petit-déjeuner offert" : "un desayuno gratis";
  }

  // 10. Discounts: 20%, 50%, etc.
  if (/20%|تخفيض.*20|خصم.*20/i.test(lower)) {
    return locale === "fr" ? "une remise de 20%" : "un descuento del 20%";
  }
  if (/50%|تخفيض.*50|خصم.*50/i.test(lower)) {
    return locale === "fr" ? "une remise de 50%" : "un descuento del 50%";
  }
  if (/%|خصم|تخفيض|reduction|réduction|descuento/i.test(lower)) {
    return locale === "fr" ? "une réduction exclusive" : "un descuento exclusivo";
  }

  // 11. Gift / Cadeau
  if (/هدية|مكافأة|cadeau|gift|premio/i.test(lower)) {
    return locale === "fr" ? "un cadeau exclusif" : "un regalo exclusivo";
  }

  // Fallback: If original was already in Latin characters, keep it cleanly
  if (/^[a-zA-Z0-9\s\-+&%]+$/.test(raw)) {
    return raw;
  }

  // Otherwise return localized generic noun with original sanitized
  const sanitizedArabic = raw.replace(/فابور/g, "مجاني");
  if (locale === "fr") return `votre récompense (${sanitizedArabic})`;
  return `tu recompensa (${sanitizedArabic})`;
}
