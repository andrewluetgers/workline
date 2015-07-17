var _ = require('lodash'),
	async = require('async');


/**
 * Starts the workflow with a given state.
 * @param {Array} the workflow of tasks
 * @param {Object} state to be passed to each step
 * @param {Function} completion callback
 */
var exampleWorkflow = {
	name: "",
	description: "",
	defaultState: function() {return {}},
	steps: [
		{}
	]
}



/**
 * @param workflow the workflow js object
 * @param getState function(id, cb) callback is node style cb(err, state)
 * @param setState function(state, cb) callback is node style cb(err, state)
 * @returns runWorkflow(id|newState|savedState, )
 */
module.exports = function workline(workflow, getState, setState) {

	getState = getState || _getState;
	setState = setState || _setState;

	var defaultState = workflow.defaultState || function() {return {}};

	return function run(state, notify) {

		function stateHandler(err, savedState) {
			err ? notify(err, savedState.id) : _run(workflow, savedState, getState, setState, notify);
		};

		// resume an existing workflow by id
		if (_.isString(state)) {
			getState(id, function(err, savedState) {
				savedState.status = "RUNNING";
				err ? notify(err, id) : setState(savedState, stateHandler);
			});

		// start a new run with default state
		// or overwrite the state of an existing run and resume with provided state
		} else {
			if (arguments.length == 1 && _.isFunction(state)) {
				notify = state;
				state = defaultState();
			} else {
				state = state || defaultState();
			}

			state.status = "RUNNING";
			setState(state, stateHandler);
		}
	};
};

// default set/get functions
var dataStore = [];

function _setState(state, cb) {
	if (state) {
		state.id = state.id || dataStore.length;
		dataStore[state.id] = state;
		cb(null, state);
	} else {
		cb("Error: state not provided");
	}
}

function _getState(id, cb) {
	var state = dataStore[id];
	if (!state) {
		cb("Error: Invalid Id: " + id);
	}

	cb(null, state);
}

// where the magic happens
function _run(workflow, state, getState, setState, notify) {

	var index = 0;

	function next(err) {
		var step = workflow.steps[index++]; // todo use get/set state

		if (!step) {
			// all done, or are we
			// todo check that all tasks have finished
			notify(err, state);

		} else {
			try {
				if (err) {
					next(err);
				} else if (_.isArray(task)) {
					async.parallelLimit(task, 10, next);
				} else if (_.isObject(task)) {
					async.parallelLimit(task.tasks, task.limit || 10, next);
				} else {
					task(state, next);
				}
			} catch (e) {
				next(e);
			}
		}
	}
}