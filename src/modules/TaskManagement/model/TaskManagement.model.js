import {
	taskActionStatuses,
	taskStatuses,
	taskTypes,
} from "../constants/TaskManagement.constants";

export class TaskList {
	constructor(obj) {
		this.tasks = Array.isArray(obj)
			? obj.map((task) => new Task(task))
			: [];
	}
}

export class Task {
	constructor(obj) {
		this._id = obj.identifier_label || "";
		this.name = obj.identifier || "";
		this.type = obj.type || taskTypes.ad_hoc.value;
		this.actions = Array.isArray(obj.tasks)
			? obj.tasks.map((action) => new TaskAction(action))
			: [];
		this.collapsed = false;
	}
}

export class TaskAction {
	constructor(obj) {
		this._id = obj._id || "";
		this.action_id = obj.action_id || "";
		this.name = obj.name || "";
		this.status = obj.status || taskActionStatuses.pending.value;
		this.due_date = obj.due_date || null;
		this.type = obj.type || taskTypes.ad_hoc.value;
		this.workflow_id = obj.workflow_id || null;
		this.workflow_user_id = obj.workflow_user_id || null;
		this.workflow_exec_id = obj.workflow_exec_id || null;
		this.is_approval_task = obj.is_approval_task || false;
	}
}
