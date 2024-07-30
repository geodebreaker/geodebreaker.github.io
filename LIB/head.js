$ = x => document.querySelector(x);
log = (...a) => console.log(...a);

document.onreadystatechange = () => {
	if(document.readyState == 'complete')
		ge.start();
};

start = () => {};
loop = () => {};

ge = {
	pic: {}
};

ge.c = $('canvas');
_ = ge.c.getContext('2d');

ge.restart = () => {
	ge.stop();
	ge.start();
};

ge.start = () => {
	start();
	ge.resume();
};

ge.resume = () => {
	ge.t = Date.now();
	ge.int = setInterval(ge.loop, 1000 / FPS);
};

ge.loop = () => {
	var nt = Date.now();
	var dt = (nt - ge.t) / 1000;
	ge.t = nt;

	$('#fps').innerText = "fps: "+Math.round(1/dt)+" / "+FPS

	_ = ge.c.getContext('2d');

	WIDTH  = ge.c.width  = innerWidth;
	HEIGHT = ge.c.height = innerHeight;

	_.imageSmoothingEnabled = false;

	loop(dt);
};

ge.stop = () => {
	clearInterval(ge.int);
};

ge.loadpic = async (filename, name) => {
	ge.pic[name] = new Image();
	ge.pic[name].src = '../pic/' + filename;
};

ge.getpic = (name) => {
	return ge.pic[name]??ge.pic._FB;
};

__ = {};

__.mkpalette = (w, h) => {
	__.newpalette = document.createElement('canvas');
	__.newpalette.width = w;
	__.newpalette.height = h;
	__._ = _
	_ = __.newpalette.getContext('2d');

	_.imageSmoothingEnabled = false;
}	

__.mkpdone = (name) => {
	_ = __._;
	ge.pic[name] = __.newpalette;
}

__.img = (pic, t2, t1, o) => {
	t1=t1??[0,0,pic.width,pic.height];
	t2=t2??t1;
	_.save();
	_.globalAlpha = o;
	_.drawImage(
		pic,
		t1[0], t1[1], t1[2], t1[3], 
		t2[0], t2[1], t2[2], t2[3]
	);
	_.restore(); 
}
__.text = (t, x, y, color, size, scolor, width) => {
	if(color)
		_.fillStyle = color;

	_.font = (size ?? 15) + "px monospace";

	if(scolor){
		_.strokeStyle = scolor;
		_.lineWidth = width ?? 1;
		_.strokeText(t, x + 5, y + (size ?? 15) - 5);
	}

	_.fillText(t, x + 5, y + (size ?? 15) - 5);
}
__.rect = (x, y, h, w, color) => {
	if(color)
		_.fillStyle = color;

	_.fillRect(x, y, h, w);
}
__.line = (start, end, color, width) => {
	if(color)
		_.strokeStyle = color;
	if(width)
		_.lineWidth = width;

	_.beginPath();
	_.moveTo(start.x, start.y);
	_.lineTo(end.x, end.y);
	_.stroke();
}
__.point = (pos, color, radius) => {
	if(color)
		_.fillStyle = color;

	_.beginPath();
	_.arc(pos.x, pos.y, radius ?? 4, 0, Math.PI * 2);
	_.fill();
}
class V {
	constructor(x, y){
		var xisvec = x.constructor.name == 'V';
		this.x = xisvec ? x.x : x;
		this.y = xisvec ? x.y : y;
	}

	format(x, y){
		if(x.constructor.name == 'V')
			return new V(x.x, x.y);
		else if(y==undefined)
			return new V(x, x);
		else
			return new V(x, y);
	}

	add(x, y){
		var a = this.format(x, y);
		this.x += a.x;
		this.y += a.y;
		return this;
	}

	sub(x, y){
		var a = this.format(x, y);
		this.x -= a.x;
		this.y -= a.y;
		return this;
	}

	mul(x, y){
		var a = this.format(x, y);
		this.x *= a.x;
		this.y *= a.y;
		return this;
	}

	div(x, y){
		var a = this.format(x, y);
		if(a.x != 0)
			this.x /= a.x;
		if(a.y != 0)
			this.y /= a.y;
		return this;
	}

	norm(){
		var d = this.mag;
		this.div(d, d);
		return this;
	}

	rot(theta){
		var ct = Math.cos(theta*D2R);
		var st = Math.sin(theta*D2R);
		this.x = this.x * ct - this.y * st;
		this.y = this.x * st + this.y * ct;
		return this;
	}

