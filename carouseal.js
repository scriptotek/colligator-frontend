var carouSeal= (function () {

	function round(number,places) {
		return +(Math.round(number + "e+" + places)  + "e-" + places);
	}

	function degTan(deg){

		return Math.tan(deg*Math.PI/180);
	}

	function degCos(deg){

		return Math.cos(deg*Math.PI/180);
	}

	
	function getRotation(obj) {
		var matrix = obj.css("-webkit-transform") ||
		obj.css("-moz-transform") ||
		obj.css("-ms-transform") ||
		obj.css("-o-transform") ||
		obj.css("transform");

		//console.log(matrix);

		var values = matrix.split('(')[1].split(')')[0].split(',');
		
		var angle = Math.atan2(values[8], values[0]) * (180/Math.PI);

		while (angle < 0) angle +=360;

		if (angle>=360) angle = 0;

		return angle;

	}

	function getItemFromId(id){

		$.each(items.imgid, function(key, val) {

			if (val == id) {
				item = key;
				return false;
			}	
		});


		return item;
		// console.log("key from id",item);

	}

	function setActiveItem(id){

		console.log('setActiveItem');

		//This is only for row view (4 or less images) 
		if (id!==undefined) {

			//Remove glow on previous center image
			$(".carouseal_row_element img").eq(activeitem).removeClass("carouseal_selected_image");
			$(".carouseal_row_element img").eq(activeitem).addClass("carouseal_deselected_image");

			activeitem = getItemFromId(id);

			
			$(".carouseal_row_element img").eq(activeitem).removeClass("carouseal_deselected_image");
			$(".carouseal_row_element img").eq(activeitem).addClass("carouseal_selected_image");

		}
		//Carousel
		else {
					
			//Remove glow on previous center image
			$(".carouseal_element img").eq(activeitem).removeClass("carouseal_selected_image");
			$(".carouseal_element img").eq(activeitem).addClass("carouseal_deselected_image");


			var deg= getRotation($("#carouseal_carousel"));
			if (deg > 0) deg = Math.abs(deg-360); 

			activeitem = Math.abs(Math.round(deg/sector));
			if (activeitem==carousellength) activeitem=0;

			var id = items.imgid[activeitem];
			
			//console.log(activeitem,deg,sector,deg/sector);
			//Add glow on center image
			
			$(".carouseal_element img").eq(activeitem).removeClass("carouseal_deselected_image");
			$(".carouseal_element img").eq(activeitem).addClass("carouseal_selected_image");

		}			
			
		// console.log("setting active item",activeitem);
	
		carouSeal.element.trigger('listenForActiveItem', id);
	}


	//Adjust covers so that front cover has excactly zero degrees - only used with panning
	function adjustItems(duration){

		//console.log("adjustitems");

		var deg= getRotation($("#carouseal_carousel"));
		if (deg > 0) deg = Math.abs(deg-360); 

		var precisedeg = sector*activeitem; 
		var rotate = deg-precisedeg;

		//console.log("::::::",rotated,rotated%360);
		//console.log(deg,precisedeg,rotate);
		rotated = rotated+rotate;
			
		addTransforms(duration);
	
	}

	function panCarousel(xpos,velocity){
		
		var panwidth = carouselmidpoint;
		var exp = 100;
		var projectionfactor = (Math.pow(panwidth,exp)-Math.pow(Math.abs(xpos-panwidth),exp))/Math.pow(panwidth,exp);
		var speedfactor= 1000;

		var rotate = (speedfactor*velocity*projectionfactor*heightfactor)/perspective;

		console.log(speedfactor,velocity,projectionfactor,heightfactor,perspective,rotate);

		rotated = rotated + rotate;
		
		addTransforms(0);	
	}

	//Make sure that any rotation of the carousel from point a to b follows least degree (to rotate in the right direction)
	function shortestRotation(item){
	
		var leftdistance = activeitem+(carousellength-item);
		var rightdistance = activeitem-item;

		if (Math.abs(leftdistance)<Math.abs(rightdistance)) {

			var rotate = leftdistance*sector; 

			if (rotate<-180) rotate = rotate +360;
		}
		else {
	
			var rotate = rightdistance*sector; 
			if (rotate>180) rotate = rotate -360;
		}

		return rotate;

	}

	function swipeCarousel(x,duration,velocity){

		velocity = Math.abs(velocity);

		//console.log('swipe',x,duration);

		//Swipe		
		//Sensitivity is how many pixels it takes to swipe one image
		if (Math.abs(x)<sensitivity && x<0) x=-sensitivity;
		else if (Math.abs(x)<sensitivity && x>0) x=sensitivity;
		
		//Exponentialy increase numOfItemsToMove with velocity
		var velocityfactor = Math.pow(1.005,Math.pow(velocity,3));

		x = x*velocityfactor;

		var numOfItemsToMove = Math.round(x/sensitivity);

		rotate=(sector*numOfItemsToMove);

		rotated=rotated+rotate;

		addTransforms(duration);

		$("#carouseal_carousel").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend',function() {

			//console.log('rotation finished in swipe');
			setActiveItem();
			
			panlock = false;

			
		});

	}

	function addTransforms(duration){

		// console.log('adding transforms');

		$("#carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+(rotated)+"deg)",
			"-webkit-transition":"all "+duration+"ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+(rotated)+"deg)",
			"transition":"all "+duration+"ms ease-in-out"
		});
	}

	function suspendAutoRotate(){

		//console.log('suspendAutoRotate');

		if (typeof autoRotatingCarousel!=="undefined") {
			clearInterval(autoRotatingCarousel);

			if (typeof waitingForIdleUser!=="undefined") {
				clearInterval(waitingForIdleUser);
			}

			autoRotateCarousel();
		}
		

		carouSeal.element.trigger('autoRotateStop');
	
	}

	function autoRotateCarousel(){

		//Wait = time to wait before autorotating (if no activity from user after this time)
		//autorotatespeed = Rotation autorotatespeed in milliseconds
		//Onoff start/stop the listener
		if (autorotateonoff=="on") { 
			idleTime = 0;
			autoRotateinprogress=false;
		
			waitingForIdleUser = setInterval(function(){
				idleTime = idleTime+1000;
			
				if (idleTime>=idleuserwait) {
					//console.log('user is idle',idleuserwait);
					
					if (!autoRotateinprogress) {
						
						autoRotatingCarousel = setInterval(function(){
							
							//console.log('autoroating carousel');
							rotateCarousel(null,autorotatespeed,"next");
							
						},autorotatespeed*3);

						autoRotateinprogress=true;
						clearInterval(waitingForIdleUser);
						
						carouSeal.element.trigger('autoRotateStart');
					}
				}
			},1000);
		}
		else if (onoff=="off") {
			idleTime = 0;
			if (waitingForIdleUser!==undefined) {
				clearInterval(waitingForIdleUser);
			}
			if (autoRotatingCarousel!==undefined) {
				clearInterval(autoRotatingCarousel);
			}
		}
	}

	//Used by rotateTo from user added left/right-buttons, keybinds etc.
	function rotateCarousel(id,duration,nextprev) {

		console.log("rotateCarousel",id);

		if (duration===undefined) duration=0;

		//Next/prev
		if (id===null && nextprev!==undefined) {
	
			if (nextprev=="next") {
				//At end
				if (activeitem==carousellength-1) rotateCarousel(items.imgid[0],rotatefast);
				//Normal
				else rotateCarousel(items.imgid[(activeitem+1)],rotatefast);
				return false;
			}

			if (nextprev=="prev"){

				if (activeitem==0) rotateCarousel(items.imgid[(carousellength-1)],rotatefast);
				//Normal
				else rotateCarousel(items.imgid[(activeitem-1)],rotatefast);

				return false;
			}
		}


		//RotateTo
		else {

			var item = getItemFromId(id);

			rotate=shortestRotation(item);
		}
		
		rotated = rotated + rotate;

		//Need timeout zero here because JAVASCRIPT REASONS
		
		setTimeout(function(){
		
			if (duration){

				addTransforms(duration);


				$("#carouseal_carousel").one('transitionend',function(e) {
					
					//console.log('rotation finished in rotate with duration');
				
					setActiveItem();
				
				});

			}
			else {

				addTransforms(0);
				setActiveItem();

				//console.log('rotation finished in rotate with NO duration');
			}	
		});
		////
	}

	function createRow($myCarousel,$imgs,initid){


		console.log('createRow',$imgs.length);

		carouselwidth = $myCarousel.width();
		carouselheight = $myCarousel.height();
		carousellength = $imgs.length;

		activeitem=0;

		//Empty element
		$myCarousel.empty();

		//Add carousel structure to element
		$myCarousel.append('<div class="carouseal_container"><div id="carouseal_row" class="carouseal_row carouseal_flex_parent"></div></div>');

		items = {};
		items.imgid = [];

		//Add images back to div with new structure
		$imgs.each(function(i){
			
			$img = $(this);
			
			$myCarousel.find(".carouseal_row").append('<div class="carouseal_row_element carouseal_flex_child"></div>');

			//Add images
			$img.addClass("carouseal_image");
			$(".carouseal_row_element").eq(i).append($img);

			//If images have ids add them to carousel_element item div (the parent of the image)
			$(".carouseal_row_element").eq(i).attr('id',$img.attr("id"));
			items.imgid.push($img.attr("id"));
	
			var mc = new Hammer($img[0],{preventDefault: true});

			mc.on('tap',function(ev){

				//To prevent misfiring, check that the tap is the first
				if (ev.tapCount==1) {
					
					setActiveItem(ev.target.id);
				}
			});	

		});

		if (initid !==undefined) activeitem=getItemFromId(initid);
		
		$(".carouseal_row_element img").eq(activeitem).addClass("carouseal_selected_image");


	}
	
	function createCarousel($myCarousel,$imgs,initid) {

		console.log('createCarousel');
	
	
		resolutionfactor = 1920/$(window).width();
		
		panlock = false;
		waitforpan = false;
		
		carouselwidth = $myCarousel.width();
		carouselheight = $myCarousel.height();
		carouselmidpoint = round($myCarousel.position().left+(carouselwidth/2),1);
		widthfactor = 1900/carouselwidth;
		heightfactor = 450/carouselheight;

		rotating=false;
		rotated=0;

		activeitem=0;
		//How many pixels it takes to swipe one cover at "normal" speed
		sensitivity= 150*resolutionfactor;
		rotateslow = 600;
		rotatefast= 400;
		itemwidth = round($myCarousel.height()/1.4,2);
		carousellength = $imgs.length;
		sector = 360/carousellength;
		radius = itemwidth/2/degTan(sector/2);
		perspective = (18600/carousellength)/widthfactor;

		items = {};
		items.imgid = [];

		//Empty element
		$myCarousel.empty();

		//Add carousel structure to element
		$myCarousel.append('<div class="carouseal_container"><div id="hammer_overlay"></div><div id="carouseal_carousel" class="carouseal_carousel"></div></div>');
		
		//Add images back to div with new structure
		var rotate = 0;
		$imgs.each(function(i){
			
			$img = $(this);
			
			//Add transforms to elements, 

			$myCarousel.find(".carouseal_carousel").append('<div class="carouseal_element" style="width:'+itemwidth+'px; transform: rotateY('+rotate+'deg) translateZ('+radius+'px); -webkit-transform: rotateY('+rotate+'deg) translateZ('+radius+'px);"></div>');
	
			//Add images
			$img.addClass("carouseal_image");
			$(".carouseal_element").eq(i).append($img);

			//If images have ids add them to carousel_element item div (the parent of the image)
			$(".carouseal_element").eq(i).attr('id',$img.attr("id"));
			items.imgid.push($img.attr("id"));


			//This applies to images that are too wide (wider than itemwidth)
			$img.one("load", function() {
			 if ($(this).width()>itemwidth-10) {
				 var oldheight = $(this).height();
				 var oldwidth = $(this).height();
				 var newwidth = itemwidth-20;
				 var newheight = oldheight/(oldwidth/newwidth);
			
				$(this).css({
					"width":newwidth,
					"height":newheight
				});
			 }
			});
				
			//Debug
			//$(".carouseal_element").eq(i).prepend('<div class="debug">'+i+'<br>'+$img.attr("id")+'</div>');

			rotate = rotate + sector;
		});

		//Add transforms to carousel
		$(".carouseal_carousel").css ({
			"-webkit-transform":"translateZ("+(-radius)+"px)",
			"transform":"translateZ("+(-radius)+"px)",
			"width":itemwidth
		});

		//Add perspective to carouseal_container
		$(".carouseal_container").css ({
			"-webkit-perspective":perspective,
			"perspective": perspective
		});
		
	
		
		//DEBUG PREV/NEXT
		/*
		
		Escape/Enter to move

		$(document).keyup(function(e) {
			switch(e.which) {
				case 13: // left
					carouSeal.rotatePrev();
				break;

				case 27: // right
					carouSeal.rotateNext();;
				break;
			}
			e.preventDefault();
		});
		*/
		
		//////////////////////////////////	
	
		//If initid is defined spin carousel to that item
		if (initid!==undefined) {
			
			console.log('Rotating unpon init to',initid);
			
			rotateCarousel(initid);
		}
		else {
		
			setActiveItem();
		}
	
		$(window).resize(function () {
			waitForFinalEvent(function(){

				var item = activeitem;
				activeitem = 0;

				carouSeal.initCarousel(items.imgid[item]);
	
			}, 300, "blowfish");
		});
		
		
		carousealHammer();
	}

	function carousealHammer(){
		//Init hammer.js
		// console.log('Hammer time!');

		var mc = new Hammer($('#hammer_overlay')[0],{preventDefault: true});

		//Register hammer.js events

		//This is to let swipe be prioritized to pan
		mc.on('press',function(ev){
			suspendAutoRotate();
			waitforswipe=true; setTimeout(function(){ waitforswipe = false;},200);
			//console.log("waitforswipe",waitforswipe);
		});
		//

		mc.get('press').set({ time: 1});
		
		mc.on('swiperight swipeleft', function(ev) {
			suspendAutoRotate();
			//console.log("swipe waitforpan",waitforpan);
			
			if (!waitforpan) {
				//Lock so pan can't be fired before swipe is finished
				panlock = true;
				swipeCarousel(ev.deltaX,rotateslow,ev.velocityX*-1);
			}
		});
	
		mc.on('panleft panright',function(ev) {
			suspendAutoRotate();
			//console.log("pan waitforswipe",waitforswipe);
			if (!panlock && !waitforswipe) {
				waitforpan=true; 
				panCarousel(ev.center.x,(ev.velocityX*-1));
			}
		});
		
		mc.on('panend',function(ev) {
			//console.log('panend panlock',panlock);
			//A little pause so a pan doesn't accidentally fire a swipe
			setTimeout(function(){ waitforpan = false;},100);

			if (!panlock) {
			
				setActiveItem();
				adjustItems(100);
			}
		});
	}

	var obj = {};
	
	obj.rotateNext = function() {
		if (carousellength>mincarousellength) rotateCarousel(null,rotatefast,"next");
	};

	obj.rotatePrev = function() {
		if (carousellength>mincarousellength) rotateCarousel(null,rotatefast,"prev");
	};

	obj.rotateTo = function(id) {
		if (carousellength>mincarousellength) rotateCarousel(id,rotatefast);
	};

	obj.autoRotate = function(onoff,wait,speed) {

		if (carousellength>mincarousellength) {

			//Default on
			if (onoff===undefined) autorotateonoff="on";
			else if (onoff===null) autorotateonoff="on";
			else if (!onoff) autorotateonoff="on";
			else autorotateonoff = onoff;

			//Default wait 2 mins
			if (wait==undefined) idleuserwait=120000;
			else if (!wait) idleuserwait==120000;
			else idleuserwait=wait;
			
			//Default speed = rotateslow
			if (speed==undefined) autorotatespeed=rotateslow;
			else if (!wait) autorotatespeed==rotateslow;
			else autorotatespeed=wait;

			autoRotateCarousel();

		}
	
	};
	
	obj.getActiveitem = function() {
		return items.imgid[activeitem];
	};

	obj.initCarousel = function(initid) {

		$(window).mousemove(function(e){
			suspendAutoRotate();
		});

		$(window).keydown(function(e){
			suspendAutoRotate();
		});

		mincarousellength = 4;
	
		// traverse all nodes
		carouSeal.element.each(function() {

			//Fetch element to be honked
			$myCarousel = $(this);

			//Find all images in element
			var $imgs = $myCarousel.find("img");

			if (!$imgs.length) {
				// console.log('No images in element!');
				return this;
			}

			//Create carouseal if there are more than four images
			if ($imgs.length>mincarousellength) createCarousel($myCarousel,$imgs,initid);
			
			//Else make static row of 2-d images
			else createRow($myCarousel,$imgs,initid);

			//createCarousel($myCarousel,$imgs,initid);
		});
			
		carouSeal.element.trigger('carouselDone');

	};
	
	return obj;

})();

//Avoid resize loop madness with custom function (thanks stackoverflow)
var waitForFinalEvent = (function () {
  var timers = {};
  return function (callback, ms, uniqueId) {
    if (!uniqueId) {
      uniqueId = "Don't call this twice without a uniqueId";
    }
    if (timers[uniqueId]) {
      clearTimeout (timers[uniqueId]);
    }
    timers[uniqueId] = setTimeout(callback, ms);
  };
})();
