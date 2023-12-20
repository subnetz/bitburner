import { NS, Server } from '../..';

export async function main(ns: NS) {
	ns.disableLog('ALL');

	let myServers = ns
		.getPurchasedServers()
		.map((server) => ns.getServer(server));
	let upgradeFirst: Server[] = myServers.filter(
		(server) => server.maxRam != ns.getPurchasedServerMaxRam()
	);
	if (upgradeFirst.length) {
		let server: Server = upgradeFirst.pop()!;
		let oldRam = ns.formatRam(server.maxRam);
		while (true) {
			let cost = ns.getPurchasedServerUpgradeCost(
				server.hostname,
				server.maxRam * 2
			);
			let money = ns.getServerMoneyAvailable('home');
			if (money > cost && cost != Infinity) {
				await ns.upgradePurchasedServer(
					server.hostname,
					server.maxRam * 2
				);
			} else {
				break;
			}
			await ns.asleep(250);
		}
		let newRam = ns.formatRam(ns.getServerMaxRam(server.hostname));
		ns.tprintf(
			'Upgraded RAM of %s from %s to %s',
			server.hostname,
			oldRam,
			newRam
		);
	} else {
		if (myServers.length == ns.getPurchasedServerLimit()) {
			ns.tprintf('Maximum amount of Servers reached!');
			return;
		}
		let newName = 'subnetz-' + myServers.length;
		ns.purchaseServer(newName, 2);
		while (true) {
			let server = ns.getServer(newName);
			let cost = ns.getPurchasedServerUpgradeCost(
				newName,
				server.maxRam * 2
			);
			let money = ns.getServerMoneyAvailable('home');
			if (money > cost && cost != Infinity) {
				await ns.upgradePurchasedServer(newName, server.maxRam * 2);
			} else {
				break;
			}
			await ns.asleep(250);
		}
		let newRam = ns.formatRam(ns.getServerMaxRam(newName));
		ns.tprintf('Bought a new Server named %s with %s', newName, newRam);
	}
}
