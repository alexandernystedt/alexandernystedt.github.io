import load_items from "./inventory.js";
import check_lines from "./physics.js";
import { connect_to_server, request_server_update } from "./client/client.js";
import { setup_renderer, update_camera, update_car_mesh, render } from "./renderer.js";

setup_renderer();

//connect_to_server();


load_items();

const degrees_to_radians = 0.0174532925;
const acceleration = .5;
const breaks = 10; 
var speedometer = document.getElementById("speedometer");

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

const car_default_weight = 750;

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
        
        this.vel_x = 0;
        this.vel_y = 0;
        
        this.weight = car_default_weight;
        
        this.padel = 0;
        this.drift = 0;
        
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
                this.horsepower = 15;
                this.weight += 10;
                break;
                
            case Engine.lawn_mower:
                this.horsepower = 5;
                this.weight += 5;
                break;
                
            case Engine.standard:
                this.horsepower = 125;
                this.weight += 150;
                break;
        }
        
        this.speed = (this.horsepower / this.weight) * 400;
        console.log(this.speed + "m/s " + this.speed * 3.60 + "km/h");
    }
    
    update()
    {
        this.wheel_angle = 0;
        
        if(pressedKeys[65] /* a */)
        {
            this.wheel_angle -= degrees_to_radians * 45 * delta * 3;
        }
        
        if(pressedKeys[68] /* d */)
        {
            this.wheel_angle += degrees_to_radians * 45 * delta * 3;
        }
        
        /* https://math.stackexchange.com/questions/180874/convert-angle-radians-to-a-heading-vector */
        let dy = -Math.cos(this.car_angle + this.wheel_angle);
        let dx = -Math.sin(this.car_angle + this.wheel_angle);
        
        if(pressedKeys[87] /* w */)
        {
            if(this.acceleration < 1)
            {
                this.acceleration += delta * (1 - this.acceleration) * /*acceleration */ 1;
            }
            
            this.car_angle -= this.wheel_angle
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
            
            this.car_angle += this.wheel_angle
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
        
        this.vel_x += dx * this.acceleration * delta * acceleration;// * this.speed;
        this.vel_y += dy * this.acceleration * delta * acceleration;// * this.speed;
        
        dy = -Math.cos(this.car_angle);
        dx = -Math.sin(this.car_angle);
        let forward_vel_x = dx * (dx * this.vel_x + dy * this.vel_y);
        let forward_vel_y = dy * (dx * this.vel_x + dy * this.vel_y);
        dy = -Math.cos(this.car_angle + (Math.PI * .5));
        dx = -Math.sin(this.car_angle + (Math.PI * .5));
        let right_vel_x = dx * (dx * this.vel_x + dy * this.vel_y);
        let right_vel_y = dy * (dx * this.vel_x + dy * this.vel_y);
        
        if(pressedKeys[32])
        {
            if(this.drift < 1)
            {
                this.drift += delta * 2;
            }
            else
            {
                this.drift = 1;
            }
        }
        else
        {
            if(this.drift > 0)
            {
                this.drift -= delta * .5;
            }
            else
            {
                this.drift = 0;
            }
        }
        
        this.vel_x = forward_vel_x + right_vel_x * this.drift;
        this.vel_y = forward_vel_y + right_vel_y * this.drift;
        
        let vel_magnitude = Math.sqrt(Math.abs(this.vel_x * this.vel_x + this.vel_y * this.vel_y));
        speedometer.innerHTML = vel_magnitude + " kmph";
        
        this.position.x += this.vel_x;
        this.position.z += this.vel_y;
        this.vel_x -= delta * breakspeed;
        this.vel_y -= delta * breakspeed;
    }
    
}

var car = new Car();
connect_to_server(car);

window.onload = function()
{
    //document.addEventListener("keydown", key_event);
    setInterval(game_update, 1000/60); /* Updates 30 times per second */
    
    setInterval(update_server, 1000/5);
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
    
    update_car_mesh(car.position.x, car.position.y, car.position.z, car.car_angle);
    
    update_camera(car.position.x, car.position.y, car.position.z, car.car_angle + Math.PI);
    
    
    /* Drawing here */
    render();
    
    //window.requestAnimationFrame(game_update);
}

function update_server()
{
    request_server_update(car.position.x, car.position.y, car.position.z, car.car_angle);
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
