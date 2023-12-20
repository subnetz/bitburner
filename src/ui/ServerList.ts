import { NS } from '../..';
import { getAllServers } from '/lib/getAllServers';
import { doc, win } from '/lib/html';
import * as html from 'lib/html';

let anchor;
export async function main(ns: NS) {
	ns.disableLog('ALL');
	anchor = await html.locateTerminalWindow(ns);
	let servers = getAllServers(ns);
	if (anchor) {
		console.log(anchor);
		servers.forEach((server) => {
			anchor.appendChild(
				html.createElement(
					'div',
					{ style: { cursor: 'pointer', color: 'red' } },
					html.createElement('span', null, server.hostname)
				)
			);
		});
	}
}
