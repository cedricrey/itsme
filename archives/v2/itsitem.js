var itemsProps = {
	"koopaShell":{
		isStatic:true,
		touched:touchedKoopaShellItem,
		holdable:true,
	}
};
function getItemAt(x,y,w,h,butMe){
	item = null;
	$.each(level.activeItems,function(key,val){
    if((x+w > this.x && x < this.x + this.w && y+h > this.y && y < this.y + this.h) && this != butMe)
      item = this;
	});
	return item;
}
function Item(startX,className,w,h){
	this.startX = startX;
	this.w = w;
	this.h = h;
	this.x = null;	
	this.y = null;
	this.className = className;
	this.dir = "Bwd";
	this.node = null;
	this.nowJumping = false;
	this.nowFalling = false;
	this.id = null;
	this.isStatic = false;
	this.holdable = false;
	this.speed = 0;
	this.jumpHeight = 20;
	if(itemsProps[className])
		$.extend(this,itemsProps[className]);
	this.activate = function (){
		this.x = this.startX;
		support = getBlockAt(this.x,0,0,2000)
		if(!this.y)
			this.y = support.y + support.h;
		this.node = $('<div class="'+this.className+'"></div>').css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px"});
		if(this.h)
			this.node.css("height",this.h+"px");	
		else
			this.h = parseInt(this.node.css("height"));
		if(this.w)
			this.node.css("width",this.w+"px");	
		else
			this.w = parseInt(this.node.css("width"));
		$(document.body).append(this.node);
		$this = this;
		if(typeof this.specialMove != "undefined" && !this.isStatic)
			this.interval = setInterval($.proxy(this.specialMove,this),40);
		else if(!this.isStatic)
			this.interval = setInterval($.proxy(this.moveMe,this),40);			
	}
	this.stopMoving = function(){
		clearInterval(this.interval);
	}
	this.jump = function(){
		console.log("enemie jump!")
		this.nowJumping = true;
		this.node.addClass("jump");
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeJump = (new Date()).getTime();
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += Math.PI * (now - this.lastTimeJump)/1000;
	    
	    if (this.wavePos >= Math.PI)
	    	nextY = this.y - fallingSpeed;
	    else	
	    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;
			
	    if(nextY <= 0)
			this.die();
	    //You continue to jump/fall, no colision
	    else if(!getBlockAt(this.x,nextY,this.w,this.h))
	    	{
    		setTimeout($.proxy(this.jump,this), 20);
	    	this.node.css({bottom:nextY+"px"});
	    	this.y = nextY;
	    	this.lastTimeJump = now;
	    	}
	    //You touch a block, but over you. You continue the jump, but now falling
	    else if(nextY > this.y)
	    	{
    		setTimeout($.proxy(this.jump,this), 20);
	    	this.lastTimeJump = now;
	    	this.wavePos = Math.PI/2;
	    	}
	    //You touch something under you. Restart the jump.
	    else{
			this.nowJumping = false;
			}
		
	}
	/*
	this.touched = function(){
		//Nothing, too specific
	}
	*/
}

function touchedKoopaShellItem(isHeld){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	newKoopa = new Enemie(x+2+marioAcc,"koopaShell");
	newKoopa.y = y;
	newKoopa.dir = this.dir;
	newKoopa.id = this.id;
	level.activeItems[this.id] = void(0);
	level.activeEnemies[this.id] = newKoopa;	
	newKoopa.activate();
	if(isHeld)
		{
		//newKoopa.wavePos = Math.PI/2;
		newKoopa.jump();
		}
}