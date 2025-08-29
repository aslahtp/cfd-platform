import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./lib/db";
import { ensureRedis, isRedisReady } from "./lib/redis";
import { startTradeStream } from "./lib/binance";
import { onTrade, tickFlush } from "./lib/aggregator";

async function main() {
	await connectDB();

	await ensureRedis();
	if (!isRedisReady()) {
		setInterval(() => { ensureRedis(); }, 5000);
	}

	const symbols = (process.env.SYMBOLS || "BTCUSD").split(",").map(s => s.trim().toUpperCase());

	startTradeStream(symbols, (t) => {
		onTrade(t.symbol, t.price, t.qty, t.ts).catch(() => {});
	});

	setInterval(() => {
		tickFlush(Date.now()).catch(() => {});
	}, 1000);

	const port = Number(process.env.PORT || 3002);
	import("http").then(http => {
		http.createServer((_, res) => {
			res.writeHead(200, { "Content-Type": "application/json" });
			res.end(JSON.stringify({ ok: true, redis: isRedisReady() }));
		}).listen(port, () => console.log(`price-poller up on ${port}`, symbols));
	});
}

main().catch(err => {
	console.error("fatal", err);
	process.exit(1);
});