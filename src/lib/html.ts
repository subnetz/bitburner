import { NS } from '../..';

export var doc = eval('document') as Document;
export var win = eval('window') as Window;

export async function locateTerminalWindow(
	ns: NS
): Promise<HTMLElement | undefined> {
	// let identifier = crypto.randomUUID();
	// ns.tprintf(identifier);
	let modals: HTMLElement[] = Array.from(
		doc.querySelectorAll(`#terminal > li`)
	);
	let terminalMessage: HTMLElement = Array.from(modals).pop()!;
	let newMessage: HTMLElement = <HTMLElement>terminalMessage.cloneNode(true);
	let anchor = <HTMLElement>newMessage.querySelector('span');
	anchor!.textContent = '';
	terminalMessage.parentElement!.appendChild(newMessage);

	return anchor;
}

export async function locateTailWindow(
	ns: NS
): Promise<HTMLElement | undefined> {
	ns.tail();
	ns.print('Loading...');
	await ns.asleep(250);
	let identifier = crypto.randomUUID();
	ns.setTitle(identifier);
	let modals: HTMLElement[] = Array.from(doc.querySelectorAll(`.drag > h6`));
	let tailWindow: HTMLElement | undefined = Array.from(modals).find((modal) =>
		modal.textContent!.includes(identifier)
	);
	if (!tailWindow) {
		console.error('tail window not found, returning');
		return;
	}
	tailWindow!.textContent = tailWindow!.getAttribute('title');
	ns.clearLog();

	return <HTMLElement>(
		tailWindow.parentElement!.nextElementSibling!.firstElementChild!
	);
}

export function createElement(
	type: string,
	attributes: Object | undefined = undefined,
	...children
): HTMLElement {
	const doc = eval('document') as Document;
	let el: HTMLElement = doc.createElement(type);

	setAttributes(el, attributes);

	if (Array.isArray(children)) {
		children = children.flat();
	}
	children.forEach((child) => {
		if (typeof child == 'string') {
			el.textContent = child;
		} else if (child instanceof HTMLElement) {
			el.appendChild(child);
		} else if (typeof child == 'number') {
			el.textContent = String(child);
		} else if (typeof child == 'boolean') {
			el.textContent = String(child);
		} else {
			console.error(child);
		}
	});
	return el;
}

export function createTable(
	style: Object | undefined = undefined
): HTMLElement {
	if (!style) {
		style = {
			width: '100%',
			fontFamily: 'Segoe UI',
		};
	}
	return createElement('table', {
		style: style,
		id: 'timer_table_main',
	});
}

export function createTableHeader(
	header: any[],
	style: Object | undefined = undefined
): HTMLElement {
	if (!style) {
		style = {
			textAlign: 'center',
			verticalAlign: 'middle',
			color: 'yellow',
			backgroundColor: '#333',
		};
	}
	return createElement(
		'tr',
		{ style: { position: 'sticky', top: '0' } },
		header.map((child) => createElement('th', { style: style }, child))
	);
}

function setAttributes(node, attributes) {
	if (!attributes) {
		return;
	}
	Object.entries(attributes).forEach(([key, value]) => {
		if (typeof value == 'object') {
			if (!node[key]) {
				node[key] = {};
			}
			setAttributes(node[key], value);
		} else {
			node[key] = value;
		}
	});
}