	dot(x, y){
		var a = this.format(x, y);
		return this.x * a.x + this.y * a.y;
	}

	get mag(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	set mag(v){
		return this.norm().mul(v).mag;
	}

	get head(){
		return R2D * Math.atan2(this.x, this.y);
	}
}


input = { 
	k: {},
	m: {
		x: 0,
		y: 0,
		lock: false,
		canlock: false
	}
}

window.addEventListener('keydown', function(event){
	if(!((event.key == 'I' && event.ctrlKey) || event.key == 'F12'))
		event.preventDefault();
	input.k[event.key.toLowerCase()] = true;
});
window.addEventListener('keyup', function(event){
	event.preventDefault();
	input.k[event.key.toLowerCase()] = false;
});
window.addEventListener('mousemove', function(event){
	if(event.target == ge.c){
		event.preventDefault();
		if(input.m.lock){
			input.m.x += event.movementX;
			input.m.y += event.movementY;
		}else{
			input.m.x = event.clientX;
			input.m.y = event.clientY;
		}
	}
});
window.addEventListener('mousedown', function(event){
	if(event.target == ge.c){
		event.preventDefault();
		if(input.m.lock || !input.m.canlock)
			input.m['lmr'[event.button]] = true;
	}
});
window.addEventListener('mouseup', function(event){
	event.preventDefault();
	input.m['lmr'[event.button]] = false;
});
window.addEventListener('contextmenu', function(event){
	event.preventDefault();
});

document.addEventListener('click', event => {
	if(!input.m.lock && input.m.canlock){
		event.stopPropagation();
		event.preventDefault();
		document.body.requestPointerLock();
	}
});

document.addEventListener('pointerlockchange', ()=>{
	input.m.lock = document.pointerLockElement == document.body;
	if(input.m.lock){
		document.body.id = 'hide-cursor';
	}else{
		document.body.id = '';
	}
});

document.addEventListener('pointerlockerror', ()=>{
	console.error('Pointer lock error');
});

D2R = Math.PI / 180;
R2D = 180 / Math.PI;

function p2c(t,r){
	return new V(
		Math.cos(t * D2R) * r,
		Math.sin(t * D2R) * r
	);
};



__.mkpalette(100, 100);
/**/__.rect(0, 0, 100, 100, "#000");
/**/__.rect(50, 0, 50,  50, "#f0f");
/**/__.rect(0, 50, 50,  50, "#f0f");
__.mkpdone('_FB');

function raycast(pos, dir, a, b){ //raycast
	var newdir = new V(dir);
	newdir.norm();

	var x1 = a.x; // https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection
	var y1 = a.y;
	var x2 = b.x;
	var y2 = b.y;

	var x3 = pos.x;
	var y3 = pos.y;
	var x4 = pos.x + newdir.x;
	var y4 = pos.y + newdir.y;

	var d = (x1-x2)*(y3-y4)-(y1-y2)*(x3-x4);
	if(d == 0)
		return false; //if parralel

	var t =   (x1-x3)*(y3-y4)-(y1-y3)*(x3-x4);
	var u = -((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3));

	t /= d;
	u /= d;

	if(!(t >= 0 && t <= 1 && u > 0))
		return false; //if not coliding

	return [new V(x1+t*(x2-x1), y1+t*(y2-y1)), t, u];
}

vec0 = new V(0,0);

function arrowwrap(t, f, a=[]){
	Function('('+f.toString()+').apply(this, arguments)').apply(t, a);
}

slider=(v, min, max, step, noreset)=>{
	var t = document.createElement('span');
	t.innerText = v.toLowerCase()+":";
	$('body').insertBefore(t, $('#reset'));
	
	var r = document.createElement('input');
	r.type = 'range';
	r.min = min;
	r.max = max;
	r.step = step;
	r.value = window[v];
	$('body').insertBefore(r, $('#reset'));
	
	var ve = document.createElement('span');
	ve.innerText = " "+window[v];
	$('body').insertBefore(ve, $('#reset'));

	$('body').insertBefore(document.createElement('br'), $('#reset'));
	
	r.onchange = () => {
		window[v] = parseFloat(r.value);
		ve.innerText = " "+r.value;
		if(!noreset){
			ge.restart();
		}
	}
}

putdesc=(desc)=>{
	$('#desc').innerText += desc + '\n';
}
