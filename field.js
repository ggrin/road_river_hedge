var map = [];

function _field(x, y, _x, _y){
    var element = document.getElementById("field_X_Y").cloneNode(true);
    element.id = 'field_'+x+'_'+y;
    element.style.top = _x+"px";
    element.style.left = _y+"px";
    return element
}

function Field(x,y){
//parameter
    this.x = x*tile_size;
    this.y = y*tile_size;
    this.type = 'empty'; //empty or building
    this.value = 0;
    this.state = null; // street/wall/river/toilet
    this.building = null;

    this.name = 'field_'+x+'_'+y;
    this.div = function() { 
	return document.getElementById(this.name); 
    };

//initialize
    //creation of html element
    if(this.div() == undefined){
	game_container.appendChild(_field(x,y,this.x,this.y) );
    }
    
    
// methods
    this.build = function(type, _x, _y){
	this.state = type;
	//picture include
	_x = _x ? Math.abs(_x) : 0;
	_y = _y ? Math.abs(_y) : 0;
	this.div().innerHTML += (_tile(pic(type+"_"+_x+"_"+_y),4));
	//set class of buildings to destroyed
	if( this.building && this.building != 'starting_point'){
	    this.div().getElementsByClassName("building_div")[0].className += " destroyed"
	}
	
    }
    this.add = function(element){
	//element.style.top = this.x+"px";
	//element.style.left = this.y+"px";
	this.div().appendChild(element);
	return this;
    }
    
}


function field(x,y){
    if(x>=max_x || y>=max_y || x<0 || y<0) return undefined;
    return map[x*max_x+y];
}
