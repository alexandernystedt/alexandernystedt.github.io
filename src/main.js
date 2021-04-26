import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/OBJLoader.js';

const degrees_to_radians = 0.0174532925;

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.3, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setClearColor("#e5e5e5");
renderer.setSize(window.innerWidth, window.innerHeight);

document.querySelector("#main-canvas").appendChild(renderer.domElement);

window.addEventListener("resize", () => 
{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    
    camera.updateProjectionMatrix();
});

renderer.render(scene, camera);

camera.position.z = 10;
camera.position.y = 18;
camera.rotation.x = -Math.PI / 4;

const texture = new THREE.TextureLoader().load("res/tex.png");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(10, 10);

const texture2 = new THREE.TextureLoader().load("res/colors.png");

var plane = new THREE.Mesh
(
    new THREE.PlaneGeometry(100, 100, 10, 10),
    new THREE.MeshBasicMaterial
    ({
        //color: 0xFF0000,
        map: texture,
    })
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

var car_mesh = new THREE.Mesh
(
    new THREE.BoxGeometry(1, .75, 1.5),
    new THREE.MeshBasicMaterial
    ({
        color: 0x0000FF,
    })
);
car_mesh.position.y = .5;
scene.add(car_mesh);

var objLoader = new THREE.OBJLoader();

let car_has_loaded = false;
var car_obj = null;

objLoader.setPath('/res/');
objLoader.load('golf.obj', function (object) 
{
	car_has_loaded = true;
	
	car_obj = object;
	
	var material = new THREE.MeshBasicMaterial
	({
		//color: 0xFF00FF,
		map: texture2,
	});
	object.traverse( function ( child ) {

        if ( child instanceof THREE.Mesh ) {

            child.material = material;

        }

    } );
	
	object.position.y = 1;
	
    scene.add(object);
});

const Engine = 
{
    "none":  0,
    "basic": 1,
    "lawn_mower": 2,
    
    "standard": 3,
}

const Tire = 
{
    "none":  0,
    "bicycle": 1,
    "offroad": 2,
    "racing": 3,
}

const car_default_weight = 50;

class Car
{
    constructor()
    {
        this.position = {};
        this.position.x = 0;
        this.position.y = 0;
        this.position.z = 0;
        
        this.wheel_angle = 0;
        this.car_angle = 0;
        
        this.engine = Engine.standard;
        this.horsepower = 0;
        
        this.speed = 0;
        
        this.acceleration = 0;
        
        this.weight = car_default_weight;
        
        this.padel = 0;
        
        this.update_values();
    }    
    
    /* Meter/second, mps */
    get max_speed()
    {
        update_values();
        return this.speed;
    }
    
    /* 0–100 km/h 16,6, 6 */
    /* Weight 1050 */
    /* Horsepwoer 118 */
    
    update_values()
    {
        this.weight = car_default_weight;
        
        switch(this.engine)
        {
            case Engine.none:
                this.horsepower = 0;
                this.weight += 0;
                break;
                
            case Engine.basic:
                this.horsepower = 3;
                this.weight += 15;
                break;
                
            case Engine.lawn_mower:
                this.horsepower = 2;
                this.weight += 10;
                break;
                
            case Engine.standard:
                this.horsepower = 125;
                this.weight = 150;
                break;
        }
        
        this.speed = (this.horsepower / this.weight) * 400;
    }
    
    update()
    {
        this.wheel_angle = 0;
        
        if(pressedKeys[65] /* a */)
        {
            this.wheel_angle -= degrees_to_radians * 45 * delta * 1.5;
        }
        
        if(pressedKeys[68] /* d */)
        {
            this.wheel_angle += degrees_to_radians * 45 * delta * 1.5;
        }
        
        /* https://math.stackexchange.com/questions/180874/convert-angle-radians-to-a-heading-vector */
        var dy = Math.cos(this.car_angle + this.wheel_angle);
        var dx = Math.sin(this.car_angle + this.wheel_angle);
        
        if(pressedKeys[87] /* w */)
        {
            if(this.acceleration < 1)
            {
                this.acceleration += delta * (1 - this.acceleration);
            }
            
            this.car_angle -= this.wheel_angle;
        }
        
        if(pressedKeys[83] /* s */)
        {
            if(this.acceleration > 0)
            {
                this.acceleration -= delta;
            }
            else if(this.acceleration > -1)
            {
                this.acceleration -= delta * (1 - Math.abs(this.acceleration));
            }
            
            this.car_angle += this.wheel_angle;
        }
        
        if(!pressedKeys[87] && !pressedKeys[83] /*&& !pressedKeys[32]*/)
        {
            if(this.acceleration < .05 && this.acceleration > -.05) { this.acceleration = 0 };
            
            if(this.acceleration > 0)
            {
                this.acceleration -= delta * .5;
            }
            else if(this.acceleration < 0)
            {
                this.acceleration += delta * .5;
            }
        }
        
        this.position.x -= dx * this.acceleration;
        this.position.z -= dy * this.acceleration;
    }
    
}

const car = new Car();

window.onload = function()
{
    
    
    //document.addEventListener("keydown", key_event);
    setInterval(game_update, 1000/60); /* Updates 30 times per second */
    //window.requestAnimationFrame(game_update)
}

let delta = 0;

let old_time = 0;
function game_update()
{
    let time = performance.now();
    delta = (time - old_time) * 0.001;
    old_time = time;
    /* Update here */
    car.update();
    
    
	if(car_has_loaded)
	{
		car_obj.position.x = car.position.x;
		car_obj.position.z = car.position.z;
		car_obj.rotation.y = car.car_angle + (Math.PI);
	}
	car_mesh.position.x = car.position.x;
    car_mesh.position.z = car.position.z;
    car_mesh.rotation.y = car.car_angle;
    
    camera.position.x = camera.position.x * .9 + (car.position.x) * .1;
    camera.position.z = camera.position.z * .9 + (car.position.z + 20) * .1;
    
    /* Drawing here */
    renderer.render(scene, camera);
    
    //window.requestAnimationFrame(game_update);
}

/* https://stackoverflow.com/questions/1828613/check-if-a-key-is-down */
var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

function main()
{
    console.log("hello");
    
    //load_game();
}

main();