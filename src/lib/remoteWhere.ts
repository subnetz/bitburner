import { NS } from '../..';

export async function main(ns: NS) {
	ns.exec('lib/where.js', 'home', 1, ...ns.args);
}
