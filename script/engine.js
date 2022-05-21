function Engine() {
   var systems = new Array();
   var objects = new Array();

   this.addObject = function(object) {
      object.id = objects.length
      objects.push(object)
      console.log("Added object with id " + object.id)
   }

   this.addSystem = function(system) {
      systems.push(system);
   }

   this.update = function(step) {
      if (step) {
         for (var i = 0; i < systems.length; ++i) {
            systems[i].action(step);
         }   	  	
      }
   }
}