import { NS, AutocompleteData, Server } from '../..';
import { getAllServers } from '/lib/getAllServers';

let args;
let weakenFactor = 0.05;
let growFactor = 0.004;
let hackFactor = 0.002;

export async function main(ns: NS) {
	ns.disableLog('ALL');
	args = ns.flags([
		['delay', 0],
		['target', 'n00dles'],
		['operation', 'prepare'],
	]);
	let servers = getAllServers(ns);
	if (args.operation == 'prepare') {
		let res = prepareTarget(ns, servers, args.target);
		if (res.length) ns.toast(res, 'error', 5000);
	}
}

export function autocomplete(data: AutocompleteData) {
	return data.servers;
}

function prepareTarget(ns: NS, servers: Server[], hostname: string): string {
	let targetServer = servers.find((server) => server.hostname == hostname);
	if (!targetServer) return `Server "${hostname}" not found`;
	let ramNeeded = 0;
	let moneyFactor = 2;
	let moneyAvailable = targetServer.moneyAvailable;
	let moneyMax = targetServer.moneyMax;
	let hackDifficulty = targetServer.hackDifficulty;
	let minDifficulty = targetServer.minDifficulty;
	let scriptRam_weaken = ns.getScriptRam('util/weaken.js');
	let scriptRam_grow = ns.getScriptRam('util/grow.js');
	if (!moneyMax) return `Server "${hostname}" has no money`;
	if (!moneyAvailable) return `Server "${hostname}" has no money remaining`;
	if (!hackDifficulty) return `Server "${hostname}" has no hack difficulty`;
	if (!minDifficulty) return `Server "${hostname}" has no minimum difficulty`;

	let growMultiplier = Math.ceil(
		moneyMax / (moneyAvailable - moneyAvailable / moneyFactor)
	);

	let threads_grow = Math.ceil(ns.growthAnalyze(hostname, growMultiplier));
	let security_increase_grow = Math.ceil(threads_grow * growFactor);
	let threads_weaken_grow = Math.ceil(security_increase_grow / weakenFactor);
	let security_current = Math.ceil(
		(hackDifficulty - minDifficulty) / weakenFactor
	);
	let threads_weaken_current = Math.ceil(security_current / weakenFactor);

	ramNeeded += scriptRam_grow * threads_grow;
	ramNeeded += scriptRam_weaken * threads_weaken_grow;
	ramNeeded += scriptRam_weaken * threads_weaken_current;

	let myServers = servers.filter((server) => server.purchasedByPlayer);
	let host = myServers.find(
		(server) =>
			server.maxRam > ramNeeded &&
			ramNeeded < server.maxRam - server.ramUsed
	);
	if (!host) {
		return `All servers are fully occupied (no free RAM)`;
	}

	if (host.hostname != 'home') {
		ns.scp(
			['util/hack.js', 'util/weaken.js', 'util/grow.js'],
			host.hostname
		);
	}
	let timeToGrow = ns.getGrowTime(hostname);
	let timeToWeaken = ns.getWeakenTime(hostname);
	let growWait = Math.floor(timeToWeaken - timeToGrow - 500);
	let pid1 = ns.exec(
		'util/grow.js',
		host.hostname,
		threads_grow,
		'--server',
		hostname,
		'--delay',
		growWait
	);
	let pid2 = ns.exec(
		'util/weaken.js',
		host.hostname,
		threads_weaken_grow + threads_weaken_current,
		'--server',
		hostname
	);

	let prt = ns.getPortHandle(1);
	prt.write(
		JSON.stringify({
			operation: 'prepare',
			target: hostname,
			timestamp: Date.now(),
			finishTime: Date.now() + timeToWeaken,
			pids: [
				{ type: 'grow', pid: pid1 },
				{ type: 'weaken', pid: pid2 },
			],
			threads: [
				{ type: 'grow', threads: threads_grow },
				{
					type: 'weaken',
					threads: threads_weaken_grow + threads_weaken_current,
				},
			],
		})
	);
	return ``;
}
