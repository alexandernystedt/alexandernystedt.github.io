function load_game()
{
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    document.addEventListener("keydown", key_event);
    setInterval(game_update, 1000/30); /* Updates 30 times per second */
}

function game_update()
{
    /* Update here */
    
    /* Drawing after the update */
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
}

function key_event(event)
{
    switch(event.keyCode)
    {
        
    }
}