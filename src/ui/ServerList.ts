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
let hackingSkill: number;

export async function main(ns: NS) {
	ns.disableLog('ALL');
	ns.clearLog();
	anchor = await html.locateTailWindow(ns);
	buttons = createButtons(ns);
	table = createTable();
	hackingSkill = ns.getHackingLevel();

	ns.atExit(quit);

	let servers = getAllServers(ns);
	createTableEntries(ns, table, servers);

	while (await ns.asleep(8888)) {
		refreshListData(ns);
	}
}

function refreshListData(ns) {
	let servers = getAllServers(ns);
	let stopAll = false;
	if (hackingSkill != ns.getHackingLevel()) {
		stopAll = true;
		hackingSkill = ns.getHackingLevel();
	}
	servers.forEach((server) => {
		let node = table.querySelector(
			'.row._' + server.hostname.replaceAll('.', '_')
		);
		let c = node.childNodes;
		c[0].textContent = server.hasAdminRights ? '🟢' : '🟥';
		c[1].textContent = server.backdoorInstalled ? '🟢' : '🟥';
		c[4].textContent = '$' + ns.formatNumber(server.moneyAvailable);
		c[5].textContent = '$' + ns.formatNumber(server.moneyMax);
		c[6].textContent = Math.ceil(server.hackDifficulty! * 100) / 100;
		c[7].textContent = Math.ceil(server.minDifficulty! * 100) / 100;
		c[8].textContent = formatTime(ns.getWeakenTime(server.hostname));
		c[0].style.cursor = server.hasAdminRights ? 'default' : 'pointer';
		c[6].style.color =
			server.hackDifficulty == server.minDifficulty ? '#0F0' : 'red';
		c[8].style.color =
			server.hackDifficulty == server.minDifficulty ? '#0F0' : 'red';
		c[4].style.color =
			server.moneyAvailable == server.moneyMax ? '#FA0' : '#940';
		if (stopAll) {
			if (c[2].textContent == '⛔') {
				c[2].click();
			}
		}
	});
	setRowDisplay(ns);
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
	servers.forEach((server) => {
		server['weakenTime'] = ns.getWeakenTime(server.hostname);
		server['moneyPerMS'] = server.moneyMax! / server['weakenTime'];
	});
	// servers.sort((a, b) => (a['moneyPerMS']! > b['moneyPerMS']! ? -1 : 1));
	servers.sort((a, b) => (a.moneyMax! > b.moneyMax! ? -1 : 1));
	let style = {
		color: 'white',
		textAlign: 'center',
		verticalAlign: 'middle',
		backgroundColor: '#333',
	};
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
		let hackit = html.createElement(
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
		);
		hackit.addEventListener('click', (e) => {
			let node = <HTMLElement>e.target;
			if (node.textContent == '▶️') {
				node.textContent = '⛔';
				let until = Date.now() + server['weakenTime'] - 10000;
				let interval = setInterval(() => {
					if (hackingSkill != ns.getHackingLevel()) {
						refreshListData(ns);
					} else {
						if (Date.now() < until) {
							ns.exec(
								'lib/addQueue.js',
								'home',
								1,
								'--hack',
								'--target',
								server.hostname
							);
						} else {
							node.click();
						}
					}
				}, 2000);
				node.setAttribute('id_interval', String(interval));
				(<HTMLElement>(
					node.nextElementSibling!.nextElementSibling!
				)).click();
			} else {
				node.textContent = '▶️';
				let id_interval = Number(node.getAttribute('id_interval'));
				clearInterval(id_interval);
				node.removeAttribute('id_interval');
			}
		});
		let sshit = html.createElement(
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
			server.hostname
		);
		sshit.addEventListener('click', (e) => {
			ns.exec('lib/ssh.js', 'home', 1, server.hostname);
		});
		let prepareit = html.createElement(
			'td',
			{
				style: {
					color:
						server.moneyAvailable == server.moneyMax
							? '#FA0'
							: '#940',
					textAlign: 'center',
					verticalAlign: 'middle',
					backgroundColor: '#333',
					cursor: 'pointer',
				},
			},
			'$' + ns.formatNumber(server.moneyAvailable!)
		);
		prepareit.addEventListener('click', (e) => {
			ns.exec(
				'lib/addQueue.js',
				'home',
				1,
				'--prepare',
				'--target',
				server.hostname
			);
		});
		let nukeit = html.createElement(
			'td',
			{
				style: style,
			},
			server.hasAdminRights ? '🟢' : '🟥'
		);
		if (!server.hasAdminRights) {
			nukeit.addEventListener(
				'click',
				(e) => {
					ns.exec(
						'lib/addQueue.js',
						'home',
						1,
						'--nuke',
						'--target',
						server.hostname
					);
					refreshListData(ns);
				},
				{ once: true }
			);
		}
		let child = html.createElement(
			'tr',
			{
				className: `row _${server.hostname.replaceAll('.', '_')}`,
				style: {
					display: display,
				},
			},
			nukeit,
			html.createElement(
				'td',
				{ style: style },
				server.backdoorInstalled ? '🟢' : '🟥'
			),
			hackit,
			sshit,
			prepareit,
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
				String(Math.ceil(server.hackDifficulty! * 100) / 100)
					.padEnd(3)
					.padStart(2)
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
				formatTime(server['weakenTime'])
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
	let refreshButton = html.createElement(
		'button',
		{
			type: 'button',
			id: 'refresh',
			style: {
				verticalAlign: 'middle',
				backgroundColor: '#333',
				borderRadius: '100%',
			},
		},
		'♻️'
	);
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
	refreshButton.addEventListener('click', (e) => {
		refreshListData(ns);
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
		refreshButton,
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
