//Javascript for scroll bar here!
var scrollT = 0;
var scrollData = null;

var cachedWidth = 0;
var cachedHeight = 0;
var currentState = "";
var stopwatch = null;
/**
 * Sets up the scroll bar and thumb.
 */
var setup = function(state){
	console.log(state);
	currentState = state;
	//Update cached dimensions.
	cachedWidth = $(window).width();
	cachedHeight = $(window).height();

	var w = cachedWidth;
	var h = cachedHeight/3;	
	var r= h/8;

	var B = drawScrollBar(w, h, r);
	setUpThumb(B,r*1.5);

/*
	$("#content").on("go", function(){
		console.log("Gho!");
	})

	$("#content").on("pause", function(){
		console.log("Hold on.");
	})

	$("#content").on("stop", function(){
		console.log("Halt!");
	})
*/


	//Add listener for resizing of scroller.
	$(window).resize(function(){
		if ($(window).width() != cachedWidth || $(window).height() != cachedHeight){
			//Only resize if the dimensions have changed between method calls.
			setup(currentState);
		}	
	});

	//Setup stopwatch
	stopwatch = new Stopwatch();
	setInterval(function(){stopwatch.update();}, 10);
	stopwatch.update();

	//Setup carousels
	var stats = getCurrentStats(0);
	setupCarousel(stats);
	setupPauseScreen(stats);

	scrollData = {pathBezier: B, thumbRadius: r*1.5};
}

/**
 * Auto resumes the stopwatch and redraws that thumb position.
 * This only occurs if the current state == "stop".
 * @return {[type]} [description]
 */
var resume = function(){
	if (currentState == "stop"){
		currentState = "go";
		stopwatch.go();
		drawThumbAtT(scrollData.pathBezier, 0, scrollData.thumbRadius, false);
	}
}
/**
 * Draws dynamic triangle
 */
var drawActiveTriangle = function(splitTime) {
	//normalize the split time according to some scale
	//console.log(splitTime);

	//set an arbitrary upper bound of 5 min - adjust later.
	normalizedSplitTime = 0;

	if (splitTime > 0) {
		normalizedSplitTime = Math.min(1, splitTime/60.0);  
	} else {
		normalizedSplitTime = Math.max(-1, splitTime/60.0);  
	}

	//console.log(normalizedSplitTime); 

	var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");

    if (normalizedSplitTime > 0) {
    	context.fillStyle="red";
    	context.beginPath();
    	context.moveTo(100,100);
    	context.lineTo(190,100 + 100*normalizedSplitTime);
    	context.lineTo(280,100);
    } else {
    	context.fillStyle="green";
    	context.beginPath();
    	context.moveTo(100,100);
    	context.lineTo(190,100 + 100*normalizedSplitTime);
    	context.lineTo(280,100);
    }
    	
    context.closePath();
    context.fill();

    //repeat for the minimalized canvas

    var canvas = document.getElementById("canvas2");
    var context = canvas.getContext("2d");

    if (normalizedSplitTime > 0) {
    	context.fillStyle="red";
    	context.beginPath();
    	context.moveTo(50,150);
    	context.lineTo(190,150 + 150*normalizedSplitTime);
    	context.lineTo(330,150);
    } else {
    	context.fillStyle="green";
    	context.beginPath();
    	context.moveTo(50,150);
    	context.lineTo(190,150 + 150*normalizedSplitTime);
    	context.lineTo(330,150);
    }
    	
    context.closePath();
    context.fill();
}

/**
 * Draws the curved track for the scroll bar.
 * This scroll bar extends across the width of the containing canvas +/- some horizontal padding.
 * @param  {[int]} width  [width of the canvases that contain the scroll bar.]
 * @param  {[int]} height [height of the canvases the contain the scroll bar.]
 * @param  {[float]} radius [radius of the curved ends of the scrollbar]
 * @return {[Bezier]}        [Bezier curve that the constrains the path of the scroll thumb]
 */
