var enemiesProps = {
	"goomba":{
		speed:0.7
	},
	"koopa":{
		speed:0.5,
		specialDie:koopaShellKilled
	},
	"flyingKoopa":{
		speed:0.7,
		specialMove:flyingKoopaMove,
		wavePos : 0	,
		specialDie:flyingKoopaDie
	},
	"koopaShell":{
		speed:4,
		enemyKiller:true,
		specialDie:koopaShellKilled,		
		jumpHeight:5,
		jumpLength:0.2,
		fallingSpeed:10,
		brickBreaker:true
	},
	"redkoopa":{
		speed:0.5,
		specialDie:koopaShellKilled,
		smartWalker:true
	},
	"redkoopaShell":{
		speed:4,
		enemyKiller:true,
		specialDie:koopaShellKilled,		
		jumpHeight:5,
		jumpLength:0.2,
		fallingSpeed:10,
		brickBreaker:true
	},
	"flowerFire":{
		speed:4,
		enemyKiller:true,
		specialMove:flowerFireMove,		
		jumpHeight:10,
		jumpLength:0.3,
		fallingSpeed:5,
		inoffensive:true,
		invincible:true,
		die:flowerFireDie
	},
	"piranhaPlant":{
		specialMove:piranhaPlantMove,
		notJumpale:true,
		z:30
	},
	"venusFireTrap":{
		specialMove:venusFireTrapMove,
		notJumpale:true,
		z:30
	},
	"fireBall":{
		specialMove:fireBallMove,
		invicible:true,
		fx:function(x){return x}
	}
};
function getEnemyAt(x,y,w,h,butMe){
	enemy = null;
	$.each(level.activeEnemies,function(key,val){
    if((x+w > this.x && x < this.x + this.w && y+h > this.y && y < this.y + this.h) && this != butMe)
      enemy = this;
	});
	return enemy;
}
function Enemy(options){
	this.options = options;
	$.extend(this,standardObject());
	this.options = options;
	this.startX = options.startX;
	this.x = null;	
	this.y = null;
	this.className = options.className;
	this.dir = "Bwd";
	this.node = null;
	this.nowJumping = false;
	this.nowFalling = false;
	this.id = null;
	this.speed = 1;
	this.wavePos = 0;
	this.typeOfObject = "Enemy";
	this.inoffensive = false;
	this.jumpHeight = 20;
	this.die = standarDie;
	if(enemiesProps[this.className])
		$.extend(this,enemiesProps[this.className]);
	if(options)
		$.extend(this,options);
	$.extend(this.options,this);
	this.activate = function (){
		if(!this.x)
			this.x = this.startX;
		support = getBlockAt(this.x,0,0,2000);
		if(!this.y && support)
			this.y = support.y + support.h;
		this.node = $('<div class="'+this.className+' enemy"></div>').css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px",
			"z-index":this.z});
		if(this.classSup)
			this.node.addClass(this.classSup);
			
		$mainScene.append(this.node);
		if(this.h)
			this.node.css("height",this.h+"px");	
		else
			this.h = parseInt(this.node.css("height"));
		if(this.w)
			this.node.css("width",this.w+"px");	
		else
			this.w = parseInt(this.node.css("width"));
		$this = this;
		
		this.lastTimeMove = (new Date()).getTime();
		this.interval = setInterval($.proxy(this.refresh,this),this.refreshTime);
	}
	this.desactivate = function(){
		clearInterval(this.interval);
		this.node.remove();	
	}
	this.refresh = function(){
		if(typeof this.specialMove != "undefined")
			this.specialMove();
		else
			this.moveMe();
		this.redraw();
		//Get Supports
		if(!this.nowFalling && !this.nowJumping)
			{this.supports = getAllBlocksAt(this.x,this.y-1,this.w,this.h);}
		else
			{this.supports = {};}
		
		inclinedSupport = false;
		$.each(this.supports,function(key,val){
			if(this.inclined)
				inclinedSupport = true;
		});
		this.onInclinedSupport = inclinedSupport;
	}
	this.redraw = function(){
		//this.node.css({bottom:this.y+"px",left:this.x+"px"});
		this.node[0].style.bottom = this.y+"px";
		this.node[0].style.left = this.x+"px";
	}
	this.moveMe = function (){
		now = (new Date()).getTime();
		avance = 0
		if(this.dir == "Bwd")
			avance = -this.speed;
		else if(this.dir == "Fwd")
			avance = this.speed;
		newX = this.x+ (avance * (now - this.lastTimeMove) / this.refreshTime);
		this.lastTimeMove = now;
		if(((b1 = getBlockAt(newX ,this.y,this.w,this.h))==null || (b1.onlySupport && b1.y+b1.h > this.y)) && (otherenemy = getEnemyAt(newX,this.y,this.w,this.h,this))==null)
			{
			if(this.smartWalker && !getBlockAt(newX ,this.y-1,1,this.h))
				this.changeDirection();
			else
				this.x = newX;
			}
		else if(otherenemy){
			if(otherenemy.enemyKiller && !this.invincible)
				this.die();
			else if(this.enemyKiller && !otherenemy.invincible)
				otherenemy.die();
			else
			{
			this.changeDirection();
			if(otherenemy.dir == this.dir)
				otherenemy.changeDirection();
			}
		}
		else if(b1.inclined)
			{			
			this.x = newX;
			newY1 = b1.fx(this.x);
			newY2 = b1.fx(this.x+this.w);
			newY = newY1 > newY2 ? newY1 : newY2;
			if(objLength(this.supports)>1)
				{
					$.each(this.supports,function(key,val){if(!this.inclined && this.y+this.h > newY)newY=this.y+this.h;})					
				}
			if(!this.nowJumping && !this.nowFalling)
				this.y = newY;
			}
		else if(this.onInclinedSupport)
			{
			nBlock = null;
			$.each(this.supports,function(key,val){if(this.inclined)nBlock  = this;})
			newY1 = nBlock.fx(newX);
			newY2 = nBlock.fx(newX+this.w);
			newY = newY1 > newY2 ? newY1 : newY2;
			if(newY+3 > b1.y+b1.h)
				{
				this.y = newY;
				this.x = newX;
				}
				
			}
		else
			{
				this.changeDirection();
				block = getBlockAt(newX ,this.y,this.w,this.h);
				if(this.brickBreaker && block.breakable)
					block.hitten();
			}
		if(!this.nowJumping)
			for(i=0;i<this.fallingSpeed;i++)
				if(((b1 = getBlockAt(this.x,this.y-1,this.w,this.h))==null || (b1.onlySupport && b1.y+b1.h > this.y)))
					{
						this.nowFalling = true;
						this.y -= 1;
					}
				else
				{					
					this.nowFalling = false;
					break;
				}
		if(this.y <= 0)
			this.die();
	}
	this.isKilled = function(){
		if(this.specialDie)
			this.specialDie();
		else
		{
			this.die();
		}
	}
	this.ejected = function(){
		this.node.addClass("ejected");
		setTimeout($.proxy(function(){this.remove()},this.node),500);
		deleteEnemy(this);
		delete level.activeEnemies[this.id];
		clearInterval(this.interval);
	}
	this.quicklyInoffensive = function(time){
		this.inoffensive = true;
		if(!time)
			setTimeout($.proxy(function(){this.inoffensive = false},this),100);
		else
			setTimeout($.proxy(function(){this.inoffensive = false},this),time);
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
    this.wavePos += Math.PI * (now - this.lastTimeJump) / (1000* this.jumpLength);
    
/*Pour faire des bons :*/
    if (this.wavePos >= Math.PI)
    	nextY = this.y - this.fallingSpeed;
    else
    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;
		
/*POUR FAIRE UNE COURSE SINUSOSOIDALE :*/	
/*	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;*/
	
		
    if(nextY <= 0)
		this.die();
    //You continue to jump/fall, no colision
    else if(!getBlockAt(this.x,nextY,this.w,this.h))
    	{
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
		support = getBlockAt(this.x,nextY,this.w,this.h)
		this.y = support.y + support.h;
		}	
	this.moveMe();
}
function flowerFireMove(){
	this.nowJumping = true;
	this.node.addClass("jump");
	if(typeof this.lastTimeJump == "undefined")		
		this.lastTimeJump = (new Date()).getTime()-10;
	now = (new Date()).getTime();
	this.lastX = this.wavePos;
    this.wavePos += Math.PI * (now - this.lastTimeJump) / (1000* this.jumpLength);
    
    if (this.wavePos >= Math.PI)
    	nextY = this.y - this.fallingSpeed;
    else
    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;
		
    if(nextY <= 0)
		this.die();
    //You continue to jump/fall, no colision
    else if(!getBlockAt(this.x,nextY,this.w,this.h))
    	{
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
		support = getBlockAt(this.x,nextY,this.w,this.h)
		this.y = support.y + support.h;
		}	
		
	//Move
	avance = 0
	if(this.dir == "Bwd")
		avance = -this.speed;
	else if(this.dir == "Fwd")
		avance = this.speed;
	newX = this.x+ (avance * (now - this.lastTimeMove) / this.refreshTime);
	this.lastTimeMove = now;
	if(!getBlockAt(newX ,this.y,this.w,this.h) && !getEnemyAt(newX ,this.y,this.w,this.h,this))
		{
		this.x = newX;
		}
	else 
	{
		if((otherenemy = getEnemyAt(newX,this.y,this.w,this.h,this)) != null && !otherenemy.invincible)
			otherenemy.die();
		this.die();
	}
	if(newX > $mainScene.x + $sceneView.width() || newX < $mainScene.x)
		this.die();
}
function piranhaPlantMove(){
	if(!this.originY)
		this.originY = this.y;
	if((this.y >= this.originY - 35) || (player.x < this.x-30 || player.x > this.x+30))
		{
		if(this.goAhead)
			this.y +=1;
		else
			this.y -=1;
		}
		
	
	if(this.y >= this.originY)
		this.goAhead = false;
	if(this.y <= this.originY - 50)
		this.goAhead = true;
}

