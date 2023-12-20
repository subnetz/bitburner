import { NS } from '../..';

export async function main(ns: NS) {
	ns.tail();
	let types = ns.codingcontract.getContractTypes();
	types.forEach((type) => {
		type = type.toLowerCase();
		type = type.replaceAll(' ', '_');
		type = type.replaceAll(':', '_');
		type = type.replaceAll('è', '_');
		ns.print(type);
		/**
find_largest_prime_factor
subarray_with_maximum_sum
total_ways_to_sum
total_ways_to_sum_ii
spiralize_matrix
array_jumping_game
array_jumping_game_ii
merge_overlapping_intervals
generate_ip_addresses
algorithmic_stock_trader_i
algorithmic_stock_trader_ii
algorithmic_stock_trader_iii
algorithmic_stock_trader_iv
minimum_path_sum_in_a_triangle
unique_paths_in_a_grid_i
unique_paths_in_a_grid_ii
shortest_path_in_a_grid
sanitize_parentheses_in_expression
find_all_valid_math_expressions
hammingcodes__integer_to_encoded_binary
hammingcodes__encoded_binary_to_integer
proper_2-coloring_of_a_graph
compression_i__rle_compression
compression_ii__lz_decompression
compression_iii__lz_compression
encryption_i__caesar_cipher
encryption_ii__vigen_re_cipher
         */
	});
}
