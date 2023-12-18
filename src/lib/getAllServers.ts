import { NS, Server } from '../..';

export function getAllServers(ns: NS): Server[] {
	let toVisit: string[] = ['home'];
	let visited: string[] = [];

	while (toVisit.length > 0) {
		let server: string | undefined = toVisit.pop();
		if (!server) continue;

		if (visited.includes(server)) continue;

		let results: string[] = ns.scan(server);
		visited.push(server);

		results.forEach((result) => {
			if (!visited.includes(result)) {
				toVisit.push(result);
			}
		});
	}

	return visited.map((hostname: string) => ns.getServer(hostname));
}
