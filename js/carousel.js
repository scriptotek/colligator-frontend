/*
TO DO: Convert this into a javascript module.
*/

function makeCarousel(){
    rotateBlocked = false;

    carouselRotatedDeg = 0;
    carouselIdCurrent = 1;

    carouselWidth = Math.round($("#carouselcontainer").height()/1.3);

    rotateTimestamp = Date.now();

    $("#carousel").empty();

    $.getJSON("http://folk.uio.no/kyrretl/bibl/leap/kart/server.php?command=carousel&coll="+currentColl, function(data) {

            numCov = Object.keys(data.isbn).length;

            rotateDeg = 360/numCov;

            rotateDeg = rotateDeg.toFixed(2);
            tranZ = Math.round(carouselWidth/2/degTan(rotateDeg/2));

            $("#carousel").css ({
                    "-webkit-transform":"translateZ("+(-tranZ)+"px)",
                    "transform":"translateZ("+(-tranZ)+"px)",
                    "width":carouselWidth,
            });

            $.each(data.isbn, function( key, val ) {

                    $("#carousel").append('<div id="cover_'+(key+1)+'" class="carouselelement" style="z-index:'+zIndexCalc(key*rotateDeg)+'; opacity:'+opCalc(key*rotateDeg)+'; width:'+carouselWidth+'px; transform: rotateY('+(key*rotateDeg)+'deg) translateZ('+tranZ+'px); -webkit-transform: rotateY('+(key*rotateDeg)+'deg) translateZ('+tranZ+'px);"><img height="100%" src="http://folk.uio.no/kyrretl/bibl/leap/kart/covers/'+currentColl+'/'+val+'.png"></div>\n');

                    // console.log(key+1,zIndexCalc(key*rotateDeg),opCalc(key*rotateDeg));
            });

    });

}

// Convert to degrees
function degTan(deg){
    return Math.tan(deg*Math.PI/180);
}
function degCos(deg){
    return Math.cos(deg*Math.PI/180);
}
function degSin(deg){
    return Math.sin(deg*Math.PI/180);
}

function shiftPropertiesOnCovers(leftright){

    var i, inherit, newopacity, newzindex;

    //left
    if (leftright==-1) {

            for (i=numCov; i>=2; i--) {

                    inherit = i-1;

                    newopacity = $("#cover_"+inherit).css("opacity");
                    newzindex = $("#cover_"+inherit).css("z-index");

                    $("#cover_"+i).animate({
                            "opacity":newopacity,
                            "z-index":newzindex
                    },rotationDuration-50);
            }

            //Gi cover 1 sluttcoverets css
            $("#cover_1").animate({
                    "opacity":$("#cover_"+numCov).css("opacity"),
                    "z-index":$("#cover_"+numCov).css("z-index")
            },rotationDuration-50);

    }

    //right
    if (leftright==1) {

            for (i=1; i<numCov; i++) {

                    inherit = i+1;

                    newopacity = $("#cover_"+inherit).css("opacity");
                    newzindex = $("#cover_"+inherit).css("z-index");

                    $("#cover_"+i).animate({
                            "opacity":newopacity,
                            "z-index":newzindex
                    },rotationDuration-50);

            }
            //Gi sluttcoveret første covers css
            $("#cover_"+numCov).animate({
                    "opacity":$("#cover_1").css("opacity"),
                    "z-index":$("#cover_1").css("z-index")
            },rotationDuration-50);

    }
    return $.Deferred().resolve();
}

function rotateCarousel(leftright) {

    //left = -1 right = 1
    if (rotateBlocked) return false;

    rotateBlocked = true;

    $("#carousel").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd',function() {
        setTimeout(function(){
                rotateBlocked = false;
        }, waitUntilNewRotatePossible);
    });


    //Flytter opacityen fra foregående element
    shiftPropertiesOnCovers(leftright).promise().done(function(){

        carouselRotatedDeg = carouselRotatedDeg + (rotateDeg*leftright);
        carouselIdCurrent = carouselIdCurrent - leftright;

        if (carouselIdCurrent<1)carouselIdCurrent=numCov;
        if (carouselIdCurrent>numCov)carouselIdCurrent=1;

        $("#carousel").css({
            "-webkit-transform":"translateZ("+(-tranZ)+"px) rotateY("+carouselRotatedDeg+"deg)",
            "-webkit-transition":"all "+rotationDuration+"ms ease-in-out",
            "transform":"translateZ("+(-tranZ)+"px) rotateY("+carouselRotatedDeg+"deg)",
            "transition":"all "+rotationDuration+"ms ease-in-out"
        });

    });
}

function zIndexCalc(deg) {
    var cos = degCos(deg);

    if (cos>0.2) zindex = 2;
    else zindex = 1;

    return zindex;
}

function opCalc(deg){
    var cos = degCos(deg);
    //Math.pow(x,1/2.5) gjør at det ikke blir for fort usynlig
    var opacfac = Math.pow(1-Math.abs(cos),1/2.5);

    if (cos>=0) opacity = 1;
    else opacity = parseFloat(parseFloat(opacfac).toFixed(2));

    if (opacity<0.2) opacity = 0.2;

    return opacity;
}

$(window).load(function() {
    $("#navigateleftarea").on( "click", function() {
            rotateCarousel(-1);
    });

    $("#navigaterightarea").on( "click", function() {
            rotateCarousel(1);
    });

    // currentColl="biologi";  //Liten
    currentColl="astrofysikk"; //Mellomstor
    // currentColl="boksamling";       //Stor

    rotationDuration=600;
    waitUntilNewRotatePossible=(rotationDuration/5);

    makeCarousel();
});

$(window).resize(function(){location.reload();});