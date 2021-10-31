//(function (){console.log("no")}?? function(){console.log("yes")})()

const game = new Game(new Scene(()=>{return []}), document.getElementById("display"))
game.switchScene(new Scene(()=>{return [new Object ({
  "colider":new DComponents.colider(0),
  "body":new DComponents.body(new Vec2(20,-60),new Vec2(10,10),false,true,0.1),
  "sprite":new DComponents.sprite(new animatedSprite(
    new Sprite("placeholder.png",0,0,16,16,10,10),[500])),
  "script":new DComponents.script(new function(){
    this.init = ()=>{
      game.sounds.fart = new Audio("fart.mp3");
      //game.sounds.fart.play();
    };
    this.last = Date.now();
    this.update = (components)=>{
      //if (Date.now()-this.last >= 1000){console.log(components.body.velocity);this.last = Date.now()}
      //console.log(components.body.forces.length())
      return components;
    }
  })
},"stay"),[new Object({
  "colider":new DComponents.colider(2),
  "body":new DComponents.body(new Vec2(20,-10),new Vec2(10,10),true,false,10),
  "sprite":new DComponents.sprite(new Sprite("placeholder.png",16,0,16,16,10,10)),
  "script":new DComponents.script(new function(){
    this.last = Date.now();
    this.init = (object)=>{
      //object.components.body.velocity = (new Vec2 (0,-10));
      return object;
    };
    this.update = (object)=>{
      
    };
  })
},"move")]]}
));

function run(){
  requestAnimationFrame(run);
  game.update();
}
run();