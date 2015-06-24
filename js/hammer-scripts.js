// Just to check if we load
console.log(42);

var hammerOverlay = document.getElementById('hammerOverlay');
var mc = new Hammer(hammerOverlay);
mc.on('swipeleft', function(ev) {
	console.log('swipeleft');
	carouselObject.rotate(-1);
});
mc.on('swiperight', function(ev) {
	console.log('swiperight');
	carouselObject.rotate(1);
});