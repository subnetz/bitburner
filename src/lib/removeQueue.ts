import { NS } from '../..';
export async function main(ns: NS) {
	const data = ns.flags([
		['server', ''],
		['pids', ''],
	]);
	let pids = JSON.parse(String(data.pids));
	pids.forEach((pid) => {
		ns.kill(pid);
	});
	ns.tprintf('killed pid(s): ' + pids.join(', '));
}
