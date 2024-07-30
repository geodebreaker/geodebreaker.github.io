putdesc('cloth sim');
putdesc('use left  click to cut');
putdesc('use right click to push');
putdesc('---');

var FPS = 30;

var ITER = 8;

drag = 0.01;

var DECEL = 0.99;

window['gravity angle'] = 90;
window['gravity strength'] = 1;

var WALLS = 1;
var DEBUG = 0;

var GRAV = new V(0, 0);

var SIZE = 10;

var STRETCH = 0;

window['mouse strength'] = 5;

slider('SIZE', 2, 30, 1);
slider('WALLS', 0, 1, 1, true);
slider('DEBUG', 0, 1, 1, true);
slider('gravity strength', 0, 2, 0.1, true);
slider('gravity angle', 0, 360, 10, true);
slider('drag', 0, 1, 0.01, true);
slider('STRETCH', 0, 20, 1, true);
slider('mouse strength', 1, 30, 1, true);

world = {};

function start(){
	ge.loadpic('mood.gif', 'pic');


	world.p = new Array(SIZE * SIZE);
	for(var i = 0; i < SIZE; i++){
		for(var j = 0; j < SIZE; j++){
			var k = i + j * SIZE;

			world.p[k] =
				new obj(
					k, 
					(innerWidth-SIZE*30)/2 + i * 30, 
					70 + j * 15, 
					1, //(k+1) / 15,
					(j==0)
				);
		}
	}

	for(var i = 0; i < SIZE; i++){
		for(var j = 0; j < SIZE; j++){
			var k = i + j * SIZE;

			if(i < SIZE - 1)
				world.p[k].connect(k + 1);
			if(j < SIZE - 1)
				world.p[k].connect(k + SIZE);
			// if(j < SIZE - 1 && i < SIZE - 1)
			// 	world.p[k].connect(k + SIZE + 1);
			// if(j < SIZE - 1 && i > 0)
			// 	world.p[k].connect(k + SIZE - 1);
		}
	}
}

function loop(dt){
	GRAV = p2c(
		window['gravity angle'],
		window['gravity strength']
	);

	DECEL = 1-drag;

	fe(p=>p.loop(dt));
	fe(p=>p.phys(dt));

	draw();
}

function draw(){
	fe(p=>p.draw());


	if(input.m.l)
		__.point(new V(input.m.x, input.m.y), '#f008', 5);

	if(input.m.r)
		__.point(new V(input.m.x, input.m.y), '#f0f8', 25);
}

fe = (cb) => world.p.forEach((...a)=>cb(...a))

class obj{
	constructor(i, x, y, m, f){
		this.i = i;

		this.p = new V(x, y);
		this.op = new V(this.p);
		this.a = new V(0, 0);
		this.m = m;

		this.f = f;
		this.c = [];
	}

	connect(i){
		this.c.push(new con(this.i, i));
	}



	loop(dt){
		this.force(GRAV);

		if(input.m.l){
			for(var i = 0; i < this.c.length; i++){
				if(this.c[i].mouseHit()){
					this.c.splice(i--, 1);
				}
			}
		}

		if(input.m.r){
			var x = new V(input.m.x, input.m.y).sub(this.p);
			this.force(x.mul(
				-Math.max(30 - x.mag, 0) * (window['mouse strength']/100)
			));
		}
	}



	force(v){
		if(!this.f)
			this.a.add(v);
	}

	phys(dt){
		if(this.f)
			this.p = new V(this.op)
		else{
			var tp = new V(this.p);
			this.p = 
				new V(this.p).sub(this.op).mul(DECEL)
				.add(this.p)
				.add(this.a.mul(dt*dt*900).mul(this.m));
			this.op = tp;
			this.a = new V(0, 0);
		}
		
		for(var i = 0; i < ITER; i++){
			this.constrain();
		}
	}

	constrain(){
		if(WALLS){
			if(this.p.y > HEIGHT){
				this.p.y = HEIGHT;
				this.force(new V(0, -5));
			}
			if(this.p.y < 0){
				this.p.y = 0;
				this.force(new V(0, 5));
			}
			if(this.p.x > WIDTH){
				this.p.x = WIDTH;
				this.force(new V(-5, 0));
			}
			if(this.p.x < 0){
				this.p.x = 0;
				this.force(new V(5, 0));
			}
		}

		this.c.forEach(c=>c.constrain());
	}



	draw(){
		if(this.f)
			__.point(this.p, "red", 2 + this.m * 2);
		else if(DEBUG)
			__.point(this.p, "white", 2 + this.m * 2);

		this.c.forEach(c=>c.draw());
	}
}

class con{
	constructor(t, f){
		this.t = t;
		this.f = f;
		this.l = 
			new V(world.p[this.t].p)
			.sub (world.p[this.f].p)
			.mag;
	}

	draw(){
		if(DEBUG){
			var x = color(
				this.l -
				new V(world.p[this.t].p)
				.sub (world.p[this.f].p)
				.mag
			);
			__.line(
				world.p[this.t].p, 
				world.p[this.f].p, 
				"rgb("+ x.r +", "+ x.g +", "+ x.b +")", 4);
		}else
			__.line(
				world.p[this.t].p, 
				world.p[this.f].p, 
				"white", 4);
	}

	constrain(){
		var t = world.p[this.t];
		var f = world.p[this.f];
		var dis = new V(t.p).sub(f.p).mag;
		var dif = this.l - dis;
		var d = new V(f.p).sub(t.p);
		d.mag -= this.l;
		d.div(t.m + f.m + STRETCH);

		if(!t.f)
			t.p = new V(t.p).add(new V(d).mul(f.m));
		if(!f.f)
			f.p = new V(f.p).sub(new V(d).mul(t.m));
	}

	mouseHit() {
		var A = world.p[this.t].p;
		var B = world.p[this.f].p;
		var C = new V(input.m.x, input.m.y);

		var AB = new V(B).sub(A);
		var AC = new V(A).sub(C);
		var BC = new V(B).sub(C);

		var area = Math.abs(AB.x * AC.y - AB.y * AC.x);

		return ((area / AB.mag <= 10) && (AC.mag <= AB.mag) && (BC.mag <= AB.mag));
	}
}

function color(val){
	return {
		r: val + 400 - val * 8,
		g: val + 400 + val * 8,
		b: val + 400 + val * 8,
	};
}
