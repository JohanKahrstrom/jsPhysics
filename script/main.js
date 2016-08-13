var PlayingAround = function() {
	/*
	 * Standard animation callback fixer found online.
	 * Source: paulirish.com/2011/requestanimationframe-for-smart-animating/
	 */
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame  ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	/*
	 * This function makes it simple to add onload events.
	 * Found online, apparently by Simon Willison.
	 */
	function addLoadEvent(func) {
			var oldonload = window.onload;
		if (typeof window.onload != 'function') {
		window.onload = func;
		} else {
			window.onload = function() {
				if (oldonload) {
					oldonload();
				}
				func();
			}
		}
	}
	addLoadEvent(myOnload);

	var canvas;
	var ctx;

	// var timeStep = 1000 / 60;
	var timeStep = 1000 / 60;

	function moveObjectVerlet() {
		var newposition = this.position.scaled(2).subtract(this.oldPosition).add(this.acceleration.scaled(timeStep*timeStep));
		var velocity = newposition.subtract(this.position);
		if (velocity.squaredMagnitude() > 100) {
			velocity = velocity.normalised().scaled(10);
			newposition = this.position.add(velocity);
		}

		this.oldPosition = this.position;
		this.position = newposition;
		this.purePosition = newposition;
		this.acceleration = new Vector(0, 0);
	}

	function verletObjectFromEuler(e) {
		var v = { position: e.position, acceleration: e.acceleration };
		v.oldPosition = e.position.subtract(e.velocity.scaled(timeStep));

		return v;
	}

	function getOldPositionFromVelocity(e, velocity) {
		return e.position.subtract(velocity.scaled(timeStep));
	}

	function makeVectorDrawer(color, radius) {
		return function() {
			ctx.save();
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, radius, 0, 2*Math.PI, true);
			ctx.fill();
			ctx.restore();
		}
	}

	/**
	 * Simple object used only to clear the screen.
	 */
	function ScreenClearer() {
		this.draw = function(ctx) {
			clearScreen(ctx);
		}

		function clearScreen(ctx) {
			ctx.save();
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.restore();
		}
	}

	var shouldStop = false;
	var step = false;
	var run = false;
	var first = true;

	function Line(l) {
		this.start = l[0];
		this.end = l[1];
		this.colliding = false;

		this.draw = function() {
			ctx.save();
			if (this.colliding) {
				ctx.strokeStyle = '#F00';
			} else {
				ctx.strokeStyle = '#000';
			}
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(this.start.position.x, this.start.position.y);
			ctx.lineTo(this.end.position.x, this.end.position.y);
			ctx.stroke();
			ctx.restore();
		}
	}

	var magnifier = new Object();
	magnifier.center = new Vector(0, 0);
	magnifier.scale = 1.0;

	function setUpEngine(engine, v) {
		/* Set up systems */
		//var accelerator = new GravityAccelerator();
		var accelerator = new EarthGravityAccelerator();
		var mover = new Mover();
		var collision = new LinearCollision();
		var dampener = new StiffDamper();
		var screenClearer = new ObjectRenderer(ctx, magnifier);
		var renderer = new ObjectRenderer(ctx, magnifier);

		engine.addSystem(screenClearer);
		engine.addSystem(accelerator);
		engine.addSystem(mover);
		engine.addSystem(dampener);
		engine.addSystem(collision);
		engine.addSystem(renderer);

		/*
		 * Set up elements.
		 * These are added in the order they will be shown by the renderer.
		 */

		// Screen clearer, only rendered.
		screenClearer.addObject(new ScreenClearer());
		// openderer.addObject(new ScreenClearer());

		var center = new Vector(0, 0);
		var offset = new Vector(140, 0);
		var n = 4;
		for (var i = 0; i < n; ++i) {
			addElement(accelerator, mover, renderer, dampener, collision, 4 + i, 50, 0.1*v, center.add(offset));
			offset = offset.rotate(2*3.14159265358979/n);
		}

		var rawLines = new Array();
		rawLines[0] = new Array();
		rawLines[0].push({position: new Vector(-200, -200), oldPosition: new Vector(-200, -200)});
		rawLines[0].push({position: new Vector(-200, 200), oldPosition: new Vector(-200, 200)});
		rawLines[1] = new Array();
		rawLines[1].push({position: new Vector(-200, 200), oldPosition: new Vector(-200, 200)});
		rawLines[1].push({position: new Vector(200, 200), oldPosition: new Vector(200, 200)});
		rawLines[2] = new Array();
		rawLines[2].push({position: new Vector(200, 200), oldPosition: new Vector(200, 200)});
		rawLines[2].push({position: new Vector(200, -200), oldPosition: new Vector(200, -200)});
		rawLines[3] = new Array();
		rawLines[3].push({position: new Vector(200, -200), oldPosition: new Vector(200, -200)});
		rawLines[3].push({position: new Vector(-200, -200), oldPosition: new Vector(-200, -200)});

		var lines = new Array();
		lines.push(new Line(rawLines[0]));
		lines.push(new Line(rawLines[1]));
		lines.push(new Line(rawLines[2]));
		lines.push(new Line(rawLines[3]));

		collision.addLine(lines[0]);
		collision.addLine(lines[1]);
		collision.addLine(lines[2]);
		collision.addLine(lines[3]);

		renderer.addObject(lines[0]);
		renderer.addObject(lines[1]);
		renderer.addObject(lines[2]);
		renderer.addObject(lines[3]);
	}

	function addElement(accelerator, mover, renderer, dampener, collision, n, r, v, center) {
		if (n < 3) {
			return;
		}

		var elements = new Array;
		var offset = new Vector(r, 0);
		for (var i = 0; i < n; ++i) {
			elements[i] = { position: center.add(offset), acceleration: new Vector(0, 0), radius: 5 , m: 1, im: 1};
			elements[i].oldPosition = getOldPositionFromVelocity(elements[i], new Vector(v, 0));
			elements[i].mass = 1
			offset = offset.rotate(2 * 3.14159265358979 / n);

			accelerator.addObject(elements[i]);
			elements[i].move = moveObjectVerlet;
			mover.addObject(elements[i]);

			collision.addObject(elements[i]);
		}

		for (var i = 0; i < n; ++i) {
			for (var j = 0; j < i; ++j) {
				dampener.addPair(elements[i], elements[j], elements[i].position.distance(elements[j].position));
			}
		}

		var rawLines = new Array();
		for (var i = 0; i < n; ++i) {
			rawLines[i] = new Array();
			rawLines[i].push(elements[i]);
			rawLines[i].push(elements[(i+1)%n]);
		}

		var lines = new Array();
		for (var i = 0; i < n; ++i) {
			lines.push(new Line(rawLines[i]));
		}

		for (var i = 0; i < n; ++i) {
			collision.addLine(lines[i]);
			renderer.addObject(lines[i]);
		}
	}

	function myOnload() {
	   console.log("Page loaded.");

	   canvas = document.getElementById('canvas');

	   if (canvas.getContext) {
	      ctx = canvas.getContext('2d');

	      ctx.translate(canvas.width/2, canvas.height/2);

	      // Start animating
	      startAnimationLoop();
	   } else {
	      console.log("Could not find canvas context.");
	   }
	}

	function getCursorInCanvas(e) {
		var rect = canvas.getBoundingClientRect();
		return new Vector(e.clientX - rect.left - canvas.width/2, e.clientY - rect.top - canvas.height/2);
	}

	function getCursorInWorld(canvasPoint) {
		return canvasPoint;
	}

	function startAnimationLoop() {
		console.log("Starting animation loop.");
		engine = new Engine()
		var v = -0.12;
		setUpEngine(engine, v);

		animloop();
	}

	function animloop() {
		if (!shouldStop) {
			requestAnimFrame(animloop);
			if (first || step) {
				run = true;
				if (first && step) {
					first = false;
				}
				step = false;
			} else {
				run = false;
			}

			engine.update(run);
		}
	}

	return {
		step : function() {
			step = true;
			first = false;
		}
	};
}();