var drawScrollBar = function(width, height, radius){
	//Set up dimensions of canvases.
	var scrollBG = $("#scrollBG");
	scrollBG.attr("width",width);
	scrollBG.attr("height", height);
	var scrollFG = $("#scrollFG");
	scrollFG.attr("width",width);
	scrollFG.attr("height", height);

	var paddingX = radius*2;
	var paddingY = (height-radius)/2;
	var anchorHeight = height/4;
	var B1 = new Bezier(new Point(paddingX,paddingY), width-paddingX*2, anchorHeight);
	var canvas = document.getElementById("scrollBG");
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "#DDDDDD";
    ctx.clearRect(0,0,width, height);   
    //ctx.fillRect(0,0, scroll.width(), scroll.height());
   	//Draw curved arc.
   	ctx.beginPath();
    ctx.moveTo(B1.p1.x,B1.p1.y);
    B1.drawCurve(ctx);
    var V = new Vector(B1.p3, B1.p4);
    var C1 = B1.p4.move(V.normalized().perpendicular(), radius);
    var P2 = B1.p4.move(V.normalized().perpendicular(), radius*2);
    var angle = Math.atan2(V.y, V.x) - Math.PI/2;
    //ctx.lineTo(newP.x, newP.y);
    ctx.arc(C1.x, C1.y, radius, angle, angle+Math.PI);
    var V2 = new Vector(B1.p1, B1.p2);
    var P3 = (B1.p1).move(V2.normalized().perpendicular(), radius*2);
    var C2 = (B1.p1).move(V2.normalized().perpendicular(), radius);
    var B2 = new Bezier(P2, P3.x-P2.x, anchorHeight);
    B2.drawCurve(ctx);
    //ctx.lineTo(20, 25);
    var diff = Math.PI/2-Math.atan2(V.y, V.x);
    var angle2 = angle+2*diff;
    ctx.arc(C2.x, C2.y, radius,  angle2, angle2 + Math.PI);
    ctx.fill();
    ctx.moveTo(C2.x, C2.y);
    var B3 = new Bezier(C2, C1.x-C2.x, anchorHeight);
    //B3.drawCurve(ctx);
    ctx.stroke();
    //ctx.fill();
    return B3;
}

/**
 * Draws the scrolling thumb and adds listeners for motion tracking.
 * @param {[Bezier]} B      [Bezier curve that this thumb's motion is constrained to]
 * @param {[float]} radius [radius of thumb]
 */
var setUpThumb = function(B, radius){
	//Get canvas for BG Pixel data.
	var thumb = $("#thumb");
	var scroll = $("#scrollFG");
	var lastX = null;
	var lastY = null;
	var offsetX = 0;
	var offsetY = 0;
	var startT = 0;
	if (currentState == "stop"){
		startT = 1;
	}
	drawThumbAtT(B, startT ,radius);

	var thumbmove = function(e){
		e.preventDefault();
		var t = e;
		if (e.originalEvent.touches != null){
			t = e.originalEvent.touches[0];
		}
  		lastX = t.pageX  - scroll.offset().left;
  		lastY = t.pageY  - scroll.offset().top;
  		drawThumb(lastX - offsetX, lastY - offsetY, B, radius, true);
  	};

  	var thumbleave = function(e){
  		var t = e;
		if (e.originalEvent.touches != null){
			t = e.originalEvent.touches[0];
		}
  		lastX = t.pageX  - scroll.offset().left;
  		lastY = t.pageY  - scroll.offset().top;
  		drawThumb(lastX, lastY, B, radius, true);
  	};

  	var thumbup = function(e){
        scroll.off("mouseleave mousemove touchmove");
        $(this).off("mouseup touchend");
       	animateThumb(lastX-offsetX,lastY-offsetY,B, radius); 
        lastX = null;
		lastY = null;
  	};

  	scroll.off();
	/*scroll.mousedown(function(e){
		var data  = document.getElementById("scrollFG").getContext("2d").getImageData(0,0,$("#scrollBG").width(), $("#scrollBG").height());
		scroll.css("z-index", 2);
		var t = e;
		if (e.originalEvent.touches != null){
			t = e.touches[0];
		}
		var x = t.pageX  - scroll.offset().left;
	  	var y = t.pageY  - scroll.offset().top;
	  	var pixel = getPixel(data, x,y);
	  	if (pixel.a == 0) return;
	  	drawThumb(x, y, B, radius, true);
		scroll.mousemove(thumbmove);
		scroll.mouseleave(thumbleave);
		$(window).mouseup(thumbup);
	});*/
	
	scroll.on("touchstart", function(e){
		var data  = document.getElementById("scrollFG").getContext("2d").getImageData(0,0,$("#scrollFG").width(), $("#scrollFG").height());
		scroll.css("z-index", 2);
		var t = e.originalEvent.touches[0];
		var C = B.locationAt(scrollT);
		lastX = t.pageX  - scroll.offset().left;
	  	lastY = t.pageY  - scroll.offset().top;
	  	var pixel = getPixel(data, lastX,lastY);
	  	if (pixel.a == 0){
	  		console.log("Empty touch");
	  		return;
	  	}
	  	//Initialize offsets.
	  	offsetX = lastX - C.x;
	  	offsetY = lastY - C.y;
	  	//Set up listeners for moving and releasing the thumb.
		scroll.on("touchmove", thumbmove);
		$(window).on("touchend", thumbup);
		//Redraw the thumb in its current position with a highlight.
		drawThumb(C.x, C.y, B, radius, true);
	})
}
var drawSquare = function(x,y){
	var canvas = document.getElementById("scrollFG");
	var ctx = canvas.getContext("2d"); 
	//ctx.clearRect(0,0, scroll.width(), scroll.height());
	//ctx.beginPath();
	//ctx.arc(L.x, L.y, radius, 0, 2 * Math.PI, false);
	size = 2;
	ctx.fillStyle = 'red';
	ctx.fillRect(x-size/2,y-size/2, size, size);
}
/**
 * Gets pixel information of the foreground canvas at a specified location.
 * @param  {[Array]} pixelData [1-D array of pixel data.]
 * @param  {[int]} x         [x-coordinate of pixel location]
 * @param  {[int]} y         [y-coordinate of pixel location]
 * @return {[Pixel]}           [Pixel object corresponding to RGBA value at coordinate.]
 */
