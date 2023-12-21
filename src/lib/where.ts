import { NS } from '../..';
import { getAllServers } from '/lib/getAllServers';
import type React_Type from 'react';
declare var React: typeof React_Type;
import { doc } from '/lib/html';

export async function main(ns: NS) {
	ns.disableLog('ALL');
	let files: string[];
	let servers = getAllServers(ns);
	servers.forEach((server) => {
		if (ns.args[0]) {
			files = ns.ls(server.hostname, String(ns.args[0]));
		} else {
			files = ns.ls(server.hostname);
		}
		if (!files.length) return;

		files = files.sort(customSort);

		let childs = files.map((file) => {
			let action = getFileExtensionAction(file);
			let folderSplit = file.split('/').map((part) =>
				React.createElement(
					'span',
					{
						style: {
							color: getFileExtensionColor(part),
							textAlign:
								getFileExtension(part) == 'folder'
									? 'center'
									: 'left',
							cursor: 'pointer',
						},
						onClick: action,
					},
					getFileExtension(part) == 'folder' ? part + '/' : part
				)
			);
			return React.createElement(
				'tr',
				null,
				React.createElement(
					'td',
					{
						style: {
							textAlign: 'right',
							paddingRight: '20px',
							paddingLeft: '20px',
						},
					},
					getFileExtension(file) == 'js'
						? ns.formatRam(ns.getScriptRam(file, server.hostname))
						: '1KB'
				),
				...folderSplit
			);
		});
		let table = React.createElement(
			'table',
			{ style: { fontSize: 13 } },
			React.createElement(
				'tr',
				null,
				React.createElement('th', null),
				React.createElement('th', null)
			),
			React.createElement(
				'tr',
				{ className: 'hostname', hostname: server.hostname },
				server.hostname,
				...childs
			)
		);
		ns.tprintRaw(table);
	});
}

export function autocomplete(data) {
	return data.scripts;
}

function getFileExtension(filename) {
	if (!filename.includes('.')) {
		return 'folder';
	} else {
		return filename.split('.').pop();
	}
}

function getFileExtensionAction(filename) {
	return actionMap[filename.split('.').pop()];
}

let actionMap = {
	js: openCode,
	txt: openCat,
	script: openCode,
	msg: openCat,
	lit: openCat,
	exe: openExe,
	cct: openExe,
};

let colorMap = {
	js: '#af0',
	msg: 'grey',
	txt: 'white',
	exe: '#a00',
	lit: 'grey',
	script: 'darkyellow',
	folder: '#3B78FF',
	cct: '#0F0',
};

function getFileExtensionColor(filename) {
	if (!filename.includes('.')) {
		return colorMap['folder'];
	} else {
		return colorMap[filename.split('.').pop()];
	}
}

function openCode(e) {
	let server: any = e.target.closest('tr.hostname').getAttribute('hostname');
	let cmd1 = 'home; run lib/ssh.js ' + server;
	let cmd2 =
		'nano ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd1);
	setTimeout(() => {
		openTerminal(cmd2);
	}, 0);
}

function openCat(e) {
	let server: any = e.target.closest('tr.hostname').getAttribute('hostname');
	let cmd1 = 'home; run lib/ssh.js ' + server;
	let cmd2 =
		'cat ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd1);
	setTimeout(() => {
		openTerminal(cmd2);
	}, 0);
}

function openExe(e) {
	let server: any = e.target.closest('tr.hostname').getAttribute('hostname');
	let cmd1 = 'home; run lib/ssh.js ' + server;
	let cmd2 =
		';un ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd1);
	setTimeout(() => {
		openTerminal(cmd2);
	}, 0);
}

function openTerminal(command) {
	const terminal = <HTMLInputElement>doc.getElementById('terminal-input')!;
	terminal.value = command;
	setTimeout(() => {
		const handler = Object.keys(terminal)[1];
		terminal[handler].onChange({ target: terminal });
		terminal[handler].onKeyDown({
			key: 'Enter',
			preventDefault: () => null,
		});
	}, 0);
}

function customSort(a, b) {
	let ext_a: string | undefined = a.split('.').pop();
	let ext_b: string | undefined = b.split('.').pop();
	if (a.includes('/') && !b.includes('/')) {
		return -1;
	} else if (!a.includes('/') && b.includes('/')) {
		return 1;
	} else if (ext_a == 'js' && ext_b != 'js') {
		return 1;
	} else if (ext_a != 'js' && ext_b == 'js') {
		return -1;
	} else if (ext_a == 'exe' && ext_b != 'exe') {
		return 1;
	} else if (ext_a != 'exe' && ext_b == 'exe') {
		return -1;
	} else if (ext_a == 'txt' && ext_b != 'txt') {
		return 1;
	} else if (ext_a != 'txt' && ext_b == 'txt') {
		return -1;
	} else {
		return 1;
	}
}
