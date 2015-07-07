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

		console.log(matrix);

		var values = matrix.split('(')[1].split(')')[0].split(',');
		
		var angle = Math.atan2(values[8], values[0]) * (180/Math.PI);

		while (angle < 0) angle +=360;

		return angle;

	}


	//Adjust covers so that front cover has excactly zero degrees and set activeitem
	function adjustItems(){
		var rotation = getRotation($("#carouseal_carousel"));
		if (rotation > 0) rotation = Math.abs(rotation-360); 
		
		activeitem = Math.round(rotation/sector);

		setTimeout(function(){
			carouSeal.element.trigger('listenForActiveItem', items.imgid[activeitem]);
		},rotatetime/4);

		var rotate = rotation-(activeitem*sector);
		
		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"-webkit-transition":"all 100ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"transition":"all 100ms ease-in-out"
		});
	}

	function panCarousel(xpos,velocity){
		
		var panwidth = carouselmidpoint;
		var exp = 0.8;
		var projectionfactor = (Math.pow(panwidth,exp)-Math.pow(Math.abs(xpos-panwidth),exp))/Math.pow(panwidth,exp);
		var speedfactor= 0.34;

		var rotate = speedfactor*velocity*projectionfactor;


		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"-webkit-transition":"all 0ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"transition":"all 0ms ease-in-out"
		});
			
	}

	//Make sure that any rotation of the carousel from point a to b follows least degree (to rotate in the right direction)
	function shortestRotation(id){
		
		var rotate = 0;
		var destdeg = id*sector;

		var leftdeg = destdeg-360; 
		var rightdeg = destdeg;

		//Find shortest absolute distance 
		if (Math.abs(leftdeg)<Math.abs(rightdeg)) rotate = leftdeg;
		else rotate = rightdeg;
			
		console.log("shortestRotation",id,destdeg,leftdeg,rightdeg,rotate);
		
		return rotate*(-1);
	}

	function rotateCarousel(x,id,zerotime) {
		rotating=true;

		console.log("rotateCarousel");

		var rotate = 0;
		var rdur = 200;

		if (zerotime !==undefined) rdur = 0;
	
		//Script-based rotation, not from gestures
		if (id!==undefined) {

			console.log("::",id);
			$.each(items.imgid, function(key, val) {

				if (val == id) {
					newrotationkey = key;
					return false;
				}
			});

			console.log("newrotationkey",newrotationkey);

			rotate=shortestRotation(newrotationkey);

			var checkRotationDone = setInterval(function(){

				if (!rotating){
					adjustItems();
					clearInterval(checkRotationDone);
					//console.log(activeitem);
				}

			},10);
				
		}

		else {
			
			//Sensitivity is how many pixels it takes to swipe one image
			if (Math.abs(x)<sensitivity && x<0) x=-sensitivity;
			else if (Math.abs(x)<sensitivity && x>0) x=sensitivity;

			var numOfCoversToMove = Math.round(x/sensitivity);

			rdur=rotatetime;

			rotate=(sector*numOfCoversToMove);
		}

		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"-webkit-transition":"all "+rdur+"ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+(getRotation($("#carouseal_carousel"))+rotate)+"deg)",
			"transition":"all "+rdur+"ms ease-in-out"
		});

		setTimeout(function(){
			rotating=false;	
		},rdur);

	}

	function createCarousel($myCarousel,$imgs,initid) {

		console.log('Carouseal honking!');
		
		lock = false;
		screenwidth = $(window).width();
		resolutionfactor = 1920/screenwidth;

		carouselwidth = $myCarousel.width();
		carouselheight = $myCarousel.height();
		carouselmidpoint = round($myCarousel.position().left+($myCarousel.width()/2),1);
		
		rotating=false;
		
		activeitem=0;
		if (initid !==undefined) activeitem=initid;
		sensitivity= 350*(screenwidth/1920);
		rotatetime = 600;
		itemwidth = round($myCarousel.height()/1.3,2);
		sector = 360/$imgs.length;
		radius = itemwidth/2/degTan(sector/2);
		circumference = itemwidth*$imgs.length;
		perspective = 14000/$imgs.length/resolutionfactor;

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
		
		//Needed to prevent pan from interfering with swipe
		mc.on('press',function(ev){
			waitforswipe=true; setTimeout(function(){ waitforswipe = false;},200);
			
		});

		mc.get('press').set({ time: 1});
	
		mc.on('swiperight swipeleft', function(ev) {
			//Lock so pan can't be fired
			lock = true; setTimeout(function(){lock=false;},rotatetime);
			console.log('swipe');
			rotateCarousel(ev.deltaX);
		});
	
		mc.on('panleft panright',function(ev) {
		 	//Wait for swipe to finish and don't interfere with swipe
			if (!lock && !waitforswipe) {
				console.log('pan');
				panCarousel(ev.center.x,(ev.velocityX*-1));
			}
		});
		
		mc.on('panend',function(ev) {
			
			console.log('panend');
			
			var checkRotationDone = setInterval(function(){
	
				if (!rotating){

					adjustItems();
					clearInterval(checkRotationDone);
					console.log("panend-->rotation finished");
				}

			},	10);
			
		});

		//If initid is defined spin carousel to that item
		if (initid!==undefined) {
			rotateCarousel(0,items.imgid[initid],1);
		}

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


	obj.rotateTo = function(id) {

		 rotateCarousel(0,id);
		
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

//Avoid resize loop madness with custom function (thank's stackoverflow)
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