var getPixel = function(pixelData, x,y){
	var i = (Math.floor(y) * pixelData.width + Math.floor(x)) * 4;
	var data = pixelData.data;
	return new Pixel(data[i], data[i+1], data[i+2], data[i+3]);
}

/**
 * Draws the scrolling thumb with respect to a specified location.
 * If the input coordinates do not fall along the curve, they are mapped to a location on the curve.
 * @param  {[int]} x      [description]
 * @param  {[int]} y      [description]
 * @param  {[Bezier]} B      [Bezier curve that this thumb's motion is constrained to]
 * @param  {[float]} radius [radius of thumb]
 */
var drawThumb = function(x, y, B, radius, isHighlighted){
	var t = B.getT(new Point(x,y));
	drawThumbAtT(B, t, radius, isHighlighted);
}

var drawThumbAtT = function(B, t, radius, isHighlighted){
	var L = B.locationAt(clamp(t, 0, 1));
	var scroll =  $("#scrollFG");
	var canvas = document.getElementById("scrollFG");
	var ctx = canvas.getContext("2d"); 
	ctx.clearRect(0,0, scroll.width(), scroll.height());
	ctx.beginPath();
	ctx.arc(L.x, L.y, radius, 0, 2 * Math.PI, false);
	/*ctx.fillStyle = '#6EBF4E';
	if (isHighlighted){
		ctx.fillStyle = '#AEFF8E';
	}*/
	setThumbColor(ctx, isHighlighted);
	ctx.fill();
	ctx.lineWidth = radius*.2;
	ctx.strokeStyle = '#001100';
	ctx.stroke(); 

	scrollT = t;
	drawSymbol(B, t, radius);
	createEvent(t);
}

/**
 * Sets the fill style of a canvas context based on thumb state.
 * @param {[2DContext]}  ctx           [context of a canvas]
 * @param {Boolean} isHighlighted [whether or not the thumb should be highlighted]
 */
var setThumbColor = function(ctx, isHighlighted){
	/*var r = 50 + Math.floor((t)*200);
	var g = 80 + Math.floor((1-t)*140);
	var b = 0; */

	var r = 110;
	var g = 207;
	var b = 78;
	if (currentState == "pause"){
		r = 211;
		g = 211;
		b = 20;
	}
	else if (currentState == "stop"){
		r = 230;
		g = 30;
		b = 30;
	}
	if (isHighlighted){
		r += 64;
		g += 64;
		b += 64;
	}
	ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";

}

