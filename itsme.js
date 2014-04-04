//console.log = function(){return void(0)}
var player = null;
var currentKey = null;
var marioDir = 0;
var marioAcc = 0;
var marioOrientation = "Fwd";
var marioJumpHeight = 70;
var fastRunning = 1;
var extraBtn = false;
var fastRunningSpeed = 1.5;

var interGame = null;
var bg1Ypos = 0;
var bg2Ypos = 0;
var itemHeld = null;
var levelManagementInterval = null;
var levelOldX = null;

var $body = $(".body");
var $mainScene = null;
var $infoBar = null;
var level = null;
var currentLevel = null;
var aroundGrids = [];
function standardObject(){
	return {
	dir : 0,
	startX : 0,
	w : 0,
	h : 0,
	x : null,	
	y : null,
	z : 100,
	className : "",
	classSup : "",
	dir : "Bwd",
	node : null,
	nowJumping : false,
	nowFalling : false,
	nowFlying : false,
	id : null,
	isStatic : false,
	holdable : false,
	speed : 1,
	speedFactor : 1,
	wavePos : 0,
	jumpHeight : 20,
	jumpLength : 1,
	fallingSpeed : 5,
	invincible : false,
	typeOfObject : "Object",
	jump : standardJump,
	changeDirection : standardChangeDirection,
	refreshTime : 20,
	lastTimeMove : (new Date()).getTime()
	}
}

var marioProps = {
	dir : 0,
	z : 1000,
	acceleration : 0,
	orientation : "Fwd",
	jumpHeight : 70,
	fastRunning : 1,
	fastRunningSpeed : 2,
	itemHeld : null,
	speed:3,
	unableToFire:false,
	runPower:0,
	superRun:false,
	coins:0,
	score:0,
	lives:3,
	fireBallNumber:0,
	maxFireBallNumber:2
}
var marioStates = ["small","grand","fleur","racoon"];

function initGame(){
	
	$mainScene = $("<div id='mainScene'></div>").css({width:$body.width()+"px",position:"absolute"});
	$sceneView = $("<div id='sceneView'></div>");
	$sceneBg = $("<div id='sceneBg'></div>").css({width:"100%",height:"100%",position:"absolute"});
	$infoBar = createInfoBar();
	$sceneView.append($mainScene);
	$body.append($sceneView);
	$body.append($infoBar);	
	refreshSceneViewSize();
	$(window).bind("resize",refreshSceneViewSize);
	player = new Mario();
	
	currentLevel = levels[1];
	if(window.location.search.indexOf("testlevel=true") != -1)
		{
			
			/*params = window.location.search.split("?")[1].split("&");
			levelString = "";
			$.each(params,function(key,val){
				if(val.indexOf("testlevel=")==0)
					levelString = val.substr(val.indexOf("=")+1);
			});*/
			levelString = localStorage.getItem('testLevel');
			//console.log(levelString);
			if(levelString != "")
			currentLevel = function(){
				return eval("test = "+decodeURI(levelString));
			}
		}
	
	else if(window.location.search.indexOf("loadLevel=") != -1)
		{
			params = window.location.search.split("?")[1].split("&");
			levelName = "";
			levelString = "";
			$.each(params,function(key,val){
				if(val.indexOf("loadLevel=")==0)
					levelName = val.substr(val.indexOf("=")+1);
			});
			if(levelName != "")
				levelString = localStorage.getItem(levelName);
			if(levelString != "")
			currentLevel = function(){
				return eval("test = "+decodeURI(levelString));
			}
		}
	
	initLevel(currentLevel);

	
}

function initLevel(currentLevel){
	if(typeof currentLevel=="function")
		level = currentLevel();
	else
		level = currentLevel;
	mainLevel = level;
	if(!level.activeBlocks)
		level.activeBlocks = {};
	if(!level.activeItems)
		level.activeItems = {};
	if(!level.activeEnemies)
		level.activeEnemies = {};
	
	
	initZone(level);
	/*
	$.each($.extend({},level.activeEnemies),function(key,val){
    	if(val)
    		{
			$.extend(this,this.options);
  			this.x = this.startX;    			
    		if(this.startX < $sceneView.w+$mainScene.x && (!this.x || this.x+this.h > $mainScene.x))
      		{
      			
      			this.activate();
      			level.activeItems[key] = this;
      			delete level.items[key];
      		}
      		else
      		{
      			level.items[key] = this;
      			delete level.activeItems[key];      			
      		}
      		}
	});
	*/
	
	$(document).bind("keydown.mario",function(e){
		manageKeyPress(e);
	});
	
	$(document).bind("keyup.mario",function(e){
		manageKeyUp(e);
	});
	levelManagement();
	levelManagementInterval = setInterval(levelManagement,100);
	if(!level.time)
		level.time = 300;
	levelTimeInterval = setInterval(levelTime,1000);
	player.activate();
	
}
function initZone(zone){
	$mainScene.empty();
	//$sceneView.scrollLeft(0);
	$mainScene.css("left",0);
	$mainScene.x = 0;
	if(!zone.activeBlocks)
		zone.activeBlocks = {};	
	if(!zone.activeEnemies)
		zone.activeEnemies = {}	
	if(!zone.activeItems)
		zone.activeItems = {}
	if(zone.height)
		$mainScene.height(zone.height);		
	$mainScene.h = $mainScene.height();
	if(zone.width)
		$mainScene.width(zone.width);		
	$mainScene.w = $mainScene.width();	
	
	$.each($.extend({},zone.activeBlocks,zone.blocks),function(key,val){
		//console.log(this)			
		this.id = key;
		if(this.activate)
			this.activate();
		zone.activeBlocks[key] = this;
		delete zone.blocks[key];
		/*if(this.isGroup)
		{		
		this.node = getGroupNode(this.className,this.w,this.h).css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px",
			"z-index":this.z});
		}
		else
		this.node = $('<div class="'+this.className+'"></div>').css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px",
			"z-index":this.z});
		
		this.id = key;
		$mainScene.append(this.node);
		if(this.h)
			this.node.css("height",this.h+"px");	
		else
			this.h = parseInt(this.node.css("height"));
		if(this.w)
			this.node.css("width",this.w+"px");	
		else
			this.w = parseInt(this.node.css("width"));*/
	});
	$.each(zone.decorations,function(key,val){	
		if(this.activate)
			this.activate();
		});
	
	if(zone.bg)
		{
		$sceneBg.css({backgroundImage:"url(images/bg/"+zone.bg+")",backgroundPosition:"0 0"});
		$mainScene.append($sceneBg);
		}
	else
		{
		$sceneBg.css({backgroundImage:"none"});
		}	
	level = zone;
	
	if(zone == mainLevel)
	{
	if(!zone.endPoint)
		zone.endPoint = {x:($mainScene.width() - $sceneView.width()/2),y:105};
	createEndLevel();
	}
}

