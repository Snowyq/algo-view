const algorithms = {
	/* ------------------------------------------------------------------------------ */
	/*                               Sort Algorithms                                  */
	/* ------------------------------------------------------------------------------ */
	sort: {
		/* ------------------------------- Bubble Sort ------------------------------ */
		bubbleSort: {
			name: "Bubble sort",
			id: "bubbleSort",
			timeComplexity: "O(n^2)",
			author: "Edward Harry Friend",

			info: ``,
			history: `The earliest description of the bubble sort algorithm was in a 1956 paper by mathematician and actuary Edward Harry Friend,[4] Sorting on electronic computer systems,[5] published in the third issue of the third volume of the Journal of the Association for Computing Machinery (ACM), as a "Sorting exchange algorithm". Friend described the fundamentals of the algorithm, and, although initially his paper went unnoticed, some years later, it was rediscovered by many computer scientists, including Kenneth E. Iverson who coined its current name.`,
		},
		/* ----------------------------- Selection Sort ----------------------------- */
		selectionSort: {
			name: "Selection sort",
			id: "selectionSort",
			timeComplexity: "O(n^2)",
			info: `The algorithm divides the input list into two parts: a sorted sublist of items which is built up from left to right at the front (left) of the list and a sublist of the remaining unsorted items that occupy the rest of the list. Initially, the sorted sublist is empty and the unsorted sublist is the entire input list. The algorithm proceeds by finding the smallest (or largest, depending on sorting order) element in the unsorted sublist, exchanging (swapping) it with the leftmost unsorted element (putting it in sorted order), and moving the sublist boundaries one element to the right.`,
		},
		/* ----------------------------- Insertion Sort ----------------------------- */
		/* ------------------------------- Merge Sort ------------------------------- */
		/* ------------------------------ Counting Sort ----------------------------- */
		/* ------------------------------- Bucket Sort ------------------------------ */
		/* ------------------------------- Radix Sort ------------------------------- */
		/* ------------------------------ Library Sort ------------------------------ */
	},
};

export default algorithms;
