import load_items from "./inventory.js";
import check_lines from "./physics.js";
import { connect_to_server, request_server_update } from "./client/client.js";
import { setup_renderer, update_camera, update_car_mesh, render } from "./renderer.js";

setup_renderer();

//connect_to_server();


load_items();

const degrees_to_radians = 0.0174532925;

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
                this.horsepower = 250;
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
            this.wheel_angle -= degrees_to_radians * 45 * delta * 4;
        }
        
        if(pressedKeys[68] /* d */)
        {
            this.wheel_angle += degrees_to_radians * 45 * delta * 4;
        }
        
        /* https://math.stackexchange.com/questions/180874/convert-angle-radians-to-a-heading-vector */
        var dy = -Math.cos(this.car_angle + this.wheel_angle);
        var dx = -Math.sin(this.car_angle + this.wheel_angle);
        
        if(pressedKeys[87] /* w */)
        {
            if(this.acceleration < 1)
            {
                this.acceleration += delta * (1 - this.acceleration) * /*acceleration */ 1;
            }
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
        
        if((this.vel_x * dx + this.vel_y * dy) > 0)
        {
            this.car_angle -= this.wheel_angle * Math.abs(this.acceleration);
        }
        else
        {
            this.car_angle += this.wheel_angle * Math.abs(this.acceleration);
        }
        
        this.vel_x += dx * this.acceleration * this.speed * delta;
        this.vel_y += dy * this.acceleration * this.speed * delta;
        
        let dot = (this.vel_x * dx + this.vel_y * dy);
        let forward_x = dx * dot;
        let forward_y = dy * dot;
        
        dy = -Math.cos(this.car_angle + this.wheel_angle + (Math.PI / 2));
        dx = -Math.sin(this.car_angle + this.wheel_angle + (Math.PI / 2));
        dot = (this.vel_x * dx + this.vel_y * dy);
        let right_x = dx * dot;
        let right_y = dy * dot;
        
        //console.log("x: " + forward_x + " y: " + forward_y);ws
        
        this.position.x += this.vel_x;
        this.position.z += this.vel_y;
        
        if(pressedKeys[32] /* space */) 
        {
            if(this.drift < 60)
            {
                this.drift += 60 * delta; 
            }
        }
        else
        {
            if(this.drift > 0)
            {
                this.drift -= 60 * delta; 
            }
            else
            {
                this.drift = 0;
            }
        }
        
        this.vel_x = forward_x + right_x * this.drift;
        this.vel_y = forward_y + right_y * this.drift;
        
        let drag_x = this.vel_x * this.vel_x;
        let drag_y = this.vel_y * this.vel_y;
        
        this.vel_x *= Math.min(drag_x * delta, delta * 1);
        this.vel_y *= Math.min(drag_y * delta, delta * 1);
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
    
    update_camera(car.position.x, car.position.y, car.position.z);
    
    
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
