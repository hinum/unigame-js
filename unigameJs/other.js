function Vec2(x,y){
  this.x = x;
  this.y = y;
  //make a copy of vec
  this.clone = ()=>{
    const x = this.x;
    const y = this.y;
    //console.log(this.x,this.y)
    return new Vec2(x,y);
  }
  
  //operations
  this.add = (vec)=>{
    this.x += vec.x;this.y += vec.y;
    return new Vec2(x+vec.x,y+vec.y);
  }
  this.minus = (vec)=>{
    this.x -= vec.x;this.y -= vec.y;
    return new Vec2(x-vec.x,y-vec.y);
  }
  
  this.multi = (vec)=> {
    if (typeof vec == "number"){//check if there is scaler
      this.x *= vec;this.y *= vec;
      return new Vec2(x*vec,y*vec);
    }
    this.x *= vec.x;this.y *= vec.y;
    return new Vec2(x*vec.x,y*vec.y);
  }

  this.divide = (other)=>{
    if (typeof other == "number"){this.x/=other,this.y /= other}
    else {this.x /= other.x;this.y /= other.y}

    return this
  }
   
  // use to find magnitude but i called it length for some reason
  this.length = ()=>{
    return Math.sqrt(this.x**2+this.y**2);
  }
  //normalized
  this.norm = ()=>{
    return this.divide(this.length());
  }
  this.invert = ()=>{
    this.x = -this.x;this.y = -this.y;
    return this;
  }
}

function Audio(src,volum){
  let returning = document.createElement("audio");
  returning.src = src;
  returning.volum = volum ?? 1;

  return returning;
}

//image
function Sprite(src,px,py,psx,psy,sx,sy) {
  this.image = new Image();
  this.image.src = src;
  this.opacity = 1;
  
  //in image cord
  this.ppos = new Vec2(px,py);
  this.psize = new Vec2(psx,psy);
  
  //size in game
  this.size = new Vec2(sx,sy);
  
  this.draw = (pos,offset)=>{
    game.ctx.globalAlpha = this.opacity;
   // console.log( pos.x)
    game.ctx.drawImage(
      this.image,
      this.ppos.x+offset.x,this.ppos.y+offset.y,
      this.psize.x,this.psize.y,
      pos.x*game.gu,-(pos.y*game.gu),
      this.size.x*game.gu,this.size.y*game.gu
    )
  }
}  
//moving image
//NOTE : sprite sheet will be read left to right and use offset to adjust y
function animatedSprite(sprite, timing){
  this.sprite = sprite;
  
  this.frame = 0;
  this.lastFrame = Date.now();
  this.timing = timing;
  
  this.draw = (pos,offset)=>{
    //updating Sprite position
    if (Date.now()-this.lastFrame >= this.timing[this.frame]){
      this.frame++;
      if (this.frame == this.timing.length) this.frame = 0;
      this.lastFrame = Date.now();
    }

    //draw
    this.sprite.draw(pos,new Vec2(this.frame*16+offset.x,offset.y));
  }
}

//find how much 2 box overlap
//insert 2 arrays of topleft bottom right
function findOverlap(box1,box2){
  //swap
  if (box1[0].x > box2[0].x){
    const bfBox1 = box1;
    box1 = box2;
    box2 = bfBox1;
  }

  let trueOverlap = (line1,line2)=>{
    return line1[1] >= line2[0] && line2[1] >= line1[0];
  }
  let xOver = trueOverlap([box1[0].x,box1[1].x],[box2[0].x,box2[1].x]);
  let yOver = trueOverlap([box1[0].y,box1[1].y],[box2[0].y,box2[1].y]);
  return (xOver && yOver);
}

// input thing => [pos,raidus]
function findOverlapCircle(thing1,thing2){
  return thing1[0].clone().minus(thing2).length() <= thing1[1]+thing2[1];
}
