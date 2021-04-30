import load_items from "./inventory.js";
import check_lines from "./physics.js";
import { connect_to_server, request_server_update } from "./client/client.js";
import { setup_renderer, update_camera, update_car_mesh, render } from "./renderer.js";

setup_renderer();

//connect_to_server();


load_items();

const degrees_to_radians = 0.0174532925;
const acceleration = .5;
const break_speed = 10; 
var speedometer = document.getElementById("speedometer");
let camera_type = false;

var standard_drift_slider = document.getElementById("drifting_value");
var standard_drift_slider_display = document.getElementById("drifting_value_display");
var space_pressed_drift_slider = document.getElementById("space_drifting_value");
var space_pressed_drift_slider_display = document.getElementById("space_drifting_value_display");
let standard_drift = .6;
let space_pressed_drift = 1;

standard_drift_slider.oninput = (() => 
{
    standard_drift = standard_drift_slider.value / 100;
    standard_drift_slider_display.innerHTML = standard_drift_slider.value + "%";
});

space_pressed_drift_slider.oninput = (() => 
{
    space_pressed_drift = space_pressed_drift_slider.value / 100;
    space_pressed_drift_slider_display.innerHTML = space_pressed_drift_slider.value + "%";
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
        this.update_values();
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
            this.acceleration = 1;
            /*if(this.acceleration < 1)
            {
                this.acceleration += delta * (1 - this.acceleration) * 1;
            }*/
            
            //this.car_angle -= this.wheel_angle
        }
        
        if(pressedKeys[83] /* s */)
        {
            this.acceleration = -1;
            /*if(this.acceleration > 0)
            {
                this.acceleration -= delta;
            }
            else if(this.acceleration > -1)
            {
                this.acceleration -= delta * (1 - Math.abs(this.acceleration));
            }*/
            
            //this.car_angle += this.wheel_angle
        }
        
        if(!pressedKeys[87] && !pressedKeys[83] /*&& !pressedKeys[32]*/)
        {
            this.acceleration = 0;
            /*if(this.acceleration < .05 && this.acceleration > -.05) { this.acceleration = 0 };
            
            if(this.acceleration > 0)
            {
                this.acceleration -= delta * .5;
            }
            else if(this.acceleration < 0)
            {
                this.acceleration += delta * .5;
            }*/
        }
        
        this.vel_x += dx * this.acceleration * acceleration;// * this.speed;
        this.vel_y += dy * this.acceleration * acceleration;// * this.speed;
        
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
        
        let drift = (space_pressed_drift * this.drift + (standard_drift * (1 - this.drift)));
        this.vel_x = forward_vel_x + right_vel_x * drift;
        this.vel_y = forward_vel_y + right_vel_y * drift;
        
        let vel_magnitude = Math.sqrt(Math.abs(this.vel_x * this.vel_x + this.vel_y * this.vel_y));
        let forward_magnitude = Math.sqrt(Math.abs(forward_vel_x * forward_vel_x + forward_vel_y * forward_vel_y));
        
        if(forward_magnitude > .1) 
        {
            this.car_angle -= this.wheel_angle * Math.min(Math.max(forward_magnitude, 0), 1);
        }
        
        speedometer.innerHTML = Math.round(vel_magnitude * 3.6);
        
        this.position.x += this.vel_x * delta;
        this.position.z += this.vel_y * delta;
        
        if(acceleration > .1)
        
        if(forward_magnitude > this.speed)
        {
            this.vel_x *= .991;
            this.vel_y *= .991;
        }
        else
        {
            this.vel_x *= .995;
            this.vel_y *= .995;
        }
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
    
    if(pressedKeys[49]) camera_type = true;
    update_camera(car.position.x, car.position.y, car.position.z, car.car_angle + Math.PI, camera_type);
    
    
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
