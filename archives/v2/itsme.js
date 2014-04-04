var currentKey = null;
var marioDir = 0;
var marioAcc = 0;
var marioOrientation = "Fwd";
var marioJumpHeight = 70;
var fastRunning = 1;
var extraBtn = false;
var fastRunningSpeed = 1.5;
var fallingSpeed = 7;
var interGame = null;
var bg1Ypos = 0;
var bg2Ypos = 0;
var itemHeld = null;
var level = {
	blocks:{
		sol:{x:0,y:0,w:527,h:62,className:"sol"},
		sol2:{x:560,y:0,w:670,h:62,className:"sol"},
		//t1:{x:30,y:20,w:50,h:50,className:"tuyau"}
		t1:{x:112,y:62,w:48,h:48,className:"tuyau"},
		bon1:{x:319,y:128,w:30,h:30,className:"bonus"}
	},
	enemies:{
		koopa1 : new Enemie(500,"koopa"),
		koopa2 : new Enemie(800,"flyingKoopa"),		
		koopa3 : new Enemie(900,"koopaShell")
	},
	activeEnemies:{
		
	},
	items:{
		koopa4 : new Item(300,"koopaShell")
	},
	activeItems:{
		
	}
};
function initGame(){
	$(document).bind("keydown.mario",function(e){
		manageKeyPress(e);
	});
	
	$(document).bind("keyup.mario",function(e){
		manageKeyUp(e);
	});
	initLevel();
	$("#marioMove").css('left',0);
	
	/*$(document.body).append($('<div id="bg1"></div>').css({position:"absolute",bottom:62,left:0}));
	bg1Ypos = $('#bg1').css("background-position").split(' ')[1];
	$(document.body).append($('<div id="bg2"></div>').css({position:"absolute",bottom:62,left:0}));
	bg2Ypos = $('#bg2').css("background-position").split(' ')[1];*/
	
	interGame = setInterval(moveMario,20);
	
}
function manageKeyPress(e){
	switch(e.keyCode)
	{
	case 37:
		//$("#mario").removeClass();
		$("#mario").removeClass("runRight");
		$("#mario").addClass("runLeft turnLeft");
		currentKey = e.keyCode;
		marioDir = marioOrientation = "Bwd";
	break;
	case 39:
		$("#mario").removeClass("turnLeft runLeft");
		$("#mario").addClass("runRight");
		currentKey = e.keyCode;
		marioDir = marioOrientation = "Fwd";
	break;
	case 40:
		$("#mario").removeClass("runLeft runRight");
		$("#mario").addClass("couch");
		currentKey = e.keyCode;
		marioDir = 0;
	break;
	case 32:
		if(!nowJumping && !nowFalling)
			{
			marioWavePos = 0;
			lastTimeJump = (new Date()).getTime();
			jumpMario();
			}
	break;
	case 88:
		fastRunning = fastRunningSpeed;
		extraBtn = true;
	break;
	}
	/*
	if(e.ctrlKey)
		fastRunning = fastRunningSpeed;
	else
		fastRunning = 1;
	*/
	e.preventDefault();
}
function manageKeyUp(e){
	if((e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 40) && e.keyCode==currentKey)    		
		{
		currentKey = null;
		$("#mario").removeClass("runLeft runRight couch");
		marioDir = 0;
		}
	if(e.keyCode == 88)
		{
		fastRunning = 1;
		extraBtn = false;
		marioReleaseItem();
		}		
}
function moveMario(){
	//if(currentKey)
	//{
		/*switch(currentKey)
		{
		case 37:
		$("#marioMove").css({left:(parseInt($("#marioMove").css('left'))-3)+"px"});
		break;
		case 39:
		$("#marioMove").css({left:(parseInt($("#marioMove").css('left'))+3)+"px"});
		break;
		}*/
		if(marioDir == "Fwd")
			marioAcc += marioAcc < 20 ? 2 : 0;
		else if(marioDir == "Bwd")
			marioAcc -= marioAcc > -20 ? 2 : 0;
		else if(marioAcc > 0)
			marioAcc -= 2;
		else if(marioAcc < 0)
			marioAcc += 2;
		if(getEnemieAt(parseInt($("#marioMove").css('left'))+(3*marioAcc*fastRunning/20),parseInt($("#marioMove").css('bottom')),$("#marioMove").width(),$("#marioMove").height()))
			{
				$("#marioMove").css({left:(parseInt($("#marioMove").css('left'))+(3*marioAcc*fastRunning/20))+"px"});				
				lose();
			}
		if(item = getItemAt(parseInt($("#marioMove").css('left'))+(3*marioAcc*fastRunning/20),parseInt($("#marioMove").css('bottom')),$("#marioMove").width(),$("#marioMove").height()))
			{
				item.dir = marioOrientation;
				if(item.holdable && extraBtn && !itemHeld)
					marioHold(item);
				else
					item.touched();	
			}
		if(!getBlockAt(parseInt($("#marioMove").css('left'))+(3*marioAcc*fastRunning/20),parseInt($("#marioMove").css('bottom')),$("#marioMove").width(),$("#marioMove").height()))
			$("#marioMove").css({left:(parseInt($("#marioMove").css('left'))+(3*marioAcc*fastRunning/20))+"px"});
		for(i=0;i<fallingSpeed;i++)
			if(!getBlockAt(parseInt($("#marioMove").css('left')),parseInt($("#marioMove").css('bottom'))-1,$("#marioMove").width(),$("#marioMove").height()) && !nowJumping)
				{
					nowFalling = true;
					$("#marioMove").css({bottom:parseInt($("#marioMove").css('bottom'))-1+"px"});
					if(enemie = getEnemieAt(parseInt($("#marioMove").css('left')),parseInt($("#marioMove").css('bottom'))-1,$("#marioMove").width(),$("#marioMove").height()))
					{
						killEnemie(enemie);
					}
				}
			else
				nowFalling = false;
		//Fall into a hole
		if(parseInt($("#marioMove").css("bottom")) <= 0)
    		lose();
		
		if((marioAcc>0 && $("#mario").hasClass("runLeft")) || (marioAcc<0 && $("#mario").hasClass("runRight")))
			$("#marioMove").addClass("surf");
		else
			$("#marioMove").removeClass("surf");
			
		//Windows Moving management
		$(window).scrollLeft($("#marioMove").position().left - $(window).width()/2);
		//Enemies creation management
		$.each(level.enemies,function(key,val){
	    	if(this.startX < $(window).width()+$(window).scrollLeft())
	      		{
	      			this.id = key;
	      			this.activate();
	      			level.activeEnemies[key] = this;
	      			level.enemies[key] = void(0);
	      		}
		});
		//Items creation management
		$.each(level.items,function(key,val){
	    	if(this.startX < $(window).width()+$(window).scrollLeft())
	      		{
	      			this.id = key;
	      			this.activate();
	      			level.activeItems[key] = this;
	      			level.items[key] = void(0);
	      		}
		});
		//$('#bg1').css("background-position",$(window).scrollLeft()*0.8+"px "+bg1Ypos);
		//$('#bg2').css("background-position",$(window).scrollLeft()*0.5+"px "+bg2Ypos);
		//console.log($("#marioMove").position());
	//}
}
nowJumping = false;
nowFalling = false;
marioLastX = 0;
marioWavePos = 0;
jumpTime = 0.85;
lastTimeJump = (new Date()).getTime();
function jumpMario(){
	nowJumping = true;
	$("#marioMove").addClass("jump");
	now = (new Date()).getTime();
	var marioLastX = marioWavePos;
    marioWavePos += Math.PI * (now - lastTimeJump)/(1000*jumpTime);
    
    //console.log(Math.sin(marioWavePos) - Math.sin(marioLastX));
    currY = parseInt($("#marioMove").css('bottom'));    
    if (marioWavePos >= Math.PI)
    	nextY = currY - fallingSpeed;
    else	
    	nextY = currY + (Math.sin(marioWavePos) - Math.sin(marioLastX)) * marioJumpHeight ;//* (now - lastTimeJump)/1000;
	 
	// console.log($("#marioMove").css('bottom') +" -- " +nextY);
		
    if(nextY <= 0)
    	lose()
    //You continue to jump/fall, no colision
    else if(!getBlockAt(parseInt($("#marioMove").css('left')),nextY,$("#marioMove").width(),$("#marioMove").height()))
    	{
    	$("#marioMove").css({bottom:nextY+"px"});
    	setTimeout(jumpMario, 20);
    	lastTimeJump = now;
		if(enemie = getEnemieAt(parseInt($("#marioMove").css('left')),parseInt($("#marioMove").css('bottom'))-1,$("#marioMove").width(),$("#marioMove").height()))
			{
				killEnemie(enemie);
			}
    	}
    //You touch a block, but over you. You continue the jump, but now falling
    else if(nextY > parseInt($("#marioMove").css("bottom")))
    	{
    	setTimeout(jumpMario, 20);
    	lastTimeJump = now;
    	marioWavePos = Math.PI/2;
    	}
    //You touch something under you. Stop the jump.
    else{
    	//console.log("stop jump")
		nowJumping = false;
		$("#marioMove").removeClass("jump");		
		marioWavePos = 0; 	
		}
}
function jumpListener(e){
	console.log(e)
}
function initLevel(){
	$.each(level.blocks,function(key,val){
		//console.log(this)
		var block = $('<div class="'+this.className+'"></div>').css({
			position:"absolute",
			width:this.w+"px",
			height:this.h+"px",
			bottom:this.y+"px",
			left:this.x+"px"});
		$(document.body).append(block);
	});
}
function getBlockAt(x,y,w,h){
	block = null;
	$.each(level.blocks,function(key,val){
    if(x+w > this.x && x < this.x + this.w && y+h > this.y && y < this.y + this.h)
      block = this;
	});
	return block;
}
function lose(){
	alert("you lose");
	clearInterval(interGame);	
	$(document).unbind(".mario");
}
function info(info){
	$('#infoMario').html(info);
}
function killEnemie(enemie){	
	marioWavePos = Math.PI * 1/4;
	lastTimeJump = (new Date()).getTime();
    $("#marioMove").css("bottom",parseInt($("#marioMove").css("bottom"))+2+"px");
	if(!nowJumping)
		jumpMario();
	enemie.isKilled();
}
function marioHold(item){
	item.stopMoving();
	level.activeItems[item.id] = void(0);
	$('#mario').append(item.node);
	item.node.css({top:"5px",right:"-15px",left:""});
	itemHeld = item;
}
function marioReleaseItem(){
	if(itemHeld)
	{
		itemHeld.dir = marioOrientation;
		itemHeld.x = parseInt($("#marioMove").css('left')) + parseInt($("#marioMove").css('width')) + 2;
		itemHeld.y = parseInt($("#marioMove").css('bottom')) + 4;
		itemHeld.touched(true);
		itemHeld = null;
	}
}
initGame();
