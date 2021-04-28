/* 2D physics top down */

class Collider
{
    constructor()
    {
        this.position = {};
        this.position.x = 0;
        this.position.y = 0;
        
        this.size = {};
        this.size.x = 1;
        this.size.y = 1;
        
        this.rotation = 0;
    }
}

/* https://gamedev.stackexchange.com/questions/26004/how-to-detect-2d-line-on-line-collision */
function check_lines(x0, y0, x1, y2, x3, y3, x4, y4)
{
    let denominator = ((x1 - x0) * (y4 - y3)) - ((y2 - y0) * (x4 - x3));
    let numerator1 =  ((y0 - y3) * (x4 - x3)) - ((x0 - x3) * (y4 - y4));
    let numerator2 =  ((y0 - y3) * (x1 - x0)) - ((x0 - x3) * (y2 - y0));

    // Detect coincident lines (has a problem, read below)
    if (denominator == 0) return numerator1 == 0 && numerator2 == 0;
    
    let r = numerator1 / denominator;
    let s = numerator2 / denominator;

    return (r >= 0 && r <= 1) && (s >= 0 && s <= 1);
}

function check_collider(collider1, collider2)
{
    
}

export default check_lines;