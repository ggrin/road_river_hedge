var current_player = -1;
var players_total = 2;
var players = [];
var max_steps = 5;

var way_types = ['streets', 'rivers', 'walls'];

function Player(num, name, building) {
  //properties
    this.num = num;
    this.name = name;
    this.building = building;
/*
    this.walls = [0,0,0];
    this.streets = [0,0,0];
    this.rivers = [0,0,0];
*/
    this.out_of_game = false;
    this.my_vote = null;
    this.votes = new Array(7);
    for(var i = 0; i<7; i++){
	this.votes[i] = voting_cards;
    }
  //methods
    //TODO make active method 
    this.div = function(){
	return document.getElementById("player_"+this.num);
    }
    this.vote_pic = function() {
	return document.getElementById("player_"+this.num+"_vote").getElementsByTagName("img")[0];
    }
    this.redraw = function(){    
	for(var i = 1; i <= max_steps; i++){
	    this.div().getElementsByClassName("wall_"+i)[0].innerHTML = this.walls[(i-1)];
	    this.div().getElementsByClassName("street_"+i)[0].innerHTML = this.streets[(i-1)];
	    this.div().getElementsByClassName("river_"+i)[0].innerHTML = this.rivers[(i-1)];
	}
	v = this.div().getElementsByClassName("votes");
	vc = this.div().getElementsByClassName("vote_card");
	for(var i = 0; i < v.length; i++){
	    v[i].innerHTML = this.votes[i]
	    if(this.votes[i] == 0){
		vc[i].style.opacity = 0.5
	    }
	}
    }    

    this.vote = function (my_vote){
	if(this.my_vote != null){
	    return false;
	}
	if(this.votes[my_vote+3]<1){
	    alert("no voting card of this type left");
	    return false;
	}
	show(this.set_vote_pic(pic("voted")));
	if(my_vote!=0)
	    this.votes[my_vote+3]--;
	this.my_vote = my_vote;
	vote_check();
	return true;
    };

    this.set_vote_pic = function (pic_){
	e = this.vote_pic();
	e.src = pic_;
	return e;
    };

    this.give_up = function(){
	if(confirm("do you realy want to give up???")){
	    this.out_of_game = true;
	    this.div().style.opacity = "0.55"
	    document.getElementById("player_"+this.num+"_vote").style.display = "none";
	    if(the_player().num == this.num || game_over()){
		turn();
	    }
	}
    }
    
    
  //constructor
    players[num-1] = this;

  // initializing ways
    for(var i = 0; i < way_types.length; i++){
	this[way_types[i]] = [];
	for(var j = 0; j < max_steps; j++)
	    this[way_types[i]][j] = 0;
    }

    //create div
    if(!this.div()){
	element = document.getElementById("player_template").cloneNode(true);
	element.id = "player_"+num;
	var give_up_button = element.getElementsByClassName("give_up_button")[0];
	var name_span = element.getElementsByClassName("player_name")[0]
	var build_pic = element.getElementsByClassName('player_building')[0];
	
	// the head
	var player = this;
	give_up_button.onclick = function(){
	    player.give_up();
	}
	name_span.innerHTML = this.name;
	name_span.onclick = function (){
	    toggle_element(build_pic);
	}
	build_pic.src = pic(this.building);

	//steps and their table
	var radio_div = element.getElementsByClassName("steps_amount_div")[0];
	var radio_parent = radio_div.parentNode;

	for(var i=0; i < max_steps ; i++){	    	    
	    var radio = radio_div.getElementsByTagName("input")[0];
	    
	    radio.value = i+1;
	    //TODO radio.accesskey = 

	    radio.name = "steps_"+this.num;
	   	    
	    radio_div.getElementsByTagName("img")[0].src = pic(num_to_name(i+1));
	    
	    radio_parent.appendChild(radio_div);
	    radio_div =  radio_div.cloneNode(true);
	}
	var n = element.getElementsByClassName("way_cell_template")[0]
	way_types.forEach(function(name){
	    var tr = element.getElementsByClassName(name)[0];
	    
	    for(var i = 0; i < max_steps; i++){
		var o = n.cloneNode(true);
		o.class = "way_cell";
	    	o.className = name.slice(0,-1)+"_"+(i+1);
		
		tr.appendChild(o);
	    }
	});
	n.parentNode.removeChild(n);
	
	//votes and their table
	var l = element.getElementsByClassName("vote_card");
	for(var i = 0; i < l.length; i++){
	    l[i].value = ""+(this.num-1)+";"+(i-3); //i-3 couse of 7 votes from -3 to +3
	    l[i].onclick = vote_handler
	}

	//append players pannel
	pannel.appendChild(element);

    }
    
    this.redraw();

    //voting element

    var my_vote_element = document.getElementById("player_vote_template").cloneNode(true)
    my_vote_element.id = "player_"+this.num+"_vote";
    my_vote_element.getElementsByClassName("player_name")[0].innerHTML = this.name;
    document.getElementById("vote_ip").appendChild(my_vote_element);

}

function the_player(){
    return players[current_player];
}

function create_players(){
    var buildings = types.slice(0,-1).sort(rand_sort);
    
    current_player = players_total-1;
    for(var i=1; i<=players_total; i++){
	var name = document.forms["config"]["player_"+i+"_name"].value != "" ? document.forms["config"]["player_"+i+"_name"].value : "Player " + i;
	var p = new Player(
	    i, 
	    name, 
	    buildings[i-1]
	);
	
	p.role = document.forms["config"]["player_"+i+"_role"].value.toLowerCase();
	if(p.role!="human"){
	    p.ai = new Ai(p);
	}
    }
    dispense_waycards();
    players.forEach(function(p){
	p.redraw();
    })
    // it's done in turn now
    //the_player().div().getElementsByClassName("player_name")[0].style.color = "red";
    
    
}

function next_player(){
    the_player().div().className = "players_pannel";
	//getElementsByClassName("player_name")[0].style.color = "black"
    do {
	current_player = (current_player+1) % players_total;
    } while(count_players() <= 1 || the_player().out_of_game )
    the_player().div().className = "players_pannel active"; 
	//getElementsByClassName("player_name")[0].style.color = "red"

    return current_player;//players[current_player];
}
