import { NS } from '../..';
import type React_Type from 'react';
import * as html from '/lib/html';
declare var React: typeof React_Type;
let ns: NS;
let data = {};
let windowSize = -1;
let anchorID = 'Timer_Table_Anchor';
export async function main(_ns: NS) {
	ns = _ns;
	ns.clearLog();
	createHTMLAnchor();
	ns.disableLog('ALL');
	ns.tail();
	ns.resizeTail(540, 0);
	ns.moveTail(2300, 2);
	singleton();

	ns.setTitle('Timer');

	start();
	ns.atExit(quit);

	while (true) {
		doStuff();
		await ns.asleep(1000);
	}
}

function singleton() {
	let filename = ns.getScriptName();
	let multi = ns.ps().filter((p) => p.filename == filename);
	if (multi.length > 1) {
		multi.forEach((p) => {
			if (p.pid != ns.pid) {
				ns.closeTail(p.pid);
				ns.kill(p.pid);
			}
		});
	}
}

function start() {
	let previous = ns.readPort(2);
	if (previous != 'NULL PORT DATA') {
		data = JSON.parse(String(previous));
	}
}

function quit() {
	ns.writePort(2, JSON.stringify(data));
	deleteHTMLAnchor();
}

function now() {
	return new Date().toLocaleDateString('de-DE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});
}

// function formatTime(millis) {
// 	let minutes: number = Math.floor(millis / 60000);
// 	let seconds: any = ((millis % 60000) / 1000).toFixed(0);
// 	return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
// }

function formatTime(ms) {
	const date = new Date(ms);
	return (
		String(date.getMinutes()).padStart(2, '0') +
		':' +
		String(date.getSeconds()).padStart(2, '0')
	);
}

async function doStuff() {
	let doc = eval('document') as Document;
	let table: any = doc.querySelector('#timer_table_main');
	/*
		ns.writePort(1, JSON.stringify({
			operation: 'hack',
			target: hostname,
			timestamp: Date.now(),
			finishTime: Date.now() + server.times.weakenTime,
			pids: [
				{ type: 'hack', 	pid: pid1 },
				{ type: 'grow', 	pid: pid2 },
				{ type: 'weaken', 	pid: pid3 }
			],
			threads: [
				{ type: 'hack',		threads: hackThreads},
				{ type: 'grow',		threads: growThreads},
				{ type: 'weaken',	threads: weakenGrowThreads + weakenHackThreads}
			]
		}));
	*/
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
			let resize = table.closest('.react-resizable');
			if (resize) {
				resize.style.height = windowSize * 30 + 60 + 'px';
			}
		}
	}
	// error: rendering problems

	if (table) {
		Object.keys(data).map((server) => {
			if (table.querySelector('#timer_table_server_' + server)) {
				editTableEntry(table, server);
			} else {
				createTableEntry(server)?.forEach((entry) =>
					table.appendChild(entry)
				);
			}
		});
	}
}

function createTable() {
	let headerStyle = {
		textAlign: 'center',
		verticalAlign: 'middle',
		color: 'yellow',
		backgroundColor: '#333',
	};
	return html.createElement(
		'table',
		{
			style: { width: '100%', fontFamily: 'Segoe UI' },
			id: 'timer_table_main',
		},
		html.createElement(
			'tr',
			null,
			html.createElement('th', { style: headerStyle }, ''),
			html.createElement('th', { style: headerStyle }, 'Server'),
			html.createElement('th', { style: headerStyle }, 'Operation'),
			html.createElement('th', { style: headerStyle }, 'Time (min)'),
			html.createElement('th', { style: headerStyle }, 'Time (max)')
		)
	);
}

function removeTableEntry(hostname) {
	let doc = eval('document') as Document;
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
		progressbar.style.width =
			((Date.now() - maxTime.timestamp) /
				(maxTime.finishTime - maxTime.timestamp)) *
				100 +
			'%';
	}
}

function createTableEntry(server) {
	let dataStyle = {
		textAlign: 'center',
		verticalAlign: 'middle',
		backgroundColor: '#111',
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

	let progressBar = html.createElement(
		'tr',
		{
			style: {
				widht: '100%',
				height: '2px',
			},
		},
		html.createElement('td', {
			colspan: '5',
			style: {
				position: 'absolute',
				width:
					((Date.now() - maxTime.timestamp) /
						(maxTime.finishTime - maxTime.timestamp)) *
						100 +
					'%',
				backgroundColor: '#8CCF27',
				transition: 'all 1s linear',
			},
			id: 'timer_table_progressbar_' + server,
		})
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
		progressBar,
	];
}

function appendToAnchor() {
	let doc = eval('document') as Document;
	let node: any = createTable();
	let anchorDom = doc.querySelector('#' + anchorID);
	if (anchorDom) {
		anchorDom.appendChild(node);
	} else {
		ns.tprint('could not find anchor dom');
		setTimeout(() => {
			appendToAnchor();
		}, 50);
	}
}

function createHTMLAnchor() {
	ns.printRaw(React.createElement('div', { id: anchorID }));
	setTimeout(() => {
		appendToAnchor();
	}, 0);
}

function deleteHTMLAnchor() {
	let doc = eval('document') as Document;
	let anchor = doc.querySelector('#' + anchorID);
	if (anchor) {
		anchor.remove();
	}
}
