// THe following must be performed each frame. 
// 1) For each guidehair (geometry), the vertices must be subjugated to physics and integrated. 
// 2) Constraints must be applied 


// Each hair vertex is organized as a set of 6 vertices, that will need to be texeelated in order to be turned into smooth lines. For now we will use exclusively these 6 vertices to control physics, it can easily be updated for more vertices however. 

// The animation will be based on forces. In particular wind and gravity will be the primary forces.


var DAMPING = 0.03;
var DRAG = 1 - DAMPING;
var MASS = .1;

var num_verts = 6;


var GRAVITY =  981 * 1.4;

var gravity = new THREE.Vector3(0,-GRAVITY,0).multiplyScalar(MASS);

var TIMESTEP = 18/1000;
var TIMESTEP_SQ = TIMESTEP * TIMESTEP;

var wind = false;
var windStrength = 2;
var windForce = new THREE.Vector3(0,0,0);


var tmpForce = new THREE.Vector3();

var lastTime;


function Sphere(pos,radius)
{
	this.position = pos;
	this.radius = radius;
}

function Particle(lineVert,mass){
	// Takes one line geometry vertex, and a specified mass
	this.position = lineVert; 
	this.previous = lineVert;
	// Useful for resetting
	this.original = lineVert;
	this.a = new THREE.Vector3(0,0,0); //acceleration
	this.mass = mass;
	this.invMass = 1/mass;
	this.tmp = new THREE.Vector3();
	this.tmp2 = new THREE.Vector3();


}

// Apply Forces (Acceleration)
// F = MA -> A = F/M
Particle.prototype.addForce = function(force){
	this.a.add(this.tmp2.copy(force).multiplyScalar(this.invMass));

}

// Perform verlet integration

Particle.prototype.integrate = function(timesq){
// Find new pos from previous calculation
	// newPos = Position - Previous = velocity;
	var newPos = this.tmp.subVectors(this.position,this.previous)
	//newPos = velocity * drag + Position
	newPos.multiplyScalar(DRAG).add(this.position);
	// newPos = velocity * drag + Position + A * DeltaT^2
	// = 2Pos - Prev + A * DelT2, which is consistant with equation.
	newPos.add(this.a.multiplyScalar(timesq));


	// Reset Variables
	this.tmp = this.previous;
	this.previous = this.position;
	this.position = newPos;
	this.a.set(0,0,0);



}

var diff = new THREE.Vector3();

function satisifyConstrains(p1,p2,distance){
	//http://en.wikipedia.org/wiki/Verlet_integration
	diff.subVectors(p2.position,p1.position);
	var currentDist = diff.length();
	if(currentDist == 0) return;
	var correction = diff.multiplyScalar(1-distance/currentDist);
	var correctionHalf = correction.multiplyScalar(0.5);
	if (distance == 1)
	{
		p2.position.sub(correction);
		//console.log(p1);
	}
	else{
	p1.position.add(correctionHalf);
	p2.position.sub(correctionHalf);
	}

}

//function Hair()
//{
	



//}


function ApplySphereColission(sphere){
		for ( i = 0,il = particles.length;i<il;i++){
			var spherePos = sphere.position;
			var radi = sphere.radius;

			if(i>0){
			diffV = new THREE.Vector3();
			particle = particles[i];
			pos = particle.position;
			diffV.subVectors(pos,spherePos);
			// console.log(diffV.length());
			if (diffV.length() < radi){
				vect = new THREE.Vector3();
				diffV.normalize();
				diffV.multiplyScalar(radi);
				vect.addVectors(spherePos,diffV);
				//console.log(vect);
				//console.log(particles[i].position);
				particles[i].position = vect;
				//console.log(particles[i].position);

			}
			}

		}
	}	

function simulate(time,line_id){
	if(!lastTime){
		lastTime = time;
	return;
	}


	var i,il,particle,pt,constraints,constrain;

	// Aerodynamics forces
	if (wind){
		}

	// Simulate for all particles, except the first one
		for (particles =[], i = 0,il = lines[line_id].geometry.vertices.length;i<il;i++){

		 particle = new Particle(lines[line_id].geometry.vertices[i],MASS);
		// console.log(particle);
		//console.log(lines[line_id].geometry.vertices[i]);
		if(i>0){
		particle.addForce(gravity);
		particle.integrate(TIMESTEP_SQ);
		}
		//console.log(particle);
		//console.log(particle);
		//console.log(lines[line_id].geometry.vertices[i]);
		particles.push(particle);

	}

	// Apply Constraints
	for (cn = 0,cnl =10;cn<cnl;cn++)
	{
		for ( i = 0,il = (particles.length-1);i<il;i++){
			
			satisifyConstrains(particles[i],particles[i+1],scalars[i]);
		
		}	
	}



	// for number of spheres
	var spheres = [];
	spheres.push(new Sphere(new THREE.Vector3(0,100,0),13.5));
	spheres.push(new Sphere(new THREE.Vector3(0,100,8),12));
	//spheres.push(new Sphere(new THREE.Vector3(0,90,15),15));
	//spheres.push(new Sphere(new THREE.Vector3(0,100,5),12));
	for (is=0,sl=2;is<sl;is++)
	{
		ApplySphereColission(spheres[is]);
	}

	//Apply Collision

	// Simply check if each particle's distance exceeds the radius of the sphere.




}







