//import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/OBJLoader.js';

let other_players = [];

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
    texture.repeat.set(999999, 999999);
    
    const texture2 = new THREE.TextureLoader().load("res/colors.png");
    
    var plane = new THREE.Mesh
    (
        new THREE.PlaneGeometry(9999999, 9999999, 10, 10),
        new THREE.MeshBasicMaterial
        ({
            //color: 0xFF0000,ss
            map: texture,
        })
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
    
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
}

function render()
{
    renderer.render(scene, camera);
}

function update_camera(x, y, z)
{
    camera.position.x = x;//camera.position.x * .9 + (x) * .1;
    camera.position.z = z + 20;//camera.position.z * .9 + (z + 20) * .1;
}

function update_car_mesh(x, y, z, rot)
{
    if(car_has_loaded)
	{
        car_obj.position.x = x;
        //car_obj.position.y = y;
	    car_obj.position.z = z;
	    car_obj.rotation.y = rot + (Math.PI);
    }
}

function update_player_pos(index, x, y, z, rot)
{
    other_players[index].mesh.position.x = x;
    //other_players[index].mesh.position.y = y;
    other_players[index].mesh.position.z = z;
    other_players[index].mesh.rotation.y = rot + Math.PI;
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

export { setup_renderer, update_camera, update_car_mesh, render, add_player_mesh, update_player_pos };
