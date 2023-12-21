import { NS } from '../..';

export async function main(ns: NS) {
	let args = <string>ns.args[0];
	if (args) {
		let files = ns.ls(ns.getHostname(), args);
		if (
			await ns.prompt(
				`Delete the following files?\n\n${files.join('\n')}`
			)
		) {
			files.forEach((file) => {
				ns.rm(file);
			});
		}
	}
}
