import { add_player_mesh, update_player_pos } from "../renderer.js";

let client_id = null; 
let ws = null;

let connected = false;

let other_player_index = [];

function connect_to_server()
{
    /* Connecting to the server */
    ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = message => 
    {
        const response = JSON.parse(message.data);
        //console.log(response);
        
        if(response.method === "connect")
        {
            client_id = response.client_id;
            
            /* Respondig to say that we are connected */
            const pay_load = 
            {
                "method": "join",
                "client_id": client_id
            }
            ws.send(JSON.stringify(pay_load));
            
            connected = true;
            //setInterval(request_server_update, 1000/1); /* Update 1 times per second */ 
            
            console.log("Welcome, client id: " + client_id);
        }
        else if(response.method === "player_joined")
        {
            /* Another player has joined */
            console.log("Player " + response.client_id + " has joined the game");
        
            let index = add_player_mesh();
            other_player_index.push(index);
        }
        else if(response.method === "update_response")
        {
            console.log(response);
            update_player_pos(0, response.x, response.y, response.z, response.rot);
        }
    };
}

function request_server_update(x, y, z, rot)
{
    if(!connected) return;
    
    const pay_load = 
    {
        "method": "update",
        "client_id": client_id,
        "x": x,
        "y": y,
        "z": z,
        "rot": rot,
    }
    
    ws.send(JSON.stringify(pay_load));
}

export { connect_to_server, request_server_update };