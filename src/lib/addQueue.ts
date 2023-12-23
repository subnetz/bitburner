import { NS, AutocompleteData, Server } from '../..';
import { getAllServers } from '/lib/getAllServers';

let args;
let weakenFactor = 0.05;
let growFactor = 0.004;
let hackFactor = 0.002;

export async function main(ns: NS) {
	ns.disableLog('ALL');
	args = ns.flags([
		['delay', 500],
		['target', 'n00dles'],
		['nuke', false],
		['prepare', false],
		['hack', false],
		['auto', false],
	]);
	let servers = getAllServers(ns);
	let operation: Function | undefined = undefined;
	if (args.nuke) {
		operation = nukeTarget;
	} else if (args.prepare) {
		operation = prepareTarget;
	} else if (args.hack) {
		operation = hackTarget;
	}
	if (operation === undefined || args.auto) {
		operation = autoOperation(ns, servers, args.target);
	}
	let res = operation(ns, servers, args.target);
	if (res.length) ns.toast(res, 'error', 5000);
}

function autoOperation(ns: NS, servers: Server[], hostname: string): Function {
	let targetServer = servers.find((server) => server.hostname == hostname);
	if (!targetServer?.hasAdminRights) {
		return nukeTarget;
	} else if (
		targetServer.moneyAvailable != targetServer.moneyMax ||
		targetServer.hackDifficulty != targetServer.minDifficulty
	) {
		return prepareTarget;
	} else if (
		targetServer.hasAdminRights &&
		targetServer.moneyAvailable == targetServer.moneyMax &&
		targetServer.hackDifficulty == targetServer.minDifficulty
	) {
		return hackTarget;
	} else {
		return (ns: NS, servers: Server[], hostname: string): string => {
			return `Don't know what to do`;
		};
	}
}

export function autocomplete(data: AutocompleteData) {
	return data.servers;
}

function nukeTarget(ns: NS, servers: Server[], hostname: string): string {
	let targetServer = servers.find((server) => server.hostname == hostname);
	if (!targetServer) return `Server "${hostname}" not found`;
	if (targetServer.hasAdminRights)
		return `Server "${hostname}" already nuked`;

	let programsAvailable = [
		'BruteSSH.exe',
		'FTPCrack.exe',
		'relaySMTP.exe',
		'HTTPWorm.exe',
		'SQLInject.exe',
	].filter((program) => ns.fileExists(program)).length;
	let programsNeeded = targetServer.numOpenPortsRequired || 0;

	if (programsAvailable < programsNeeded)
		return `Server "${hostname}" needs ${programsNeeded} open Ports (you can only open ${programsAvailable})`;

	if (ns.getHackingLevel() < (targetServer.requiredHackingSkill || 0)) {
		return `Server "${hostname}" needs ${
			targetServer.requiredHackingSkill
		} hacking skill (you only have ${ns.getHackingLevel()})`;
	}

	[
		ns.brutessh,
		ns.ftpcrack,
		ns.relaysmtp,
		ns.httpworm,
		ns.sqlinject,
		ns.nuke,
	].forEach((program) => {
		try {
			program(hostname);
		} catch (e) {}
	});
	return ``;
}

function prepareTarget(ns: NS, servers: Server[], hostname: string): string {
	let targetServer = servers.find((server) => server.hostname == hostname);
	if (!targetServer) return `Server "${hostname}" not found`;
	let ramNeeded = 0;
	let moneyAvailable =
		targetServer.moneyAvailable! < 10 ? 10 : targetServer.moneyAvailable;
	let moneyMax = targetServer.moneyMax! < 1 ? 1 : targetServer.moneyMax;
	let hackDifficulty = targetServer.hackDifficulty;
	let minDifficulty = targetServer.minDifficulty;
	let scriptRam_weaken = ns.getScriptRam('util/weaken.js');
	let scriptRam_grow = ns.getScriptRam('util/grow.js');
	if (!moneyMax) return `Server "${hostname}" has no money`;
	if (!moneyAvailable) return `Server "${hostname}" has no money remaining`;
	if (!hackDifficulty) return `Server "${hostname}" has no hack difficulty`;
	if (!minDifficulty) return `Server "${hostname}" has no minimum difficulty`;

	let growMultiplier = Math.max(moneyMax / moneyAvailable + 0.1, 2);
	let threads_grow = Math.ceil(ns.growthAnalyze(hostname, growMultiplier));
	let security_increase_grow = Math.ceil(threads_grow * growFactor);
	let threads_weaken_grow = Math.ceil(security_increase_grow / weakenFactor);
	let security_current = Math.ceil(hackDifficulty - minDifficulty);
	let threads_weaken_current = Math.ceil(security_current / weakenFactor);

	ramNeeded += scriptRam_grow * threads_grow;
	ramNeeded += scriptRam_weaken * threads_weaken_grow;
	ramNeeded += scriptRam_weaken * threads_weaken_current;
	// ramNeeded *= 2;

	//let myServers = servers.filter((server) => server.purchasedByPlayer);
	let myServers = servers
		.filter((server) => server.purchasedByPlayer)
		.reverse();
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
	let growWait = Math.floor(timeToWeaken - timeToGrow - args.delay);
	let now = Date.now();
	let pids: number[] = [];
	pids.push(
		ns.exec(
			'util/grow.js',
			host.hostname,
			threads_grow,
			'--server',
			hostname,
			'--delay',
			growWait,
			'--start',
			now,
			'--end',
			now + timeToWeaken
		),
		ns.exec(
			'util/weaken.js',
			host.hostname,
			threads_weaken_grow + threads_weaken_current,
			'--server',
			hostname,
			'--start',
			now,
			'--end',
			now + timeToWeaken
		)
	);
	if (!pids.every((a) => a != 0)) {
		pids.forEach((p) => ns.kill(p));
		return `Server "${host.hostname}" occupied (no free RAM)`;
	}

	// let prt = ns.getPortHandle(1);
	// prt.write(
	// 	JSON.stringify({
	// 		operation: 'prepare',
	// 		target: hostname,
	// 		timestamp: now,
	// 		finishTime: now + timeToWeaken,
	// 		pids: [
	// 			{ type: 'grow', pid: pid1 },
	// 			{ type: 'weaken', pid: pid2 },
	// 		],
	// 		threads: [
	// 			{ type: 'grow', threads: threads_grow },
	// 			{
	// 				type: 'weaken',
	// 				threads: threads_weaken_grow + threads_weaken_current,
	// 			},
	// 		],
	// 	})
	// );
	return ``;
}

