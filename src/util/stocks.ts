import { NS } from '../..';
import { colors } from '/lib/color';

export async function main(ns: NS) {
	ns.disableLog('ALL');
	let stock = ns.stock;
	let sym = stock.getSymbols();
	while (await stock.nextUpdate()) {
		ns.clearLog();
		sym.forEach((s) => {
			let forecast = stock.getForecast(s);
			let col = forecast > 0.5 ? colors.green : colors.red;
			ns.printf(
				`%s %s%s%s %s %s$%s $%s`,
				s.padEnd(7),
				col,
				ns.formatPercent(forecast).padEnd(8),
				colors.default,
				ns.formatPercent(stock.getVolatility(s)).padEnd(7),
				colors.yellow,
				ns.formatNumber(stock.getAskPrice(s)).padEnd(10),
				ns.formatNumber(stock.getBidPrice(s))
			);
		});
	}
}
