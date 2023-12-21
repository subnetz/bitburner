import { NS } from '../..';
import { getAllServers } from '/lib/getAllServers';

export async function main(ns: NS) {
	let fileList = [
		'lib/getAllServers.js',
		'lib/ssh.js',
		'lib/ll.js',
		'lib/remoteWhere.js',
		'lib/rmrf.js',
	];

	let servers = getAllServers(ns);
	servers.forEach((server) => {
		ns.scp(fileList, server.hostname, 'home');
	});
}
