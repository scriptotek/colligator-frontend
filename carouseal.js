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
	

	function panCarousel(xpos,velocity){

		var panwidth = carouselmidpoint;
		var exp = 0.8;
		var projectionfactor = (Math.pow(panwidth,exp)-Math.pow(Math.abs(xpos-panwidth),exp))/Math.pow(panwidth,exp);
		var speedreducer = 0.34;

		var rotate = speedreducer*velocity*projectionfactor;

		rotated=rotated+rotate;

		//console.log("velocity:",velocity,"projectionfactor",projectionfactor);


		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
			"-webkit-transition":"all 0ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
			"transition":"all 0ms ease-in-out"
		});
		updateCarouselDegrees(rotate);
			
	}

	function setActiveCover(){

		//Set active cover - the cover that has degree ~ 0 (facing front)
		var mindist = Infinity; //We needed a somewhat high number, ok?
		var	mindistkey = -1;
		var currentcover = activecover;

		$.each(items.deg, function(key, val) {
			
			var x = Math.min(Math.abs(360-items.deg[key]), Math.abs(items.deg[key]-0));
		
			if (x < mindist) {
				mindist = x; 
				mindistkey = key;
			}
		});

		if (currentcover!=mindistkey) {
			activecover = mindistkey;
			carouSeal.element.trigger('listenForActivecover', items.imgid[mindistkey]);
			//console.log('Change in active cover: ' + mindistkey);
		}
	}

	function updateCarouselDegrees(rotate){
		
		$.each(items.deg, function(key, val) {
			
			items.deg[key] = (items.deg[key] + rotate) % 360;
		
		});	
		setActiveCover();
	}

	function rotateCarousel(x,id) {


		//console.log("rotateCarousel",x,id);

		var rotate = 0;
		var rdur = 200;
	
		if (id!==undefined) {

			$.each(items.imgid, function(key, val) {

				if (val == id) {
					cover = key;
					return false;
				}
			});

			//Get cover from id

			//console.log(":::::",cover);

			rotate=-items.deg[cover];
			//console.log("XXXXXX",cover,-items.deg[cover]);
		}


		else {
			//Sensitivity is how many pixels it takes to move one image
			if (Math.abs(x)<sensitivity && x<0) x=-sensitivity;
			else if (Math.abs(x)<sensitivity && x>0) x=sensitivity;

			var numOfCoversToMove = Math.round(x/sensitivity);

			rdur=rotatetime;

			rotate=(sector*numOfCoversToMove);
		}

		rotated=rotated+rotate;

		// console.log(numOfCoversToMove,rotate,rotated);

		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
			"-webkit-transition":"all "+rdur+"ms ease-in-out",
			"transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
			"transition":"all "+rdur+"ms ease-in-out"
		});

		updateCarouselDegrees(rotate);

	}

	function createCarousel($myCarousel,$imgs) {

		console.log('Carouseal honking!');
		
		lock = false;
		screenwidth = $(window).width();
		screenmid = round(screenwidth/2,1);
		resolutionfactor = 1920/screenwidth;

		carouselwidth = $myCarousel.width();
		carouselmidpoint = round($myCarousel.position().left+($myCarousel.width()/2),1);

		activecover=0;
		sensitivity= 300*(screenwidth/1920);
		rotatetime = 600;
		side = round($myCarousel.height()/1.3,2);
		sector = 360/$imgs.length;
		radius = side/2/degTan(sector/2);
		circumference = side*$imgs.length;
		perspective = 14000/$imgs.length/resolutionfactor;
		rotated = 0;

		items = {};
		items.deg = [];
		items.imgid = [];

		//Empty element
		$myCarousel.empty();

		//Add carousel structure to element
		$myCarousel.append('<div class="carouseal_container"><div id="hammer_overlay"></div><div class="carouseal_carousel"></div></div>');
		
		//Add images back to div with new structure
		var rotate = 0;
		$imgs.each(function(i){

			items.deg.push(rotate);
			
			$img = $(this);
			
			//Add transforms to elements, 

			$myCarousel.find(".carouseal_carousel").append('<div class="carouseal_element" style="width:'+side+'px; transform: rotateY('+rotate+'deg) translateZ('+radius+'px); -webkit-transform: rotateY('+rotate+'deg) translateZ('+radius+'px);"></div>');
			
	
			//Add images
			$img.css({"height":"100%"});
			$(".carouseal_element").eq(i).append($img);
				
			//If images have ids add them to carousel_element members
			$(".carouseal_element").eq(i).attr('id',$img.attr("id"));
			items.imgid.push($img.attr("id"));
			
			//Debug
			$(".carouseal_element").eq(i).prepend('<div class="debug">'+i+'</div>');

			rotate = rotate + sector;
		});

		//Add transforms to carousel
		$(".carouseal_carousel").css ({
			"-webkit-transform":"translateZ("+(-radius)+"px)",
			"transform":"translateZ("+(-radius)+"px)",
			"width":side
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
			
			if (!lock && !waitforswipe) {
				console.log('panend');
		 		setActiveCover();
		 		rotateCarousel(0,items.imgid[activecover]);
			}
		});
		//////////////////////////////////	
				
		//Call init on resize
		$( window ).resize(function() {

			carouSeal.initCarousel(); 
	
		});
	}

	function createSlider(){




	}


	var obj = {};


	obj.rotateTo = function(id) {

		 rotateCarousel(0,id);
		
	};


	obj.getActiveCover = function() {

		
		return items.imgid[activecover];
		
	};

	obj.initCarousel = function() {

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

			createCarousel($myCarousel,$imgs)
		});
			
		carouSeal.element.trigger('carouselDone');

	};
	
	return obj;

})();
