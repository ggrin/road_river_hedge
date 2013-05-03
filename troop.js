
var troops = [];
var troop_c = 0;
var finish_move;


function _troop( num, type ){
    var e = document.getElementById("building_troop_template").cloneNode(true);
    e.id = "building_troop_"+num;
    //TODO unshoen
    e.innerHTML = e.innerHTML.replace(/TILE_SIZE/g, tile_size);
    e.innerHTML = e.innerHTML.replace(/NUM/g, num);
    /*doesn't do anything eventlistener disapears*/
    e.getElementsByClassName("troop_pic")[0].onclick = function(){
        if(interface_mode == "arrows"){
	    troop(num).show_arrows();
        } else if(interface_mode == "fields"){
	    troop(num).show_destinations();
        }
    };

    return e;
}

function Troop(type) {
    this.type = type;
    this.num = troop_c++
    this.name = 'building_troop_'+this.num
    troops[this.num] = this
    
    this.div = function(){ 
	return document.getElementById(this.name)
    };
    
    this.move = function(x,y){
	var f = field(x,y);
	if(!f){
	    alert("coordinates :"+[x,y]+" are invalid, Sorry something went wrong!");
	    return false;
	}
	f.add( this.div() );

	this.x = x;
	this.y = y;

	return f;
    }
    this.show_arrows = function(value) {
	var list = this.div().getElementsByClassName("arrow")
	for(var i=0;i<list.length;i++) {
	    toggle_element(list[i], value);
	}
    }
    this.show_destinations = function(){
	var troop = this;
	var moves = possible_moves(the_player()).filter(function(m){return m[0]== troop.num} ); // TODO waste of performance to first count for all and then filter again an troop.possible_moves should exist
	this.hide_destinations();
	moves.forEach(function(m){
	    var f = field((troop.x + (m[1] * m[3])), (troop.y + m[2] * m[3]) );
	    var el = document.all.move_here_template.cloneNode(true);
	    el.className = "possible_move_marker";
	    el.id = "";
	    el.getElementsByClassName("cards_left")[0].innerHTML = 
		the_player()[troop.type+"s"][m[3]-1];
	    el.onclick = function(){
		troop.make_move(m[1],m[2],m[3]);
		troop.hide_destinations();
	    }
	    f.add(el);
	});
	
	return moves;
    }
    this.hide_destinations = function(){
	markers = document.getElementsByClassName("possible_move_marker");
	for(var i = markers.length; i > 0 ; i--){
	    markers[0].parentNode.removeChild(markers[0]);
	}	
    }

    function legal_params(x,y,steps){
	if (x != 0) { 
	    d = x;
	} else if(y != 0) {
	    d = y;
	} else {
	    return false;
	}
	
	if (d < -1 || d > 1) 
	    return false;
	
	if (steps < 1 || steps > max_steps)
	    return false;
	
	return true;
    
    }

    this.make_move = function(x,y,steps) {
	if(phase!="move"){
	    return undefined;
	}

	if(steps == undefined)
	    steps = steps_amount();
	
	if(steps == undefined){
	    alert("choose number of steps");
	    return false;
	}

	if(!legal_params(x,y,steps)){
	    alert("cheating ai or interface error")
	    alert("x : "+x+"  ,y : "+y+"  , steps :"+steps);
	    return false;
	}
	if(!legal_move(this.x, this.y, x, y, steps, this.type)){
	    alert("illegal move");
	    return false;
	}

	this.div().className = "active_trooper";
	this.show_arrows("none");
			
	the_player()[this.type+'s'][steps-1]--;
	the_player().redraw();
	
	var __x = this.x;
	var __y = this.y;
	var trooper = this;
	
	this.move(this.x+x*steps, this.y+y*steps);
	// here actualy happens voting now, but is called in the last line
	finish_move = function (result){
	    trooper.div().className = "trooper";
	    
	    trooper.move(__x,__y);
	    // move undone, now the voting result should decide if building is allowed
	    
	    if(result){
		var i=0;
		var interval;
		var go_now = function(){
		    if(i < steps){
			i++;
			var field = trooper.move(trooper.x+x, trooper.y+y);
			if(i == steps)
			    field.build(trooper.type, 0,0);
			else
			    field.build(trooper.type,x,y);
		    } else {
			window.clearInterval(interval);
			//__x = __y = trooper = null;
			
			turn();
		    }
		}
		phase = "building";
		interval = window.setInterval(go_now, 300);
		
	    } else {
		turn();
	    }
	    //turn done
	    
	} 
	
	vote_now();

    }

    this.surrounding = function(){
	//       b[O] 
	// b[1]  x,y  b[2]
	//      b[3]
	
	var bak = [];
	for(var i = -1; i < 2; i++){
	    if(i == 0){
		for(var j = -1; j < 2; j++){
		    if( j !=0 ){
			bak.push( field(this.x,this.y+j));
		    }
		}
	    } else {
		bak.push( field( this.x + i, this.y) );
	    }
	}
	return bak;
    }

    this.moveable = function(){
	var free_fields = 4
	this.surrounding().forEach( function(f) {
	    if( !f || f.state != null){
		free_fields--;
	    }
	});
	return free_fields; 
    }
//constructor
    
    if(!document.getElementById(this.name)){
	game_container.appendChild( _troop(this.num, type) );
    }
}
function move_out_of_range(x, y, _x, _y, steps){
    //within range?
    if(x + steps * _x >= max_x || x + steps * _x < 0 || 
       y + steps * _y >= max_y || y + steps * _y < 0){
	if(debug) 
	    alert("move out of range");
	return false
    }
    return true;
}
function is_something_on_the_way(x, y, _x, _y, steps, mode){
    var bak = [];
    //somethings on the way?
    
    for(var i=1; i <= steps; i++) {
	var f = field(x+_x*i,y+_y*i);
	if( f == undefined){
	    console.log("x : "+x+", y : "+y+", _x : "+_x+", _y : "+_y+", steps : "+steps);
	    return bak;
	}
	if(f.state != null){
	    if(debug) 
		console.log("something on the way on "+(x+_x*i) +","+ (y+_y*i));
	    if(mode!=undefined)
		return bak;
	    else 
		return false;
	}
	bak.push(f);
    }
    return bak;
}
function waycards_available(steps, type){
    //having such waycards?
    if(the_player()[type+'s'][steps-1]<1){
	if(debug)
	    alert("you have no such waycards");
	return false;
    }
    return true;

}
function legal_move(x, y, _x, _y, steps, type){
    if(
	move_out_of_range(x, y, _x, _y, steps) &&
	    is_something_on_the_way(x, y, _x, _y, steps) &&
	    waycards_available(steps, type)
    ){
	return true;
    } else {
	return false;
    }
}

function steps_amount(){
    radios = the_player().div().getElementsByClassName("steps_amount")
    for(var i = 0; i < radios.length; i++) {
	if(radios[i].checked)
	    return i+1;
    }
    return undefined;
}


function troop(num){
    return troops[num];
}
