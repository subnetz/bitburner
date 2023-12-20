import { NS } from '../..';
/**
Proper 2-Coloring of a Graph
You are attempting to solve a Coding Contract. You have 5 tries remaining, after which the contract will self-destruct.


You are given the following data, representing a graph:
[14,[[8,10],[1,4],[4,9],[1,5],[2,11],[6,11],[2,4],[1,7],[9,11],[0,8],[12,13],[7,9],[6,12],[0,6],[1,8],[4,13],[5,13],[3,4],[8,9],[5,9],[4,10],[5,10],[10,11],[6,8],[5,6],[0,3]]]

Note that "graph", as used here, refers to the field of graph theory, and has no relation to statistics or plotting.

The first element of the data represents the number of vertices in the graph. Each vertex is a unique number between 0 and 13.
The next element of the data represents the edges of the graph. Two vertices u,v in a graph are said to be adjacent if there exists an edge [u,v]. Note that an edge [u,v] is the same as an edge [v,u], as order does not matter.

You must construct a 2-coloring of the graph, meaning that you have to assign each vertex in the graph a "color", either 0 or 1, such that no two adjacent vertices have the same color.
Submit your answer in the form of an array, where element i represents the color of vertex i.
If it is impossible to construct a 2-coloring of the given graph, instead submit an empty array.

Examples:

Input: [4, [[0, 2], [0, 3], [1, 2], [1, 3]]]
Output: [0, 0, 1, 1]

Input: [3, [[0, 1], [0, 2], [1, 2]]]
Output: []
 */

function colorGraph(input) {
	if (input.length != 2 || input[0] > 14 || input[0] < 2) {
		return [];
	}
	const onlyUnique = (value, index, array) => {
		return array.indexOf(value) === index;
	};
	let result: any = [];
	let verts = input[0];
	let edges = input[1];
	let vertMap = {};
	let noResult = false;
	for (let i = 0; i < verts; i++) {
		vertMap[i] = { neighbours: [] };
	}
	edges.forEach((edge) => {
		let x = edge[0];
		let y = edge[1];
		vertMap[x].neighbours.push(y);
		vertMap[y].neighbours.push(x);
		vertMap[x].neighbours = vertMap[x].neighbours.filter(onlyUnique);
		vertMap[y].neighbours = vertMap[y].neighbours.filter(onlyUnique);
	});
	vertMap[0].color = 0;
	Object.entries(vertMap).forEach(([vert, props]: any, index) => {
		if (props.color !== undefined) {
			props.neighbours.forEach((neighbour) => {
				if (
					vertMap[neighbour].color &&
					vertMap[neighbour].color != (props.color + 1) % 2
				) {
					noResult = true;
				}
				vertMap[neighbour].color = (props.color + 1) % 2;
			});
		} else {
			//?
		}
	});
	if (noResult) {
		return [];
	}
	Object.entries(vertMap).forEach(([vert, props]: any, index) => {
		result.push(props.color);
	});

	return result;
}

export async function main(ns: NS) {
	/**
	 * tests
	 */
	let unitTests: boolean = true;
	let units = [
		[
			[
				4,
				[
					[0, 2],
					[0, 3],
					[1, 2],
					[1, 3],
				],
			],
			[0, 0, 1, 1],
		],
		[
			[
				3,
				[
					[0, 1],
					[0, 2],
					[1, 2],
				],
			],
			[],
		],
	];
	units.forEach((unit) => {
		let result = colorGraph(unit[0]);
		unitTests =
			unitTests && JSON.stringify(result) == JSON.stringify(unit[1]);
		if (JSON.stringify(result) != JSON.stringify(unit[1])) {
			ns.tprintf('ERROR Unittest failed:');
			ns.tprintf(
				'Expected:       %s -> %s',
				JSON.stringify(unit[0]),
				JSON.stringify(unit[1])
			);
			ns.tprintf(
				'Result:         %s -> %s',
				JSON.stringify(unit[0]),
				JSON.stringify(result)
			);
		} else {
			ns.tprintf(
				`INFO colorGraph ${JSON.stringify(unit[0])} -> ${JSON.stringify(
					unit[1]
				)} passed`
			);
		}
	});
	if (unitTests) {
		ns.tprintf('INFO Unittests: All Unittests passed');
	} else {
		ns.tprintf('ERROR Unittests: Some Unittests failed!');
	}
	ns.tprintf(
		'Solution for "[14,[[8,10],[1,4],[4,9],[1,5],[2,11],[6,11],[2,4],[1,7],[9,11],[0,8],[12,13],[7,9],[6,12],[0,6],[1,8],[4,13],[5,13],[3,4],[8,9],[5,9],[4,10],[5,10],[10,11],[6,8],[5,6],[0,3]]]":\n' +
			JSON.stringify(
				colorGraph([
					14,
					[
						[8, 10],
						[1, 4],
						[4, 9],
						[1, 5],
						[2, 11],
						[6, 11],
						[2, 4],
						[1, 7],
						[9, 11],
						[0, 8],
						[12, 13],
						[7, 9],
						[6, 12],
						[0, 6],
						[1, 8],
						[4, 13],
						[5, 13],
						[3, 4],
						[8, 9],
						[5, 9],
						[4, 10],
						[5, 10],
						[10, 11],
						[6, 8],
						[5, 6],
						[0, 3],
					],
				])
			)
	);
}
