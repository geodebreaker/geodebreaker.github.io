putdesc('cicle sim');
putdesc('use left   click to add');
putdesc('use right  click to remove');
putdesc('use middle click to push');
//putdesc('---');

var FPS = 30;

var ITER = 8;

drag = 0.01;

var DECEL = 0.99;

window['gravity angle'] = 90;
window['gravity strength'] = 1;

var WALLS = 1;
var DEBUG = 0;

var GRAV = new V(0, 0);

var SIZE = 0;

var STRETCH = 0;

window['mouse strength'] = 5;

// slider('SIZE', 2, 30, 1);
// slider('WALLS', 0, 1, 1, true);
// slider('DEBUG', 0, 1, 1, true);
// slider('gravity strength', 0, 2, 0.1, true);
// slider('gravity angle', 0, 360, 10, true);
// slider('drag', 0, 1, 0.01, true);
// slider('STRETCH', 0, 20, 1, true);
// slider('mouse strength', 1, 30, 1, true);

world = {};

function start(){
	ge.loadpic('mood.gif', 'pic');
	world.p = [];
}

var cps = 4;
var limit = 100;
var t = 0;
var tt = 0;
var timmy = 0;
function loop(dt){
	timmy += dt;
	if(true){//input.m.l){
		if(t > 1 / cps && world.p.length < limit){
			var p = p2c(Math.sin(timmy * 1)*45-90, 300-80);
			p.add(WIDTH/2, HEIGHT/2);
			addio(p.x, p.y)//input.m.x, input.m.y);
			t -= 1 / cps;
		}
		t += dt;
	}else{
		t = 1 / cps;
	}
	if(input.m.l){
		if(tt > 1 / cps){
			var p = p2c(Math.sin(timmy * 1)*45-90, 300-80);
			p.add(WIDTH/2, HEIGHT/2);
			addio(input.m.x, input.m.y);
			tt -= 1 / cps;
		}
		tt += dt;
	}else{
		tt = 1 / cps;
	}

	GRAV = p2c(
		window['gravity angle'],
		window['gravity strength']
	);

	DECEL = 1-drag;

	var idt = dt / ITER;
	for(var i = 0; i < ITER; i++){
		fe(p=>p.loop(idt));
		fe(p=>p.phys(idt));
	}

	draw();
}

function draw(){
	if(WALLS){
		__.rect(0, 0, WIDTH, HEIGHT, "gray");
		__.point(new V(WIDTH, HEIGHT).div(2), "black", 300);
	}

	_.fillStyle = "white";

	fe(p=>p.draw());

	if(input.m.m)
		__.point(new V(input.m.x, input.m.y), '#f0f8', 30);

	__.point(new V(15 + WIDTH/2, 15 + HEIGHT/2), 'gray', 30)
}

fe = (cb) => world.p.forEach((...a)=>{if(a[0].e)cb(...a)});
addio = (x, y) => {
	world.p.push(new obj(
		world.p.length, 
		x, 
		y, 
		15,// + Math.random() * 10 - 5, 
		false,
		"white"
	));
};

class obj{
	constructor(i, x, y, rad, f, col){
		this.i = i;

		this.p = new V(x, y);
		this.op = new V(this.p);
		this.a = new V(0, 0);
		this.rad = rad;
		this.m = Math.PI * rad * rad * 0.005;

		this.e = true;
		this.f = f;

		this.col = col;//i%12//Math.floor(Math.random() * 12);
	}



	loop(dt){
		if(input.m.r && new V(this.p).sub(input.m.x, input.m.y).mag < this.rad)
			this.e = false;

		this.force(GRAV);

		if(input.m.m){
			var c = new V(input.m.x, input.m.y);
			var x = new V(this.p).sub(c);
			if(x.mag < 30 + this.rad){
				x.mag = 30 + this.rad;
				this.p = x.add(c);
			}
		}

		var c = new V(15 + WIDTH/2, 15 + HEIGHT/2);
		var x = new V(this.p).sub(c);
		if(x.mag < 30 + this.rad){
			x.mag = 30 + this.rad;
			this.p = x.add(c);
		}
	}



	force(v){
		if(!this.f)
			this.a.add(v);
	}

	phys(dt){
		if(this.f)
			this.p = new V(this.op);
		else{
			var tp = new V(this.p);
			this.p = 
				new V(this.p).sub(this.op).mul(DECEL)
				.add(this.p)
				.add(this.a.mul(dt*dt*900).mul(this.m));
			this.op = tp;
			this.a = new V(0, 0);
			this.constrain();
		}
	}

	constrain(){
		if(WALLS){
			var c = new V(WIDTH, HEIGHT).div(2);
			var x = new V(this.p).sub(c);
			if(x.mag > 300 - this.rad){
				x.mag = 300 - this.rad;
				this.p = x.add(c);
			}
		}

		for(var i = this.i + 1; i < world.p.length; i++){
			if(world.p[i].e)
				this.collision(world.p[i]);
		}
	}

	collision(o){
		var d = new V(this.p).sub(o.p);
		var l = d.mag;
		if(l < this.rad + o.rad){
			d.mag = (l - (this.rad + o.rad)) / 2;
			this.p.sub(d);
			o.p.add(d);
		}
	}



	draw(){
		if(this.f)
			__.point(this.p, "white", this.rad);
		else
			__.point(
				this.p, this.col, this.rad);
	}
}
