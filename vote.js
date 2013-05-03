//config

var voting_timeout = 5000;
var done_voting_timeout;
function move_now(){
    if(phase!="vote"){
	return;
    }
    window.clearTimeout(hidden_timeout);
    hide(document.all.votes);
    finish_move(true);
}
function vote_now(){
    window.clearTimeout(done_voting_timeout);
    done_voting();
    phase = "vote";
    players.forEach( function(p){
	p.my_vote = null;
	hide(p.vote_pic());
    });
   
    show_and_hide(document.all.votes, voting_timeout, function (){
	finish_move(true);
    });
    
    //handle ai votes
    active_players().forEach(function(p){
	if(p.role != "human"){
	    p.ai.do_vote();
	}
    });
}

function lets_vote(){
    if( phase != "vote" ) {
	return
    }

    window.clearTimeout(hidden_timeout);
    hide(document.all.vote_now);
    show(document.all.vote_ip);
    active_players().forEach(function(p){
	if(p.role != "human"){
	    p.ai.vote();
	}
    })
    
}

function all_voted(){
    var num_votes = 0;
    players.forEach(function (p){
	if(p.my_vote != null){
	    num_votes++;
	}
    });

    if(num_votes>=count_players()){
	//vote finished
	return true;
    }else{
	return false;
    }
}

function finish_vote(vote_value){
    if(phase!="vote"){
	return
    }
    players.forEach( function (p){
	vote_value += p.my_vote;
	p.set_vote_pic(pic("vote_"+p.my_vote));
    } )
    
    //alert(vote_value);
    if(vote_value < 0 ){
	finish_move(false);
    }else{
	finish_move(true);
    }
    players.forEach( function(p){
	p.redraw();
    });
    
    done_voting_timeout = window.setTimeout(done_voting,2000);
}


function vote_check(){
    var vote_value = 0;

    if(all_voted()){
	finish_vote(vote_value);
    }
}


function done_voting(){
    show(document.all.vote_now);
    hide(document.all.vote_ip);
    hide(document.all.votes);

}

function vote_handler(e) {
    if(phase!="vote")
	return;
    var attrs = this.value.split(";");
    var p = parseInt(attrs[0]);
    var val = parseInt(attrs[1]);
    players[p].vote(val); 
}
