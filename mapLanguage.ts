// Preserve road numbers and other non-name labels; replace name expressions only.
export function spanishNames(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  if ((value[0] === 'get' || value[0] === 'has') && typeof value[1] === 'string' && /^name(?:[:_].*)?$/.test(value[1])) {
    return value[0] === 'has' ? ['has','name'] : ['coalesce',['get','name:es'],['get','name_es'],['get','name'],['get','name:latin']];
  }
  // Bilingual local/English templates should become one Spanish-preferred name.
  if (JSON.stringify(value).includes('name:nonlatin')) return ['coalesce',['get','name:es'],['get','name_es'],['get','name'],['get','name:latin']];
  return value.map(spanishNames);
}
