import { NS, AutocompleteData } from '../..';
import { getServerPath } from '/lib/getAllServers';

export async function main(ns) {
	ns.disableLog('ALL');
	ns.clearLog();
	let path = getServerPath(ns, ns.args[0]);
	if (path.length > 0) {
		let doc = eval('document');
		// Acquire a reference to the terminal text field
		const terminalInput = doc.getElementById('terminal-input');
		// Set the value to the command you want to run.
		terminalInput.value = 'home;connect ' + path.join(';connect ');
		// Get a reference to the React event handler.
		const handler = Object.keys(terminalInput)[1];

		// Perform an onChange event to set some internal values.
		terminalInput[handler].onChange({ target: terminalInput });

		// Simulate an enter press
		terminalInput[handler].onKeyDown({
			key: 'Enter',
			preventDefault: () => null,
		});
	} else {
		ns.tprint("Could not find '" + ns.args[0] + "'");
	}
}

export function autocomplete(data: AutocompleteData) {
	return data.servers;
}