function standByZone(zone){
	$.each(zone.activeEnemies,function(key,val){
		//console.log(this)			
		this.id = key;
		if(this.desactivate)
			this.desactivate();
		zone.enemies[key] = this;
		delete zone.activeEnemies[key];
	});
	$.each(zone.activeItems,function(key,val){
		//console.log(this)			
		this.id = key;
		if(this.desactivate)
			this.desactivate();
		zone.items[key] = this;
		delete zone.activeItems[key];
	});
}
function levelManagement(){
	if(levelOldX == $mainScene.x)
		return true;
	/*
	$.each($.extend({},level.enemies,level.items,level.blocks),function(key,val){
    	if(!this.startX)
    		this.startX = this.x;
    	if(val && this.startX < $sceneView.w+$mainScene.x && (!this.x || this.x+this.h > $mainScene.x))
      		{
      			tab = this.constructor == Enemie ? level.enemies : this.constructor == Item ? level.items : level.blocks;
      			activeTab = this.constructor == Enemie ? level.activeEnemies : this.constructor == Item ? level.activeItems : level.activeBlocks;
      			
      			this.id = key;
      			if(this.activate)
      				this.activate();
      			activeTab[key] = this;
      			delete tab[key];
      		}
	});
	$.each($.extend({},level.activeEnemies,level.activeItems,level.activeBlocks),function(key,val){
    	if(val && this.x+this.h < $mainScene.x)
      		{
      			tab = this.constructor == Enemie ? level.enemies : this.constructor == Item ? level.items : level.blocks;
      			activeTab = this.constructor == Enemie ? level.activeEnemies : this.constructor == Item ? level.activeItems : level.activeBlocks;
      			
      			this.id = key;
      			if(this.desactivate)      			
      				this.desactivate();
      			tab[key] = this;
      			delete activeTab[key];
      		}
	});*/
	

	//Enemies creation management
	$.each(level.enemies,function(key,val){
    	if(val && this.startX < $sceneView.w+$mainScene.x && (!this.x || this.x+this.w > $mainScene.x))
      		{
      			this.id = key;
      			this.activate();
      			level.activeEnemies[key] = this;
      			delete level.enemies[key];
      		}
	});
	/*
	$.each(level.activeEnemies,function(key,val){
    	if(val && this.x+this.w < $mainScene.x)
      		{
      			this.id = key;
      			this.desactivate();
      			level.enemies[key] = this;
      			delete level.activeEnemies[key];
      		}
	});
	*/
	//Items creation management
	$.each(level.items,function(key,val){
    	if(val && this.startX < $sceneView.w+$mainScene.x && (!this.x || this.x+this.w > $mainScene.x))
      		{
      			this.id = key;
      			this.activate();
      			level.activeItems[key] = this;
      			delete level.items[key]
      		}
	});
	levelOldX = $mainScene.x;
	/*	
	$.each(level.activeItems,function(key,val){
    	if(val && this.x+this.w < $mainScene.x)
      		{
      			this.id = key;
      			this.desactivate();
      			level.items[key] = this;
      			delete level.activeItems[key];
      		}
	});
	*/
	/*
	//Blocks creation management
	$.each(level.blocks,function(key,val){
    	if(val && this.x < $sceneView.w+$mainScene.x && (!this.x || this.x+this.h > $mainScene.x))
      		{
      			this.id = key;
      			if(this.activate)
      				this.activate();
      			level.activeBlocks[key] = this;
      			delete level.blocks[key];
      		}
	});	
	$.each(level.activeBlocks,function(key,val){
    	if(val && this.x+this.w < $mainScene.x)
      		{
      			this.id = key;
      			if(this.desactivate)      			
      				this.desactivate();
      			level.blocks[key] = this;
      			delete level.activeBlocks[key];
      		}
	});
	*/
}
function endLevel(){	
	/*
	clearInterval(player.interval);
	clearTimeout(player.jumpTimeout);
	*/
	player.winLevel();
	$(document).unbind(".mario");
	/*stopAll();*/
	currentKey = null;	
	/*alert('LEVEL FINISHED');*/
}
function levelTime(){
	level.time --;
	$('#timeLeft').html((level.time<100 ? "0" : "")+(level.time<10 ? "0" : "")+level.time)
	if(level.time <= 0)
		{
			player.die();
			clearInterval(levelTimeInterval);
		}
}
function refreshSceneViewSize(){
	$sceneView.w = $sceneView.width();
	$sceneView.h = $sceneView.height();	
}
function createInfoBar(){
	infoBar = $("<div id='infoBar'></div>");
	
	playerInfo = $("<div id='playerInfo'></div>");
	playerInfo.append($("<div id='levelName'>WORLD 1</div>"));
	playerInfo.append($("<div id='runPower'><span class='powerLevel'>&#9654;&#9654;&#9654;&#9654;&#9654;&#9654;</span><span class='superRun'>P</span></div>"));
	playerInfo.append($("<div id='playerCoin'><span class='coin'></span><span id='numCoins'>&nbsp;0</span></div>"));
	playerInfo.append($("<div id='playerLives'>Mx <span id='numLives'>3</span></div>"));
	playerInfo.append($("<div id='playerScore'>0000000</div>"));
	playerInfo.append($("<div id='timeLeft'>300</div>"));
	
	infoBar.append(playerInfo);
	return infoBar;
}
function createEndLevel(){	
	endZone = $("<div id='endZone'></div>").css({
		position:"absolute",
		left:(level.endPoint.x-$sceneView.width()/2)+"px",
		width:$sceneView.width()+"px",
		height:$mainScene.height()+"px",
		backgroundColor:"#000",
		zIndex:20
	});
	$mainScene.append(endZone);
	
	endBlock = new Item(level.endPoint.x-10,"endBlock",{x:level.endPoint.x-10,y:level.endPoint.y});
	endBlock.node = $('<div class="endBlock"></div>').css({
			position:"absolute",
			bottom:endBlock.y+"px",
			left:endBlock.x+"px",
			"z-index":endBlock.z});
	level.activeBlocks.endLevelBlock = endBlock;	
	$mainScene.append(endBlock.node);
}
function addAroundGrid(grid){
	aroundGrids.push(grid);
}
function deleteItem(item){
	for(var grid in aroundGrids)
		delete aroundGrids[grid].items[item.id];
}
function deleteEnemie(enemie){
	for(var grid in aroundGrids)
		delete aroundGrids[grid].enemies[enemie.id];
}