function hackTarget(ns: NS, servers: Server[], hostname: string): string {
	let targetServer = servers.find((server) => server.hostname == hostname);
	if (!targetServer) return `Server "${hostname}" not found`;
	let ramNeeded = 0;
	let moneyFactor = 2;
	let moneyAvailable =
		targetServer.moneyAvailable! < 10 ? 10 : targetServer.moneyAvailable;
	let moneyMax = targetServer.moneyMax;
	let hackDifficulty = targetServer.hackDifficulty;
	let minDifficulty = targetServer.minDifficulty;
	let scriptRam_hack = ns.getScriptRam('util/hack.js');
	let scriptRam_weaken = ns.getScriptRam('util/weaken.js');
	let scriptRam_grow = ns.getScriptRam('util/grow.js');
	if (!moneyMax) return `Server "${hostname}" has no money`;
	if (!moneyAvailable) return `Server "${hostname}" has no money remaining`;
	if (!hackDifficulty) return `Server "${hostname}" has no hack difficulty`;
	if (!minDifficulty) return `Server "${hostname}" has no minimum difficulty`;

	let halfMoney = Math.floor(moneyAvailable / moneyFactor);
	// let growMultiplier = Math.ceil(
	// 	moneyMax / (moneyAvailable - halfMoney)
	// );
	let growMultiplier = moneyFactor + 0.5;

	let threads_hack = Math.floor(ns.hackAnalyzeThreads(hostname, halfMoney));
	let security_increase_hack = Math.ceil(threads_hack * hackFactor);
	let threads_weaken_hack = Math.ceil(security_increase_hack / weakenFactor);
	let threads_grow = Math.ceil(ns.growthAnalyze(hostname, growMultiplier));
	let security_increase_grow = Math.ceil(threads_grow * growFactor);
	let threads_weaken_grow = Math.ceil(security_increase_grow / weakenFactor);

	ramNeeded += scriptRam_hack * threads_hack;
	ramNeeded += scriptRam_weaken * threads_weaken_hack;
	ramNeeded += scriptRam_grow * threads_grow;
	ramNeeded += scriptRam_weaken * threads_weaken_grow;
	// ramNeeded *= 2;

	//let myServers = servers.filter((server) => server.purchasedByPlayer);
	let myServers = servers
		.filter((server) => server.purchasedByPlayer)
		.reverse();
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
	let timeToHack = ns.getHackTime(hostname);
	let timeToGrow = ns.getGrowTime(hostname);
	let timeToWeaken = ns.getWeakenTime(hostname);
	let hackWait = Math.floor(timeToWeaken - timeToHack - args.delay);
	let growWait = Math.floor(timeToWeaken - timeToGrow + args.delay);
	let weakenWait = args.delay * 2;
	let now = Date.now();
	let pids: number[] = [];
	pids.push(
		ns.exec(
			'util/hack.js',
			host.hostname,
			threads_hack,
			'--server',
			hostname,
			'--delay',
			hackWait,
			'--start',
			now,
			'--end',
			now + timeToWeaken + weakenWait
		),
		ns.exec(
			'util/weaken.js',
			host.hostname,
			threads_weaken_hack,
			'--server',
			hostname,
			'--start',
			now,
			'--end',
			now + timeToWeaken + weakenWait
		),
		ns.exec(
			'util/grow.js',
			host.hostname,
			threads_grow,
			'--server',
			hostname,
			'--delay',
			growWait,
			'--start',
			now,
			'--end',
			now + timeToWeaken + weakenWait
		),
		ns.exec(
			'util/weaken.js',
			host.hostname,
			threads_weaken_grow,
			'--server',
			hostname,
			'--delay',
			weakenWait,
			'--start',
			now,
			'--end',
			now + timeToWeaken + weakenWait
		)
	);
	if (!pids.every((a) => a != 0)) {
		pids.forEach((p) => ns.kill(p));
		return `Server "${host.hostname}" occupied (no free RAM)`;
	}
	// let prt = ns.getPortHandle(1);
	// prt.write(
	// 	JSON.stringify({
	// 		operation: 'hack',
	// 		target: hostname,
	// 		timestamp: now,
	// 		finishTime: now + timeToWeaken + weakenWait,
	// 		pids: [
	// 			{ type: 'hack', pid: pid1 },
	// 			{ type: 'weaken', pid: pid2 },
	// 			{ type: 'grow', pid: pid3 },
	// 			{ type: 'weaken', pid: pid4 },
	// 		],
	// 	})
	// );
	return ``;
}
