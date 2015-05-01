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
		$("#nopacebtn").addClass("buttonselect");
		$("#pacebtn").removeClass("buttonselect");
		$("#pace")[0].value="";
		$("#splithelptext").hide();
		$("input[name='paceradio'][value='nopace']").prop('checked',true);
		$("#pacehelptext").show();
	} else {
		$("#splitinput").show();
		$("#nosplitinput").show();
		$("#paceinput").hide();
		$("#nopaceinput").hide();
		$("#nexttext").hide();
		$("#ghotext").show();
		$("#nosplitbtn").addClass("buttonselect");
		$("#splitbtn").removeClass("buttonselect");
		$("#split")[0].value="";
		$("#splithelptext").show();
		$("input[name='splitradio'][value='nosplit']").prop('checked',true);
		$("#pacehelptext").hide();
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
			location.href="../running.html"+location.hash+"&pace="+$("#pace")[0].secondvalue+stopPageInfo;
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
			location.href="../running.html"+location.hash+"&pace="+$("#pace")[0].secondvalue+stopPageInfo;
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
	$("input[name='splitradio'][value='nosplit']").prop('checked',true);
});

$("#nopacebtn").on('click', function(){
	$("#nopacebtn").addClass("buttonselect");
	$("#pacebtn").removeClass("buttonselect");
	$("input[name='paceradio'][value='nopace']").prop('checked',true);
});


/**
* Spinning Wheel Widget from: Copyright (c) 2009 Matteo Spinelli, http://cubiq.org/
**/

$("#splitbtn").on('click',function(){
	$("#nosplitbtn").removeClass("buttonselect");
	$("#splitbtn").addClass("buttonselect");
	$("#nexttext").show();
	$("#ghotext").hide();
	$("input[name='splitradio'][value='split']").prop('checked',true);
	$(".container").append($("<div id='swbackmodalsplit' class='modal-backdrop fade in'></div>"));

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
	SpinningWheel.addSlot({separator: 'mi'}, 'readonly shrink');

	SpinningWheel.setDoneAction(splitDone);
	SpinningWheel.setCancelAction(splitCancel);

	SpinningWheel.open();
});

$("#swbackmodalsplit").on('click',function(){
	alert('hi');
});

function splitDone() {
	$("#swbackmodalsplit").remove();
	$("#split")[0].value = SpinningWheel.getSelectedValues().values.join().replace(/,/g, '').slice(0,-2);
	if ($("#split")[0].value == 0){
		$("#nosplitbtn").trigger('click');
		$("#split")[0].value = "";
	}
	//$("#forwardbtn").focus();
}

function splitCancel() {
	$("#swbackmodalsplit").remove();
	$("#nosplitbtn").trigger('click');
}

$("#pacebtn").on('click',function(){
	$("#nopacebtn").removeClass("buttonselect");
	$("#pacebtn").addClass("buttonselect");
	$("input[name='paceradio'][value='pace']").prop('checked',true);
	$(".container").append($("<div id='swbackmodalpace' class='modal-backdrop fade in'></div>"));

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
	SpinningWheel.addSlot({separator: 'min'}, 'readonly shrink');

	SpinningWheel.setDoneAction(paceDone);
	SpinningWheel.setCancelAction(paceCancel);
	
	SpinningWheel.open();
	
});

function paceDone(){
	$("#swbackmodalpace").remove();
	$("#pace")[0].value = SpinningWheel.getSelectedValues().values.join().replace(/,/g, '').slice(0,-3);
	$("#pace")[0].secondvalue = SpinningWheel.getSelectedValues().values[0]*60 + Number(SpinningWheel.getSelectedValues().values[2]);
	if($("#pace")[0].secondvalue == 0){
		$("#nopacebtn").trigger('click');
		$("#pace")[0].value = "";
	}
	//$("#forwardbtn").focus();
}

function paceCancel(){
	$("#swbackmodalpace").remove();
	$("#nopacebtn").trigger('click');
}

$("#backbtn").css("height", $(window).height()/12);
$("#forwardbtn").css("height", $(window).height()/12);
//$(":button").css("height", $(window).height()/12);

//var offset = $("#backbtn").offset().left;
//$("#backbtn").css("bottom", offset);
//$("#forwardbtn").css("bottom", offset);
//$("#forwardbtn").css("right", offset);

});