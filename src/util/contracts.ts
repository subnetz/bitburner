import { NS } from '../..';

let args;
export async function main(ns: NS) {
	ns.tail();
	ns.clearLog();
	args = ns.flags([
		['test', false],
		['pick', -1],
	]);
	if (args.test) {
		let test = unittest(ns);
		ns.print(test);
		ns.printf(
			`Tests done (%s of %s)`,
			Object.values(test).filter((a) => a).length,
			Object.keys(test).length
		);
	}
}

function unittest(ns: NS) {
	let c = ns.codingcontract;
	let types = c.getContractTypes();
	// create dummy contracts
	types.forEach((type) => {
		c.createDummyContract(type);
	});
	// read all contracts
	let files = ns.ls('home', '.cct');
	// solve all contracts
	let overview = Object.fromEntries(
		files.map((file) => {
			let type = c.getContractType(file);
			let data = c.getData(file);
			let func = typeFunctions[type];
			let sol = func(data);
			if (!sol) return [type, false];
			let attempt = c.attempt(sol, file, 'home');
			return [type, !!attempt];
		})
	);
	// clean up
	if (args.delete) {
		files.forEach((file) => {
			if (
				args.pick == -1 ||
				types.indexOf(c.getContractType(file)) != args.pick
			) {
				ns.rm(file, 'home');
			}
		});
	}
	return overview;
}

let typeFunctions = {
	'Find Largest Prime Factor': find_largest_prime_factor,
	'Subarray with Maximum Sum': subarray_with_maximum_sum,
	'Total Ways to Sum': total_ways_to_sum,
	'Total Ways to Sum II': total_ways_to_sum_ii,
	'Spiralize Matrix': spiralize_matrix,
	'Array Jumping Game': array_jumping_game,
	'Array Jumping Game II': array_jumping_game_ii,
	'Merge Overlapping Intervals': merge_overlapping_intervals,
	'Generate IP Addresses': generate_ip_addresses,
	'Algorithmic Stock Trader I': algorithmic_stock_trader_i,
	'Algorithmic Stock Trader II': algorithmic_stock_trader_ii,
	'Algorithmic Stock Trader III': algorithmic_stock_trader_iii,
	'Algorithmic Stock Trader IV': algorithmic_stock_trader_iv,
	'Minimum Path Sum in a Triangle': minimum_path_sum_in_a_triangle,
	'Unique Paths in a Grid I': unique_paths_in_a_grid_i,
	'Unique Paths in a Grid II': unique_paths_in_a_grid_ii,
	'Shortest Path in a Grid': shortest_path_in_a_grid,
	'Sanitize Parentheses in Expression': sanitize_parentheses_in_expression,
	'Find All Valid Math Expressions': find_all_valid_math_expressions,
	'HammingCodes: Integer to Encoded Binary':
		hammingcodes__integer_to_encoded_binary,
	'HammingCodes: Encoded Binary to Integer':
		hammingcodes__encoded_binary_to_integer,
	'Proper 2-Coloring of a Graph': proper_2_coloring_of_a_graph,
	'Compression I: RLE Compression': compression_i__rle_compression,
	'Compression II: LZ Decompression': compression_ii__lz_decompression,
	'Compression III: LZ Compression': compression_iii__lz_compression,
	'Encryption I: Caesar Cipher': encryption_i__caesar_cipher,
	'Encryption II: Vigenère Cipher': encryption_ii__vigen_re_cipher,
};

function find_largest_prime_factor(data) {
	let factors: number[] = [];
	let d = 2;
	while (data > 1) {
		while (data % d == 0) {
			factors.push(d);
			data /= d;
		}
		d = d + 1;
		if (d * d > data) {
			if (data > 1) {
				factors.push(data);
			}
			break;
		}
	}
	return factors.pop()!;
}
function subarray_with_maximum_sum(data) {}
function total_ways_to_sum(data) {}
function total_ways_to_sum_ii(data) {}
function spiralize_matrix(data) {}
function array_jumping_game(data) {}
function array_jumping_game_ii(data) {}
function merge_overlapping_intervals(data) {}
function generate_ip_addresses(data) {}
function algorithmic_stock_trader_i(data) {}
function algorithmic_stock_trader_ii(data) {}
function algorithmic_stock_trader_iii(data) {}
function algorithmic_stock_trader_iv(data) {}
function minimum_path_sum_in_a_triangle(data) {
	let sum = 0;
	let i = 0;
	data.forEach((arr) => {
		if (arr.length == 1) {
			sum += arr.at(0);
		} else {
			if (arr.at(i) < arr.at(i + 1)) {
				sum += arr.at(i);
			} else if (arr.at(i) > arr.at(i + 1)) {
				sum += arr.at(++i);
			} else {
				throw new Error(
					'minimum_path_sum_in_a_triangle:' +
						'two numbers in a path were the same!'
				);
			}
		}
	});
	return sum;
}
function unique_paths_in_a_grid_i(data) {}
function unique_paths_in_a_grid_ii(data) {}
function shortest_path_in_a_grid(data) {}
function sanitize_parentheses_in_expression(data) {}
function find_all_valid_math_expressions(data) {}
function hammingcodes__integer_to_encoded_binary(data) {}
function hammingcodes__encoded_binary_to_integer(data) {}
function proper_2_coloring_of_a_graph(data) {
	if (data.length != 2 || data[0] > 14 || data[0] < 2) {
		return [];
	}
	const onlyUnique = (value, index, array) => {
		return array.indexOf(value) === index;
	};
	let result: any = [];
	let verts = data[0];
	let edges = data[1];
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
function compression_i__rle_compression(data) {}
function compression_ii__lz_decompression(data) {
	let res = '';
	let i = 0;
	let first = Number(data[i]);
	let second;
	res += data.substr(i + 1, first);
	i += first + 1;
	while (i < data.length) {
		first = Number(data[i]);
		second = Number(data[i + 1]);
		if (first == 0) {
			i++;
			continue;
		} else if (isNaN(second)) {
			res += data.substr(i + 1, first);
			i += first + 1;
		} else {
			for (let x = 0; x < first; x++) {
				res += res[res.length - second - x + (x % second)];
			}
			i += 2;
		}
	}
	return res;
}
function compression_iii__lz_compression(data) {}
function encryption_i__caesar_cipher(data) {}
function encryption_ii__vigen_re_cipher(data) {}
