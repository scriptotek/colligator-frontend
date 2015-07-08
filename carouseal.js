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

	function setActiveItem(){
		
		var deg= getRotation($("#carouseal_carousel"));
		if (deg > 0) deg = Math.abs(deg-360); 
		
		activeitem = Math.abs(Math.round(deg/sector));
		
		//console.log("setting active item",activeitem);

	//	console.log("HERRR:::",items.imgid[activeitem]);
	
		carouSeal.element.trigger('listenForActiveItem', items.imgid[activeitem]);
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
		var exp = 0.8;
		var projectionfactor = (Math.pow(panwidth,exp)-Math.pow(Math.abs(xpos-panwidth),exp))/Math.pow(panwidth,exp);
		var speedfactor= 0.34;

		var rotate = speedfactor*velocity*projectionfactor;
	

		//console.log(rotated,"+",rotate,"==",rotated+rotate);

		rotated = rotated + rotate;
		
		addTransforms(0);
			
	}

	//Make sure that any rotation of the carousel from point a to b follows least degree (to rotate in the right direction)
	function shortestRotation(item){

		var leftdistance = activeitem+(carousellength-item);
		var rightdistance = activeitem-item;

		//console.log(activeitem,item,leftdistance,rightdistance);

		if (Math.abs(leftdistance)<Math.abs(rightdistance)) {

			//console.log("LEFT",leftdistance,leftdistance*sector);

			var rotate = leftdistance*sector; 

			if (rotate<-180) rotate = rotate +360;
		}
		else {
			//console.log("RIGHT",rightdistance,rightdistance*sector);

			var rotate = rightdistance*sector; 
			if (rotate>180) rotate = rotate -360;
		}

		return rotate;

	}

	function swipeCarousel(x,duration){

		//console.log('swipe',x,duration);

		//Swipe		
		//Sensitivity is how many pixels it takes to swipe one image
		if (Math.abs(x)<sensitivity && x<0) x=-sensitivity;
		else if (Math.abs(x)<sensitivity && x>0) x=sensitivity;

		var numOfCoversToMove = Math.round(x/sensitivity);

		rotate=(sector*numOfCoversToMove);

		rotated=rotated+rotate;

		addTransforms(duration);

		$("#carouseal_carousel").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend',function() {

			//console.log('rotation finished in swipe');
			
			setActiveItem();
			
			panlock = false;

			
		});

	}

	function addTransforms(duration){

		//console.log('adding transforms');

		$("#carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+(rotated)+"deg)",
			"-webkit-transition":"all "+duration+"ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+(rotated)+"deg)",
			"transition":"all "+duration+"ms ease-in-out"
		});
	}

	//Used by rotateTo from user added left/right-buttons, keybinds etc.
	function rotateCarousel(id,duration,nextprev) {

		console.log(id,nextprev);

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

			//console.log("rotateCarousel",id);

			$.each(items.imgid, function(key, val) {

				if (val == id) {
					item = key;
					return false;
				}	
			});

			//console.log("key from id",item);

			rotate=shortestRotation(item);
		}
		
		rotated = rotated + rotate;

		//Need timeout zero here because JAVASCRIPT REASONS
		setTimeout(function(){

			if (duration){

				addTransforms(duration);

				$("#carouseal_carousel").one('transitionend webkitTransitionEnd oTransitionEnd otransitionend',function() {

					//console.log('rotation finished in rotate');
					
					setActiveItem();
				
				});

			}
			else {

				addTransforms(0);
				setActiveItem();
			}
		});
		////
	}

	function createCarousel($myCarousel,$imgs,initid) {

		console.log('Carouseal honking!');
		
		panlock = false;
		waitforpan = false;
		screenwidth = $(window).width();
		resolutionfactor = 1920/screenwidth;

		carouselwidth = $myCarousel.width();
		carouselheight = $myCarousel.height();
		carouselmidpoint = round($myCarousel.position().left+($myCarousel.width()/2),1);
		
		rotating=false;
		rotated=0;

		activeitem=0;
		if (initid !==undefined) activeitem=initid;
		sensitivity= 350*(screenwidth/1920);
		rotateslow = 600;
		rotatefast= 400;
		itemwidth = round($myCarousel.height()/1.3,2);
		carousellength = $imgs.length;
		sector = 360/carousellength;
		radius = itemwidth/2/degTan(sector/2);
		perspective = 14000/carousellength/resolutionfactor;

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
			$(".carouseal_element").eq(i).prepend('<div class="debug">'+i+'<br>'+$img.attr("id")+'</div>');

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
		
		//Register hammer.js events
		// console.log('Hammer time!');

		var hammer_options = {
		  preventDefault: true
		};

		var hammerOverlay = document.getElementById('hammer_overlay');
		var mc = new Hammer(hammerOverlay,hammer_options);
		
		//This is to let swipe be prioritized to pan
		mc.on('press',function(ev){
			waitforswipe=true; setTimeout(function(){ waitforswipe = false;},200);
			//console.log("waitforswipe",waitforswipe);
		});
		//

		mc.get('press').set({ time: 1});
		
		mc.on('swiperight swipeleft', function(ev) {
			
			//console.log("swipe waitforpan",waitforpan);
			
			
			if (!waitforpan) {
				//Lock so pan can't be fired before swipe is finished
				panlock = true;
				swipeCarousel(ev.deltaX,rotateslow);
			}
		});
	
		mc.on('panleft panright',function(ev) {
			
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
			
		//If initid is defined spin carousel to that item
		if (initid!==undefined) {
			console.log('Rotating unpon init to',items.imgid[initid]);
			rotateCarousel(items.imgid[initid]);
		}
		/*DEBUG PREV/NEXT
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
	
		$(window).resize(function () {
			waitForFinalEvent(function(){
				carouSeal.initCarousel(activeitem);
	
			}, 300, "blowfish");
		});
	}


	//This function is for the images that are to wide for the carousel
	function resizeWideImages(){
	

	}

	function createSlider(){




	}


	var obj = {};

	obj.rotateNext = function(id) {
		console.log('next');
		rotateCarousel(null,rotatefast,"next");
	};


	obj.rotatePrev = function(id) {
		rotateCarousel(null,rotatefast,"prev");
		console.log('prev');
	};

	obj.rotateTo = function(id) {
		rotateCarousel(id,rotatefast);
	};


	obj.getActiveitem = function() {

		
		return items.imgid[activeitem];
		
	};

	obj.initCarousel = function(initid) {
	
		// traverse all nodes
		carouSeal.element.each(function() {

			//Fetch element to be honked
			$myCarousel = $(this);

			//Find all images in element
			var $imgs = $myCarousel.find("img");

			if (!$imgs.length) {
				console.log('No images in element!');
				return this;
			}

			//Create carouseal if there are more than four images
			//if ($imgs.length>4) createCarousel($myCarousel,$imgs);

			//Else make static row of 2-d images
			//else createSlider($myCarousel,$imgs);

			createCarousel($myCarousel,$imgs,initid);
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
