import WebSocket from "ws";
import dotenv from "dotenv";
import { toBinanceSpot, normalizeInternal } from "./symbols";
dotenv.config();

type TradeMsg = {
  stream: string;
  data: {
    e: "trade";
    s: string; // symbol BTCUSDT
    t: number; // trade id
    p: string; // price
    q: string; // quantity
    T: number; // ms
    m: boolean; // is buyer market maker
  };
};

export type Trade = {
  symbol: string; // BTCUSD
  price: number;
  qty: number;
  ts: number; // ms
};

export function startTradeStream(
  internalSymbols: string[],
  onTrade: (t: Trade) => void
) {
  const base = process.env.BINANCE_WS_BASE || "wss://stream.binance.com:9443";
  const streams = internalSymbols
    .map(toBinanceSpot)
    .map((s) => `${s}@trade`)
    .join("/");
  const url = `${base}/stream?streams=${streams}`;

  let ws: WebSocket | null = null;
  let closedByApp = false;
  let retryMs = 1000;

  const connect = () => {
    ws = new WebSocket(url);
    ws.on("open", () => {
      retryMs = 1000;
      // console.log("binance ws connected");
    });
    ws.on("message", (buf) => {
      try {
        const msg = JSON.parse(buf.toString()) as TradeMsg;
        if (msg?.data?.e !== "trade") return;
        const s = normalizeInternal(msg.data.s);
        const t: Trade = {
          symbol: s,
          price: Number(msg.data.p),
          qty: Number(msg.data.q),
          ts: msg.data.T,
        };
        onTrade(t);
      } catch (err) {
        console.error("binance trade error", err);
      }
    });
    ws.on("close", () => {
      if (closedByApp) return;
      setTimeout(connect, retryMs);
      retryMs = Math.min(retryMs * 2, 15000);
    });
    ws.on("error", () => {
      ws?.close();
    });
  };

  connect();

  return {
    close: () => {
      closedByApp = true;
      ws?.close();
    },
  };
}