function manageKeyPress(e){
	//console.log(e.keyCode)
	switch(e.keyCode)
	{
	case 37:
		player.runRight();
		currentKey = e.keyCode;
	break;
	case 38:
		player.goUp();
		currentKey = e.keyCode;
	break;
	case 39:
		player.runLeft();
		currentKey = e.keyCode;
	break;
	case 40:
		player.couch();
		currentKey = e.keyCode;
	break;
	case 32:
		player.goJump();		
	break;
	case 88:
		player.extraOn();
	break;
	}
	e.preventDefault();
}
function manageKeyUp(e){
	if((e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 40) && e.keyCode==currentKey)
		{
			player.cancelMove();
			currentKey = null;
		}
	if(e.keyCode == 38)
		{
			player.stopUp();	
		}
	if(e.keyCode == 40)
		{
			player.stopCouch();	
		}
	if(e.keyCode == 32)
		{
			player.stopJump();	
		}
	if(e.keyCode == 88)
		{
			player.releaseItem();
			player.extraOff();
		}		
}
function Mario(){
	$.extend(this,standardObject());
	$.extend(this,marioProps);
	//this.node = $("#marioMove");
	//this.y = parseInt(this.node.css("bottom"));
	this.typeOfObject = "Mario";
	this.state = marioStates[0];
	this.elementsAround = {};
	addAroundGrid(this.elementsAround);
	this.activate = function(){
		this.node = $("<span id='marioMove'><span id='mario'></span></span>").css("z-index",this.z);
		$mainScene.append(this.node);	
		this.animNode = $('#mario');
		this.node.css('left',0);		
		this.h = this.node.height();
		this.w = this.node.width();	
		this.heldItem = null;
		this.extraBtn = false;
		this.onInclinedSupport = false;
		this.fastRunning = 1;
		this.powerJump = 1;
		if(!this.x)
			this.x = this.startX;	
		support = getElementAt($.extend({},level.blocks,level.activeBlocks),this.x,0,this.w,$mainScene.h);
		if(!this.y && support)
			this.y = support.y + support.h;
		this.unpause();		
		this.originalProps = $.extend({},this);
		//$(document.body).append(this.node);
	}
	this.pause = function(){
		clearInterval(this.interval);
	}
	this.unpause = function(){		
		this.interval = setInterval($.proxy(this.refresh,this),this.refreshTime);
	}
	this.refresh = function(){
		
		now = (new Date()).getTime();		
		if(!this.lastAroundTime || now - this.lastAroundTime > 100)
		{
		for(var key in this.elementsAround){delete this.elementsAround[key]}
		$.extend(this.elementsAround,getElementsAt($.extend({},level.activeItems,level.activeBlocks,level.activeEnemies),this.x-2*this.w,this.y-2*this.h,this.w*5,this.h*5));
		this.lastAroundTime = now;
		}
		
		
		//console.log(now);
		this.moveMe();
		this.redraw();
		
		//Get Supports
		if(!this.nowFalling && !this.nowJumping)
			{
				this.supports = (getElementsAt(this.elementsAround.blocks,this.x,this.y-1,this.w,this.h))["blocks"];
				this.manageInclined();
				
				if(this.acceleration != 0 && !this.nowSliding)
					{
						this.node.addClass("run");
						/*time = this.acceleration < 0 ? -this.acceleration : this.acceleration;
						time = time<10 ? 10 : time;
						time = 0.2 * 20/time;
						console.log(time)
						if(this.speedRuning)
							time=time/2;
						this.animNode.css({
							"-moz-animation-duration":time+"s",
							"-webkit-animation-duration":time+"s",
						})*/
					}
				else
					this.node.removeClass("run");					
			}
		else
		{
			this.supports = {};
			/*this.animNode.css({
				"-moz-animation-duration":" ",
				"-webkit-animation-duration":" ",
			});*/
			this.node.removeClass("run");
		}
		
		this.manageRunPower();
	}
	this.redraw = function(){
		//this.node.css({bottom:this.y+"px",left:this.x+"px"});
			
		
		//Windows Moving management
		//scL = $sceneView.scrollLeft();
		//if(this.orientation == "Bwd" && scL > this.x - $sceneView.w/2 +10)
		sl = this.x - $sceneView.w/2 +10
		//$sceneView.scrollLeft(sl);
		if(sl>0 && sl<$mainScene.w-$sceneView.w)	
			{
			$mainScene.css("left",-sl+"px");			
			$mainScene.x = sl;
			}
		if($sceneBg && sl>0 && sl<$mainScene.w-$sceneView.w)
			$sceneBg.css({backgroundPosition:sl/3+"px bottom"})
		//else if(scL < this.x - $sceneView.w/2 -10)
		//	$sceneView.scrollLeft(this.x - $sceneView.w/2 -10);
		//$(window).scrollTop($mainScene.height()-this.y+ $(window).height()/2);
		/*$mainScene.scrollLeft(this.x - $mainScene.width()/2);
		$mainScene.scrollTop(this.y - $mainScene.height()/2);*/
		$sceneView.scrollTop($mainScene.h-this.y-$sceneView.h/2);
		this.node[0].style.bottom = this.y+"px";
		this.node[0].style.left = this.x+"px";
		if(this.nowFalling)
			{this.node.addClass("falling");}
		else
			{this.node.removeClass("falling");}
		
		/*
		newTime = (new Date()).getTime();
		if(typeof oldTime == "undefined")
			oldTime = 0;
		//info(newTime - oldTime);
		oldTime = newTime;
		*/
	}
	this.moveMe = function(){
		now = (new Date()).getTime();
		/*Colision / ecraser*/
		if((b1=getElementAt(this.elementsAround.blocks,this.x-1,this.y,1,this.h))!=null && !b1.onlySupport && !b1.inclined && !getElementAt(this.elementsAround.blocks,this.x+this.w,this.y,1,this.h))
			this.x +=1;
		else if((b3=getElementAt(this.elementsAround.blocks,this.x+this.w,this.y,1,this.h))!=null && !b3.onlySupport && !b3.inclined && !getElementAt(this.elementsAround.blocks,this.x-1,this.y,1,this.h))
			this.x -=1;
		else if((b4=getElementAt(this.elementsAround.blocks,this.x+1,this.y,1,this.h))!=null && (b5=getElementAt(this.elementsAround.blocks,this.x+this.w-1,this.y,1,1))!=null && b4!=b5 && !b4.inclined && !b5.inclined)
			{this.die();return;}
		if((b6=getElementAt(this.elementsAround.blocks,this.x,this.y-1,this.w,1))!=null && (b7=getElementAt(this.elementsAround.blocks,this.x,this.y+this.h-1,this.w,1))!=null && b6!=b7 && !b6.inclined && !b7.inclined)
			{
				console.log(this.x + " " + this.w);
				this.die();return;
			}
		
		if(this.dir == "Fwd")
			this.acceleration += this.acceleration < 20 ? 1 : 0;
		else if(this.dir == "Bwd")
			this.acceleration -= this.acceleration > -20 ? 1 : 0;
		else if(this.acceleration > 0)
			this.acceleration -= 1;
		else if(this.acceleration < 0)
			this.acceleration += 1;
		//newX = this.x+(this.speed*this.fastRunning*this.speedFactor*this.acceleration/20) * (now - this.lastTimeMove) / this.refreshTime;
		newX = this.x+(this.speed*this.fastRunning*this.speedFactor*this.acceleration/20);		
		if(newX < $mainScene.x)
			newX=$mainScene.x;
		//if((block = getElementAt(this.elementsAround.blocks,newX,this.y,this.w,this.h))==null || block.onlySupport)
		if((block = $.proxy(getBlockAt,this)(newX,this.y,this.w,this.h))==null || block.onlySupport)
			this.x = newX;
		else if(block.wayToWarp && block.wayToWarpDir && block.wayToWarpDir == this.dir)
			{
			//this.reset();
			supportWayToWarp = block;
			this.pause();
			setTimeout(function(){goToWarpZone(supportWayToWarp.wayToWarp,supportWayToWarp.wayToWarpX,supportWayToWarp.wayToWarpY,block.wayToWarpDir)},1000);
			return this;
			}
		else if(block.inclined)
			{			
			this.x = newX;
			newY1 = block.fx(this.x);
			newY2 = block.fx(this.x+this.w);
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
			if(newY+3 > block.y+block.h)
				{
				this.y = newY;
				this.x = newX;
				}
				
			}
		else
			this.acceleration = 0;
		this.lastTimeMove = now;
		
		this.manageEnemie()
		if(item = getElementAt(this.elementsAround.items,this.x,this.y,this.w,this.h))
			{
				item.dir = this.orientation;
				if(item.holdable && this.extraBtn && !this.heldItem)
					this.holdItem(item);
				else
				{
					item.holder = this;
					item.touched();
				}	
			}
			
		//Falling management
		/*
		isSpeedRun = this.speedFactor == 1 && this.fastRunning == fastRunningSpeed && !this.nowFalling && !this.nowJumping;
		canPass = false;
		if(isSpeedRun && this.dir == "Fwd")
			canPass = getElementAt(this.elementsAround.blocks,this.x+(16-this.h),this.y-1,this.w,this.h);
		else if(isSpeedRun)
			canPass = getElementAt(this.elementsAround.blocks,this.x-(16-this.h),this.y-1,this.w,this.h);
		
		if(!canPass || !canPass.onlySupport)*/
			this.fall();
		
		//Fall into a hole
		if(this.y <= -this.h)
    		this.lose("tombé");
		
		if((this.acceleration > 0 && this.node.hasClass("turnRight")) || (this.acceleration < 0 && !this.node.hasClass("turnRight")))
			this.node.addClass("surf");
		else
			this.node.removeClass("surf");		
		
	};
	/*Return false if touched*/
	this.manageEnemie = function(){	
		currEnemie = getElementAt(this.elementsAround.enemies,this.x,this.y,this.w,this.h)
		if(currEnemie != null && !currEnemie.inoffensive && !this.invincible)
			{
				console.log(currEnemie)
				if(!getEnemieAt(this.x,this.y+this.fallingSpeed+1,this.w,this.h)
					&& !currEnemie.notJumpale
					&& !currEnemie.invicible)
				{
					console.log(currEnemie)
					this.killEnemie(currEnemie);
				}
				else
				{
					this.enemieTouch();
				}
				/*
				clearTimeout(this.jumpTimeout);
				this.nowJumping = false;
				this.node.removeClass("jump");
				*/				
			return true;
			}		
		return false;
	}
	this.fall = function(){
		if(!this.nowJumping && objLength(this.supports)==0)
		for(i=0;i<this.fallingSpeed;i++)
			if(	((block = getElementAt(this.elementsAround.blocks,this.x,this.y-1,this.w,this.h))==null 
				|| block.onlySupport || block.inclined))
				{
					if(block)
					{
						if(block.onlySupport && block.y+block.h<=this.y)
						{
							this.y = block.y+block.h;
							this.nowFalling = false;
							return this;
						}
						if(block.inclined)
						{
							newY1 = block.fx(this.x);
							newY2 = block.fx(this.x+this.w);
							this.y = newY1 > newY2 ? newY1 : newY2;
							this.nowFalling = false;
							return this;
						}
					}
					this.nowFalling = true;
					//info("nowFalling = true : "+this.x+" "+(this.y-1)+" "+this.w+" "+this.h);
					this.y -= 1;
					//this.node.css({bottom:parseInt($("#marioMove").css('bottom'))-1+"px"});
					/*
					if(!getElementAt(this.elementsAround.enemies,this.x,this.y,this.w,this.h) && (enemie = getElementAt(this.elementsAround.enemies,this.x,this.y-1,this.w,this.h)))
					{
						this.killEnemie(enemie);
						/*
						if(this.lastPressJump && (new Date()).getTime() - this.lastPressJump < 100)
							{
								this.nowJumping = this.nowFalling = false;
								this.goJump();
							}
					//}
					*/
					/*
					if(this.manageEnemie())
						{
							console.log("enemie touched falling")
							this.nowFalling = false;
							return true;
						}
						*/
				}
				else
				{					
					this.nowFalling = false;
					//info("nowFalling = false");
					break;
				}
	}
	this.enemieTouch = function(){
		if(this.state == marioStates[0])
			this.lose();
		else
			{
				if(marioStates.indexOf(this.state) > 1)
					state = 1;
				else
					state = 0;
				this.changeState(marioStates[state]);
				this.quicklyInvicible(1000);
			}
	}
	this.lose = function(message){
		
		clearInterval(this.interval);
		clearTimeout(this.jumpTimeout);
		
		this.animNode.css({
			"-moz-animation-duration":"",
			"-webkit-animation-duration":"",
		})
		
		if(this.y > 0)
			{
			this.node.addClass("dying");
			}
		$(document).unbind(".mario");
		stopAll();
		currentKey = null;
		if(level.checkPoints)
			$.each(level.checkPoints,$.proxy(function(key,val){
				if(this.x>val && this.startX<val)
					this.startX=val;
			},this));
		else
			this.startX = 0;
		if(this.lives > 0)
			{
			setTimeout($.proxy(function(){
				this.addLife(-1);						
				this.x = this.startX;
				this.y = null;
				this.reset();
				initLevel(currentLevel)
				},this),3000);			
			}
		else
			GameOver();
	};
	this.killEnemie = function(enemie){
		if(!enemie.invincible)
			{ 
			console.log("kill :"+enemie);
			enemie.isKilled();
			this.wavePos = 0;
			this.powerJump = 0.4;
			if(this.lastPressJump && (new Date()).getTime() - this.lastPressJump < 100)
				this.powerJump = 1;
			clearTimeout(this.jumpTimeout);		
			this.jump();
			}
	};
	this.holdItem = function(item){
		item.stopMoving();
		$('#mario').append(item.node);
		item.node.css({top:(this.h/2-item.h/2+4)+"px",right:"-12px",left:""});
		this.heldItem = item;
		this.heldItem.holder = this;
		this.node.addClass("hold");
		deleteItem(level.activeItems[item.id]);
		delete level.activeItems[item.id];
	}
	this.releaseItem = function(){
		//console.log(this.heldItem)
		if(this.heldItem)
		{
			this.heldItem.dir = this.orientation;
			if(this.orientation == "Fwd")
				this.heldItem.x = this.x + this.w + 2;
			else
				this.heldItem.x = this.x - this.w - 10;
			this.heldItem.y = this.y + 4;
			this.heldItem.holder = this;
			this.heldItem.touched(true);
			this.heldItem = null;
			this.node.addClass("kickItem");
			setTimeout($.proxy(function(){this.node.removeClass("kickItem")},this),200);
		}
		this.node.removeClass("hold");
	}
	this.runRight = function(){
		this.node.addClass("turnRight");
		this.dir = this.orientation = "Bwd";
	}
	this.runLeft = function(){
		this.node.removeClass("turnRight");
		this.dir = this.orientation = "Fwd";
	}
	this.couch = function(){
		supportWayToWarp = null;
		$.each(this.supports,function(key,val){if(this.wayToWarp && this.wayToWarpDir && this.wayToWarpDir == "down")supportWayToWarp=this;})
		if(supportWayToWarp && !this.nowSliding)
		{
			//this.cancelMove();			
			//clearInterval(this.winLevelInterval);
			this.pause();
			//stopAll();
			this.node.addClass("straight down");
			setTimeout(function(){goToWarpZone(supportWayToWarp.wayToWarp,supportWayToWarp.wayToWarpX,supportWayToWarp.wayToWarpY,"down")},1000);
		}
		else if(this.onInclinedSupport)
		{			
			this.node.removeClass("run");
			this.node.addClass("seated");
			
			nBlock = null;
			$.each(this.supports,function(key,val){if(this.inclined)nBlock  = this;})
			newY1 = nBlock.fx(this.x);
			newY2 = nBlock.fx(this.x+this.w);
			
			nOrientation = "Fwd";
			if(newY1 < newY2)
				nOrientation = "Bwd";
			/*
			if(nOrientation != this.orientation)
				if(this.acceleration > 0 )
					this.acceleration-=2;
				else if(this.acceleration < 0 )
					this.acceleration+=2;
				else
					this.orientation = nOrientation;
			*/
			this.orientation = nOrientation;
			
			this.dir = this.orientation;
			this.nowSliding = true;
		}
		else
		{
			this.node.removeClass("run");
			if(!this.nowSliding)
			this.node.addClass("couch");
			this.h = this.node.height();
			this.w = this.node.width();
			this.dir = 0;
		}
	}
	this.stopCouch = function(){
			this.node.removeClass("couch");
			this.node.removeClass("seated");
			this.h = this.node.height();
			this.w = this.node.width();
			this.nowSliding = false;
	}
	this.goUp = function(){
		this.lookUp = true;
	}
	this.stopUp = function(){
		this.lookUp = false;		
	}	
	this.goJump = function(){
		this.lastPressJump = (new Date()).getTime();
		if(!this.nowJumping && !this.nowFalling && !this.nowFlying)
			{
			this.powerJump = 1;
			this.wavePos = 0;
			this.lastTimeJump = this.lastPressJump;
			this.startTimeJump = this.lastTimeJump;
			this.jump();
			}		
		else if(this.nowFlying)
			{
				this.wavePos = 0;
				this.lastTimeJump = this.lastPressJump;
				this.startTimeJump = this.lastTimeJump;
				clearTimeout(this.jumpTimeout);
				this.jump();
			}
		else if(!this.isPressingJump && this.state == marioStates[3] && (this.nowFalling || (this.nowJumping && this.wavePos > (Math.PI/2))))
			{
				if(this.planeTimeout)
					clearTimeout(this.planeTimeout);
				if(this.jumpTimeout)
					clearTimeout(this.jumpTimeout);
				this.node.removeClass('plane');
				this.node.addClass("plane");
				this.nowJumping = false;
				this.nowFalling = true;
				this.fallingSpeed = this.fallingSpeed / 3;
				this.planeTimeout = setTimeout($.proxy(function(){
							this.node.removeClass('plane');
							this.fallingSpeed = this.originalProps.fallingSpeed;
							},this)
						,500);	
			}
			this.isPressingJump = true;
	}
	this.stopJump = function(){
			now = (new Date()).getTime();
			diff = (now - this.startTimeJump) / 200;
			this.powerJump = diff >=1 ? 1 : diff;
			this.isPressingJump = false;
			//info(this.powerJump);
			
	}
	this.jump = function(){
		this.nowJumping = true;
		this.node.addClass("jump");
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeJump = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += Math.PI * (now - this.lastTimeJump) /(1000*this.jumpLength*this.powerJump);
	    //this.wavePos += Math.PI * this.refreshTime /(1000*this.jumpLength*this.powerJump);
	    
	    if (this.wavePos >= Math.PI)
	    	{
	    		//nextY = this.y - this.fallingSpeed;
	    		this.nowJumping = false;
				this.node.removeClass("jump");
				this.y = parseInt(this.y);
	    		this.fall();
	    		return false;
	    	}
	    else	
	    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight * this.powerJump ;//* (now - lastTimeJump)/1000;



	    if(nextY <= 0)
			this.die();
	    //You continue to jump/fall, no colision
	    else if((block = getElementAt(this.elementsAround.blocks,this.x,nextY,this.w,this.h)) == null || block.onlySupport || (block.inclined && block.fx(this.x+(this.w/2))<nextY+5))
	    	{
	    	oldY = this.y;
	    	this.y = nextY;
	    	this.lastTimeJump = now;	
	    	if(block && block.onlySupport && block.y+block.h<=oldY)
	    		{
	    			this.y = block.y+block.h+1;
					this.nowJumping = false;
					this.node.removeClass("jump");
					return this;
	    		}
	    	this.manageEnemie();
			if(this.wavePos >= Math.PI/2)
				{
				this.nowFalling = true;
				this.node.removeClass("jump");
				}			
    		this.jumpTimeout = setTimeout($.proxy(this.jump,this), this.refreshTime);
	    	}
	    //You touch a block, but over you. You continue the jump, but now falling
	    else if(nextY > this.y)
	    	{
	    		if(block.wayToWarp && block.wayToWarpDir && block.wayToWarpDir=="up" && this.lookUp)
				{
					supportWayToWarp = block; 
					this.pause();
					this.nowJumping = false;
					this.node.addClass("straight up");
					setTimeout(function(){goToWarpZone(supportWayToWarp.wayToWarp,supportWayToWarp.wayToWarpX,supportWayToWarp.wayToWarpY,"up")},1000);
				}
	    		else
	    		{
		    		this.jumpTimeout = setTimeout($.proxy(this.jump,this), this.refreshTime);
			    	this.lastTimeJump = now;
			    	this.wavePos = Math.PI/2;
			    	this.node.removeClass("jump");
			    	if(this.typeOfObject == "Mario" && block.hitten)
						{
							block.holder = this;
							block.hitten();
						}
				}
	    	}
	    //You touch something under you.
	    else{
			this.nowJumping = false;
			this.lastTimeJump = void(0);
			support = getBlockAt(this.x,nextY,this.w,this.h);
			if(support.inclined)				
				{
				newY1 = support.fx(this.x);
				newY2 = support.fx(this.x+this.w);
				this.y = newY1 > newY2 ? newY1 : newY2;
				}
			else
				this.y = support.y + support.h;
	    	this.node.css({bottom:this.y+"px"});
	    	this.node.removeClass("jump");
			}		
	}
	this.extraOn = function(){
		if(this.state == "fleur" && !this.extraBtn)
			{
				this.fire();
			}
		if(this.state == "racoon" && !this.extraBtn)
			{
				this.tailHit();
			}
		this.fastRunning = fastRunningSpeed;
		this.extraBtn = true;
	}
	this.extraOff = function(){
		this.fastRunning = 1;
		this.extraBtn = false;
		this.releaseItem();
	}
	this.increaseRunPower = function(){
		if(!this.runPowerUpdate){
			this.runPowerUpdate = true;
			if(this.runPower <8)
			{
				this.runPower++;
				this.updateRunPowerInfo();
			}
			setTimeout($.proxy(function(){
					this.runPowerUpdate = false;
					},this)
				,200);
			}
	}
	this.decreaseRunPower = function(){
		if(!this.runPowerUpdate){
			this.runPowerUpdate = true;
			if(this.runPower >0)
			{
				this.runPower--;
				this.updateRunPowerInfo();
			}
			setTimeout($.proxy(function(){
					this.runPowerUpdate = false;
					},this)
				,100);
			}		
	}
	this.manageRunPower = function(){
		if(!this.superRun)
			{
			if((this.acceleration == 20 || this.acceleration == -20) && this.speedFactor >= 1 && this.fastRunning == fastRunningSpeed && !this.nowFalling && !this.nowJumping)
				this.increaseRunPower();
			else
				this.decreaseRunPower();
				
			if(this.runPower >= 7)
				{
					this.superRun = true;
					this.node.addClass('superRuner');
					if(this.state == marioStates[3])					
						this.nowFlying = true;
					else
						{
							this.jumpHeight *=2;
							this.jumpLength *=2;
						}
					setTimeout($.proxy(function(){
							this.superRun = false;
							this.node.removeClass('superRuner');
							this.nowFlying = false;
							this.jumpHeight = this.originalProps.jumpHeight;
							this.jumpLength = this.originalProps.jumpLength;
					 		clearTimeout(this.jumpTimeout);
					 		this.nowJumping = false;
							},this)
						,4000);	
				}
			}
	}
	this.updateRunPowerInfo = function(){
		runHTML = "";
		for (var i=1; i < 7; i++) {
		  if(i<this.runPower)
		  	runHTML += "<span>&#9654;</span>";
		  else
		  	runHTML += "&#9654;";
		};
		$("#infoBar #runPower .powerLevel").html(runHTML);
		if(this.runPower >= 7)
			$("#infoBar #runPower .superRun").addClass("on");
		else
			$("#infoBar #runPower .superRun").removeClass("on");
	}
	this.manageInclined = function(){
		$this = this;
		speedInclined = 10;
		inclinedSupport = false;
		$.each(this.supports,function(key,val){
			if(this.inclined) 
				{
				if(($this.orientation == "Fwd" && this.fx($this.x)<this.fx($this.x+10))	|| ($this.orientation == "Bwd" && this.fx($this.x)<this.fx($this.x-10)))
					speedInclined = 5;
				else
					speedInclined = 15;
				inclinedSupport = true;
				}				
		});
		this.onInclinedSupport = inclinedSupport;
		this.speedFactor *=10;
		if(speedInclined != 10)
			{
			if(speedInclined > this.speedFactor)
					this.speedFactor += 1;
			else if(speedInclined < this.speedFactor)
					this.speedFactor -= 1;
			}
		else
			{
				if(this.speedFactor < 10)
					this.speedFactor += 1;
				else if(this.speedFactor > 10)
					this.speedFactor -= 1;
			}
		this.speedFactor = this.speedFactor/10;
	}
	this.cancelMove = function(){		
		this.node.removeClass("couch");
		this.dir = 0;
	}
	this.changeState = function(state){
		oldState = this.state;
		this.state = state;
		$this = this;
		$.each(marioStates,function(key){
			$this.node.removeClass(this.toString());
		});
		this.node.addClass(state);
		fn1 = $.proxy(function(){this.node.removeClass(oldState);this.node.addClass(state);},this);
		fn2 = $.proxy(function(){this.node.removeClass(state);this.node.addClass(oldState);},this);
		for(i=100;i<1100;i+=200)
		{
			setTimeout(fn2,i);
			setTimeout(fn1,i+100);
		}
		this.h = this.node.height();
		this.w = this.node.width();
		if(this.heldItem)		
			this.heldItem.node.css({top:(this.h/2-this.heldItem.h/2+4)+"px",right:"-12px",left:""});
	}
	this.quicklyInvicible = function(timing){
		this.invincible = true;
		setTimeout($.proxy(function(){this.invincible = false},this),timing || 100);
	}
	this.fire = function(){
		if(!this.unableToFire && this.fireBallNumber < this.maxFireBallNumber)
		{
			fireBall = new Enemie(this.x,"flowerFire",{y:this.y+this.h/2,dir:this.orientation,wavePos:Math.PI});
			fireBall.sender = this;
			this.addActiveFireBall();
			level.enemies["fireBall_"+(new Date()).getTime()] = fireBall;
			this.unableToFire = true;
			this.node.addClass("fire");
			setTimeout($.proxy(function(){this.node.removeClass("fire");},this),200);
			setTimeout($.proxy(function(){this.unableToFire = false},this),100);
		}		
	}
	this.tailHit = function(){		
		if(!this.unableToTailHit)
		{
			this.stopCouch();
			this.node.addClass("hit");
			this.unableToTailHit = true;
			setTimeout($.proxy(function(){
				this.node.removeClass("hit");
				this.unableToTailHit = false;
			},this),300);
			setTimeout($.proxy(function(){
					enemies = getElementsAt(this.elementsAround.enemies,this.x+this.w,this.y,7,3)["enemies"]
					$.each(enemies,function(key,val){this.ejected();});
					
					blocks = getElementsAt(this.elementsAround.blocks,this.x+this.w,this.y,7,3)["blocks"]
					$.each(blocks,function(key,val){				
			    	if(this.hitten)
						{this.holder = player;this.hitten();}
						});
				},this),100);
			setTimeout($.proxy(function(){
				enemies = getElementsAt(this.elementsAround.enemies,this.x-5,this.y,5,3)["enemies"]
				$.each(enemies,function(key,val){this.ejected();});
					
				blocks = getElementsAt(this.elementsAround.blocks,this.x-5,this.y,5,3)["blocks"]
				$.each(blocks,function(key,val){				
		    	if(this.hitten)
					{this.holder = player;this.hitten();}
					});
						},this),200);
		}
	}
	this.addActiveFireBall = function(){
		this.fireBallNumber++;
	}
	this.removeActiveFireBall = function(){
		if(this.fireBallNumber>0)
			this.fireBallNumber--;	
	}
	this.addCoin = function(num){
		if(num)
			this.coins += num;
		else
			this.coins++;
		
		while(this.coins>=100)
			{
				this.coins -= 100;
				this.addLife();
			}
		
		$('#numCoins').html( (this.coins<10? "&nbsp;" : "") + this.coins);	
	}
	this.addLife = function(num){
		if(num)
			this.lives += num;
		else
			this.lives++;
		
		$('#numLives').html( (this.lives<10? "&nbsp;" : "") + this.lives);	
	}
	this.addPoint = function(num){
		if(num)
			this.score += num;
		else
			this.score++;
		
		$('#playerScore').html(
			(this.score<1000000? "0" : "")
			+(this.score<100000? "0" : "")
			+(this.score<10000? "0" : "")
			+(this.score<1000? "0" : "")
			+(this.score<100? "0" : "")
			+(this.score<10? "0" : "")
			+ this.score);	
	}
	this.reset = function(){
		this.cancelMove();
		this.stopCouch();
		this.stopJump();
		this.releaseItem();
		this.extraOff();
		this.state = marioStates[0];
		this.runPower = 0;
		this.runPowerUpdate = false;
		this.updateRunPowerInfo();
		this.nowJumping = false;
		this.nowFlying = false;
		this.nowFalling = false;
	}
	this.winLevel = function(){
		stopAll();
		this.cancelMove();
		this.extraOff();
		this.nowJumping = false;
		this.stopJump();
		this.fall();
		this.acceleration = this.dir = 0;
		//setTimeout($.proxy(this.runLeft,this),1000);	
		this.winLevelInterval = setInterval($.proxy(function(){
			if(!this.nowFalling)
				this.runLeft()
			if(this.x > $mainScene.width())
				{
					this.cancelMove();
					clearInterval(this.winLevelInterval);
					clearInterval(this.interval);
					$body.append($("<div class='message'>COURSE CLEAR !</div>"));
					setTimeout(function(){
						$(".message",$body).html($(".message",$body).html()+"<br/><br/>BUT YOU GOT NO CARD...");
					},1000);				
				}
		},this),100)
	}
	this.die = this.lose;
}
function stopAll(){
	$.each(level.activeEnemies,function(key,val){
		clearInterval(this.interval);
		if(this.node)
			this.node.css({WebkitAnimation:"none",MozAnimation:"none",OAnimation:"none",MsAnimation:"none",animation:"none"});
	});
	$.each(level.activeItems,function(key,val){
		clearInterval(this.interval);
	});
	clearInterval(levelTimeInterval);
}
function info(info){
	$('#infoMario').html(info);
}

