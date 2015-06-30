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
	

	function panCarousel(x,d){

		if (d==2) direction="left";
		if (d==4) direction="right";

		if (direction!=currentdirection) {
			currentdirection = direction;
			originX=x;
			
		}
		
		//console.log(currentdirection,x,originX,x-originX);
		
	
		var speedreducer = 0.05;
		var rotate = (180*(x-originX)*speedreducer)/(Math.PI*radius);
		
		rotated=rotated+rotate;

		//console.log(rotated,rotate);

		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",	
			"transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
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


	var obj = {};


	obj.rotateTo = function(id) {

		 rotateCarousel(0,id);
		
	};


	obj.getActiveCover = function() {

		
		return items.imgid[activecover];
		
	};

	obj.createCarousel = function() {

		console.log('Carouseal honking!');

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

			activecover=0;
			sensitivity= 200;
			rotatetime = 600;
			side = round($myCarousel.height()/1.3,2);
			sector = 360/$imgs.length;
			radius = side/2/degTan(sector/2);
			circumference = side*$imgs.length;
			perspective = 8000/$imgs.length;
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
				
				//Add transforms to elements
				$myCarousel.find(".carouseal_carousel").append('<div class="carouseal_element" style="width:'+side+'px; transform: rotateY('+rotate+'deg) translateZ('+radius+'px); -webkit-transform: rotateY('+rotate+'deg) translateZ('+radius+'px);"></div>');

				//Add images
				$img.css({"height":"100%"});
				$(".carouseal_element").eq(i).append($img);
					
				//If images have ids add them to carousel_element members
				$(".carouseal_element").eq(i).attr('id',$img.attr("id"));
				items.imgid.push($img.attr("id"));
				
				//Debug
				// $(".carouseal_element").eq(i).prepend('<div class="debug">'+i+'</div>');

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
			console.log('Hammer time!');

			//Globals to be used with hammer pan
			originX=0;
			currentdirection="";

			var hammerOverlay = document.getElementById('hammer_overlay');
			var mc = new Hammer(hammerOverlay);
			
			mc.on('swipeleft', function(ev) {
				//console.log('swipeleft');
				rotateCarousel(ev.deltaX);
			});
			mc.on('swiperight', function(ev) {
				//console.log('swiperight');
				//rotateCarousel(ev.deltaX);
			});

			// mc.on('panstart',function(ev) {
			// 	originX=0;
			// 	//console.log('panstart',originX);
			// });

			// mc.on('pan',function(ev) {
			// 	//console.log('pan',ev);
			// 	panCarousel(ev.deltaX,ev.direction);
			// });
		
			// mc.on('panend',function(ev) {
			// 	//console.log('panend');
			// 	setActiveCover();
			// 	rotateCarousel(0,items.imgid[activecover]);
			// });
			//////////////////////////////////
		});

	};
	
	return obj;

})();
