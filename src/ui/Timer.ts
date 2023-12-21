import { NS } from '../..';
import type React_Type from 'react';
import * as html from '/lib/html';
import { doc, win } from '/lib/html';
import { formatTime } from '/lib/formatTime';
declare var React: typeof React_Type;
let data;
let windowSize;
let anchor;
export async function main(ns: NS) {
	ns.disableLog('ALL');
	if (!data) data = {};
	windowSize = -1;

	anchor = await html.locateTailWindow(ns);
	ns.resizeTail(540, 61);
	ns.moveTail(2300, 2);
	ns.setTitle('Timer');
	let table = createTable();

	ns.atExit(quit);

	while (true) {
		doStuff(ns, table);
		await ns.asleep(1000);
	}
}

function quit() {
	if (anchor) anchor.firstElementChild.remove();
}

async function doStuff(ns: NS, table: HTMLElement) {
	// read new jobs on port
	let prt = ns.getPortHandle(1);
	while (!prt.empty()) {
		let info = JSON.parse(String(prt.read()));
		if (info.operation == 'hack' || info.operation == 'prepare') {
			if (!data[info.target]) {
				data[info.target] = {
					hostname: info.target,
					hacks: [],
					prepares: [],
				};
			}
			let target = data[info.target];
			if (info.operation == 'hack') {
				target.hacks.push(info);
			} else if (info.operation == 'prepare') {
				target.prepares.push(info);
			}
		}
	}
	// clean up old jobs
	Object.entries(data).forEach(([hostObject, host]: [any, any]) => {
		if (host.hacks.length > 0) {
			host.hacks = host.hacks.filter((h) =>
				ns.isRunning(h.pids.find((p) => p.type == 'weaken').pid)
			);
		}
		if (host.prepares.length > 0) {
			host.prepares = host.prepares.filter((h) =>
				ns.isRunning(h.pids.find((p) => p.type == 'weaken').pid)
			);
		}
		if (host.hacks.length == 0 && host.prepares.length == 0) {
			if (table) removeTableEntry(host.hostname);
			delete data[hostObject];
		}
	});

	// resize window to match data size
	if (table) {
		let newSize = Object.keys(data).length;
		if (newSize != windowSize) {
			windowSize = newSize;
			//ns.resizeTail(500, windowSize * 60 + 60);
			let resize = <HTMLElement>table.closest('.react-resizable');
			if (resize) {
				resize.style.height = windowSize * 30 + 62 + 'px';
			}
		}
	}

	if (table) {
		Object.keys(data).map((server) => {
			if (table.querySelector('#timer_table_server_' + server)) {
				editTableEntry(table, server);
			} else {
				createTableEntry(ns, server)?.forEach((entry) =>
					table.appendChild(entry)
				);
			}
		});
	}
}

function removeTableEntry(hostname) {
	let table: any = doc.querySelector('#timer_table_main');
	if (table) {
		let server = table.querySelector('#timer_table_server_' + hostname);
		let progressbar = table.querySelector(
			'#timer_table_progressbar_' + hostname
		);
		try {
			server.remove();
			progressbar.parentElement.remove();
		} catch {}
	}
}

function editTableEntry(table, hostname) {
	let server = table.querySelector('#timer_table_server_' + hostname);
	let progressbar = table.querySelector(
		'#timer_table_progressbar_' + hostname
	);
	let operations = [...data[hostname].hacks, ...data[hostname].prepares].sort(
		(a, b) => (a.finishTime > b.finishTime ? 1 : -1)
	);
	if (operations.length == 0) {
		return;
	}
	let minTime = operations[0];
	operations.reverse();
	let maxTime = operations[0];
	if (server) {
		let minTimeNode = server.querySelector('.minTime');
		let maxTimeNode = server.querySelector('.maxTime');
		minTimeNode.textContent = formatTime(minTime.finishTime - Date.now());
		maxTimeNode.textContent = formatTime(maxTime.finishTime - Date.now());
	}
	if (progressbar) {
		if (progressbar.finishTime != maxTime.finishTime) {
			progressbar.animate(
				[
					{ width: CSS.percent(0) },
					{
						width: CSS.percent(99.5),
					},
				],
				Number(parseInt(maxTime.finishTime) - Date.now())
			);
			progressbar.finishTime = maxTime.finishTime;
		}
	}
}

function createTableEntry(ns, server) {
	let dataStyle = {
		textAlign: 'center',
		verticalAlign: 'middle',
		backgroundColor: '#111',
		color: '#0f0',
	};

	let operations = [...data[server].hacks, ...data[server].prepares].sort(
		(a, b) => (a.finishTime > b.finishTime ? 1 : -1)
	);
	if (operations.length == 0) {
		return;
	}
	let minTime = operations[0];
	operations.reverse();
	let maxTime = operations[0];

	let newTimer: any = html.createElement('td', {
		colspan: '5',
		style: {
			position: 'absolute',
			backgroundColor: '#8CCF27',
		},
		id: 'timer_table_progressbar_' + server,
	});
	let progressDiv = html.createElement(
		'tr',
		{
			style: {
				widht: '100%',
				height: '2px',
			},
		},
		newTimer
	);
	newTimer.finishTime = maxTime.finishTime;
	newTimer.animate(
		[
			{ width: CSS.percent(0) },
			{
				width: CSS.percent(99.5),
			},
		],
		{
			fill: 'forwards',
			duration: Number(parseInt(maxTime.finishTime) - Date.now()),
		}
	);

	let cancelButton = html.createElement(
		'td',
		{
			style: {
				textAlign: 'center',
				verticalAlign: 'middle',
				color: 'white',
				backgroundColor: '#333',
				cursor: 'pointer',
				width: 25,
				fontSize: 12,
			},
			className: 'cancelButton',
		},
		'❌'
	);
	cancelButton.addEventListener('click', (e) => {
		removeTableEntry(server);
		ns.toast('Killing ' + server, 'error');
		ns.exec(
			'lib/removeQueue.js',
			'home',
			1,
			'--server',
			server,
			'--pids',
			JSON.stringify(
				operations.map((op) => op.pids.map((p) => p.pid)).flat()
			)
		);
	});

	return [
		html.createElement(
			'tr',
			{
				id: 'timer_table_server_' + server,
			},
			cancelButton,
			html.createElement(
				'td',
				{
					style: {
						textAlign: 'center',
						verticalAlign: 'middle',
						color: 'cyan',
						backgroundColor: '#111',
					},
				},
				server
			),
			html.createElement(
				'td',
				{
					style: {
						textAlign: 'center',
						verticalAlign: 'middle',
						color: minTime.operation == 'hack' ? 'red' : 'magenta',
						backgroundColor: '#111',
					},
				},
				minTime.operation
			),
			html.createElement(
				'td',
				{ style: dataStyle, className: 'minTime' },
				formatTime(minTime.finishTime - Date.now())
			),
			html.createElement(
				'td',
				{ style: dataStyle, className: 'maxTime' },
				formatTime(maxTime.finishTime - Date.now())
			)
		),
		progressDiv,
	];
}

function createTable(): HTMLElement {
	let node: HTMLElement = html.createTable();
	node.appendChild(
		html.createTableHeader([
			'',
			'Server',
			'Operation',
			'Time (min)',
			'Time (max)',
		])
	);
	anchor.appendChild(node);
	return node;
}
