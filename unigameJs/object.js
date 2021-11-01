function Object(components,name){
  //init
  this.id = Date.now();
  this.components = components;
  this.name = name;

  //update function
  this.update = ()=>{
    for (const key in this.components){
      this.components = this.components[key].update(this)?.components ?? this.components;
    }
  }

  this.runEvent = (event)=>{
    return this.components.scrpit?.script[event] ?? function(){};
  }
}

const DComponents = {//all defualt components
  
  //use for testing
  "test": function (){
    this.last = Date.now();
    this.update = ()=>{
      if (Date.now()-this.last >= 1000){
        console.log("done");
        this.last = Date.now();
      }
    }
  },

  //body and physic component (IMPORTANT)
  "body": function (pos,area,isDynamic, noGravity,mass){
    //init
    this.pos = pos;
    this.area = area;
    this.velocity = new Vec2(0,0);
    this.isDynamic = isDynamic ?? false;

    //physic stuff
    this.mass = mass ?? 1;
    this.airResistance = 1;
    this.frictions = [new Vec2(0,0)];
    this.acceleration = new Vec2(0,0);
    this.noGravity = noGravity ?? false;
    this.forces = []

    this.onGround = false;
    
    this.update = ()=>{
      if (this.isDynamic){//perform physics
        //update acceleration
        //sum net force
        const netForce = new Vec2(0,0);
        this.forces.forEach((thing)=>{netForce.add(thing)});
        
        //doin gravity
        if (!this.noGravity && !this.onGround)
        netForce.minus(new Vec2(0,game.scene.gravity*this.mass));
        this.onGround = false;
        
        //drag
        this.frictions[0] = (this.velocity.clone().norm().multi(0.5*1.05*this.airResistance*game.scene.airDensity*(this.velocity.length()**2)))
        this.frictions.forEach((thing)=>{netForce.minus(thing)})
        //update velocity
        this.velocity.add(netForce.clone().multi(game.dt));
      }
      this.pos.add(this.velocity.clone().divide(this.mass).multi(game.dt));
    }
  },

  //rendering sprite
  "sprite": function(sprite,offset){
    //init
    //offset of the ppos value
    this.offset = offset ?? new Vec2(0,0);
    //mess with sprite pos offset
    if (sprite.sprite) this.posOffset = new Vec2(-sprite.sprite.size.x/2,-sprite.sprite.size.y/2);
    else this.posOffset = new Vec2(-sprite.size.x/2,-sprite.size.y/2)
    this.sprite = sprite;
    
    //"draw" the sprite
    this.update = (object)=>{
      this.sprite.draw(object.components.body.pos.clone().add(this.posOffset),this.offset);
    }
  },
  //render text
  "text": function(text,font,size, align,offset){
    this.text = text ?? "";
    this.font = font ?? "Arial";
    this.size = size ?? 10;
    this.align = align ?? "center";

    this.opacity = 1;
    this.offset = offset?? new Vec2 (0,0);
    
    //draw
    this.update = (object)=>{
      game.ctx.font = this.size*game.gu+"px "+this.font;
      game.ctx.textAlign = this.align;

      game.ctx.globalAlpha = this.opacity;
      const pos = object.components.body.pos.add(this.offset);
      game.ctx.fillText(this.text,pos.x,pos.y);
    }
  },

  //script (use for script)
  "script": function(script){
    this.init = true;
    this.script = script;
    //console.log(this.script)
    this.update = (object)=>{
      //init
      if (this.init){
        this.init = false;
        return this.script.init(object);
      }
      //updating
      return this.script.update(object)
    }
  },

  //trigger
  "trigger": function (size){
    this.size = size;

    this.update = (object)=>{
      const pos = object.components.body.pos;
      let doTheThing = (thing)=> (object.components.script?.script?.onEnterTrigger ?? function(){})(object,thing) ?? object;
      //run through all objects
      game.scene.runonall(function(){
        const thisBody = this.components.body;
        //find overlap
        if (findOverlap([pos.clone().minus(size),pos.clone().add(size)],
            [thisBody.pos.clone().minus(thisBody.area),thisBody.pos.clone().add(thisBody.area)]) && object.id != this.id)
            object = object.getEvent("onEnterTrigger")(object,this);
      });
      return object;
    }
  },

  //hit stop berb berb
  "colider":function (bouncy,mass){
    this.bouncy = bouncy ?? 1;
    this.firction = 0;
    this.mass = 0;//optional

    this.trigger = new DComponents.trigger(new Vec2(0,0));
    //calculate
    this.collide1dimension = (masses,speed)=>{
      const stuff = masses[0]+masses[1];
      return ((masses[0]-masses[1])/stuff)*speed[0]+((masses[1]*2)/stuff)*speed[1];
    }
    //do the work
    const script = function(object,thing){
      if (!thing().components.colider) return object;

      const thingMass = thing().components.collider?.mass ?? thing().components.body.mass;
      const thingSpeed = thing().components.body.velocity;
      const thisSpeed = object.components.body.velocity;
      
      object.components.body.velocity = new Vec2(
        this.collide1dimension([this.mass,thingMass],[thisSpeed.x,thingSpeed.x]),
        this.collide1dimension([this.mass,thingMass],[thisSpeed.y,thingSpeed.y])
      ).multi(this.bouncy);
      object.components.body.onGround = true;
      
      return object
    }.bind(this);
    
    this.update = (object)=>{
      //update trigger
      this.trigger.size = object.components.body.area;
      object.components.body = this.trigger.update({
        "components":{"body": object.components.body},
        "id": object.id,"getEvent":()=>script
      })

      return object;
    }
  }
};