function Engine() {
   var systems = new Array();

   this.addSystem = function(system) {
      systems.push(system);
   }

   this.update = function(step) {
      for (var i = 0; i < systems.length; ++i) {
         systems[i].action(step);
      }
   }
}