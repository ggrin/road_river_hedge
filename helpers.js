
function show_selected_players(s){
    for(var i=1; i <= max_players; i++){
	document.forms["config"].players.getElementsByTagName("tr")[i].style.display = i <= s ? "table-row" : "none"
    }
}

function faculty(n){ // this should be solved with gaus's formula
    var ret = 0;
    for(var i = n; i > 0; i--){
	ret += i;
    }
    return ret;
}

function rand(min, max){
    var r = Math.random();
    if(min==undefined){
	return r;
    }
    if(max==undefined){
	max = min-1;
	min = 0;
    }
    return Math.round(r*(max-min)+min);
}


function rand_sort(a,b){
    return 2*Math.random()-0.5;
}

function clone_ary(ary){
    var l = ary.length;
    var bak = new Array(l);
    for(var i = 0; i<l; i++){
	bak[i]=ary[i];
    }

    return bak;
}

function pic(str){
    return "pic/"+str+".png";
}

function hide(obj, state){
    if(!state) 
	state = "none";
    obj.style.display = state;
}

function show(obj, state){
    if(!state) 
	state = "inline";
    obj.style.display = state;
    
}

function toggle_element(obj, state){
    if(obj.style.display == "none"){
	show(obj, state);
    }else{
	hide(obj, state);
    }
    
    return obj;
}


function Assoc_ary(keys, val){
    if(keys){
	for(var i=0; i < keys.length; i++){
	    this[keys[i]] = val; 
	} 
    }
}

var hidden_timeout;

function show_and_hide(el, ms, block){
    el.style.display="inline";
    hidden_timeout = window.setTimeout(function () { 
	el.style.display = "none"; 
	if(block)
	    block();
    }, ms);
    return el;
}

function num_to_name(num) {
    var names =  ['zero','one','two', 'three', 'four','five','six','seven', 'eight', 'nine'];
   
    return names[num];
}
function count_players(){
    var num_players = 0;
    players.forEach( function(p){
	if(!p.out_of_game){
	    num_players+=1
	}
    })
    return num_players;
}

function active_players(){
    var ret = []
    players.forEach( function(p){
	if(!p.out_of_game){
	    ret.push(p);
	}
    })
    return ret;

}

function for_each_direction(proc){
    for(var i = -2; i <= 2; i++){
	if(i!=0){   
	    var _x = i%2
	    var _y = (i+1)%2
	    proc(_x,_y)
	}
    }
}