function goToWarpZone(zone,x,y,dir){
	player.node.removeClass("straight down up");
	if(zone == "level")
		returnToLevel(x,y,dir);
	else
	{
		standByZone(level);
		zone = level.warpZone[zone];
		zone.time = level.time;
		player.x = x;
		player.y = y;
		initZone(zone);
		block = getBlockAt(x,y,1,1);
		if(block && block.wayToWarpDir)
			dir = block.wayToWarpDir;
		if(block && dir == "down")
			player.y = block.y - player.h - 1;
		if(block && dir == "up")
			player.y = block.y + block.h + 1;
		$mainScene.append(player.node);
		player.redraw();
		if(dir == "up")
			player.node.addClass("straight returnUp");
		if(dir == "down")
			player.node.addClass("straight returnDown");
		setTimeout(function(){
			player.unpause();
			player.node.removeClass("straight returnDown returnUp");		
			},1000);	
	}
	//player.activate();
}
function returnToLevel(x,y,dir){
	player.node.removeClass("straight down up");
	mainLevel.time = level.time;
	standByZone(level);
	level = mainLevel;
	player.x = x;
	player.y = y;
	initZone(level);
	block = getBlockAt(x,y,1,1);
	if(block && block.wayToWarpDir)
		dir = block.wayToWarpDir;
	if(block && dir == "down")
		player.y = block.y - player.h - 1;
	if(block && dir == "up")
		player.y = block.y + block.h + 1;
	$mainScene.append(player.node);
	player.redraw();
	if(dir == "up")
		player.node.addClass("straight returnUp");
	if(dir == "down")
		player.node.addClass("straight returnDown");
	setTimeout(function(){
		player.unpause();
		player.node.removeClass("straight returnDown returnUp");		
		},1000);	
}
function GameOver(){
	alert('GAME OVER...');
}
function standardChangeDirection(){
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
function standardJump(){
		this.nowJumping = true;
		this.node.addClass("jump");
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeJump = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += Math.PI * (now - this.lastTimeJump) /(1000*this.jumpLength);
	    
	    if (this.wavePos >= Math.PI)
	    	nextY = this.y - this.fallingSpeed;
	    else	
	    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;

	    if(nextY <= 0)
			this.die();
	    //You continue to jump/fall, no colision
	    else if((block = getBlockAt(this.x,nextY,this.w,this.h)) == null)
	    	{
    		setTimeout($.proxy(this.jump,this), 20);
	    	this.node.css({bottom:nextY+"px"});
	    	oldY = this.y;
	    	this.y = nextY;
	    	this.lastTimeJump = now;	    	
			if(!getEnemieAt(this.x,oldY,this.w,this.h) && (enemie = getEnemieAt(this.x,this.y-1,this.w,this.h)))
				{
					if(this.typeOfObject == "Mario")
						this.killEnemie(enemie);
					if(this.typeOfObject == "Enemie")
						this.wavePos = 0;
				}
	    	}
	    //You touch a block, but over you. You continue the jump, but now falling
	    else if(nextY > this.y)
	    	{
    		setTimeout($.proxy(this.jump,this), 20);
	    	this.lastTimeJump = now;
	    	this.wavePos = Math.PI/2;
	    	if(this.typeOfObject == "Mario" && block.marioBonus)
				{
					block.holder = this;
					block.marioBonus();
				}
	    	}
	    //You touch something under you.
	    else{
			this.nowJumping = false;
			this.lastTimeJump = void(0);
			support = getBlockAt(this.x,nextY,this.w,this.h);
			if(support.inclined)
				this.y = support.fx(this.x);
			else
				this.y = support.y + support.h + 1;
	    	this.node.css({bottom:this.y+"px"});
	    	this.node.removeClass("jump");
			}		
	}
function getElementAt(list,x,y,w,h,butMe){
	element = null;
	$.each(list,function(key,val){
		if(element && element.z > this.z)
			return null;
		cY = this.y;cH = this.h;
		if(this.onlySupport)
			{
			cY = cY + cH -1;
			cH = 1;
			}
		/*
	    if(!this.inclined && ((x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH) && this != butMe))
	      element = this; 
	    else if(this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH && this.fx(x+w/2) > y+h/2))
		  element = this;
		 */	
	    if(x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH)
			if(!this.inclined)
				element = this;
			else 
				{
				cY2 = this.fx(x);
				cY3 = this.fx(x+w);
				if(cY2 > y || cY3 > y)
					element = this;
				}
	});
	return element;	
}
function getElementsAt(list,x,y,w,h,options){
	elements = {
		items : {},
		blocks : {},
		enemies : {}
	};
	butMe = null;
	if(options && options.butMe)
		butMe =  options.butMe;
	$.each(list,function(key,val){
		tab = this.constructor == Enemie ? elements.enemies : this.constructor == Item ? elements.items : elements.blocks;
		cY = this.y;cH = this.h;
		if(this.onlySupport)
			{
			cY = cY + cH -1;
			cH = 1;
			}
		/*
	     if(!this.inclined && ((x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH) && this != butMe))
			tab[this.id]=this;
	    else if(this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH && this.fx(x+w/2) > y+h/2))
			tab[this.id]=this;
		*/
	    if(x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH  && this != butMe)
			if(!this.inclined)
				tab[this.id]=this;
			else 
				{
				cY2 = this.fx(x);
				cY3 = this.fx(x+w);
				if(cY2 > y || cY3 > y)
					tab[this.id]=this
				}
		
	});
	return elements;	
}

function objLength(obj){
	var cpt = 0;
	for(var i in obj)
		{
		cpt++;
		}
	return cpt;
}

$(window).bind("load",
function(){
	test = $('<div class="orangePanel1"></div>');
	$('.body').append(test);
	
	border = {top:parseInt(test.css('border-top-width')),
				right:parseInt(test.css('border-right-width')),
				bottom:parseInt(test.css('border-bottom-width')),
				left:parseInt(test.css('border-left-width'))};
				
	console.log(border);
				
	initGame();
	$(window).unload(function(){$sceneView.scrollLeft(0)})
	if ("ontouchstart" in document.documentElement)
	{	
		$padUp = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"20%",left:"10%",zIndex:4000,opacity:0.5,backgroundColor:"#000",borderRadius:"20% 20% 0 0"});
		$padDown = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"40%",left:"10%",zIndex:4000,opacity:0.5,backgroundColor:"#000",borderRadius:"0 0 20% 20%"});
		$padLeft = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"30%",left:"0",zIndex:4000,opacity:0.5,backgroundColor:"#000",borderRadius:"20% 0 0 20%"});
		$padRight = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"30%",left:"20%",zIndex:4000,opacity:0.5,backgroundColor:"#000",borderRadius:"0 20% 20% 0"});
		$padA = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"35%",right:"15%",zIndex:4000,opacity:0.5,backgroundColor:"#ed1f24",borderRadius:"50%"});
		$padB = $("<a href='javascript:void(0)'> </a>").css({width:"10%",height:"10%",position:"absolute",top:"35%",right:"0",zIndex:4000,opacity:0.5,backgroundColor:"#ed1f24",borderRadius:"50%"});
	
		$body.append($padUp);
		$body.append($padDown);
		$body.append($padLeft);
		$body.append($padRight);
		$body.append($padA);
		$body.append($padB);
	    
	    $padRight.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:39});
		});
		$padRight.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:39});
		});
			
		$padLeft.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:37});
		});
		$padLeft.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:37});
		});
			
		$padUp.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:38});
		});
		$padUp.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:38});
		});
			
		$padDown.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:40});
		});
		$padDown.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:40});
		});
			
		$padA.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:88});
		});
		$padA.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:88});
		});
			
		$padB.bind("touchstart",function(e){
			e.preventDefault();
			manageKeyPress({keyCode:32});
		});
		$padB.bind("touchend",function(e){
			e.preventDefault();
			manageKeyUp({keyCode:32});
		});
		$sceneBg = null;
	}
});
