function possible_moves(player, first){
    var bak = [];
    function _possible_moves(troop, _x, _y){
	var waycards = player[troop.type+"s"];
	dis:for(var steps = 1; steps <= max_steps; steps++){
	    if(waycards[steps-1]<=0){
		//alert("CONTINUE "+troop.type+" steps:"+steps+";"+waycards[steps-1]);
		continue dis;
	    }
		
	    if(move_out_of_range(troop.x, troop.y, _x, _y, steps) &&  
	       is_something_on_the_way(troop.x, troop.y, _x, _y, steps)){
		bak.push([troop.num, _x, _y, steps]);
		if(first)
		    return true;

	    } else {
		//alert("BREAK "+troop.type+" steps:"+steps+";"+waycards[steps-1]);
		break dis;
	    }
	}
	return false;
    }
    troops.forEach( function(troop){
	for(var _x = -1; _x <= 1; _x++){
	    if(_x == 0) {
		for(var _y = -1; _y <= 1; _y++){
		    if(_y != 0){
			if(_possible_moves(troop, 0, _y)&&first)
			    return true;
		    }
		}
	    } else {
		if(_possible_moves(troop, _x, 0)&&first)
		    return true;
	    }
	}
    })
    
    if(first){
	if(bak.length == 0)
	    return false;
	else
	    return true;
    }
    return bak;
}
function score_for_fields(fields){
    var bak = [0,0,0,0]; // changes when size of types change
    fields.forEach(function(f){
	    var i = types.indexOf(f.building);
	    if(i  >= 0){
		bak[i] += f.value;
	    }
	})
    return bak
}

function scores_for_move(troop_num, _x, _y, steps){
    var bak;
    var fields = is_something_on_the_way(troop(troop_num).x,troop(troop_num).y, _x, _y, steps);
    if(fields){
	bak = score_for_fields(fields);
    } else {
	if(debug)
	    console.log("Ai tried to evalue impossible move: troop:"+troop_num+", "+_x+":"+_y+"; "+steps);
    }
    return bak;
}

function score_for_endangered(troop_num, _x, _y, steps){
    var x = troop(troop_num).x + _x*steps
    var y = troop(troop_num).y + _y*steps
    var f = [];
    for_each_direction(function(_x,_y){
	f = f.concat( is_something_on_the_way(x,y,_x,_y,max_steps, "endangered") )
    })
    f = f.filter(function(i){ return i.building })
    
    return score_for_fields(f);
}
function heuristic_for_move(player, m){
    var score = scores_for_move(m[0],m[1],m[2],m[3]);
    //own * -3
    var endangered = score_for_endangered(m[0], m[1], m[2], m[3])
    score[types.indexOf(player.building)] *= -3;
    endangered[types.indexOf(player.building)] *= -6;
    var val = score.reduce(function(p, c, i, ary){
	return p + c;
    }) * 4;
    val += endangered.reduce(function(p, c, i, ary){
	return p + c;
    }) * 2;
    return val;
}

function Ai(player){
    this.player = player;
    //METHODS
    var ai = this;
    this.turn = function(){
	var moves = possible_moves(this.player);
	if(moves.length == 0){
	    alert("no possible moves, should never happen")
	    return false;
	}
	var evaluated_moves = moves.map(function(m){
	    return [heuristic_for_move(ai.player, m),
		    m];
	}).sort(function(m1,m2){
	    return ( m2[0] - m1[0]);
	});

	//filter moves with highest score
	var limit = evaluated_moves[0][0];
	var sane_moves = evaluated_moves.filter(function(v){
	    // this is bad
	    // should break after first mismatch
	    // already sorted
	    
	    if(v[0] >=  limit)
		return true;
	    else {
		return false;
	    }
	}).map(function(v){
	    return v[1];
	}); 
	var move = sane_moves[rand(sane_moves.length)];
	troops[move[0]].make_move(move[1],move[2],move[3]);
    } 
    /* function(){
            do { 
                var delta_x =0; 
                var delta_y = 0;
                if(rand() > 0.5){
                delta_x = 1;
            }else{
		delta_y = 1;
	    }
	    if(rand() > 0.5) {
		delta_x *= -1; 
		delta_y *= -1;
	    }
	    steps = rand(1, max_steps);
	    var troop = troops[rand(0,3)];
	} while(!legal_move(troop.x, troop.y, delta_x, delta_y, steps, troop.type))
	// alert("x : "+delta_x+"  ,y : "+delta_y+"  , steps :"+steps);
	troop.make_move(delta_x,delta_y,steps);
    }; 
    */
    this.do_vote = function(){
	if(Math.random() > 0.1){
	    return 1;
	}
	lets_vote();
    };
    this.vote = function(){
	var vote;
	//do{
	    vote = rand(6);
	    if(this.player.votes[vote] <= 0)
		vote = 3;
	//} while(!this.player.vote(vote-4)+1);
	this.player.vote(vote-3);
    }
    
}
