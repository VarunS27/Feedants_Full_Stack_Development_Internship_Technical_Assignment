const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
  hi: ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्ट', 'नव', 'दिस'],
};

/** Indian digit grouping: 1,500 / 1,50,000 — matches the ₹ amounts in the design. */
export const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(
    Number(amount || 0)
  );
  return `₹ ${formatted}`;
};

/** "10 Aug 26" — the compact form used on the Important Dates card. */
export const formatShortDate = (iso, lang = 'en') => {
  if (!iso) return '—';
  const date = new Date(iso);
  const month = (MONTHS[lang] || MONTHS.en)[date.getMonth()];
  return `${date.getDate()} ${month} ${String(date.getFullYear()).slice(-2)}`;
};

/** "11:50 PM" */
export const formatTime = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${period}`;
};

export const pad = (value) => String(value).padStart(2, '0');

export const ordinalPosition = (position, lang = 'en') => {
  if (lang === 'hi') {
    const hindi = { 1: 'प्रथम', 2: 'द्वितीय', 3: 'तृतीय', 4: 'चतुर्थ', 5: 'पंचम', 6: 'षष्ठ' };
    return hindi[position] || `${position}वां`;
  }
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const value = position % 100;
  return position + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
};
