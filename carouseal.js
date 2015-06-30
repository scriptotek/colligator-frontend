(function($) {

	function round(number,places) {
		return +(Math.round(number + "e+" + places)  + "e-" + places);
	}

	function degTan(deg){

		return Math.tan(deg*Math.PI/180);
	}

	function degCos(deg){

		return Math.cos(deg*Math.PI/180);
	}

	function findClosestCover(){
		//console.log('find closest cover');
		var smallestdistance = 360;
		var closestcover = 0;

		$.each(items.deg, function(key, val) {
			//console.log(key,val,smallestdistance);
			
			if (Math.abs(val)<smallestdistance) {
				smallestdistance = Math.abs(val);  
				closestcover = key;
			}
		});

		//console.log(":::::::::::::::::::",closestcover);
		rotateCarousel(0,closestcover);

	}

	function panCarousel(x){

		var rotate = round(x/200,2);
		
		rotated=round((rotated+rotate),2);

		//console.log(rotated,rotate);

		$(".carouseal_carousel").css({
			"-webkit-transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",	
			"transform":"translateZ("+(-radius)+"px) rotateY("+rotated+"deg)",
		});

		updateCarouselProperties(rotate);
	}


	function updateCarouselProperties(rotate){
		
		//Set active cover - the cover that has degree ~ 0 (facing front)
		var minDist = 1000,
			minDistKey = -1;
		$.each(items.deg, function(key, val) {
			items.deg[key] = (items.deg[key] + rotate) % 360;
			var x = Math.min(Math.abs(360-items.deg[key]), Math.abs(items.deg[key]-0));
			if (x < minDist) { minDist = x; minDistKey = key; }
		});

		activecover = minDistKey;
		$myCarousel.trigger('getActivecover', items.imgid[minDistKey]);
		console.log('Active cover: ' + minDistKey);
	}


	function rotateCarousel(x,id) {

		//console.log("rotateCarousel",x);

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

			// console.log(":::::",cover);

			rotate=-items.deg[cover];
			//console.log("XXXXXX",cover,-items.deg[cover]);
		}


		else {
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

		updateCarouselProperties(rotate);
	}


	// jQuery plugin definition
	$.fn.carouSeal = function(setactivecover) {

		//Detect user requested rotation to specific cover
		if (setactivecover!==undefined) {
			rotateCarousel(0,setactivecover);
			return this;
		}
		
		console.log('Carouseal honking!');
	
		// traverse all nodes
		this.each(function() {

			$myCarousel = $(this);
			//$myCarousel.addClass('carouseal_container');
			
			//Make sure element contains only images
			//Find all images in element
			var $imgs = $myCarousel.find("img");

			//Empty element
			$myCarousel.empty();

			//Add carousel structure to element
			$myCarousel.append('<div class="carouseal_container"><div id="hammer_overlay"></div><div class="carouseal_carousel"></div></div>');

			activecover=0;
			sensitivity= 200;
			rotatetime = 600;
			side = round($myCarousel.height()/1.3,2);
			sector = 360/$imgs.length;
			radius = side/2/degTan(sector/2);
			perspective = 6000/$imgs.length;
			rotated = 0;

			items = {};
			items.deg = [];
			items.imgid = [];
			
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

			var hammerOverlay = document.getElementById('hammer_overlay');
			var mc = new Hammer(hammerOverlay);
			
			mc.on('swipeleft', function(ev) {
				//console.log('swipeleft',ev);
				rotateCarousel(ev.deltaX);
			});
			mc.on('swiperight', function(ev) {
				//console.log('swiperight',ev);
				rotateCarousel(ev.deltaX);
			});

			mc.on('panstart',function(ev) {
				//console.log('panstart');
			});

			mc.on('panleft',function(ev) {
				//console.log('panleft',ev);
				//panCarousel(ev.deltaX);
			});

			mc.on('panright',function(ev) {
				//console.log('panright',ev);
				//panCarousel(ev.deltaX);
			});

			mc.on('panend',function(ev) {
				//console.log('panend');
				//findClosestCover();
			});
			//////////////////////////////////
		});

		// allow jQuery chaining
		return this;
	};

})(jQuery);
