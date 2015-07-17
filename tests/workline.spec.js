
var workline = require('../'),
	expect = require('expect.js');

var dataStore = [];

function setState(state, cb) {
	var id = dataStore.length;
	state = state || {};
	state.id = id;
	dataStore[id] = state;
	cb(null, state);
}

function getState(id, cb) {
	var state = dataStore[id];
	if (!state) {
		state = dataStore[id] = {id: id};
	}
	cb(null, state);
}


describe('workline', function() {
	describe('init', function() {
		it('should return a function', function() {
			var run = workline({});
			expect(run).to.be.a('function');
		});
	});
});