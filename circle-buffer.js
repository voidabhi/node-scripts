function CircularBuffer(n) {
    this._array= new Array(n);
    this.length= 0;
}
CircularBuffer.prototype.toString= function() {
    return '[object CircularBuffer('+this._array.length+') length '+this.length+']';
};
CircularBuffer.prototype.get= function(i) {
    if (i<0 || i<this.length-this._array.length)
        return undefined;
    return this._array[i%this._array.length];
};
CircularBuffer.prototype.set= function(i, v) {
    if (i<0 || i<this.length-this._array.length)
        throw CircularBuffer.IndexError;
    while (i>this.length) {
        this._array[this.length%this._array.length]= undefined;
        this.length++;
    }
    this._array[i%this._array.length]= v;
    if (i==this.length)
        this.length++;
};
CircularBuffer.IndexError= {};
