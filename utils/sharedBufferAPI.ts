type BufferId = string | number;

type BufferEntry = {
    sharedBuffer: SharedArrayBuffer;
    typedArray: Int32Array;
};

type Int32ArrayConstructor = typeof Int32Array;

const buffers: Map<BufferId, BufferEntry> = new Map();

export const SharedBufferAPI = {
    init(
        id: BufferId,
        size: number,
        Type: Int32ArrayConstructor = Int32Array
    ): Int32Array | undefined {
        const existing = buffers.get(id);
        if (existing) return existing.typedArray;

        if (typeof Type !== "function") {
            throw new Error("Type must be a TypedArray constructor");
        }
        if (typeof SharedArrayBuffer !== "undefined") {
            const sharedBuffer = new SharedArrayBuffer(size);
            const typedArray = new Type(sharedBuffer);

            buffers.set(id, { sharedBuffer, typedArray });

            return typedArray;
        }
    },

    find(id: BufferId): BufferEntry | undefined {
        return buffers.get(id);
    },

    write(id: BufferId, value: number, index: number = 0): void {
        const bufferObj = buffers.get(id);
        if (!bufferObj) return;
        Atomics.store(bufferObj.typedArray, index, value);
    },

    read(id: BufferId, index: number = 0): number | undefined {
        const bufferObj = buffers.get(id);
        if (!bufferObj) return;
        return Atomics.load(bufferObj.typedArray, index);
    },

    getBuffer(id: BufferId): SharedArrayBuffer | undefined {
        const bufferObj = buffers.get(id);
        if (!bufferObj) return;
        return bufferObj.sharedBuffer;
    },
};
