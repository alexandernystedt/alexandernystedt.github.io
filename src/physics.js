/* 2D physics top down */

function dot(x, y, x1, y1)
{
    return (x * x1 + y * y1);
}

function squared_length(x, y)
{
    return dot(x, y, x, y);
}

class OBB2D 
{
    constructor(center_x, center_y, width, height, angle)
    {
        this.angle = angle;
        
        this.corners = 
        [ 
            0, 0, 
            0, 0, 
            0, 0,  
            0, 0 
        ];
        
        this.axis = 
        [
            0, 0,
            0, 0
        ];
        
        this.origin = [ 0, 0 ];
        
        let x1 = Math.cos(angle);
        let x2 = Math.sin(angle);
        let y1 = -x2;
        let y2 = x1;
    
        width /= 2;
        height /= 2;
        x1 *= width;
        x2 *= width;
        y1 *= height;
        y2 *= height;
    
        this.corners[0] = center_x - x1 - y1;
        this.corners[1] = center_y - x2 - y2;
        
        this.corners[2] = center_x + x1 - y1;
        this.corners[3] = center_y + x2 - y2;
        
        this.corners[4] = center_x + x1 + y1;
        this.corners[5] = center_y + x2 + y2;
        
        this.corners[6] = center_x - x1 + y1;
        this.corners[7] = center_y - x2 + y2;
        
        this.compute_axes();
    }
    
    overlaps1way(other)
    {
        for(let a = 0; a < 2; a++)
        {
            let t = dot(other.corners[0], other.corners[1], this.axis[a * 2], this.axis[a * 2 + 1]);
            
            let tmin = t;
            let tmax = t;
            
            for(let c = 1; c < 4; c++)
            {
                t = dot(other.corners[c * 2], other.corners[c * 2 + 1], this.axis[a * 2], this.axis[a * 2 + 1]);
                
                if(t < tmin)
                {
                    tmin = t;
                }
                else if(t > tmax)
                {
                    tmax = t;
                }
            }
            
            if((tmin > 1 + this.origin[a]) || (tmax < this.origin[a]))
            {
                return false;
            }
        }
        
        return true;
    }
    
    compute_axes()
    {
        this.axis[0] = this.corners[2] - this.corners[0];
        this.axis[1] = this.corners[3] - this.corners[1];
        this.axis[2] = this.corners[6] - this.corners[0];
        this.axis[3] = this.corners[7] - this.corners[1];
        
        for(let a = 0; a < 2; a++)
        {
            let vec_len = squared_length(this.axis[a * 2 + 0], this.axis[a * 2 + 1]);
            this.axis[a * 2 + 0] /= vec_len;
            this.axis[a * 2 + 1] /= vec_len;
            
            this.origin[a] = dot(this.corners[0], this.corners[1], this.axis[a * 2], this.axis[a * 2 + 1]);
            
        }
    }
    
    overlaps(other)
    {
        return this.overlaps1way(other) && other.overlaps1way(this);
    }
    
    move_to(x, y)
    {
        let x1 = (this.corners[0] + this.corners[2] + this.corners[4] + this.corners[6]) / 4;
        let y1 = (this.corners[1] + this.corners[3] + this.corners[5] + this.corners[7]) / 4;
        
        x -= x1;
        y -= y1;
        
        for(let c = 0; c < 4; c++)
        {
            this.corners[c * 2] += x;
            this.corners[c * 2 + 1] += y;
        }
        
        this.compute_axes();
    }
    };

export { OBB2D };