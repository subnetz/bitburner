import { NS, Server } from '../..';
import { getAllServers } from '/lib/getAllServers';
import { formatTime } from '/lib/formatTime';
import * as html from 'lib/html';

let anchor;
let buttons;
let table;
let root: boolean = true;
let todo: boolean;
let purchased: boolean;
let nomoney: boolean;

export async function main(ns: NS) {
	ns.disableLog('ALL');
	ns.clearLog();
	anchor = await html.locateTailWindow(ns);
	buttons = createButtons(ns);
	table = createTable();

	ns.atExit(quit);

	let servers = getAllServers(ns);
	createTableEntries(ns, table, servers);

	while (await ns.asleep(1000)) {}
}

function setRowDisplay(ns) {
	let hackingSkill = ns.getHackingLevel();
	let servers = getAllServers(ns);
	servers.forEach((server) => {
		let display = 'table-row';
		if (!purchased && server.purchasedByPlayer) {
			display = 'none';
		} else if (root && !server.hasAdminRights) {
			if (
				todo &&
				!server.hasAdminRights &&
				hackingSkill > (server.requiredHackingSkill || 0)
			) {
			} else {
				display = 'none';
			}
		} else if (!nomoney && !server.moneyMax && !server.purchasedByPlayer) {
			display = 'none';
		}
		let node = table.querySelector(
			'.row._' + server.hostname.replaceAll('.', '_')
		);
		node.style.display = display;
	});
}

////✅🟩🟥🔴🟢❎❌☑️❇️▶️
function createTableEntries(ns: NS, table: HTMLElement, servers: Server[]) {
	servers.sort((a, b) => (a.moneyMax! > b.moneyMax! ? -1 : 1));
	let style = {
		color: 'white',
		textAlign: 'center',
		verticalAlign: 'middle',
		backgroundColor: '#333',
	};
	let hackingSkill = ns.getHackingLevel();
	servers.forEach((server) => {
		let display = 'table-row';
		if (!purchased && server.purchasedByPlayer) {
			display = 'none';
		} else if (root && !server.hasAdminRights) {
			if (
				todo &&
				!server.hasAdminRights &&
				hackingSkill > (server.requiredHackingSkill || 0)
			) {
			} else {
				display = 'none';
			}
		} else if (!nomoney && !server.moneyMax && !server.purchasedByPlayer) {
			display = 'none';
		}
		let child = html.createElement(
			'tr',
			{
				className: `row _${server.hostname.replaceAll('.', '_')} ${
					server.purchasedByPlayer ? 'purchased' : ''
				} ${server.hasAdminRights ? 'root' : ''} ${
					server.moneyMax ? '' : 'nomoney'
				} ${
					hackingSkill >= (server.requiredHackingSkill || 0) &&
					!server.hasAdminRights
						? 'hackable'
						: ''
				}`,
				style: {
					display: display,
				},
			},
			html.createElement(
				'td',
				{
					style: style,
				},
				server.hasAdminRights ? '🟢' : '🟥'
			),
			html.createElement(
				'td',
				{ style: style },
				server.backdoorInstalled ? '🟢' : '🟥'
			),
			html.createElement(
				'td',
				{
					style: {
						color: 'white',
						textAlign: 'center',
						verticalAlign: 'middle',
						backgroundColor: '#333',
						cursor: 'pointer',
					},
				},
				'▶️'
			),
			html.createElement('td', { style: style }, server.hostname),
			html.createElement(
				'td',
				{
					style: {
						color: '#FA0',
						textAlign: 'center',
						verticalAlign: 'middle',
						backgroundColor: '#333',
					},
				},
				'$' + ns.formatNumber(server.moneyAvailable!)
			),
			html.createElement(
				'td',
				{
					style: {
						color: '#FA0',
						textAlign: 'center',
						verticalAlign: 'middle',
						backgroundColor: '#333',
					},
				},
				'$' + ns.formatNumber(server.moneyMax!)
			),
			html.createElement(
				'td',
				{
					style: {
						color:
							server.hackDifficulty == server.minDifficulty
								? '#0F0'
								: 'red',
						textAlign: 'center',
						verticalAlign: 'middle',
						backgroundColor: '#333',
					},
				},
				Math.ceil(server.hackDifficulty! * 100) / 100
			),
			html.createElement(
				'td',
				{ style: style },
				Math.ceil(server.minDifficulty! * 100) / 100
			),
			html.createElement(
				'td',
				{
					style: {
						color:
							server.hackDifficulty == server.minDifficulty
								? '#0F0'
								: 'red',
						textAlign: 'center',
						verticalAlign: 'middle',
						backgroundColor: '#333',
					},
				},
				formatTime(ns.getWeakenTime(server.hostname))
			)
		);
		table.appendChild(child);
	});
}

