//import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/OBJLoader.js';
import { get_material } from '../shaders/default.js';

let other_players = {};

var car_has_loaded = false;
var car_obj = null;
var camera = null;
var scene = null;
var renderer = null;
var objLoader = new THREE.OBJLoader();

function setup_renderer()
{
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.3, 1000);
    
    renderer = new THREE.WebGLRenderer();
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
    texture.repeat.set(100, 100);
    
    const texture2 = new THREE.TextureLoader().load("res/colors.png");
    
    var plane = new THREE.Mesh
    (
        new THREE.PlaneGeometry(1000, 1000, 10, 10),
        new THREE.MeshBasicMaterial
        ({
            //color: 0xFF0000,ss
            map: texture,
        })
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    
    objLoader.setPath('/res/');
    objLoader.load('911.obj', function (object) 
    {
    	car_has_loaded = true;
    
    	car_obj = object;
    
    	var material = get_material(texture2);
        
    	object.traverse( function ( child ) {
        
            if ( child instanceof THREE.Mesh ) {
            
                child.material = material;
            
            }
        
        } );
    
    	object.position.y = 1;
    
        scene.add(object);
    });
    
    objLoader.load('showcase.obj', function (object) 
    {
    	var material = get_material(texture2);
        
    	object.traverse( function ( child ) {
        
            if ( child instanceof THREE.Mesh ) {
            
                child.material = material;
            
            }
        
        } );
    
    	object.position.y = 1;
    
        scene.add(object);
    });
}

function render()
{
    renderer.render(scene, camera);
}

function set_camera(x, y, z, rot)
{
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    
    camera.rotation.x = rot;
}

function update_camera(x, y, z, rot, type)
{
    if(type)
    {
        let dx = -Math.sin(rot);
        let dz = -Math.cos(rot);
        
        camera.position.x = camera.position.x * .9 + (x + dx * 30) * .1;//camera.position.x * .9 + (x) * .1;
        camera.position.z = camera.position.z * .9 + (z + dz * 30) * .1;//camera.position.z * .9 + (z + 20) * .1;
        
        camera.lookAt(x, y, z);
    }
    else
    {
        camera.position.x = camera.position.x * .9 + (x) * .1;
        camera.position.y = y;
        camera.position.z = camera.position.z * .9 + (z + 20) * .1;
        
        camera.rotation.x = -Math.PI / 4;
    }
}

function update_car_mesh(x, y, z, rot)
{
    if(car_has_loaded)
	{
        car_obj.position.x = x;
        car_obj.position.y = y;
	    car_obj.position.z = z;
	    car_obj.rotation.y = rot + (Math.PI);
    }
}

function update_player_pos(id, x, y, z, rot)
{
    if(Object.keys(other_players).indexOf(id) === -1 )
    {
        /* New client */
        other_players[id] = new THREE.Mesh
        (
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial
            ({
                color: 0xFF0000
            })
        );
        
        scene.add(other_players[id]);
    }
    
    other_players[id].position.x = other_players[id].position.x * .2 + x * .8;
    other_players[id].position.y = 1;
    other_players[id].position.z = other_players[id].position.z * .2 + z * .8;
}

function add_player_mesh()
{
    let new_player = {};
    objLoader.load('golf.obj', function (object) 
    {
    	car_has_loaded = true;
    
    	new_player.mesh = object;
    
    	var material = new THREE.MeshBasicMaterial
    	({
    		color: 0xFF00FF,
    		//map: texture2,
    	});
    	object.traverse( function ( child ) {
        
            if ( child instanceof THREE.Mesh ) {
            
                child.material = material;
            
            }
        
        } );
    
    	object.position.y = 1;
    
        scene.add(object);
    });
    
    other_players.push(new_player);
    return other_players.length - 1;
}

export { scene, setup_renderer, update_camera, update_car_mesh, render, add_player_mesh, update_player_pos, set_camera };