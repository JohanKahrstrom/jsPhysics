var tolerance = 0.0000000001;

/**
 * This system accelerates all objects using newtonian gravitation.
 */
function GravityAccelerator() {
   var objects = new Array();

   this.addObject = function(object) {
      objects.push(object);
   }

   this.action = function() {
      for (var i = 0; i < objects.length; ++i) {
         for (var j = 0; j < i; ++j) {
            acceleratePair(objects[i], objects[j]);
         }
      }
   }

   function acceleratePair(e, f) {
      // Vector from e to f
      var v = f.position.subtract(e.position);

      // Distance between particles
      var r2 = v.squaredMagnitude();

      // Normalised vector from e to f
      var n = v.normalised();

      var a1 = n.scaled(1 / r2)
      var a2 = n.scaled(1 / r2)

      e.acceleration = e.acceleration.add(a1);
      f.acceleration = f.acceleration.subtract(a2);
   }
}

/**
 *
 */
function EarthGravityAccelerator() {
   var objects = {};

   this.addObject = function(object) {
      if (typeof object.id === "undefined") throw "Adding object with no id to EarthGravityAccelerator.";
      objects[object.id] = object;
      console.log("Added object " + object.id + " to EarthGravityAccelerator.");
   }

   this.action = function() {
      for (id in objects) {
         accelerate(objects[id]);
      }
   }

   function accelerate(e) {
      e.acceleration = new Vector(0, 0.001);
   }
}

function StiffDamper() {
   var pairs = new Array();

   this.addPair = function(f, s, d) {
      var pair = new Object();
      pair.first = f;
      pair.second = s;
      pair.distance = d;
      pairs.push(pair);
   }

   this.action = function() {
      var error = 1;
      while (error > 0.5 * tolerance) {
         error = 0;
         for (var i = 0; i < pairs.length; ++i) {
            var thisError = dampen(pairs[i]);
            error = (thisError > error) ? thisError : error;
         }
      }
   }

   function dampen(pair) {
      var v = pair.first.position.subtract(pair.second.position);
      var error = v.magnitude() - pair.distance;
      var n = v.normalised();

      pair.first.position = pair.first.position.subtract(n.scaled(error*pair.first.im/(pair.first.im + pair.second.im)));
      pair.second.position = pair.second.position.add(n.scaled(error*pair.second.im/(pair.first.im + pair.second.im)));

      return error;
   }
}

function LinearCollision() {
   var objects = new Array();
   var lines = new Array();

   this.addLine = function(l) {
      lines.push(l);
   }

   this.addObject = function(e) {
      objects.push(e);
   }

   this.action = function() {
      for (var j = 0; j < lines.length; ++j) {
         lines[j].colliding = false;
      }
      var count = 0;
      while(resolveAll()) {
         count++;
         // if (count > 1000) {
         //    return;
         // }
      }
   }

   function resolveAll() {
      collision = false;
      for (var i = 0; i < objects.length; ++i) {
         for (var j = 0; j < lines.length; ++j) {
            collision |= checkObject(objects[i], lines[j]);
         }
      }
      return collision;
   }

   function checkObject(e, line) {
      var oldLine = line.end.oldPosition.subtract(line.start.oldPosition);
      var newLine = line.end.position.subtract(line.start.position);
      var oldPoint = e.oldPosition.subtract(line.start.oldPosition).transform(oldLine.normalised());
      var newPoint = e.position.subtract(line.start.position).transform(newLine.normalised());
      var pathlength = e.position.subtract(e.oldPosition).magnitude();

      var ttt = paddedSign(oldPoint.y);
      var tttt = paddedSign(newPoint.y);
      if (ttt*tttt < 0) {
         var intersectionTime = (-oldPoint.y)/(newPoint.y - oldPoint.y);
         var intersectionX = (1 - intersectionTime) * oldPoint.x + intersectionTime * newPoint.x;

         var oldLength = oldLine.magnitude();
         var newLength = newLine.magnitude();

         var intersectionLength = (1 - intersectionTime) * oldLength + intersectionTime * newLength;

         var tt = paddedSign(-intersectionX);
         if (tt < 0) {
            var t = paddedSign(intersectionX - intersectionLength);
            if (t < 0) {
               e.colliding = true;
               line.colliding = true;
               resolveObject(e, line);
               return true;
            }
         }

      }
      return false;
   }

   function resolveObject(e, line) {
      var a = e.position.subtract(line.start.position);
      var lineNormal = line.end.position.subtract(line.start.position).rotateRight().normalised();
      var intercept = a.dot(lineNormal);
      var sign = intercept ? (intercept < 0 ? -1 : 1) : 0;
      intercept += 2*tolerance*sign;
      e.position = e.position.subtract(lineNormal.scaled(intercept));
   }
}

function paddedSign(v) {
   return v < tolerance ? -1 : 1;
}

/**
 * This is a straightforward system which moves all added objects.
 */
function Mover() {
   var objects = new Array();

   this.addObject = function(object) {
      objects.push(object);
   }

   this.action = function() {
      for (var i = 0; i < objects.length; ++i) {
         objects[i].move();
      }
   }
}

/**
 * This is a straightforward rendering system which renders the objects.
 */
function ObjectRenderer(c, m) {
   var objects = new Array();
   var ctx = c;
   var magnifier = m;

   this.addObject = function(object) {
      objects.push(object);
   }

   this.action = function() {
      ctx.save();
      ctx.translate(m.center.x, m.center.y);
      ctx.scale(m.scale, m.scale);
      ctx.translate(-m.center.x, -m.center.y);
      for (var i = 0; i < objects.length; ++i) {
         objects[i].draw(ctx);
      }
      ctx.restore();
   }
}
