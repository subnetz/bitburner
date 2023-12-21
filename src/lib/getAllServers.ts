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

export function getServerPath(ns: NS, hostname: string): string[] {
	let toVisit: { hostname: string; path: string[] }[] = [
		{ hostname: 'home', path: [] },
	];
	let visited: { hostname: string; path: string[] }[] = [];

	while (toVisit.length > 0) {
		let server: { hostname: string; path: string[] } = toVisit.pop()!;
		if (!server) continue;
		if (server.hostname == hostname) return server.path;

		if (visited.find((vis) => vis.hostname == server.hostname)) continue;

		let results: string[] = ns.scan(server.hostname);
		visited.push(server);

		results.forEach((result) => {
			if (!visited.find((vis) => vis.hostname == result)) {
				let toVisitServer = {
					hostname: result,
					path: server.path.slice(),
				};
				toVisitServer.path.push(result);

				toVisit.push(toVisitServer);
			}
		});
	}
	return [];
}
