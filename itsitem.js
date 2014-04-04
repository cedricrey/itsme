var itemsProps = {
	"koopaShell":{
		isStatic:true,
		touched:touchedKoopaShellItem,
		holdable:true,
	},
	"redkoopaShell":{
		isStatic:true,
		touched:touchedKoopaShellItem,
		holdable:true,
	},
	"mushroom":{
		touched:touchedMushroom,
		holdable:false,
	},
	"flower":{
		touched:touchedFlower,
		isStatic:true,
		holdable:false,
	},
	"leaf":{
		touched:touchedLeaf,
		specialMove:leafFall,
		holdable:false,
	},
	"coin":{
		touched:touchedCoin,
		isStatic:true,
		holdable:false,
	},
	"endBlock":{touched:endBlockTouched,isStatic:true}
};
function getItemAt(x,y,w,h,butMe){
	item = null;
	$.each(level.activeItems,function(key,val){
    if((x+w > this.x && x < this.x + this.w && y+h > this.y && y < this.y + this.h) && this != butMe)
      item = this;
	});
	return item;
}
function Item(startX,className,options){
	this.options = options;
	$.extend(this,standardObject());
	this.options = options;
	this.startX = startX;
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
	this.speed = 1;
	this.holder = null;
	this.jumpHeight = 20;
	if(itemsProps[className])
		$.extend(this,itemsProps[className]);
	if(options)
		$.extend(this,options);
	$.extend(this.options,this);
	this.activate = function (){
		if(!this.x)
			this.x = this.startX;
		support = getBlockAt(this.x,0,0,2000)
		if(!this.y)
			this.y = support.y + support.h;
		this.node = $('<div class="'+this.className+'"></div>').css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px",
			"z-index":this.z});
		$mainScene.append(this.node);		
		if(this.classSup)
			this.node.addClass(this.classSup);
			
		if(this.h)
			this.node.css("height",this.h+"px");	
		else
			this.h = parseInt(this.node.css("height"));
		if(this.w)
			this.node.css("width",this.w+"px");	
		else
			this.w = parseInt(this.node.css("width"));
		$this = this;
		if(this.isStatic)
			this.speed = 0;
		
		this.lastTimeMove = (new Date()).getTime();
		if(!this.isStatic)
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
		if((block = getBlockAt(newX,this.y,this.w,this.h))==null || block.onlySupport)
			{
			this.x = newX;
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
		for(i=0;i<this.fallingSpeed;i++)
			if(!getBlockAt(this.x,this.y-1,this.w,this.h) && !this.nowJumping)
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
	this.stopMoving = function(){
		clearInterval(this.interval);
	}
	this.die = function(){
		if(this.y > 0)
			{this.node.addClass("dying");
			setTimeout($.proxy(function(){this.remove()},this.node),500);}
		else
			this.node.remove();
		delete level.activeEnemies[this.id];
		clearInterval(this.interval);
	}
	this.ejected = function(){
		this.node.addClass("ejected");
		setTimeout($.proxy(function(){this.remove()},this.node),500);
		deleteItem(this);
		delete level.activeEnemies[this.id];
		clearInterval(this.interval);
	}
}

function touchedKoopaShellItem(isHeld){
	var x = this.x;
	var y = this.y;
	this.node.remove();
	clearInterval(this.interval);
	newX = x+2;
	/*if(this.holder && this.holder.acceleration)
		newX+=this.holder.acceleration;*/
	newKoopa = new Enemie(newX,this.className);
	newKoopa.y = y;
	newKoopa.dir = this.dir;
	newKoopa.id = this.id;
	level.activeEnemies[this.id] = newKoopa;
	deleteItem(this);	
	delete level.activeItems[this.id];
	newKoopa.quicklyInoffensive(400);
	newKoopa.activate();
	if(isHeld)
		{
		newKoopa.wavePos = Math.PI/2;
		newKoopa.jump();
		}
}
function touchedMushroom(isHeld){
	this.node.remove();
	clearInterval(this.interval);	
	if(this.holder && this.holder.state == marioStates[0])
		this.holder.changeState("grand");
	delete level.activeItems[this.id];
}
function touchedFlower(isHeld){
	this.node.remove();
	clearInterval(this.interval);	
	if(this.holder)
		this.holder.changeState("fleur");
	delete level.activeItems[this.id];
}
function touchedLeaf(isHeld){
	this.node.remove();
	clearInterval(this.interval);	
	if(this.holder)
		this.holder.changeState("racoon");
	delete level.activeItems[this.id];
}
function touchedCoin(isHeld){
	this.node.remove();
	clearInterval(this.interval);	
	if(this.holder)
		this.holder.addCoin();
	delete level.activeItems[this.id];
}
function leafFall(){
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeCircle = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += 2*Math.PI * (now - this.lastTimeCircle) /(1000*this.jumpLength);
		
	
		this.x += (Math.sin(this.wavePos) - Math.sin(this.lastX)) *0.7 *this.jumpHeight;
		this.y -= ((Math.pow((Math.cos(this.wavePos)*1.7 - Math.cos(this.lastX)*1.7),2))-0.005)*300;
		if(this.wavePos > 2*Math.PI)
			this.wavePos = 0;
}
function endBlockTouched(){
	endLevel();
	this.touched = function(){return void(0);}
}