function venusFireTrapMove(){
	now = new Date();
	if(!this.originY)
		this.originY = this.y;
		
	orientation = "";
	if(this.y<player.y)
		orientation+="N";
	else
		orientation+="S";
	if(this.x<player.x)
		orientation+="E";
	else
		orientation+="W";
		
	this.node.removeClass("NE NW SE SW");
	this.node.addClass(orientation);	
	
	if((this.y >= this.originY - 35) || (player.x < this.x-30 || player.x > this.x+30))
		{
		if(!this.nowUp)
			{
			if(this.goAhead)
				this.y +=1;
			else
				this.y -=1;
			}
		}
		
	if(this.y == this.originY && !this.nowUp)
	{
		this.nowUp = true;
		setTimeout($.proxy(function(){
			if(level.activeEnemies[this.id] && this.x+this.h > $mainScene.x && this.x < $mainScene.x+$sceneView.w)
				{
				now = (new Date()).getTime();
				currX = this.x+(this.w/2);
				currY = this.y+this.h-10;
				newFireBall = new Enemy({"startX" : currX, "className" : "fireBall"});
				newFireBall.y = currY;
				newFireBall.dir = currX<player.x ? "Fwd" : "Bwd";
				newFireBall.id = "fireBall_"+now;
				newFireBall.multFx = (currY - player.y)/(currX - player.x);
				newFireBall.multFx = newFireBall.multFx < -1 ? -1 : newFireBall.multFx > 1 ? 1 : newFireBall.multFx;
				newFireBall.addFx = currY - newFireBall.multFx*currX;			
				//mult = (this.y - player.y)/(this.x - player.x);
				newFireBall.fx = function(x){return (this.multFx*x)+this.addFx;}
				level.activeEnemies["fireBall_"+now] = newFireBall;
				newFireBall.activate();
				}
			
			},this),700);
		setTimeout($.proxy(function(){this.nowUp=false},this),1500);
	}
	
	if(this.y >= this.originY)
		this.goAhead = false;
	if(this.y <= this.originY - 80)
		this.goAhead = true;
		
	lastTimeMove = now; 
}
function fireBallMove(){
	if(this.dir == "Bwd")
		this.x -= this.speed;
	else
		this.x += this.speed;
	
	this.y = this.fx(this.x);
}
function flyingKoopaDie(){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	newKoopa = new Enemy({"startX" : x, "className" :"koopa"});
	newKoopa.y = y;
	newKoopa.id = this.id;
	level.activeEnemies[this.id] = newKoopa;
	newKoopa.quicklyInoffensive();
	newKoopa.activate();
	deleteEnemy(this);
	delete this;
}
function koopaShellKilled(){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	console.log("Kill : "+this.className)
	className = this.className.indexOf("redkoopa") == 0 ? "redkoopaShell" : "koopaShell";
	newKoopaItem = new Item({"startX" : x, "className" : className});
	newKoopaItem.y = y;
	newKoopaItem.dir = this.dir;
	newKoopaItem.id = this.id;
	newKoopaItem.activate();
	level.activeItems[newKoopaItem.id] = newKoopaItem;
	deleteEnemy(level.activeEnemies[newKoopaItem.id]);
	delete level.activeEnemies[newKoopaItem.id];
}
function flowerFireDie(){
	this.sender.removeActiveFireBall();
	$.proxy(standarDie,this)();	
}
function standarDie(){
	if(this.y > 0)
		{
		this.node.addClass("dying");
		setTimeout($.proxy(function(){this.remove()},this.node),500);
		}
	else
		this.node.remove();
	deleteEnemy(this);
	delete level.activeEnemies[this.id];
	clearInterval(this.interval);
}
