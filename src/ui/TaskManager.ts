import { NS, ProcessInfo } from '../..';
import { getAllServers } from '/lib/getAllServers';

export async function main(ns: NS) {
	ns.disableLog('ALL');
	ns.setTitle('Queue List');

	let taskList = getTaskList(ns);
	taskList.forEach((task) => {
		ns.print(
			String(task.pid).padEnd(10),
			String(task.threads).padEnd(10),
			task.filename.padEnd(20),
			JSON.stringify(task.args)
		);
	});
}

function getTasksPerTarget(ns: NS) {
	let servers = getAllServers(ns);
	let select = ['util/weaken.js', 'util/grow.js', 'util/hack.js'];
	let serverTasks: any = [];
	servers.forEach((server) => {
		let ps: ProcessInfo[] = ns.ps(server.hostname);
		ps.forEach((p) => {
			if (select.includes(p.filename)) {
				// let args: {
				// 	server: string;
				// 	delay: number;
				// 	start: number;
				// 	end: number;
				// } = { server: 'placeholder', delay: 0, start: 0, end: 0 };
				// p.args.forEach((arg, index) => {
				// 	if (arg == '--server') {
				// 		args.server = String(p.args[index + 1]);
				// 	} else if (arg == '--delay') {
				// 		args.delay = Number(p.args[index + 1]);
				// 	} else if (arg == '--start') {
				// 		args.start = Number(p.args[index + 1]);
				// 	} else if (arg == '--end') {
				// 		args.end = Number(p.args[index + 1]);
				// 	}
				// });
				// tasks.push({
				// 	pid: p.pid,
				// 	filename: p.filename,
				// 	args: args,
				// 	threads: p.threads,
				// });
			}
		});
	});
	return serverTasks;
}

function getTaskList(ns: NS) {
	let servers = getAllServers(ns);
	let select = ['util/weaken.js', 'util/grow.js', 'util/hack.js'];
	let tasks: {
		pid: number;
		filename: string;
		args: object;
		threads: number;
	}[] = [];
	servers.forEach((server) => {
		let ps: ProcessInfo[] = ns.ps(server.hostname);
		ps.forEach((p) => {
			if (select.includes(p.filename)) {
				let args: {
					server: string;
					delay: number;
					start: number;
					end: number;
				} = { server: 'placeholder', delay: 0, start: 0, end: 0 };
				p.args.forEach((arg, index) => {
					if (arg == '--server') {
						args.server = String(p.args[index + 1]);
					} else if (arg == '--delay') {
						args.delay = Number(p.args[index + 1]);
					} else if (arg == '--start') {
						args.start = Number(p.args[index + 1]);
					} else if (arg == '--end') {
						args.end = Number(p.args[index + 1]);
					}
				});
				tasks.push({
					pid: p.pid,
					filename: p.filename,
					args: args,
					threads: p.threads,
				});
			}
		});
	});
	return tasks;
}