/**
 * Draws a symbol corresponding to the current state of the thumb.
 * It is a triangle if in state "go",
 * It is two tall rectangles if in state "pause",
 * It is a square if in state "stop".
 * @param  {[type]} B      [description]
 * @param  {[type]} t      [description]
 * @param  {[type]} radius [description]
 * @return {[type]}        [description]
 */
var drawSymbol = function(B, t, radius){
	var canvas = document.getElementById("scrollFG");
	var ctx = canvas.getContext("2d");
	ctx.fillStyle = 'black';
	var L = B.locationAt(clamp(t,0,1));
	var size = radius/1.5;

	if (currentState == "go"){
		var s = Math.sqrt(Math.pow(size,2) + Math.pow(size/2, 2));
		ctx.beginPath();
		ctx.moveTo(L.x-size/2, L.y-s/2);
		ctx.lineTo(L.x-size/2, L.y+s/2);
		ctx.lineTo(L.x+size/2, L.y);
		ctx.fill();

	}
	else if(currentState == "pause"){
		//Draw pause symbol, which are two tall rectangles.
		ctx.fillRect(L.x-size/2, L.y-size/2, size*.4, size);
		ctx.fillRect(L.x-size/2+size*.6, L.y-size/2, size*.4, size);
	}
	else{
		//Else, currentEvent == "stop"
		//Draw stop symbol, which is a small square.
		ctx.fillRect(L.x-size/2, L.y-size/2, size, size);
	}

	//Now draw the text.
	var textSize = radius/1.5;
	ctx.font= textSize+"px Verdana";
	var start = B.locationAt(0).add(new Point(0, radius*1.8));
	displayText("go", ctx, "Gho", start, textSize, "#6EBF4E");
	
	var middle = B.locationAt(.5);
	middle.y = start.y;
	displayText("pause", ctx, "Pause", middle, textSize, "#C3C314");
	var end = B.locationAt(1);
	end.y = start.y;
	displayText("stop", ctx, "Stop", end, textSize, "#D61D1D");
}

var displayText = function(state, ctx, title, position, textSize, color){
	if (currentState == state) ctx.fillStyle = color;
	else ctx.fillStyle = "#DDDDDD";
	var length = textSize*.5*title.length;
	ctx.fillText(title, position.x - length/2, position.y);

}
/**
 * Animate the thumb moving towards one of the ends of the scroll bar (whichever is closer).
 * @param  {[type]} x      [description]
 * @param  {[type]} y      [description]
 * @param  {[type]} B      [description]
 * @param  {[type]} radius [description]
 * @return {[type]}        [description]
 */
var animateThumb = function(x, y, B, radius){
	var t = B.getT(new Point(x,y));
	var delta = -.02;
	if (t > .5){
		delta *= -1;
	}
	var id = setInterval(function(){
		t += delta;
		if (t <= 0 || t >= 1){
			clearInterval(id);
		}
		drawThumbAtT(B, t, radius, false);
	}, 5);
	t += delta;
	drawThumbAtT(B,t, radius, false);
}

var createEvent = function(t){
	var eventName = "go";
	var offset = .1;
	if (t > offset && t < 1-offset){
		eventName = "pause";
	}
	else if (t > 1-offset){
		eventName = "stop";
	}
	if (eventName != currentState){
		//Only dispatch the event when the state changes.
		currentState = eventName;
		//var event = new Event(currentState);
		//Dispatch the event
		//$("#content").trigger(event);
		//console.log(currentState);

		if (eventName == "go") {
			stopwatch.go();
			showGoScreen();
		}
		else if (eventName == "pause") {
			stopwatch.pause();
			showPauseScreen();
		}
		else if (eventName == "stop") {
			stopwatch.pause();
			showStopScreen();
		}
	}
	
}
/**
 * Clamps a value between a min and a max value.
 * @param  {[float]} value [value to clamp]
 * @param  {[float]} min   [min value to clamp with]
 * @param  {[float]} max   [max value to clamp with]
 * @return {[float]}       [clamped value]
 */
var clamp = function(value, min, max){
	return Math.min(Math.max(min, value), max);
}

