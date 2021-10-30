function Game(defaultScene,canvasDisplay){
  //init
  this.canvas = canvasDisplay;
  this.ctx = this.canvas.getContext("2d");
  this.last = Date.now();

  //doing sizing stuff
  this.gu = innerWidth/160;
  this.canvas.width = this.gu*160;
  this.canvas.height = this.gu*90;
  this.ctx.imageSmoothingEnabled = false;

  this.scene = defaultScene;
  this.sounds = {};

  //update
  this.update = ()=>{
    //change the dt value
    this.dt = (Date.now()-this.last)/1000;
    this.ctx.clearRect(0,0,this.gu*160,this.gu*90)
    
    //update
    this.scene.update();
    this.last = Date.now();
  }

  //change scene
  this.switchScene = (scene)=>{
    this.scene.runonall(function(){(this.components.script?.onOff ?? function (){})();});
    let offScene = this.scene;
    this.scene = scene;
    this.scene.runonall(function(){(this.components.script?.onOn ?? function (){})();});
    
    return offScene;
  }
}

function Scene(init){
  this.objects = init();

  //game poperties here
  this.camera = new Vec2(0,0);
  this.gravity = 8;
  this.airDensity = 0.001;
  
  this.update = ()=>{
    this.runonall(function(){this.update()});
  }

  //run stuff on all objects
  this.runonall= (func)=>{
    this.objects.forEach((thing)=>{
      if (thing.update) return func.bind(thing)();
      return thing.forEach((thing1)=>func.bind(thing1)());
    })
  }
}