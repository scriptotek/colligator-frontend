// Just to check if we load
console.log("hammer-scripts.js loads");

// Get the element we want touch events on
var hammerOverlay = document.getElementById('hammerOverlay');
var mc = new Hammer(hammerOverlay);
// Register events
mc.on('swipeleft', function(ev) {
	console.log('swipeleft');
	rotateCarousel(-1);
});
mc.on('swiperight', function(ev) {
	console.log('swiperight');
	rotateCarousel(1);
});

mc.on('panleft panright', function(ev){
	console.log(ev);
});