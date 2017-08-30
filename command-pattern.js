
function Calculator () {
    this._currentValue = 0;
    this.commands = [];
}

Calculator.prototype = {
    execute: function(command) {
        this._currentValue = command.execute(this._currentValue);
        this.commands.push(command);
    },
    undo: function() {
        var cmd = this.commands.pop();

        this._currentValue = cmd.undo(this._currentValue);
    },
    getCurrentValue: function() {
        return this._currentValue;
    }
}

function Command (fn, undo, value) {
    this.execute = fn;
    this.undo = undo;
    this.value = value;
}

function add (value) {
    return value + this.value;
}
function AddCommand (value) {
    Command.call(this, add, sub, value);
}
function sub (value) {
    return value - this.value;
}
function SubCommand (value) {
    Command.call(this, sub, add, value);
}
