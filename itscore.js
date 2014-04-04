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

var $body = $(document.body);
var $mainScene = null;
var $infoBar = null;
function standardObject(){
	return {
	dir : 0,
	startX : 0,
	w : 0,
	h : 0,
	x : null,	
	y : null,
	className : "",
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
}
var marioStates = ["small","grand","fleur"];

function initGame(){
	level = levels[1];
	initLevel();
	player = new Mario();
	player.activate();
	$(document).bind("keydown.mario",function(e){
		manageKeyPress(e);
	});
	
	$(document).bind("keyup.mario",function(e){
		manageKeyUp(e);
	});
	levelManagementInterval = setInterval(levelManagement,20);
	levelTimeInterval = setInterval(levelTime,1000);

	
}
function levelManagement(){
	//Enemies creation management
	$.each(level.enemies,function(key,val){
    	if(val && this.startX < $sceneView.width()+$sceneView.scrollLeft())
      		{
      			this.id = key;
      			this.activate();
      			level.activeEnemies[key] = this;
      			level.enemies[key] = void(0);
      		}
	});
	/*
	$.each(level.activeEnemies,function(key,val){
		try{
      	this.redraw();
      	}
      	catch(e){}
	});*/
	//Items creation management
	$.each(level.items,function(key,val){
    	if(val && this.startX < $sceneView.width()+$sceneView.scrollLeft())
      		{
      			this.id = key;
      			this.activate();
      			level.activeItems[key] = this;
      			level.items[key] = void(0);
      		}
	});	
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
function manageKeyPress(e){
	switch(e.keyCode)
	{
	case 37:
		player.runRight();
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
	this.node = $("#marioMove");
	this.y = parseInt(this.node.css("bottom"));
	this.typeOfObject = "Mario";	
	this.heldItem = null;
	this.extraBtn = false;
	this.fastRunning = 1;
	this.powerJump = 1;
	this.state = marioStates[0];
	this.activate = function(){
		this.h = this.node.height();
		this.w = this.node.width();
		this.node.css('left',0);
		this.x = 0;
		this.interval = setInterval($.proxy(this.refresh,this),this.refreshTime);
		$mainScene.append(this.node);
		//$(document.body).append(this.node);
	}
	this.refresh = function(){
		this.moveMe();
		this.redraw();		
		
		//Get Supports
		if(!this.nowFalling && !this.nowJumping)
			{
				this.supports = getAllBlocksAt(this.x,this.y-1,this.w,this.h);
				//this.manageInclinedSpeed();						
			}
		else
		{
			this.supports = {};
		}
		
		this.manageRunPower();
		
	}
	this.redraw = function(){
		//this.node.css({bottom:this.y+"px",left:this.x+"px"});
			
		//Windows Moving management
		$sceneView.scrollLeft(this.x - $sceneView.width()/2);
		//$(window).scrollTop($mainScene.height()-this.y+ $(window).height()/2);
		/*$mainScene.scrollLeft(this.x - $mainScene.width()/2);
		$mainScene.scrollTop(this.y - $mainScene.height()/2);*/
		$sceneView.scrollTop($mainScene.height()-this.y-$sceneView.height()/2);
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
		if(this.dir == "Fwd")
			this.acceleration += this.acceleration < 20 ? 2 : 0;
		else if(this.dir == "Bwd")
			this.acceleration -= this.acceleration > -20 ? 2 : 0;
		else if(this.acceleration > 0)
			this.acceleration -= 2;
		else if(this.acceleration < 0)
			this.acceleration += 2;
		newX = this.x+(this.speed*this.fastRunning*this.speedFactor*this.acceleration/20) * (now - this.lastTimeMove) / this.refreshTime;
		//newX = this.x+(this.speed*this.fastRunning*this.speedFactor*this.acceleration/20);
		this.lastTimeMove = now;
		if(enemie = getEnemieAt(newX,this.y,this.w,this.h) && !enemie.inoffensive && !this.invincible)
			{
				this.x = newX;
				this.enemieTouch();
				return this;
				/*
				clearTimeout(this.jumpTimeout);
				this.nowJumping = false;
				this.node.removeClass("jump");
				*/
			}
		if(item = getItemAt(newX,this.y,this.w,this.h))
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
			
		if(!getBlockAt(newX,this.y,this.w,this.h))
			this.x = newX;
		else if((block = getBlockAt(newX,this.y,this.w,this.h)) && block.inclined)
			{				
			this.x = newX;
			this.y = block.fx(this.x-this.h/2);
			}
		else
			this.acceleration = 0;
			
		//Falling management
		this.fall();
		
		//Fall into a hole
		if(this.y <= -this.h)
    		this.lose("tombé");
		
		if((this.acceleration > 0 && this.node.hasClass("turnRight")) || (this.acceleration < 0 && !this.node.hasClass("turnRight")))
			this.node.addClass("surf");
		else
			this.node.removeClass("surf");		
		
	};
	this.fall = function(){		
		for(i=0;i<this.fallingSpeed;i++)
			if(!getBlockAt(this.x,this.y-1,this.w,this.h) && !this.nowJumping)
				{
					this.nowFalling = true;
					//info("nowFalling = true : "+this.x+" "+(this.y-1)+" "+this.w+" "+this.h);
					this.y -= 1;
					this.node.css({bottom:parseInt($("#marioMove").css('bottom'))-1+"px"});
					if(!getEnemieAt(this.x,this.y,this.w,this.h) && (enemie = getEnemieAt(this.x,this.y-1,this.w,this.h)))
					{
						this.killEnemie(enemie);
						/*
						if(this.lastPressJump && (new Date()).getTime() - this.lastPressJump < 100)
							{
								this.nowJumping = this.nowFalling = false;
								this.goJump();
							}
						*/
					}
				}
			else if(!this.nowJumping)
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
				this.changeState(marioStates[marioStates.indexOf(this.state)-1]);
				this.quicklyInvicible(1000);
			}
	}
	this.lose = function(message){
		//alert("you lose on this : " + message);
		//console.log("NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO : " + message)
		
		if(this.y > 0)
			{
			this.node.addClass("dying");
			//setTimeout($.proxy(function(){this.remove()},this.node),1000);
			}
		clearInterval(this.interval);
		clearTimeout(this.jumpTimeout);
		$(document).unbind(".mario");
		stopAll();
	};
	this.killEnemie = function(enemie){
		if(!enemie.invincible)
			{ 
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
		level.activeItems[item.id] = void(0);
		$('#mario').append(item.node);
		item.node.css({top:(this.h/2-item.h/2)+"px",right:"-18px",left:""});
		this.heldItem = item;
		this.heldItem.holder = this;
		this.node.addClass("hold");
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
		this.node.addClass("run turnRight");
		this.dir = this.orientation = "Bwd";
	}
	this.runLeft = function(){
		this.node.addClass("run");
		this.node.removeClass("turnRight");
		this.dir = this.orientation = "Fwd";
	}
	this.couch = function(){		
		this.node.removeClass("run");
		this.node.addClass("couch");
		this.h = this.node.height();
		this.w = this.node.width();
		this.h = 
		this.dir = 0;
	}
	this.stopCouch = function(){
		this.node.removeClass("couch");
		this.h = this.node.height();
		this.w = this.node.width();
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
	}
	this.stopJump = function(){
			now = (new Date()).getTime();
			diff = (now - this.startTimeJump) / 200;
			this.powerJump = diff >=1 ? 1 : diff;
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
	    		this.fall();
	    		return false;
	    	}
	    else	
	    	nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight * this.powerJump ;//* (now - lastTimeJump)/1000;



	    if(nextY <= 0)
			this.die();
	    //You continue to jump/fall, no colision
	    else if((block = getBlockAt(this.x,nextY,this.w,this.h)) == null)
	    	{
    		this.jumpTimeout = setTimeout($.proxy(this.jump,this), this.refreshTime);
	    	this.node.css({bottom:nextY+"px"});
	    	oldY = this.y;
	    	this.y = nextY;
	    	this.lastTimeJump = now;	    	
			if(!getEnemieAt(this.x,oldY,this.w,this.h) && (enemie = getEnemieAt(this.x,this.y-1,this.w,this.h)))
				{
					this.killEnemie(enemie);
				}
			if(this.wavePos >= Math.PI/2)
				{
				this.nowFalling = true;
				this.node.removeClass("jump");
				}
	    	}
	    //You touch a block, but over you. You continue the jump, but now falling
	    else if(nextY > this.y)
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
	this.extraOn = function(){
		this.fastRunning = fastRunningSpeed;
		this.extraBtn = true;
		if(this.state == "fleur")
			{
				this.fire();
			}
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
				,300);
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
				,200);
			}		
	}
	this.manageRunPower = function(){
		if(!this.superRun)
			{
			if((this.acceleration == 20 || this.acceleration == -20) && this.speedFactor == 1 && this.fastRunning == fastRunningSpeed && !this.nowFalling && !this.nowJumping)
				this.increaseRunPower();
			else
				this.decreaseRunPower();
				
			if(this.runPower >= 7)
				{
					this.superRun = true;						
					this.nowFlying = true;
					setTimeout($.proxy(function(){
							this.superRun = false;
							this.nowFlying = false;
					 		clearTimeout(this.jumpTimeout);
					 		this.nowJumping = false;
							},this)
						,40000);	
				}
			}
	}
	this.updateRunPowerInfo = function(){
		runHTML = "";
		for (var i=1; i < 7; i++) {
		  if(i<this.runPower)
		  	runHTML += "<span>&#9654;</span>&nbsp;";
		  else
		  	runHTML += "&#9654;&nbsp;";
		};
		$("#infoBar #runPower .powerLevel").html(runHTML);
		if(this.runPower >= 7)
			$("#infoBar #runPower .superRun").addClass("on");
		else
			$("#infoBar #runPower .superRun").removeClass("on");
	}
	this.manageInclinedSpeed = function(){
		$this = this;
		speedInclined = 10;
		$.each(this.supports,function(key,val){
			if(this.inclined) 
				{
				if(($this.orientation == "Fwd" && this.fx(this.x+1)>this.y)	|| ($this.orientation == "Bwd" && this.fx(this.x+1)<this.y))
					speedInclined = 5;
				else
					speedInclined = 20;
				}				
		});
		this.speedFactor *=10;
		if(speedInclined != 10)
			{
				if(speedInclined > this.speedFactor)
				{
					this.speedFactor += 1;
				}				
			else if(speedInclined < this.speedFactor)
				{
					this.speedFactor -= 1; 
				}
			}
		this.speedFactor = this.speedFactor/10;
	}
	this.cancelMove = function(){		
		this.node.removeClass("run couch");
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
		this.heldItem.node.css({top:(this.h/2-this.heldItem.h/2)+"px",right:"-18px",left:""});
	}
	this.quicklyInvicible = function(timing){
		this.invincible = true;
		setTimeout($.proxy(function(){this.invincible = false},this),timing || 100);
	}
	this.fire = function(){
		if(!this.unableToFire)
		{
			fireBall = new Enemie(this.x,"flowerFire",{y:this.y+this.h/2,dir:this.orientation,wavePos:Math.PI});
			level.enemies["fireBall_"+(new Date()).getTime()] = fireBall;
			this.unableToFire = true;
			this.node.addClass("fire");
			setTimeout($.proxy(function(){this.node.removeClass("fire");},this),200);
			setTimeout($.proxy(function(){this.unableToFire = false},this),100);
		}		
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
function initLevel(){
	$mainScene = $("<div id='mainScene'></div>").css({width:$body.width()+"px"});
	$sceneView = $("<div id='sceneView'></div>");
	$infoBar = createInfoBar();
	$sceneView.append($mainScene);
	$body.append($sceneView);
	$body.append($infoBar);
	$.each(level.blocks,function(key,val){
		//console.log(this)
		var block = $('<div class="'+this.className+'"></div>').css({
			position:"absolute",
			bottom:this.y+"px",
			left:this.x+"px"});		
		this.node = block;
		this.id = key;
		$mainScene.append(block);
		if(this.h)
			this.node.css("height",this.h+"px");	
		else
			this.h = parseInt(this.node.css("height"));
		if(this.w)
			this.node.css("width",this.w+"px");	
		else
			this.w = parseInt(this.node.css("width"));	
	});
}
function createInfoBar(){
	infoBar = $("<div id='infoBar'></div>");
	
	playerInfo = $("<div id='playerInfo'></div>");
	playerInfo.append($("<div id='levelName'>world 1</div>"));
	playerInfo.append($("<div id='runPower'><span class='powerLevel'>&#9654; &#9654; &#9654; &#9654; &#9654; &#9654;</span> <span class='superRun'>P</span></div>"));
	playerInfo.append($("<div id='playerCoin'><div class='coin'></div><span id='numCoins'>&nbsp;0</span></div>"));
	playerInfo.append($("<div id='playerLives'>Mx <span id='numLives'>3</span></div>"));
	playerInfo.append($("<div id='playerScore'>0000000</div>"));
	playerInfo.append($("<div id='timeLeft'>300</div>"));
	
	infoBar.append(playerInfo);
	return infoBar;
}
function info(info){
	$('#infoMario').html(info);
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
initGame();
