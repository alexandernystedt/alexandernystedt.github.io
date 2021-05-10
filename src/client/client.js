import { add_player_mesh, update_player_pos } from "../renderer.js";

let client_id = null; 
let ws = null;

let connected = false;

let current_game = null;

let clients = {};

function host_game()
{
    const packet = 
    {
        method: "host_game",
        client_id: client_id
    }
    
    ws.send(JSON.stringify(packet));
}

function join_game(code)
{
    const packet = 
    {
        method: "join_game",
        client_id: client_id,
        
        code: code
    }
    
    ws.send(JSON.stringify(packet));
}

function leave_game()
{
    const packet = 
    {
        method: "leave_game",
        client_id: client_id,
    }
    
    ws.send(JSON.stringify(packet));
}

function connect_to_server()
{
    /* Connecting to the server */
    ws = new WebSocket("wss://192.168.8.100:8080");
    ws.onmessage = message => 
    {
        const response = JSON.parse(message.data);
        //console.log(response);
        
        if(response.method === "connect")
        {
            /* Saving the client ID, for verfication in the future */
            client_id = response.client_id;
            
            console.log("Successfully connected to server client ID: " + client_id);
            connected = true;
        }
        else if(response.method === "update_response")
        {
            
            if(Object.keys(clients).indexOf(response.client_id) === -1 )
            {
                /* New client */
                clients[response.client_id] = 
                {
                    position: response.position,
                    rot: response.rot,
                    score: 0
                }
                
                console.log(response.client_id + " has joined your lobby");
            }
            else
            {
                clients[response.client_id].position = response.position;
                clients[response.client_id].rot = response.rot;
            }
            
            /* Get the data and use it */
            let position = clients[response.client_id].position;
            //console.log(response.client_id + " : x: " + position.x + ", y:" + position.y + ", z:" + position.z);
            
            update_player_pos(response.client_id, position.x, position.y, position.z, clients[response.client_id].rot);
        }
        else if(response.method === "game_created")
        {
            if(response.code != null)
            {
                console.log("You are the host of game " + response.code);
                current_game = response.code;
            }
            else
            {
                console.log("Failed creating new game, server full");
            }
        }
        else if(response.method === "game_joined")
        {
            console.log("You have joined the game " + response.code);
            current_game = response.code;
        }
        else if(response.method === "game_left")
        {
            console.log("You have left the game");
            current_game = null;
        }
        else if(response.method === "player_left")
        {
            console.log("Player " + response.client_id + " has left the lobby");
            
            if(Object.keys(clients).indexOf(response.client_id) === -1)
            {
                delete clients[response.client_id];
            }
        }
    };
}

function request_server_update(x, y, z, rot)
{
    if(!connected) return;
    
    const pay_load = 
    {
        method: "update",
        client_id: client_id,
        
        position: 
        {
            x: x,
            y: y,
            z: z
        },
        
        rot: rot,
    }
    
    ws.send(JSON.stringify(pay_load));
}

function update_scoreboard()
{
    for(const player in clients)
    {
        //clients[player]
    }
}

export { connect_to_server, request_server_update, host_game, join_game, leave_game, current_game };
