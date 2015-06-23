var myElement = document.getElementById('carousel');
var mc = new Hammer(myElement);
mc.on('panleft panright', function(ev) {
	console.log(ev);
});