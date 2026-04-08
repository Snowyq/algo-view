import { clamp } from "../../utils/values"
import { Algorithm } from "../Algorithm"
import { CacheManager } from "../CacheManager"
import { OptionsManager } from "../OptionsManager"

export class SortAlgorithm extends Algorithm {
    optionsManager
    cacheManager
    name
    complexity
    MAX_GROUP_CACHE_SIZE = 20
    operations = []
    selected = []

    options = {
        steps: {
            types: {
                initial: true,
                check: true,
                "check-true": true,
                "check-false": true,
                swap: true,
                select: true,
                finish: true,
            },
        },
    }

    constructor(array) {
        super()
        this.array = array
        this.optionsManager = new OptionsManager(this.options)
        this.cacheManager = new CacheManager(this.cache)
        this.init()
    }

    init() {
        this.createSteps()
    }

    reset() {
        this.operations = []
        this.steps = []
        this.createSteps()
    }

    changeInput(array) {
        this.array = array
        this.reset()
    }

    use() {
        return {
            steps: this.getSteps(),
            operations: this.getOperations(),
            array: this.getArray(),
            minValue: this.getArrayMinMax().min,
            maxValue: this.getArrayMinMax().max,
            name: this.name,
            complexity: this.complexity,
        }
    }

    data() {
        return this.use()
    }

    createStep(step) {
        if (this.options.steps.types[step.type]) {
            this.steps.push({ ...step, selected: this.selected.slice() })
        }
        if (!("operationId" in step)) {
            step.prevOperationId =
                this.operations.length === 0
                    ? undefined
                    : this.operations.length - 1
        }
    }

    getSteps() {
        return this.steps.slice()
    }

    getStepByIndex(index) {
        const steps = this.getSteps()
        const stepIndex = clamp(index, 0, steps.length - 1)
        const step = steps[stepIndex]
        return step
    }

    createOperation(type, elements) {
        this.operations.push({ type, elements })
        return this.operations.length - 1
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Step Types                                 */
    /* -------------------------------------------------------------------------- */

    swap(index1, index2, arr, options) {
        const activeItems = [index1, index2]
        const instructionId = options.instructionId
        const actionType = "swap"
        const operationId = this.createOperation(actionType, activeItems)
        ;[arr[index1], arr[index2]] = [arr[index2], arr[index1]]
        this.createStep({
            type: actionType,
            activeItems,
            operationId,
            instructionId,
        })
    }

    check(index1, operator, index2, arr, options) {
        // Operation Details
        const type = "check"
        const activeItems = [index1, index2]
        const instructionId = options.instructionId

        // creates check step
        this.createStep({
            type,
            activeItems,
            operator,
            instructionId,
        })

        //
        const isTrue = this.check(arr[index1], arr[index2], operator)

        if (isTrue)
            this.createStep({ type: "check-true", activeItems, instructionId })
        else
            this.createStep({
                type: "check-false",
                activeItems,
                instructionId,
            })

        // return Result of comparison for use in if statement
        return isTrue
    }

    select(index, options) {
        // Operation details
        const type = "select"
        const activeItems = [index]

        // handles perm selection
        if (options.mode === "perm") {
            this.selected = this.selected.filter((el) => el.id !== options.id)
            this.selected.push({ id: options.id, index })
        }

        // creates step
        this.createStep({ type, activeItems })
    }

    assign(targetIndex, itemIndex, arr, options) {
        const type = "assign"
        const activeItems = [targetIndex, itemIndex]
        const instructionId = options.instructionId
        const operationId = this.createOperation(type, activeItems)
        arr[targetIndex] = arr[itemIndex]
        this.createStep({ type, activeItems, instructionId, operationId })
    }

    selectMany(selects) {
        selects.forEach((sel) => {
            if (sel.options && sel.options.mode === "perm") {
                this.selected = this.selected.filter(
                    (el) => el.id !== sel.options.id
                )
                this.selected.push({ id: sel.options.id, index: sel.index })
            }
        })
        this.createStep({
            type: "select",
            activeItems: selects.map((sel) => sel.index),
            instructionId: [
                ...new Set(
                    selects.map((sel) => sel.options?.instructionId).flat()
                ),
            ],
        })
    }

    createSteps() {
        const dir = this.direction
        const arr = this.getArray()

        this.createStep({
            type: "initial",
            activeItems: [],
        })
        this.sort(arr, dir)
        this.createStep({
            type: "finish",
            activeItems: Array.from({ length: arr.length }, (_, i) => i),
        })
        this.cacheManager
            .initGroup("state")
            .createPersistentCache(
                "state",
                this.getArray(),
                this.getOperations(),
                this.makeOperation
            )
    }

    getResult() {
        return this.resultArray.slice()
    }

    #calcArrayMinMax() {
        const arr = this.getArray()
        this.minValue = Math.min(...arr)
        this.maxValue = Math.max(...arr)
    }

    getArrayMinMax() {
        if (isNaN(this.minValue) || isNaN(this.maxValue)) {
            this.#calcArrayMinMax()
        }
        return { min: this.minValue, max: this.maxValue }
    }

    getOperationIdByStepIndex(index) {
        const steps = this.getSteps()
        const stepIndex = clamp(index, 0, steps.length - 1)
        // From given state find closest prev state with assigned operationId

        if (steps[stepIndex].prevOperationId) {
            return steps[stepIndex].prevOperationId
        }

        for (let i = stepIndex; i > 0; i--) {
            const step = steps[i]
            if (!isNaN(step.operationId)) {
                return step.operationId
            }
        }
    }

    getStateByOperationId(operationId) {
        let state = this.getArray()
        let stateId = 0
        if (isNaN(operationId)) return state
        const operations = this.getOperations()

        // Restore state by prev operationId and calculate state from that
        const closestState = this.cacheManager.getClosest("state", operationId)
        if (closestState) {
            state = closestState.item.slice()
            stateId = closestState.key
        }
        if (stateId === operationId) return state

        if (stateId > operationId) {
            let counter = stateId + 1
            while (counter - 1 > operationId) {
                counter--
                const operation = operations[counter]
                this.makeOperation(operation, state)
            }
        } else if (stateId < operationId) {
            let counter = stateId
            while (counter < operationId) {
                counter++
                const operation = operations[counter]
                this.makeOperation(operation, state)
            }
        }
        return state
    }

    makeOperation(operation, state) {
        if (operation.type === "swap") {
            const [index1, index2] = operation.elements
            ;[state[index1], state[index2]] = [state[index2], state[index1]]
        }
        if (operation.type === "assign") {
            const [targetIndex, valueIndex] = operation.elements
            state[targetIndex] = state[valueIndex]
        }
    }

    getStateByStepsIndex(stepIndex) {
        const operationId = this.getOperationIdByStepIndex(stepIndex)
        const state = this.getStateByOperationId(operationId)
        return state
    }

    getArrayLength() {
        return this.array.length
    }

    getArray() {
        return this.array.slice()
    }

    sort() {}

    static getInstructions() {}
}