var setupCarousel = function(stats){
	var topBreadCrumbs = []
	var bottomBreadCrumbs = []
	var carousel = $("#carousel");
	var innerCarousel = $("<div>").addClass("carousel-inner");
	//Set up full time div.
	var fullTime = $("<div><h1 id = fullTime style = 'font-size:100%'></h1></div>");
	fullTime.addClass("item active");
	//Set up split time div and inner header
	
	innerCarousel.append(fullTime)
	carousel.append(innerCarousel);
	topBreadCrumbs.push('Time'); 

	//Add split time and pacing diff info, but only if they are existent stats.
	if (stats.splitTime != null){
		var splitTime = $("<div class = item><h1 id = splitTime style = 'font-size:100%'></h1></div>");
		innerCarousel.append(splitTime);

		topBreadCrumbs.push('Split Time'); 

		//add split time to array 
	
	}
	if (stats.pacingDiff != null){
		var timeDiff = $("<div class = item><h1 id = timeDiff style = 'font-size:100%'></h1></div>");
		innerCarousel.append(timeDiff);

		topBreadCrumbs.push('Diff'); 
	}

	if (innerCarousel.find("div").length > 1){
		//Setup arrows, but only if there is more than one element in the carousel.
		var leftArrow = $("<a href='#carousel' id = 'leftControl' class='left carousel-control' data-slide='prev'>"+
            				"<span class='glyphicon glyphicon-chevron-left'></span></a>");
		var rightArrow = $("<a href='#carousel' id = 'rightControl' class='right carousel-control' data-slide='next'>"+
            				"<span class='glyphicon glyphicon-chevron-right'></span></a>");

		innerCarousel.append(leftArrow).append(rightArrow);
	}

	//Now, set up the distance carousel.
	var distanceCarousel = $("#carousel2");
	var innerCarousel2 = $("<div>").addClass("carousel-inner");
	var fullDistance = $("<div class = 'item active'><h1 id = fullDist style = 'font-size:100%'></h1></div>");
	innerCarousel2.append(fullDistance);
	distanceCarousel.append(innerCarousel2);
	bottomBreadCrumbs.push('Distance'); 

	if (stats.pacingDiff != null){
		var splitDistance = $("<div class = item><h1 id = splitDist style = 'font-size:100%'></h1></div>");
		innerCarousel2.append(splitDistance);
		bottomBreadCrumbs.push('Split Distance'); 
		var leftArrow = $("<a href='#carousel2' id = 'leftControl2' class='left carousel-control' data-slide='prev'>"+
            				"<span class='glyphicon glyphicon-chevron-left'></span></a>");
		var rightArrow = $("<a href='#carousel2' id = 'rightControl2' class='right carousel-control' data-slide='next'>"+
            				"<span class='glyphicon glyphicon-chevron-right'></span></a>");

		innerCarousel2.append(leftArrow).append(rightArrow);
	}


	//for loop to display the appropriate carousel breadcrumbs 

	//topBreadCrumbs
	topBreadString = ""; 
	for (var i = 0; i < topBreadCrumbs.length; i++) {
		topBreadString += "<span id = " + topBreadCrumbs[i] + ">" + topBreadCrumbs[i] + "</span>"

		if (topBreadCrumbs[i+1] != null) {
			topBreadString += " / "
		}
	}

	$("#topCarouselBread").html(topBreadString); 

	bottomBreadString = ""; 
	
	for (var i = 0; i < bottomBreadCrumbs.length; i++) {
		if (bottomBreadCrumbs[i] != "Split Distance") {
			bottomBreadString += "<span id = " + bottomBreadCrumbs[i] + ">" + bottomBreadCrumbs[i] + "</span>"
		} else {
			bottomBreadString += "<span id = SplitDistance>" + bottomBreadCrumbs[i] + "</span>"
		}
		
		if (bottomBreadCrumbs[i+1] != null) {
			bottomBreadString += " / "
		}
	}

	$("#bottomCarouselBread").html(bottomBreadString); 

}

