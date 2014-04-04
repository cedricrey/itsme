var currentKey = null;
    	var marioDir = 0;
    	var marioAcc = 0;
    	$(document).bind("keydown",function(e){
    		manageKeyPress(e);
    	})
    	
    	$(document).bind("keyup",function(e){
    		manageKeyUp(e);
    	})
    	function manageKeyPress(e){
    		switch(e.keyCode)
    		{
    		case 37:
	    		//$("#mario").removeClass();
	    		$("#mario").removeClass("runRight");
	    		$("#mario").addClass("runLeft turnLeft");
    			currentKey = e.keyCode;
    			marioDir = "Bwd";
    		break;
    		case 39:
	    		$("#mario").removeClass("turnLeft runLeft");
	    		$("#mario").addClass("runRight");
    			currentKey = e.keyCode;
    			marioDir = "Fwd";
    		break;
    		case 40:
	    		$("#mario").removeClass("runLeft runRight");
	    		$("#mario").addClass("couch");
    			currentKey = e.keyCode;
    			marioDir = 0;
    		break;
    		case 32:
    			if(!nowJumping)
					jumpMario();
    		break;
    		}
    		e.preventDefault();
    	}
    	function manageKeyUp(e){
    		if((e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 40) && e.keyCode==currentKey)    		
    			{
    			currentKey = null;
    			$("#mario").removeClass("runLeft runRight couch");
    			marioDir = 0;
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
	    			marioAcc += marioAcc < 10 ? 1 : 0;
	    		else if(marioDir == "Bwd")
	    			marioAcc -= marioAcc > -10 ? 1 : 0;
	    		else if(marioAcc > 0)
	    			marioAcc -= 1;
	    		else if(marioAcc < 0)
	    			marioAcc += 1;
	    		$("#marioMove").css({left:(parseInt($("#marioMove").css('left'))+(6*marioAcc/10))+"px"});
	    		
	    		if((marioAcc>0 && $("#mario").hasClass("runLeft")) || (marioAcc<0 && $("#mario").hasClass("runRight")))
	    			$("#marioMove").addClass("surf");
	    		else
	    			$("#marioMove").removeClass("surf");
	    			
	    		$(window).scrollLeft($("#marioMove").position().left - $(window).width()/2)
	    		//console.log($("#marioMove").position());
	    	//}
    	}
    	setInterval(moveMario,40);
    	nowJumping = false;
    	function jumpMario(){
    		nowJumping = true;
    		$("#marioMove").addClass("jump");
    		setTimeout(function(){
    			$("#marioMove").removeClass("jump");
    			nowJumping = false;
    			},1000);
    	}
    	function jumpListener(e){
    		console.log(e)
    	}
