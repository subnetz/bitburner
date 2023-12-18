import { NS, BasicHGWOptions } from '../../index';

export async function main(ns: NS) {
	const data = ns.flags([
		['delay', 0],
		['server', 'n00dles'],
	]);
	await ns.weaken(String(data.server), {
		additionalMsec: Number(data.delay),
		// threads: 0,
		// stock: false,
	});
}