var setupPauseScreen = function(stats){
	var data = [true, false, false, true, false];
	if (stats.splitTime != null){
		data[1] = true;
	}
	if (stats.pacingDiff != null){
		data[2] = true;
		data[4] = true;
	}

	//var pauseData = $("#pauseScreen");
	var pauseData = $("#pauseLabels");
	var pauseHelpData = $("#pauseHelpLabels");
	for (var i = 0; i < data.length; i++){
		if (data[i]){
			var header = $("<h3>").attr("id", "pauseLabel" + (i+1)).addClass("pauseLabel");

			//add another label within the left column 
			var helpLabel = $("<h4>").attr("id", "pauseHelpLabel" + (i+1)).addClass("pauseHelpLabel");


			//console.log(header); 
			pauseData.append(header);
			pauseHelpData.append(helpLabel);
		}
	}
	//console.log(pauseData); 
}
//===================================================================
//							Helper Classes
//===================================================================


var Point = function(x,y){
	this.x =x;
	this.y = y;

	this.move = function(V, distance){
		var dV = V.multiply(distance);
		return this.add(new Point(dV.x, dV.y));
	}

	this.multiply = function(f){
		return new Point(f*x, f*y);
	}
	this.add = function(P){
		return new Point(this.x+P.x, this.y+P.y);
	}

	this.toString = function(){
		return "Point [" + this.x + "," + this.y + "]";
	}
}

var Vector = function(p1, p2){
	this.x = p2.x-p1.x;
	this.y = p2.y-p1.y;
	this.length = Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2));

	var create = function(x,y){
		return new Vector(new Point(0,0), new Point(x,y));
	}

	this.perpendicular = function(){
		return create(-this.y,this.x);
	}

	this.normalized = function(){
		return create(this.x/this.length, this.y/this.length);
	}

	this.multiply = function(f){
		return create(this.x*f, this.y*f);
	}

	this.angle = function(V){
		return Math.acos(this.x*V.x + this.y*V.y);
	}
	this.toString = function(){
		return "Vector <" +this.x + "," +this.y +">";
	}	
}

var Bezier = function(p1, anchorWidth, anchorHeight){
	var horizontalSpacing = anchorWidth/3;
	this.p1 = new Point(p1.x, p1.y);
	this.p2 = new Point(p1.x+horizontalSpacing, p1.y - anchorHeight);
	this.p3 = new Point(p1.x+horizontalSpacing*2, p1.y - anchorHeight);
	this.p4 = new Point(p1.x+horizontalSpacing*3, p1.y);

	this.drawCurve = function(ctx){
		ctx.bezierCurveTo(this.p2.x,this.p2.y,this.p3.x,this.p3.y,this.p4.x,this.p4.y);
	}
	this.locationAt = function(t){
		T1 = this.p1.multiply(Math.pow(1-t, 3));
		T2 = this.p2.multiply(3*Math.pow(1-t,2)*t);
		T3 = this.p3.multiply(3*(1-t)*Math.pow(t,2));
		T4 = this.p4.multiply(Math.pow(t,3));
		return new Point(T1.x+T2.x+T3.x+T4.x, T1.y+T2.y+T3.y+T4.y);
	}
	this.getT = function(P){
		var length = this.p4.x-this.p1.x;
		return clamp((P.x-this.p1.x)/length, 0, 1);
	}
	this.toString = function(){
		return "Bezier: " + this.p1.toString() + ", " + this.p2.toString() + ", " + this.p3.toString() + ", " + this.p4.toString();
 	}
}

var Pixel = function(r, g, b, a){
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}


