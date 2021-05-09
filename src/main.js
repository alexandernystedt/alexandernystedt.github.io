import load_items from "./inventory.js";
import { connect_to_server, request_server_update, host_game, join_game, leave_game, current_game } from "./client/client.js";
import { scene, setup_renderer, update_camera, update_car_mesh, render, set_camera } from "./renderer.js";
import ParticleSystem from "./particles.js";
import { delta, update_delta } from "./delta.js";

setup_renderer();

let system = new ParticleSystem(scene, "res/smoke.png");

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


let join = document.getElementById("join");
let host = document.getElementById("host");
//let leave = document.getElementById("leave");
let code = document.getElementById("code");

var join_panel = document.getElementById("join-panel");
join_panel.style.visibility = "hidden";
var join_panel_close = document.getElementById("join-panel-close");
var join_panel_accept = document.getElementById("join-panel-accept");
var join_panel_cancel = document.getElementById("join-panel-cancel");

let current_game_display = document.getElementById("current-game");

join.addEventListener("click", () =>
{
    join_panel.style.visibility = "visible";
}); 

host.addEventListener("click", () =>
{
    host_game();
}); 

/*leave.addEventListener("click", () =>
{
    console.log("Leaving game...");
    leave_game();
}); */

join_panel_close.addEventListener("click", () =>
{
    /* Disable the panel when the (x) button is pressed */
    join_panel.style.visibility = "hidden";
}); 

join_panel_accept.addEventListener("click", () =>
{
    console.log("Joining game " + code.value + "...");
    join_game(code.value);
    /* TODO: Display something if the lobby doesnt exist */
    join_panel.style.visibility = "hidden";
}); 

join_panel_cancel.addEventListener("click", () =>
{
    join_panel.style.visibility = "hidden";
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

function game_update()
{
    if(current_game != null)
    {
        update_delta();
        
        /* Update here */
        car.update();
        
        update_car_mesh(car.position.x, car.position.y + 1, car.position.z, car.car_angle);
        
        //if(pressedKeys[49]) camera_type = true;
        update_camera(car.position.x, car.position.y + 18, car.position.z, car.car_angle + Math.PI, camera_type);
        
        
        system.update_patricles(car.position);
        
    }
    else
    {
        set_camera(0, 7.5, 10, -33.75 * degrees_to_radians);
        update_car_mesh(0, 2, 0, Date.now() / 1000);
    }
    /* Drawing here */
    render();
}

function update_server()
{
    if(current_game != null)
    {
        current_game_display.innerHTML = "Current game: " + current_game;
        request_server_update(car.position.x, car.position.y, car.position.z, car.car_angle);
    }
    else
    {
        current_game_display.innerHTML = "Current game: none";
    }   
}

/* https://stackoverflow.com/questions/1828613/check-if-a-key-is-down */
var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }