
remoteStorage.defineModule("roadriverhedge", 
    function(privateClient, publicClient){
	privateClient.declareType('savegame', {
	    'description' : 'a savegame you might want to load later',
	    'type' : 'object',
	    'properties' : {
		'name' : {
		    'type' : 'string',
		},
		'map' : {
		    'type' : 'object'
		},
		'troops' : {
		    'type' : 'object'
		},
		'players' : {
		    'type' : 'object'
		},
		'config' : {
		    'type' : 'object'
		}
	    }
	});
	return {
	    'exports' : {
		'save' : function(name, data) {
		    return privateClient.storeObject('savegame', "savegames/"+name, {
			'map' : data['map'],
			'troops' : data['troops'],
			'players' : data['players'],
			'config' : data['config']
		    });
		},
		'load' : function(name) {
		    return privateClient.getObject("savegames/"+name);
		},
		'list_games' : function() {
		    return privateClient.getListing("savegames/");
		}
	    }
	}
    }

			  )

function init_remoteStorage(){
    remoteStorage.claimAccess({'roadriverhedge': 'rw'}).then(function(){
 	remoteStorage.displayWidget();
    });
}

function save_game(name){    
    function preprocess_map_for_saving(){
	for(var i = 0; i < map.length; i++){
	    if(map[i].state != null && map[i].state != types[types.length-1]){
		console.log(map[i]);
		map[i].orientation  = map[i].div()
		    .getElementsByClassName("way")[0].
		    src.match(/_(\d)_(\d)/).slice(1);
		
	    }
	}
	return map;
    }

    data = {
	'map' : preprocess_map_for_saving(),
	'players' : players,
	'troops' : troops,
	'config' : {
	    'max_x' : max_x,
	    'max_y' : max_y,
	    'num_buildings' : num_buildings,
	    'voting_cards' : voting_cards,
	    'voting_timeout' : voting_timeout,
	    'max_steps' : max_steps,
	    'players_total' : players_total,
	    'current_player' : current_player,
	    'interface_mode' : interface_mode,
	    'phase' : phase
	}

    }
    
    return remoteStorage.roadriverhedge.save(name, data).then(savegames_list);
    	

}

function reset_game(data){
    console.log(data);
    config = data['config'];
    
    
    //ugly setting config should happen at one place but init_game depends on right interface mode(proably make interface changeable ingame)
    interface_mode = config['interface_mode'];

    if(phase == 'out of game'){
	init_game();
    }


    
    max_x = config['max_x'];
    max_y = config['max_y'];
    phase = config['phase'];
    players_total = config['players_total'];
    current_player = config['current_player'];
    num_buildings = config['num_buildings'];
    voting_cards = config['voting_cards'];
    voting_timeout = config['voting_timeout'];
    max_steps = config['max_steps'];
    


    map = data['map'];
    
    players = data['players'];
    
    troops = data['troops'];

    redraw_map();
    reinit_players();
    reinit_troopers();
}

function load_game(name){
    remoteStorage.roadriverhedge.load(name).then(
	reset_game
    );
}

function reinit_troopers(){
    troop_c = 0;
    for(var i = 0; i < 4; i++){
	t = troops[i];
	troops[i] = new Troop(t.type);
	// troops[i].x = t.x;    done   by
	// troops[i].y = t.y;      move:)
	troops[i].move(t.x,t.y);
    }
}

function reinit_players(){
    
    pannels = document.getElementsByClassName("players_pannel");
    while(pannels.length > 1){
	pannels[1].remove();
    }
    for(var i = 0; i < players_total; i++){
	p = players[i]
	players[i] = new Player(p.num, p.name, p.building);
	if(p.role!="human"){
	    players[i].ai = new Ai(players[i]);
	}
	players[i].walls = p.walls;
	players[i].rivers = p.rivers;
	players[i].streets = p.streets;
	players[i].votes = p.votes;
	players[i].out_of_game = p.out_of_game;
	
	players[i].redraw();
    }
    the_player().div().className = "players_pannel active"; 
}

function redraw_map(){
// TODO drawing hedges in the right shape but this is usable now
    var fields = document.getElementsByClassName('field');
    while(fields.length > 1){
	fields[1].remove();
    }
    
    for(var i = 0; i < max_x*max_y; i++){
	f = map[i];
	map[i] = new Field(Math.floor(i/max_x),i % max_x);
	if( f.building ){
	    map[i].building = f.building;
	    map[i].type = 'building';
	    map[i].value = f.value;
	    if(f.building!="starting_point"){
		map[i].add(_building(f.building, f.value));
	    }
	}
	if(f.state){
	    map[i].state = f.state;
	    if(f.state != types[types.length-1]){
		map[i].build(f.state,
			     Number(f.orientation[0]),
			     Number(f.orientation[1])
			    );
	    }
	}
	
    }
}

function savegames_list(){
    function create_list_element(name){

	function handle_savegame_onclick(e){
	    document.all.savegame_name.value = e.toElement.innerHTML;
	}

	var li = document.createElement("li");
	li.className = "savegame_name";
	li.innerHTML = name;
	li.addEventListener("click", handle_savegame_onclick);
	document.all.savegames.appendChild(li);
    }
    var lis = document.getElementsByClassName("savegame_name");
    while(lis.length > 0){
	lis[0].remove();
    }
    remoteStorage.roadriverhedge.list_games().then(function(games_list){
	for(var k in games_list){
	    console.log(" " + k + "  :  " + games_list[k] );
	    create_list_element(games_list[k]);
	}
    });
}
