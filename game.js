var FPS = 30;

var AMOUNT = 10;
var RADIUS = 50;
var CENTER = new V(300, 300);

var INFLATE = 0.1;

var G = new V(0, 1);
var STRETCH = 0.3;
var DECEL = 0.95;
var BOUNCE = 0.8;

$('#inflate').onchange = function(){$('#v1').value = INFLATE = this.value; ge.restart()}
$('#amount' ).onchange = function(){$('#v2').value = AMOUNT  = this.value; ge.restart()}
$('#radius' ).onchange = function(){$('#v3').value = RADIUS  = this.value; ge.restart()}
$('#stretch').onchange = function(){$('#v4').value = STRETCH = this.value; ge.restart()}
$('#inflate').value = $('#v1').value = INFLATE;
$('#amount' ).value = $('#v2').value = AMOUNT;
$('#radius' ).value = $('#v3').value = RADIUS;
$('#stretch').value = $('#v4').value = STRETCH;

var w = {
	o: [],
	f: (f, ...a) =>
		w.o.forEach(o => 
			o[f](...a)),
	e: (f) =>
		w.o.forEach(o =>
			f(o)),
	b: (f) => {
		for(var i=0;i<w.o.length;i++){
			for(var j=i+1;j<w.o.length;j++){
				f(w.o[i], w.o[j]);
			}
		}
	},
	t: (f) => {
		for(var i=0;i<w.o.length;i++){
			for(var j=0;j<w.o.length;j++){
				if(i!=j)
					f(w.o[i], w.o[j]);
			}
		}
	},
	a: (...v) => {
		return w.o[w.o.push(new obj(w.o.length, ...v))-1];
	}
};

function start(){
	ge.loadpic('mood.gif', 'pic');

	w.o=[];

	for(var i=0;i<AMOUNT;i++){
		var an = 360/AMOUNT*i*D2R;
		var op = new V(
			Math.cos(an),
			Math.sin(an)
		).mul(RADIUS).add(CENTER);
		w.a(op);
	}
	
	w.t((a,b)=>a.conn(b))
}

DB = (x, y) => {
	DBL.push([new V(x), new V(x).add(y)]);
};

function loop(dt){
	DBL = [];
	
	AVG = new V(0, 0);
	w.e((o)=>
		AVG.add(o.p))
	AVG.div(w.o.length);
	// var c = new V(CENTER).sub(AVG);
	// c.mul(0.0001 * c.mag);
	// AVG.add(c);
	
	w.b((a,b) =>
		a.spring(b));
	
	w.f('loop', dt);
	
	w.f('phys', dt);
	
	//w.f('draw', dt);
	draw();
}

function draw(){
	var a = [];
	w.e((o)=>a.push(new V(o.p)))
	_.beginPath();
	var p = a.shift();
	_.moveTo(p.x, p.y);
	a.forEach(p =>
		_.lineTo(p.x, p.y));
	_.closePath();
	
	_.fillStyle = "blue";
	_.strokeStyle = "white";
	_.lineWidth = 3;

	_.fill();
	_.stroke();

	//__.line(CENTER, AVG, "red", 3);

	if(input.m.l)
		__.point(new V(input.m.x, input.m.y), "#f0f4", 50)
}

class obj{
	constructor(i, pos){
		this.i = i;
		this.p = pos;
		this.f = false;
		this.v = new V(0, 0);
		this.a = new V(0, 0);
		this.c = {};
		this.m = Math.random() * 1.5 + 0.5;
	}

	conn(o){
		this.c[o.i] = new V(o.p).sub(this.p).mag;
	}

	phys(dt){
		if(!this.f){
			this.v.add(this.a.mul(this.m));
			this.a = new V(0, 0);
			this.v.mul(DECEL * dt * 30);
			this.p.add(this.v);
		}

		if(this.p.y > 600){
			this.p.y = 600;
			this.v.y *= -BOUNCE;
		}

		if(input.m.l){
			var d = new V(input.m.x, input.m.y).sub(this.p);
			if(d.mag < 50){
				d.mag -= 50;
				this.p.add(d);
				d.mag = d.dot(this.v);
				d.mag = Math.min(d.mag, 100);
				this.v=new V(0,0)//.add(d.mul(-BOUNCE));
			}
		}
	}

	spring(o){
		var f = (a, b) => {
			var d = new V(a.p).sub(b.p);
			d.mag = Math.min(d.mag, 100);
			d.mag = Math.max(d.mag, 10);
			d.mag -= a.c[b.i];
			d.mag *= -STRETCH/2;
			a.a.add(d);
		};
		if(this.c[o.i]){
			f(this, o);
		}
		if(o.c[this.i]){
			f(o, this);
		}
	}

	loop(dt){
		this.a.add(G);
		
		var d = new V(this.p).sub(AVG);
		d.mag -= RADIUS;
		this.a.add(d.mul(-INFLATE));
	}

	draw(){
		for(var i in this.c){
			var pa = this.p;
			var pb = w.o[i].p;
			var d = new V(pa).sub(pb).mag;
			__.line(
				pa, pb, 
				"rgb("+(d+100)+", 0, 0)", 
				3);
		}
		var c = (this.i*170900+1020).toString(16);
		c = "#" + "0".repeat(6 - c.length) + c;
		__.point(this.p, c, 10);
		__.text(this.i, this.p.x - 10, this.p.y - 5, "white")
	}
}