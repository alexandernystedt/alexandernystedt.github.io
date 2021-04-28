const item_url = "/items/";

let items_data = [];

function load_items()
{
    load_single_item("test_item");
}

function load_single_item(name)
{
    let request = new XMLHttpRequest();
    request.open('GET', item_url + name + '.json');
    request.responseType = "json";
    request.send();
    request.onload = function()
    {
        const data = request.response;
        if(data == null)
        {
            console.log("Failed loading item.");
            return;            
        }
        
        if(data.name == null)
        {
            data.name = "unknown";
        }
        
        if(data.id == null)
        {
            data.id = -1;
        }
        
        if(data.desc == null)
        {
            data.desc = "no description yet";
        }
        
        if(data.weight == null)
        {
            data.weight = 0;
        }
        
        if(data.type == null)
        {
            data.type = "none";
        }
        else if(data.type == "engine")
        {
            if(data.horsepower == null)
            {
                data.horsepower = 0;
            }
        }
        
        items_data.push(data);
        console.log(data);
    }
}

class Item
{
    construct(name, id)
    {
        this.name = name;
        this.id = id;    
    }
}

class Inventory
{
    constructor()
    {
        this.num_items = 0;
        this.itmes = [];
    }
    
    add_item()
    {
        
    }
}

export default load_items;