var enemiesProps = {
	"koopa":{
		speed:1.5,
		specialDie:koopaShellKilled
	},
	"flyingKoopa":{
		speed:2.5,
		specialMove:flyingKoopaMove,
		wavePos : 0	,
		specialDie:flyingKoopaDie
	},
	"koopaShell":{
		speed:8,
		enemieKiller:true,
		specialDie:koopaShellKilled,		
		jumpHeight:5
	}
};
function getEnemieAt(x,y,w,h,butMe){
	enemie = null;
	$.each(level.activeEnemies,function(key,val){
    if((x+w > this.x && x < this.x + this.w && y+h > this.y && y < this.y + this.h) && this != butMe)
      enemie = this;
	});
	return enemie;
}
function Enemie(startX,className,w,h){
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
	this.speed = 1;
	this.wavePos = 0;
	this.jumpHeight = 20;
	if(enemiesProps[className])
		$.extend(this,enemiesProps[className]);
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
		/*
		if(typeof this.specialMove != "undefined")
			this.interval = setInterval('level.activeEnemies["'+this.id+'"].specialMove()',40);
		else
			this.interval = setInterval('level.activeEnemies["'+this.id+'"].moveMe()',40);
		*/
			
		if(typeof this.specialMove != "undefined")
			this.interval = setInterval($.proxy(this.specialMove,this),40);
		else
			this.interval = setInterval($.proxy(this.moveMe,this),40);
	}
	this.moveMe = function (){
		avance = 0
		if(this.dir == "Bwd")
			avance = -this.speed;
		else if(this.dir == "Fwd")
			avance = this.speed;
		if(!getBlockAt(this.x+avance,this.y,this.w,this.h) && !getEnemieAt(this.x+avance,this.y,this.w,this.h,this))
			{
			this.x+=avance
			this.node.css({left:(this.x)+"px"});
			}
		else if((otherenemie = getEnemieAt(this.x+avance,this.y,this.w,this.h,this)) != null){
			if(otherenemie.enemieKiller)
				this.die();
			else if(this.enemieKiller)
				otherenemie.die();
			else
			{
			this.changeDirection();
			if(otherenemie.dir == this.dir)
				otherenemie.changeDirection();
				}
		}
		else
			{
				this.changeDirection();
			}
		for(i=0;i<fallingSpeed;i++)
			if(!getBlockAt(this.x,this.y-1,this.w,this.h) && !this.nowJumping)
				{
					this.nowFalling = true;
					this.y -= 1;
					this.node.css({bottom:this.y+"px"});
				}
		if(this.y <= 0)
			this.die();
	}
	this.jump = function(){
		this.nowJumping = true;
		this.node.addClass("jump");
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeJump = (new Date()).getTime()-10;
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
	this.changeDirection = function(){
		if(this.dir == "Fwd")
			{
			this.dir="Bwd";
			this.node.removeClass("turnRight");
			}
		else
			{
			this.dir="Fwd";
			this.node.addClass("turnRight");						
			}
	}
	this.isKilled = function(){
		if(this.specialDie)
			this.specialDie();
		else
		{
			this.die();
		}
	}
	this.die = function(){		
		this.node.remove();
		level.activeEnemies[this.id] = void(0);
		clearInterval(this.interval);
	}
}
koopaJumpHeight = 20;
function flyingKoopaMove(){
	this.nowJumping = true;
	this.node.addClass("jump");
	if(typeof this.lastTimeJump == "undefined")		
		this.lastTimeJump = (new Date()).getTime()-10;
	now = (new Date()).getTime();
	this.lastX = this.wavePos;
    this.wavePos += Math.PI * (now - this.lastTimeJump)/1000;
    
    if (this.wavePos >= Math.PI)
    	nextY = this.y - fallingSpeed;
    else	
    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * koopaJumpHeight ;//* (now - lastTimeJump)/1000;
		
    if(nextY <= 0)
		this.die();
    //You continue to jump/fall, no colision
    else if(!getBlockAt(this.x,nextY,this.w,this.h))
    	{
    	this.node.css({bottom:nextY+"px"});
    	this.y = nextY;
    	this.lastTimeJump = now;
    	}
    //You touch a block, but over you. You continue the jump, but now falling
    else if(nextY > this.y)
    	{
    	this.lastTimeJump = now;
    	this.wavePos = Math.PI/2;
    	}
    //You touch something under you. Restart the jump.
    else{
		this.wavePos = 0;
		}	
	this.moveMe();
}
function flyingKoopaDie(){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	newKoopa = new Enemie(x,"koopa");
	newKoopa.y = y;
	newKoopa.id = this.id;
	level.activeEnemies[this.id] = newKoopa;	
	newKoopa.activate();
}
function koopaShellKilled(){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	newKoopaItem = new Item(x,"koopaShell");
	newKoopaItem.y = y;
	newKoopaItem.dir = this.dir;
	newKoopaItem.id = this.id;
	level.activeItems[newKoopaItem.id] = newKoopaItem;
	level.activeEnemies[newKoopaItem.id] = void(0);
	newKoopaItem.activate();
}