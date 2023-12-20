import { NS } from '../..';
/**
Compression III: LZ Compression
You are attempting to solve a Coding Contract. You have 10 tries remaining, after which the contract will self-destruct.


Lempel-Ziv (LZ) compression is a data compression technique which encodes data using references to earlier parts of the data.
In this variant of LZ, data is encoded in two types of chunk. Each chunk begins with a length L, encoded as a single ASCII digit from 1 to 9, followed by the chunk data, which is either:

1. Exactly L characters, which are to be copied directly into the uncompressed data.
2. A reference to an earlier part of the uncompressed data. To do this, the length is followed by a second ASCII digit X: each of the L output characters is a copy of the character X places before it in the uncompressed data.

For both chunk types, a length of 0 instead means the chunk ends immediately, and the next character is the start of a new chunk. The two chunk types alternate, starting with type 1, and the final chunk may be of either type.

You are given the following input string:
    oyjEUxIyjEUxcyjEUxcyjcyj8fj8fj8fjjo13x118lWTsN118118118121811812
Encode it using Lempel-Ziv encoding with the minimum possible output length.

Examples (some have other possible encodings of minimal length):
    abracadabra     ->  7abracad47
    mississippi     ->  4miss433ppi
    aAAaAAaAaAA     ->  3aAA53035
    2718281828      ->  627182844
    abcdefghijk     ->  9abcdefghi02jk
    aaaaaaaaaaaa    ->  3aaa91
    aaaaaaaaaaaaa   ->  1a91031
    aaaaaaaaaaaaaa  ->  1a91041
 */

function compress(str: string) {
	return str;
}
function decompress(str: string) {
	let res = '';
	let i = 0;
	let first = Number(str[i]);
	let second;
	res += str.substr(i + 1, first);
	i += first + 1;
	while (i < str.length) {
		first = Number(str[i]);
		second = Number(str[i + 1]);
		if (first == 0) {
			i++;
			continue;
		} else if (isNaN(second)) {
			res += str.substr(i + 1, first);
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

function decompress2(str: string) {
	let res: any = [];
	let strArr = str.split('');
	let first = Number(strArr.shift());
	let second;
	res.push(...strArr.splice(0, first));
	while (strArr.length) {
		first = Number(strArr.shift());
		if (first == 0) {
		} else if (isNaN(Number(strArr[0]))) {
			res.push(...strArr.splice(0, first));
		} else {
			second = Number(strArr.shift());
			let rep = res.slice(
				res.length - second,
				res.length - second + first
			);
			if (rep.length < first) {
				let newFirst = first - rep.length;
				while (newFirst > 0) {
					rep.push(
						...res.slice(
							res.length - second,
							res.length - second + newFirst
						)
					);
					newFirst = first - rep.length;
				}
			}
			res.push(...rep);
		}
	}

	return res.join('');
}

export async function main(ns: NS) {
	/**
	 * tests
	 */
	let unitTests: boolean = true;
	let units = [
		['abracadabra', '7abracad47'],
		['mississippi', '4miss433ppi'],
		['aAAaAAaAaAA', '3aAA53035'],
		['2718281828', '627182844'],
		['abcdefghijk', '9abcdefghi02jk'],
		['aaaaaaaaaaaa', '3aaa91'],
		['aaaaaaaaaaaaa', '1a91031'],
		['aaaaaaaaaaaaaa', '1a91041'],
	];
	units.forEach((unit) => {
		let compressed = compress(unit[0]) == unit[1];
		let decompressed = decompress(unit[1]) == unit[0];
		unitTests = unitTests && compressed && decompressed;
		if (!compressed) {
			ns.tprintf('ERROR Unittest failed at compressing:');
			ns.tprintf('Expected:       %s -> %s', unit[0], unit[1]);
			ns.tprintf('Result:         %s -> %s', unit[0], compress(unit[0]));
		} else {
			ns.tprintf(`INFO compress ${unit[0]} -> ${unit[1]} passed`);
		}
		if (!decompressed) {
			ns.tprintf('WARN Unittest failed at decompressing:');
			ns.tprintf('Expected:       %s -> %s', unit[1], unit[0]);
			ns.tprintf(
				'Result:         %s -> %s',
				unit[1],
				decompress(unit[1])
			);
		} else {
			ns.tprintf(`INFO decompress ${unit[1]} -> ${unit[0]} passed`);
		}
	});
	if (unitTests) {
		ns.tprintf('INFO Unittests: All Unittests passed');
	} else {
		ns.tprintf('ERROR Unittests: Some Unittests failed!');
	}
	ns.tprintf(
		'Solution for "oyjEUxIyjEUxcyjEUxcyjcyj8fj8fj8fjjo13x118lWTsN118118118121811812":\n' +
			compress(
				'oyjEUxIyjEUxcyjEUxcyjcyj8fj8fj8fjjo13x118lWTsN118118118121811812'
			)
	);
}
