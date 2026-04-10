export function generateRandomArray(n, min, max) {
	return Array.from({ length: n }, () =>
		Math.floor(Math.random() * (max - min) + min)
	);
}
