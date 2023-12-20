export function formatTime(ms) {
	const date = new Date(ms);
	return (
		String(date.getMinutes()).padStart(2, '0') +
		':' +
		String(date.getSeconds()).padStart(2, '0')
	);
}
