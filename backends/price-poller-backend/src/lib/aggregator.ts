import { Candle } from "../models/Candle";
import { publishJson } from "./redis";

type Interval = "1m" | "5m" | "10m";

const INTERVAL_MS: Record<Interval, number> = {
  "1m": 60_000,
  "5m": 5 * 60_000,
  "10m": 10 * 60_000,
};

type Bucket = {
  startMs: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  quoteVolume: number;
  trades: number;
  lastClose?: number; // to carry forward
};

const buckets: Record<string, Record<Interval, Bucket | undefined>> = {};
const lastCloseMap: Record<string, number | undefined> = {};

function floorTo(ms: number, width: number) {
  return Math.floor(ms / width) * width;
}

function publish(symbol: string, iv: Interval, doc: object) {
  publishJson(`candles:${symbol}:${iv}`, doc);
}

async function flush(symbol: string, iv: Interval, b: Bucket) {
  const doc = {
    symbol,
    interval: iv,
    ts: b.startMs,
    open: b.open,
    high: b.high,
    low: b.low,
    close: b.close,
    volume: b.volume,
    quoteVolume: b.quoteVolume,
    trades: b.trades,
  };
  try {
    console.log(
      "[db] upsert candle",
      symbol,
      iv,
      b.startMs,
      `vol=${b.volume}`,
      `trades=${b.trades}`
    );
    type UpdateResultLite = {
      matchedCount?: number;
      modifiedCount?: number;
      upsertedId?: unknown;
      upsertedCount?: number;
    };
    const res = await Candle.updateOne(
      { symbol, interval: iv, ts: b.startMs },
      { $set: doc },
      { upsert: true }
    );
    const r = res as UpdateResultLite;
    const matched = r.matchedCount;
    const modified = r.modifiedCount;
    const upserted = Boolean(
      r.upsertedId || (r.upsertedCount && r.upsertedCount > 0)
    );
    console.log(
      "[db] upsert result",
      symbol,
      iv,
      b.startMs,
      `matched=${matched}`,
      `modified=${modified}`,
      `upserted=${upserted}`
    );
  } catch (e) {
    console.warn(
      "[db] upsert failed",
      symbol,
      iv,
      b.startMs,
      (e as Error).message
    );
  }
  publish(symbol, iv, doc);
  lastCloseMap[symbol] = b.close;
}

export async function onTrade(
  symbol: string,
  price: number,
  qty: number,
  ts: number
) {
  const ivs: Interval[] = ["1m", "5m", "10m"];
  for (const iv of ivs) {
    const width = INTERVAL_MS[iv];
    const startMs = floorTo(ts, width);
    buckets[symbol] ||= { "1m": undefined, "5m": undefined, "10m": undefined };
    const cur = buckets[symbol][iv];

    if (!cur || cur.startMs !== startMs) {
      if (cur) await flush(symbol, iv, cur);
      const open = price;
      buckets[symbol][iv] = {
        startMs,
        open,
        high: price,
        low: price,
        close: price,
        volume: qty,
        quoteVolume: price * qty,
        trades: 1,
        lastClose: lastCloseMap[symbol],
      };
    } else {
      cur.high = Math.max(cur.high, price);
      cur.low = Math.min(cur.low, price);
      cur.close = price;
      cur.volume += qty;
      cur.quoteVolume += price * qty;
      cur.trades += 1;
    }
  }
}

// empty intervals
export async function tickFlush(nowMs: number) {
  const ivs: Interval[] = ["1m", "5m", "10m"];
  for (const symbol of Object.keys(buckets)) {
    for (const iv of ivs) {
      const width = INTERVAL_MS[iv];
      const cur = buckets[symbol][iv];
      if (!cur) {
        // carry forward
        continue;
      }
      const boundary = cur.startMs + width;
      if (nowMs >= boundary) {
        await flush(symbol, iv, cur);
        // create carry forward bucket
        const lc = lastCloseMap[symbol];
        const nextStart = floorTo(nowMs, width);
        buckets[symbol][iv] =
          lc !== undefined
            ? {
                startMs: nextStart,
                open: lc,
                high: lc,
                low: lc,
                close: lc,
                volume: 0,
                quoteVolume: 0,
                trades: 0,
              }
            : undefined;
      }
    }
  }
}
