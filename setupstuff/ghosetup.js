$(document).ready(function () {


$.extend({
        getHashVars : function() {
            var vars = [], hash;
            var hashes = window.location.href.slice(
                    window.location.href.indexOf('#') + 1).split('&');
            for ( var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getHashVar : function(name) {
            return $.getHashVars()[name];
        }
    });

$(window).on('hashchange', function() {
	if($.getHashVar('split') != null) {
		$("#splitinput").hide();
		$("#nosplitinput").hide();
		$("#paceinput").show();
		$("#nopaceinput").show();
		$("#nexttext").hide();
		$("#ghotext").show();
		//$("#nopacebtn").addClass("buttonselect");
		//$("#pacebtn").removeClass("buttonselect");
		$("#pace")[0].value="";
	} else {
		$("#splitinput").show();
		$("#nosplitinput").show();
		$("#paceinput").hide();
		$("#nopaceinput").hide();
		$("#nexttext").hide();
		$("#ghotext").show();
		//$("#nosplitbtn").addClass("buttonselect");
		//$("#splitbtn").removeClass("buttonselect");
		$("#split")[0].value="";
	}
	return false;
});

$(window).trigger('hashchange');

$("#backbtn").on('click', function(){
	if ($.getHashVar('split') != null){
		location.hash="";
	} 
	else {
		location.href="../index.html"
	}
});

var stopPageInfo = "&type=save&run=0";

$("#forwardbtn").on('click', function(){
	if ($.getHashVar('split') != null) {
		if ($('#pacebtn').hasClass('buttonselect')){
			location.href="../running.html"+location.hash+"&pace="+$("#pace")[0].value+stopPageInfo;
		} 
		else {
			location.href="../running.html"+location.hash+"&pace="+stopPageInfo;
		}
	}
	else {
		if ($('#splitbtn').hasClass('buttonselect')) {
			location.hash+="split="+$("#split")[0].value;
		}
		else {
			location.href="../running.html"+location.hash+"?split=&pace="+stopPageInfo;
		}
	}

/*
	if($.getHashVar('split') != null){
		if($("#pacebtn").hasClass("buttonselect")){
			location.href="../running.html"+location.hash+"&pace="+$("#pace")[0].value+stopPageInfo;
		} else {
			location.href="../running.html"+location.hash+"&pace="+stopPageInfo;
		}
	} else if($.getHashVar('dist') != null){
		if($("#splitbtn").hasClass("buttonselect")){
			location.hash+="&split="+$("#split")[0].value;
		} else {
			location.href="../running.html"+location.hash+"split=&pace="+stopPageInfo;
		}
	} else {
		if($("#distancebtn").hasClass("buttonselect")){
			location.hash+="dist="+$("#distance")[0].value;
		} else {
			location.hash+="dist=";
		}
	}
	*/
});

$("#nosplitbtn").on('click', function(){
	$("#nosplitbtn").addClass("buttonselect");
	$("#splitbtn").removeClass("buttonselect");
	$("#nexttext").hide();
	$("#ghotext").show();
});

$("#nopacebtn").on('click', function(){
	$("#nopacebtn").addClass("buttonselect");
	$("#pacebtn").removeClass("buttonselect");
});

$("#splitbtn").on('click',function(){
	$("#nosplitbtn").removeClass("buttonselect");
	$("#splitbtn").addClass("buttonselect");
	$("#nexttext").show();
	$("#ghotext").hide();

	var splitmiles = {};
	var splitdivisions = {};
	for (var k = 0; k<11; k++){
		splitmiles[k]=k;
	}
	for (var l = 0; l<100; l+=5){
		if(l<10){
		 	splitdivisions[l] = '0'+l;
		} else {
			splitdivisions[l] = l;
		}
	}
	
	SpinningWheel.addSlot(splitmiles, 'right');
	SpinningWheel.addSlot({separator: '.'}, 'readonly shrink');
	SpinningWheel.addSlot(splitdivisions, 'left');

	SpinningWheel.setDoneAction(splitDone);

	SpinningWheel.open();
});

function splitDone() {
	$("#split")[0].value = SpinningWheel.getSelectedValues().values.join().replace(/,/g, '');
	//$("#forwardbtn").focus();
}

$("#pacebtn").on('click',function(){
	$("#nopacebtn").removeClass("buttonselect");
	$("#pacebtn").addClass("buttonselect");

	var paceminutes = {};
	var paceseconds = {};
	for (var m = 0; m<16; m++){
		paceminutes[m] = m;
	}
	for (var n = 0; n<60; n++){
		if (n<10){
			paceseconds[n] = '0'+n;
		} else {
			paceseconds[n] = n;
		}
	}

	SpinningWheel.addSlot(paceminutes, 'right');
	SpinningWheel.addSlot({separator: ':'}, 'readonly shrink');
	SpinningWheel.addSlot(paceseconds, 'left');

	SpinningWheel.setDoneAction(paceDone);
	
	SpinningWheel.open();
	
});

function paceDone(){
	$("#pace")[0].value = SpinningWheel.getSelectedValues().values.join().replace(/,/g, '');
	//$("#forwardbtn").focus();
}

$("#backbtn").css("height", $(window).height()/12);
$("#forwardbtn").css("height", $(window).height()/12);
//$(":button").css("height", $(window).height()/12);

//var offset = $("#backbtn").offset().left;
//$("#backbtn").css("bottom", offset);
//$("#forwardbtn").css("bottom", offset);
//$("#forwardbtn").css("right", offset);

});