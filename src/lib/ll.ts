import { NS } from '../..';
import type React_Type from 'react';
declare var React: typeof React_Type;

export function main(ns: NS) {
	ns.disableLog('ALL');
	let files: string[];

	if (ns.args[0]) {
		files = ns.ls(ns.getHostname(), String(ns.args[0]));
	} else {
		files = ns.ls(ns.getHostname());
	}

	files = files.sort((a, b) => {
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
	});

	files.forEach((file) => {
		let res: any = file;
		if (file.includes('/')) {
			let split = file.split('/');
			let childs = split.map((s, i) => {
				if (i != split.length - 1) {
					return React.createElement(
						'span',
						{ style: { color: 'cyan' } },
						s + '/'
					);
				} else {
					return fileExtensionToNode(s);
				}
			});
			res = childs;
		} else {
			res = fileExtensionToNode(file);
		}
		let ext: string | undefined = file.split('.').pop();
		let listener =
			ext == 'js'
				? {
						style: { color: '#bbb', textDecoration: 'underline' },
						onClick: openCode,
				  }
				: ext == 'txt' || ext == 'msg' || ext == 'lit'
				? {
						style: { color: '#bbb', textDecoration: 'underline' },
						onClick: openCat,
				  }
				: null;
		let test = React.createElement('span', listener, res);
		ns.tprintRaw(test);
	});
}

export function autocomplete(data) {
	return data.scripts;
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
	let doc = eval('document');
	let command = 'nano';
	command += ' ' + e.target.parentElement.textContent;
	const terminal = doc.getElementById('terminal-input');
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

function openCat(e) {
	let doc = eval('document');
	let command = 'cat';
	command += ' ' + e.target.parentElement.textContent;
	const terminal = doc.getElementById('terminal-input');
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
