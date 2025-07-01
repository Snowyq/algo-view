import { isObject } from "../utils/objects";

export class OptionsManager {
	opened;
	openedName;
	stack = [];
	nameStack = [];

	constructor(optionsObject) {
		this.options = optionsObject;
		this.opened = this.options;
	}

	selectGroup(group) {
		if (group in this.opened && isObject(group)) {
			this.opened = this.opened[group];
			this.openedName = group;
			this.stack.push(this.opened);
			this.nameStack.push(group);
		}
		return this;
	}

	unselectGroup() {
		if (this.stack.length === 0) this.close();
		this.opened = this.stack.pop();
		this.openedName = this.nameStack.pop();
		return this;
	}

	hasOption(optionName) {
		if (optionName in this.opened) return true;
		else return false;
	}

	isEnabled(optionName) {
		return !!this.opened[optionName];
	}

	close() {
		this.opened = this.options;
		this.openedName = "";
		this.stack = [];
		return this;
	}

	getGroups() {
		return Object.keys(this.opened);
	}

	getSelected() {
		return this.opened;
	}

	getSelectedName() {
		return this.openedName;
	}

	isGroupSelected() {
		return !!this.openedName;
	}

	getOption(optionName) {
		if (this.hasOption(optionName)) {
			return this.opened[optionName];
		}
	}

	setOption(optionName, value) {
		if (this.hasOption(optionName)) {
			this.opened[optionName] = value;
		}
		return this;
	}

	addOption(optionName, value) {
		if (!this.hasOption(optionName)) {
			this.opened[optionName] = value;
		}
		return this;
	}

	setOptions(options) {
		for (let optionName in options) {
			this.setOption(optionName, options[optionName]);
		}
		return this;
	}
}
