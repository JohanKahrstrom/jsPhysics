function Vector(thex, they) {
	thex = typeof thex !== 'undefined' ? thex : 0;
	they = typeof they !== 'undefined' ? they : 0;

	this.x = thex;
	this.y = they;
}

Vector.prototype.toString = function() {
	return "Vector(" + this.x + ", " + this.y + ")";
}

Vector.prototype.add = function(other) {
	return new Vector(this.x + other.x, this.y + other.y);
}

Vector.prototype.negate = function() {
	return new Vector(-this.x, -this.y);
}

Vector.prototype.subtract = function(other) {
	return new Vector(this.x - other.x ,this.y - other.y);
}

Vector.prototype.scaled = function(factor) {
	return new Vector(this.x * factor, this.y * factor);
}

Vector.prototype.isEqualTo = function(other) {
	return (this.x == other.x && this.y == other.y);
}

Vector.prototype.dot = function(other) {
	return this.x * other.x + this.y * other.y;
}

Vector.prototype.cross = function(other) {
	return this.x * other.y - this.y * other.x;
}

Vector.prototype.squaredMagnitude = function() {
	return this.dot(this);
}

Vector.prototype.magnitude = function() {
	return Math.sqrt(this.dot(this));
}

Vector.prototype.angle = function() {
	return Math.atan2(this.x, this.y);
}

Vector.prototype.angley = function() {
	return Math.atan2(this.y, -this.x);
}

Vector.prototype.normalised = function() {
	return this.scaled(1/this.magnitude());
}

Vector.prototype.distance = function(other) {
	return this.subtract(other).magnitude();
}

Vector.prototype.rotate = function(angle) {
   return new Vector(this.x * Math.cos(angle) - this.y * Math.sin(angle),
                     this.x * Math.sin(angle) + this.y * Math.cos(angle));
}

Vector.prototype.rotateRight = function() {
	return new Vector(-this.y, this.x);
}

// Returns the projection of this onto other vector
Vector.prototype.project = function(other) {
	return other.scaled(this.dot(other) / other.dot(other));
}

// Returns the rejection of this onto other vector,
// i.e. this.project(other) + this.reject(other) = this;
Vector.prototype.reject = function(other) {
	return this.subtract(this.project(other));
}

// Returns
Vector.prototype.transform = function(that) {
	return new Vector(this.dot(that), this.cross(that)).scaled(1/that.magnitude());
}