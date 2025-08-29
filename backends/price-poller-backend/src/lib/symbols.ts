export function toBinanceSpot(symbol: string) {
  const s = symbol.trim().toUpperCase();
  if (s.endsWith("USD")) return s.replace("USD", "USDT").toLowerCase();
  return s.toLowerCase();
}

export function normalizeInternal(symbol: string) {
  const s = symbol.toUpperCase();
  if (s.endsWith("USDT")) return s.replace("USDT", "USD");
  return s;
}
