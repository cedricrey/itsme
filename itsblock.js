var blocksProps = {
	"bonusCoin":{},
	"bonusMushroom":{breakable:true,hitten:bonusMushroom,bonusType:""},
	"brickBlock":{breakable:true,hitten:hitBrick},
	"orangePanel1":{onlySupport:true},
	"orangePanel2":{onlySupport:true},
	"orangePanel3":{onlySupport:true},
	"orangePanel4":{onlySupport:true},
	"orangePanel5":{onlySupport:true},
	"bluePanel1":{onlySupport:true},
	"bluePanel2":{onlySupport:true},
	"bluePanel3":{onlySupport:true},
	"bluePanel4":{onlySupport:true},
	"greenPanel1":{onlySupport:true},
	"greenPanel2":{onlySupport:true},
	"greenPanel3":{onlySupport:true},
	"greenPanel4":{onlySupport:true},
	"greenPanel5":{onlySupport:true},
	"greenPanel6":{onlySupport:true},
	"greyPanel1":{onlySupport:true},
	"greyPanel2":{onlySupport:true},
	"plateform1":{moveMe:function(){$.proxy(standardCircle,this)();},jumpLength:1},
	"grassIncline45":{inclined:true,fx:supInclined},
	"grassInclineN45":{inclined:true,fx:supInclined,inclineFact:-1},
	"grassIncline22":{inclined:true,fx:supInclined,inclineFact:0.5},
	"grassInclineN22":{inclined:true,fx:supInclined,inclineFact:-0.5}	
}
var decoProps ={
	"cloudDeco" : {},
	"palmTree":{},
	"bush" : {},
	"dome1" : {},
	"dome2" : {},
	"dome3" : {},
	"dome4" : {},
};
function Block(options){
	this.node = "";	
	$.extend(this,standardObject());
	this.options = options;
	if(options.className && blocksProps[options.className])
		$.extend(this,blocksProps[options.className]);
	$.extend(this,options);
	
	this.redraw = function(){
		this.node.css({bottom:this.y+"px",left:this.x+"px"});
	}
	this.activate = function(){
		if(this.isGroup)
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
		
		if(this.classSup)
			this.node.addClass(this.classSup);
		
		$mainScene.append(this.node);
		border = {top:parseInt(this.node.css('border-top-width')),
					right:parseInt(this.node.css('border-right-width')),
					bottom:parseInt(this.node.css('border-bottom-width')),
					left:parseInt(this.node.css('border-left-width'))};
		
		if(this.h)
			this.node.css("height",(this.h-border.top-border.bottom)+"px");	
		else
			this.h = parseInt(this.node.css("height"))+border.top+border.bottom;
		if(this.w)
			this.node.css("width",(this.w-border.right-border.left)+"px");	
		else
			this.w = parseInt(this.node.css("width"))+border.right+border.left;
			
		if(this.moveMe)			
			this.interval = setInterval($.proxy(this.refresh,this),this.refreshTime);	
	}
	this.refresh = function(){
		oldX = this.x;
		oldY = this.y;	
		this.moveMe();
		this.redraw();
			getAllElementsOver(this,{evalFn:"this.y+="+(this.y-oldY)+";this.x+="+(this.x-oldX)});
			
	}
	
}
function Decoration(options){
	this.node = "";
	this.z = 30;
	if(options.className && decoProps[options.className])
		$.extend(this,decoProps[options.className]);
	$.extend(this,options);	

	this.activate = function(){
		if(this.isGroup)
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
			
		if(this.moveMe)			
			this.interval = setInterval($.proxy(this.refresh,this),this.refreshTime);	
	}
}
function bonusMushroom(){
		bonusType = "coin";		
		if(this.bonusType)
			bonusType = this.bonusType;
		if(player.state == marioStates[0] && bonusType != "coin")
			bonusType =  "mushroom";
		className = bonusType;
		item = new Item({"startX" : this.x+(this.w/2)-4, "className" : className,y:this.y+this.h,id:"bonus_"+this.id});
		level.activeItems["bonus_"+this.id] = item;
		item.activate();		
		item.x = this.x+this.h/2-item.h/2;
		if(className == "leaf")
			item.y = this.y + this.h + 40
		
		if(bonusType == "coin")
			{
				player.addCoin();
				item.node.addClass('boingUp');
				setTimeout($.proxy(function(){
					this.node.remove();
					delete level.activeItems[this.id];
				},item),500);
			}
		
			
		this.node.addClass('boingUp');
		this.className = "emptyBlock";
		setTimeout($.proxy(function(){this.node.removeClass("boingUp bonusMushroom");this.node.addClass("emptyBlock")},this),300);
		this.hitten = function(){};
	}

