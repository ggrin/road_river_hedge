
// statics
var max_players = 4;


//config

var max_x = 12;
var max_y = 12;
var tile_size = 60;
var num_buildings = 5;
var voting_cards = 1;
var types = ['tipi', 'bathtub', 'shrine', 'fire','tree']
var debug = false;
//divs I might want to use

var game_container;
var pannel;
var vote_div;

// globals
var phase = 'out of game';

window.onload = function (){
    var form = document.getElementById("menu").getElementsByTagName("form")[0]
    form.voting_cards.value = voting_cards;
    form.max_steps.value = max_steps;
    form.voting_timeout.value = voting_timeout;
    form.max_x.value = max_x;
    form.max_y.value = max_y;
    form.num_buildings.value = num_buildings;
    
    init_remoteStorage();
    savegames_list();

    //new_game(document.forms.config);    
};

function new_game(form){
    voting_cards = parseInt(form.voting_cards.value);
    max_steps = parseInt(form.max_steps.value);
    voting_timeout = parseInt(form.voting_timeout.value);
    max_x = parseInt(form.max_x.value);
    max_y = parseInt(form.max_y.value);
    num_buildings = parseInt(form.num_buildings.value);
    players_total = parseInt(form.players_total.value);
    interface_mode = form.interface_mode.value;
    start_game();    
}

function generate_waycard_pool(){ 
    var pool = [];
    	
    var per_color = (max_x*max_y)/(8-max_players);
    
    for(var color = 0; color < 4; color++){ //first color has to have more cards therefor 4 rounds
	//initializing pool 
	
	var used = 0;
	while(used < per_color){
	    var n = rand(1,max_steps); 
	    used += n;
	    pool.push([way_types[color%3],n-1]);  // the modulu ashures tha pool[0] will be used two times
	}
    }
    
    return pool;
}

function dispense_waycards(){
    var pool = generate_waycard_pool().sort(rand_sort);
    while(pool.length >= players.length){	
	for(var i = 0; i < players.length; i++){
	    var card = pool.pop();
	    players[i][ card[0] ][ card[1] ]++;
	}
    }
}

function init_game(){
    hide(document.getElementById("menu"));
    game_container = document.getElementById("game_container");
    show(game_container);
    pannel = document.getElementById("pannel");
    pannel.style.left = tile_size*max_x+"px";
    vote_div = document.getElementById("votes"); 
    window.onkeypress = hot_keys_handler;
    if(interface_mode == 'fields'){
	radios = document.getElementsByClassName("steps_amount")
	for(var i = 0; i < radios.length; i++){
	    radios[i].style.display = "none";
	}
    }
    save_and_load_div = document.all.save_and_load
    save_and_load_div.getElementsByTagName("button")[0].style.display = ""
    save_and_load_div.style.display = "none"
    pannel.appendChild(save_and_load_div)
    phase = "move";
}
function start_game() {
    init_game();

    draw_board();
    place_buildings();
    place_building_troops();
    create_players();

    
    turn();
    return false;
}


function scores(){
    var scores = new Array(players.length);
    for(var i = 0; i < players.length; i++){
	scores[i] = 0;
    }

    for(var x = 0; x < max_x; x++){
	for(var y = 0; y < max_y; y++){
	    var f = field(x,y);
	    if(f.building != null && f.state == null){
		for(var i = 0; i < players.length; i++){
		    if(f.building == players[i].building){
			scores[i] = scores[i]+f.value;
		    }
		}
	    }
	}
    }
    return scores
}

function troopers_moveable(){
    for(var i = 0; i < troops.length; i++){
	if(troops[i].moveable()) return true;
    }
}
function moves_left(){
    for(var p = 0; p < players.length; p++)
	for(var t = 0; t < way_types.length; t++)
	    for(var n = 0; n < max_steps; n++)
		if( players[p][ way_types[t] ][n] > 0 ) return true;
}

function game_over(){
    //this might not catch all possible game_overs
    for(var i = 0; i < players_total; i++){
	if(count_players() <= 1 || !possible_moves(players[(current_player+i+1)%players_total], true) ){
	    return true;
	}
    }
    return false;
}
    
