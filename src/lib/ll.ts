import { NS } from '../..';
import type React_Type from 'react';
declare var React: typeof React_Type;
import * as html from '/lib/html';
import { doc } from '/lib/html';

// let anchor;
// export async function main(ns: NS) {
// 	ns.disableLog('ALL');
// 	let files: string[];

// 	if (ns.args[0]) {
// 		files = ns.ls(ns.getHostname(), String(ns.args[0]));
// 	} else {
// 		files = ns.ls(ns.getHostname());
// 	}
// 	anchor = await html.locateTerminalWindow(ns);
// 	if (anchor) {
// 		files.forEach((file) => {
// 			anchor.appendChild(
// 				html.createElement(
// 					'div',
// 					{ style: { cursor: 'pointer', color: 'red' } },
// 					html.createElement('span', null, file)
// 				)
// 			);
// 		});
// 	}
// }

export function main(ns: NS) {
	ns.disableLog('ALL');
	let files: string[];

	if (ns.args[0]) {
		files = ns.ls(ns.getHostname(), String(ns.args[0]));
	} else {
		files = ns.ls(ns.getHostname());
	}

	files = files.sort(customSort);

	// let childs = files.map((file) => {
	// 	let res: any = file;
	// 	if (file.includes('/')) {
	// 		let split = file.split('/');
	// 		let childs = split.map((s, i) => {
	// 			if (i != split.length - 1) {
	// 				return React.createElement(
	// 					'span',
	// 					{ style: { color: '#3B78FF' } },
	// 					s + '/'
	// 				);
	// 			} else {
	// 				return fileExtensionToNode(s);
	// 			}
	// 		});
	// 		res = childs;
	// 	} else {
	// 		res = fileExtensionToNode(file);
	// 	}
	// 	let ext: string | undefined = file.split('.').pop();
	// 	let listener =
	// 		ext == 'js'
	// 			? {
	// 					style: {
	// 						color: '#ff0',
	// 						cursor: 'pointer',
	// 						textDecoration: 'underline',
	// 					},
	// 					onClick: openCode,
	// 			  }
	// 			: ext == 'txt' || ext == 'msg' || ext == 'lit'
	// 			? {
	// 					style: {
	// 						color: '#bbb',
	// 						cursor: 'pointer',
	// 						textDecoration: 'underline',
	// 					},
	// 					onClick: openCat,
	// 			  }
	// 			: null;
	// 	return React.createElement(
	// 		'tr',
	// 		null,
	// 		React.createElement(
	// 			'td',
	// 			null,
	// 			React.createElement('span', listener, res)
	// 		)
	// 	);
	// });
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
					? ns.formatRam(ns.getScriptRam(file))
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
		...childs
	);
	ns.tprintRaw(table);
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

function fileExtensionToNode(filename) {
	let ext: string | undefined = filename.split('.').pop();
	if (!ext) {
		return React.createElement(
			'span',
			{ style: { color: 'grey' } },
			filename
		);
	}
	if (ext == 'js') {
		let js = React.createElement(
			'span',
			{
				style: { color: 'yellow' },
			},
			filename
		);
		return js;
	} else if (ext == 'exe') {
		return React.createElement(
			'span',
			{ style: { color: 'red' } },
			filename
		);
	} else if (ext == 'txt') {
		return React.createElement(
			'span',
			{ style: { color: 'white' } },
			filename
		);
	} else {
		return React.createElement(
			'span',
			{ style: { color: 'grey' } },
			filename
		);
	}
}

function openCode(e) {
	let cmd =
		'nano ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd);
}

function openCat(e) {
	let cmd =
		'cat ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd);
}

function openExe(e) {
	let cmd =
		'run ' +
		Array.from(e.target.closest('tr').querySelectorAll('span'))
			.map((node: HTMLElement) => node.textContent)
			.join('');
	openTerminal(cmd);
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