function quit() {
	if (table) table.remove();
	if (buttons) buttons.remove();
}

function createTable(): HTMLElement {
	let table: HTMLElement = html.createTable();
	let header: HTMLElement = html.createTableHeader(
		['r', 'b', 'h', 'hostname', 'cur', 'max', 'cur', 'min', 'time'],
		{
			textAlign: 'center',
			verticalAlign: 'middle',
			color: 'yellow',
			backgroundColor: '#333',
		}
	);
	table.appendChild(header);
	anchor.appendChild(table);
	return table;
}

function createButtons(ns): HTMLElement {
	let labelStyle = {
		color: 'white',
		fontFamily: 'Segoe UI',
		verticalAlign: 'bottom',
	};
	let rootNode = html.createElement('input', {
		type: 'checkbox',
		id: 'hasAdmin',
		style: { verticalAlign: 'middle' },
		checked: !!root,
	});
	let hackable = html.createElement('input', {
		type: 'checkbox',
		id: 'isHackable',
		style: { verticalAlign: 'middle' },
		checked: !!todo,
	});
	let purchasedNode = html.createElement('input', {
		type: 'checkbox',
		id: 'isPurchased',
		style: { verticalAlign: 'middle' },
		checked: !!purchased,
	});
	let hasMoney = html.createElement('input', {
		type: 'checkbox',
		id: 'hasMoney',
		style: { verticalAlign: 'middle' },
		checked: !!nomoney,
	});
	rootNode.addEventListener('change', (e) => {
		let target = <HTMLInputElement>e.target;
		root = target.checked;
		setRowDisplay(ns);
	});
	hackable.addEventListener('change', (e) => {
		let target = <HTMLInputElement>e.target;
		todo = target.checked;
		setRowDisplay(ns);
	});
	purchasedNode.addEventListener('change', (e) => {
		let target = <HTMLInputElement>e.target;
		purchased = target.checked;
		setRowDisplay(ns);
	});
	hasMoney.addEventListener('change', (e) => {
		let target = <HTMLInputElement>e.target;
		nomoney = target.checked;
		setRowDisplay(ns);
	});
	let div: HTMLElement = html.createElement(
		'div',
		{
			style: {
				display: 'flex',
				justifyContent: 'space-evenly',
				position: 'absolute',
				width: '100%',
				bottom: '-29px',
				backgroundColor: '#333',
				border: '1px solid black',
				borderRadius: '8px',
			},
		},
		html.createElement(
			'div',
			undefined,
			rootNode,
			html.createElement(
				'label',
				{ for: 'hasAdmin', style: labelStyle },
				'root'
			)
		),
		html.createElement(
			'div',
			undefined,
			hackable,
			html.createElement(
				'label',
				{ for: 'isHackable', style: labelStyle },
				'todo'
			)
		),
		html.createElement(
			'div',
			undefined,
			purchasedNode,
			html.createElement(
				'label',
				{ for: 'isPurchased', style: labelStyle },
				'servers'
			)
		),
		html.createElement(
			'div',
			undefined,
			hasMoney,
			html.createElement(
				'label',
				{ for: 'hasMoney', style: labelStyle },
				'money'
			)
		)
	);
	anchor.appendChild(div);

	return div;
}