var Stopwatch  = function(){

	var startTime = new Date().getTime();
	var pauseTime = 0;
	var pause = false;
	var previousT = startTime;
	

	var zeroPad = function(n, width){
		ns = n + '';
  		return ns.length >= width ? ns : new Array(width - ns.length + 1).join("0") + ns;
	}

	this.elapsedTime = function(){
		var t = new Date().getTime();
		if (pause){
			pauseTime += t - previousT;		
		}
		previousT = t;
		return t - startTime - pauseTime;
	}

	this.pause = function(){
		pause = true;
		
	}

	this.go = function(){
		pause = false;
	}

	this.formatTimeWithMilliseconds = function(milliseconds) {
		var hsec = Math.floor(milliseconds/10);
		var sec  = Math.floor(hsec/100);
		var min = Math.floor(sec/60);

		var time = "";
		time += zeroPad(min, 2) +":" + zeroPad(sec%60, 2) + "." + zeroPad(hsec%100, 2);
		return time;
	}

	this.formatDistance = function(distance) {
		var truncated = Math.floor(distance*100)/100;
		return truncated.toFixed(2) + " mi";
	}

	this.update = function(){
		/*
		var hsec = Math.floor(this.elapsedTime()/10);
		var sec  = Math.floor(hsec/100);
		var min = Math.floor(sec/60);
		var time = "";
		time += zeroPad(min, 2) +":" + zeroPad(sec%60, 2) + "." + zeroPad(hsec%100, 2);
		*/

		var currentMilliseconds = this.elapsedTime();
		var time = this.formatTimeWithMilliseconds(currentMilliseconds);

		$("#fullTime").text(time);
		$("#pauseHelpLabel1").text("Time");
		$("#pauseLabel1").text(time);

		//var stats = getCurrentStats(sec);
		var stats = getCurrentStats(currentMilliseconds/1000);
		//var distanceStr = (stats.distance).toFixed(2) + " mi";
		var distanceStr = this.formatDistance(stats.distance);
		var splitDistStr;
		if (!stats.splitDistance) {
			splitDistStr = "none";
		}
		else {
			splitDistStr = this.formatDistance(stats.splitDistance);
			//splitDistStr = (stats.splitDistance).toFixed(2) + " mi";
		}
		var splitTimeStr;
		if (!stats.splitTime) {
			splitTimeStr = "none";
		}
		else {
			//splitTimeStr = formatTime(stats.splitTime);
			splitTimeStr = this.formatTimeWithMilliseconds(stats.splitTime*1000);
		}
		var diffStr;
		if (!stats.pacingDiff) {
			diffStr = "none";
		} else {
			//diffStr = getDifferentialGivenDiff(stats.pacingDiff);
			var symbol;
			if (stats.pacingDiff > 0) {
				symbol = "+";
			}
			else {
				symbol = "-";
			}
			diffStr = symbol + this.formatTimeWithMilliseconds(Math.abs(stats.pacingDiff)*1000);

			if (stats.pacingDiff > 0) {

				$("#timeDiff").removeClass('positive'); 
				$("#timeDiff").addClass('negative'); 

				$("#pauseLabel3").removeClass('positive'); 
				$("#pauseLabel3").addClass('negative'); 
				
			} else {
				$("#timeDiff").removeClass('negative'); 
				$("#timeDiff").addClass('positive'); 

				$("#pauseLabel3").removeClass('negative'); 
				$("#pauseLabel3").addClass('positive'); 
			}
		}

		$("#splitTime").text(splitTimeStr);
		$("#pauseHelpLabel2").text('Split Time');
		$("#pauseLabel2").text(splitTimeStr);
		//$("#pauseLabel2").innerHTML = "<span class = 'pauseHelpLabel'> Split Time: </span>" + splitTimeStr;
		$("#timeDiff").text(diffStr);
		$("#pauseHelpLabel3").text('Diff');
		$("#pauseLabel3").text(diffStr);
		$("#fullDist").text(distanceStr);
		$("#pauseHelpLabel4").text('Distance');
		$("#pauseLabel4").text(distanceStr);
		$("#splitDist").text(splitDistStr);
		$("#pauseHelpLabel5").text('Split Distance');
		$("#pauseLabel5").text(splitDistStr);


		//redraw the dynamic triangle based on the times.
		drawActiveTriangle(stats.pacingDiff);

		//console.log($("fullTime")); 

		//update the carousel breadcrumbs 
		if ($("#fullTime").parent().hasClass('active')) {
			$("#Time").addClass('toggled'); 
		} else {
			$("#Time").removeClass('toggled'); 
		}

		if ($("#splitTime").parent().hasClass('active')) {
			$("#Split").addClass('toggled'); 
		} else {
			$("#Split").removeClass('toggled'); 
		}

		if ($("#timeDiff").parent().hasClass('active')) {
			$("#Diff").addClass('toggled'); 
		} else {
			$("#Diff").removeClass('toggled'); 
		}

		if ($("#fullDist").parent().hasClass('active')) {
			$("#Distance").addClass('toggled'); 
		} else {
			$("#Distance").removeClass('toggled'); 
		}

		if ($("#splitDist").parent().hasClass('active')) {
			$("#SplitDistance").addClass('toggled'); 
		} else {
			$("#SplitDistance").removeClass('toggled'); 
		}

		//modify positive or negative splitDistance colors



	}
}