function hitBrick(){
		if(!this.holder || (this.holder && this.holder.state != marioStates[0]))
			{
				//level.blocks[this.id] = void(0);
				delete level.activeBlocks[this.id];
				//this.node.remove();
				this.node.removeClass('brickBlock');
				this.node.html("<div class='brickPart1'></div><div class='brickPart2'></div><div class='brickPart3'></div><div class='brickPart4'></div>");
				setTimeout($.proxy(function(){this.node.remove()},this),300);				
			}
	}

function standardBlockJump(){
		this.nowJumping = true;
		this.node.addClass("jump");
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeJump = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += Math.PI * (now - this.lastTimeJump) /(1000*this.jumpLength);
		

	    nextY = this.y + (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight ;//* (now - lastTimeJump)/1000;
		this.y = nextY;
		this.lastTimeJump = now;
		if(this.wavePos > 2*Math.PI)
			this.wavePos = 0;
			/*getAllElementsOver(this,{evalFn:"console.log(this);this.jump()"});	*/	
}
function standardCircle(){
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeCircle = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += 2*Math.PI * (now - this.lastTimeCircle) /(1000*this.jumpLength);
		
		if(!this.circleRadius)
			this.circleRadius = 20;
		if(!this.circleCenterX)
			this.circleCenterX = this.x - this.circleRadius;
		if(!this.circleCenterY)
			this.circleCenterY = this.y;
	
		this.x = (this.circleCenterX - (this.circleRadius * Math.cos(this.wavePos)) );
		this.y = (this.circleCenterY - (this.circleRadius * Math.sin(this.wavePos)) );
		if(this.wavePos > 2*Math.PI)
			this.wavePos = 0;
}
function circle2(){
		if(typeof this.lastTimeJump == "undefined")		
			this.lastTimeCircle = (new Date()).getTime()-10;
		now = (new Date()).getTime();
		this.lastX = this.wavePos;
	    this.wavePos += 2*Math.PI * (now - this.lastTimeCircle) /(1000*this.jumpLength);
		
	
		this.x += (Math.sin(this.wavePos) - Math.sin(this.lastX)) * this.jumpHeight;
		this.y += (Math.cos(this.wavePos) - Math.cos(this.lastX)) * this.jumpHeight;
		if(this.wavePos > 2*Math.PI)
			this.wavePos = 0;
}
function supInclined(x){
	if(!this.inclineFact)
		this.inclineFact = 1;
	if(!this.inclineOffset)
		this.inclineOffset = this.y+this.h/2 - ((this.x+this.w/2)*this.inclineFact);
	return this.inclineFact*x + this.inclineOffset;
}

/*Utilities Function*/	
function getBlockAt(x,y,w,h){
	list = level.activeBlocks;
	if(this.elementsAround)
		{
			list = this.elementsAround.blocks;
		}
	block = null;
	$.each(list,function(key,val){
		cY = this.y;cH = this.h;
		if(this.onlySupport)
			{
			cY = cY + cH -1;
			cH = 1;
			}
		/*
	    if(!this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH))
			block = this; 
	    else if(this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH && this.fx(x+w/2) > y+h/2))
			block = this;
		*/		
	    if(x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH)
			if(!this.inclined)
				block = this;
			else 
				{
					cY2 = this.fx(x);
					cY3 = this.fx(x+w);
					if(cY2 > y || cY3 > y)
						block = this;
				}
	});
	return block;
}
function getAllBlocksAt(x,y,w,h){
	blocks = {};
	$.each(level.activeBlocks,function(key,val){
		cY = this.y;cH = this.h;
		if(this.onlySupport)
			{
			cY = cY + cH -1;
			cH = 1;
			}
	    if(!this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH))
			blocks[this.id]=this;
	    else if(this.inclined && (x+w > this.x && x < this.x + this.w && y+h > cY && y < cY + cH && this.fx(x+w/2) > y+h/2))
			blocks[this.id]=this;
	});
	return blocks;
}
function getAllElementsOver(block,options){
	elements = {}
	returnedElements = {}
	$.extend(elements,level.activeEnemies,level.activeItems,{player:player});
	$.each(elements,function(key,val){
		if(this.supports && this.supports[block.id]==block)
			returnedElements[key]=this;
	});
	if(options && options.evalFn)
		$.each(returnedElements,function(key,val){
			eval(options.evalFn);
		});
	return returnedElements;
}
function getGroupNode(className,w,h){	
	testNode = $('<div class="'+className+'"></div>');
	$mainScene.append(testNode);
	elW = testNode.width();
	elH = testNode.height();
	testNode.remove();
	newNode = $('<div class="grp_'+className+'"></div>');
	newNode.height(w);
	newNode.width(h);
	for(i=0;i<h;i+=elH)
		for(j=0;j<w;j+=elW)
			{
				el = $('<div class="'+className+'"></div>');
				el.height(elH);
				el.width(elW);
				el.css("float","left");
				newNode.append(el);
			}
	return newNode;
}