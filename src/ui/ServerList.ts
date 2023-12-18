import { NS } from '../..';
import { getAllServers } from '/lib/getAllServers';

export async function main(ns: NS) {
	let servers = getAllServers(ns);
	servers.forEach((server) => {
		ns.tprint(server.hostname);
	});
}