function _tile(src, layer, css_class){
    return '<img style="position:absolute;top:0px;left:0px;z-index:'+layer+'" src="'+src+'" class="'+css_class+'"/>'
}

function _building(type, num){
    var element = document.getElementById("building_template").cloneNode(true)
    element.id = "";
    element.getElementsByClassName("building")[0].src = pic(type);
    if(num!=0){
	element.getElementsByClassName("building_value")[0].innerHTML = num;
	var img = element.getElementsByClassName("building")[0];
	img.style.width=100+num*10+"%";
	element.style.top = -num*5+"px";
	element.style.left = -num*3+"px";
    } else {
	var img = element.getElementsByClassName("building")[0];
	img.style.width=160+"%";
	element.style.top = -36+"px";
	element.style.left = -18+"px";
    
    }
    return element;
}
	
function draw_board(){
    for( var i = 0 ; i < max_x ; i++ ){
	for( var j = 0 ; j < max_y ; j++ ){
	    map[i*max_x+j] = new Field(i,j);
	}
    }
    field(0,0).building = "starting_point";
    field(0,max_y-1).building = "starting_point";
    field(max_x-1,0).building = "starting_point";
    field(max_x-1,max_y-1).building = "starting_point";
}


function place_buildings(){
   //where to place the buildings, how to manage the points
    types.forEach(
	function(type) {
	    for(var i = 0; i < num_buildings; i++) {
		do {
		    var x = rand(1 , max_x-2); //no buildings on the borders
		    var y = rand(1, max_y-2);
		    var f = field(x,y);
		} while( f.building );
		
		f.building = type;
		// unbeautiful solution
		if(type==types[types.length-1]) {
		    f.state = type;
		} else {
		    f.value = i+1;
		}
		f.add(_building(type, f.value));
	    }
	}
    );
}

function place_building_troops(){
    new Troop("street").move(0,0);
    field(0,0).build("street");

    new Troop("river").move(0,max_y-1);
    field(0,max_y-1).build("river");

    new Troop("street").move(max_x-1,max_y-1);
    field(max_x-1,max_y-1).build("street");

    new Troop("wall").move(max_x-1,0);
    field(max_x-1,0).build("wall");
}

function turn(){
    phase = "move";
    if(game_over()){
	//alert("game over! " + scores());
	end_game();
    } else {
	next_player();
	if(the_player().role != "human"){
	    the_player().ai.turn();
	}
    }
}
function end_game(){
    phase = "game over";
    var the_scores = scores().map(function(s,i){
	return [players[i],s]
    }).sort(function(a,b){
	return b[1] - a[1];
    });
    //alert(the_scores[0]);
    if(the_scores[0][1]>the_scores[1][1]){
	document.getElementsByClassName("draw")[0].style.display = "none";
	document.getElementsByClassName("won")[0].style.display = "block";
	document.all.winners_name.innerHTML = the_scores[0][0].name;
	if( the_scores[0][0].out_of_game ){
	    document.getElementsByClassName("winner_gave_up")[0].style.display = "inline";
	}
    } else {
	//draw	
	document.getElementsByClassName("draw")[0].style.display = "block"
	document.getElementsByClassName("won")[0].style.display = "none"
    }
    the_scores.forEach(function(s){
	el = document.getElementById("scores_player_"+s[0].num+"_name")
	el.getElementsByClassName("players_name")[0].innerHTML = s[0].name
	el.getElementsByClassName("players_building")[0].src = pic(s[0].building);
	el.getElementsByClassName("players_score")[0].innerHTML = s[1]
	el.style.display = "inline-block"
    });
    document.all.scores.style.display = "block";
    
    return the_scores;
    // show score screen
}

function hot_keys_handler(e){
    if(e.keyCode == 32 || e.keyCode == 13) {  //space || return
	lets_vote();
    }
    if(e.keyCode == 103){ //gG
	move_now();
    }

}
