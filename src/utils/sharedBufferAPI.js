let buffers = new Map();

export const SharedBufferAPI = {
	init(id, size, Type = Int32Array) {
		if (buffers.has(id)) return buffers.get(id).typedArray;

		if (typeof Type !== "function") {
			throw new Error("Type must be a TypedArray constructor");
		}
		if (typeof SharedArrayBuffer !== "undefined") {
			const sharedBuffer = new SharedArrayBuffer(size);
			const typedArray = new Int32Array(sharedBuffer);

			buffers.set(id, { sharedBuffer, typedArray });

			return typedArray;
		}
	},

	find(id) {
		const bufferObj = buffers.get(id);
		return bufferObj;
	},

	write(id, value, index = 0) {
		const bufferObj = buffers.get(id);
		if (!bufferObj) return;
		Atomics.store(bufferObj.typedArray, index, value);
	},

	read(id, index = 0) {
		const bufferObj = buffers.get(id);
		if (!bufferObj) return;
		return Atomics.load(bufferObj.typedArray, index);
	},

	getBuffer(id) {
		const bufferObj = buffers.get(id);
		if (!bufferObj) return;
		return bufferObj.sharedBuffer;
	},
};
