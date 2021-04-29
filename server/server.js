const http = require("http");
const websocket_server = require("websocket").server;
const http_server = http.createServer();
http_server.listen(8080, () => console.log("Listening on 8080..."));

const max_clients = 5;

/* The computers that are connected to the server */
const clients = {};
/* The players connected with those clients/computers */
/* This is where the player info and data (position etc) lies */
let connected_players = [];

const ws_server = new websocket_server
({
    "httpServer": http_server
});

function add_player()
{
    
}

function disconnect_player(client_id)
{
    /* Removing the client */
    
    delete clients[client_id];
    
    connected_players.forEach((player, index) => 
    {
        if(player.client_id == client_id)
        {
            connected_players.splice(index, 1);
            console.log("Player disconnected!");
            return;
        }
    });
    
    console.log("Error disconnecting player, no data associated with the client");
}

ws_server.on("request", request => 
{
    const client_id = guid();
    
    const connection = request.accept(null, request.origin);
    connection.on("open", () => console.log("opened!"));
    connection.on("close", () => 
    {
        disconnect_player(client_id);
    });
    
    connection.on("message", message => 
    {
        /* Server has recived a message from the client */
        const response = JSON.parse(message.utf8Data);
        
        /* Update request */
        if(response.method === "join")
        {
            const packet = 
            {
                "method": "player_joined",
                "client_id": response.client_id
            };
            
            let ret_packet = {};
            ret_packet
            
            connected_players.forEach(player => 
            {
                ret_packet[player.client_id] = 
                {
                    x: player.x,
                    y: player.y,
                    z: player.z
                };
                
                clients[player.client_id].connection.send(JSON.stringify(packet));
            });
            
            /* Sending back the other players before the current client has been added to the players */
            
            
            /* Adding the new player */
            let player = 
            {
                "client_id": response.client_id,
                
                "x": 0,
                "y": 0,
                "z": 0
            };
            
            connected_players.push(player);
            
            console.log("Player " + response.client_id + " has joined the game");
        } 
        else if(response.method === "update")
        {
            console.log("Update from " + response.client_id);
            
            let player = null;
            connected_players.forEach(p => 
            {
                if(p.client_id === response.client_id)
                {
                    player = p;
                    //break;
                }
            });
            
            player.x = response.x;
            player.y = response.y;
            player.z = response.z;
            player.rot = response.rot;
            
            const pay_load = 
            {
                "method": "update_response",
                "client_id": client_id,
                "x": player.x,
                "y": player.y,
                "z": player.z,
                "rot": player.rot
            };
            
            connected_players.forEach(player => 
            {
                if(player.client_id !== response.client_id)
                {
                    clients[player.client_id].connection.send(JSON.stringify(pay_load));
                }
            });
        }
    });
    
    clients[client_id] = 
    {
        /* The client meta data */
        //name: "name",
        "connection": connection,
    };
    
    const pay_load = 
    {
        "method": "connect",
        "client_id": client_id
    };
    
    console.log("Connected client " + client_id);
    
    connection.send(JSON.stringify(pay_load));
});

/* GUID generation */
/* https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid */
function guid() 
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
    {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}
  