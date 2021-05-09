import { delta } from "./delta.js";

const vertex_shader = `
uniform float pointMultiplier;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = pointMultiplier / gl_Position.w;
}`;

const fragment_shader = `
uniform sampler2D diffuseTexture;

void main() {
  gl_FragColor = texture2D(diffuseTexture, gl_PointCoord) * vec4(.8, .8, .8, 1);
}`;

class ParticleSystem
{
    constructor(scene, texture)
    {
        const uniforms = 
        {
            diffuseTexture: 
            {
                value: new THREE.TextureLoader().load(texture)
            },
            pointMultiplier:
            {
                value: window.innerHeight / (2 * Math.tan(0.5 * 60 * Math.PI / 180))
            }
        };
        
        this.material = new THREE.ShaderMaterial
        ({
            uniforms: uniforms,
            vertexShader: vertex_shader,
            fragmentShader: fragment_shader,
            blending: THREE.NormalBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });
        
        this.particles = [];
        
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new THREE.Float32BufferAttribute([]), 3));
        
        this.points = new THREE.Points(this.geometry, this.material);
        
        scene.add(this.points);
        
        this.add_particles();
        this.update_geometry();
    }
    
    add_particles()
    {
        for(let i = 0; i < 20; i++)
        {
            let life = Math.random() * 2;
            this.particles.push
            ({
                position: new THREE.Vector3
                (
                    (Math.random() * 2 - 1) * 1,
                    (Math.random() * 2 - 1) * 1 + 1,
                    (Math.random() * 2 - 1) * 1,
                ),
                
                velocity: new THREE.Vector3
                (
                    (Math.random() * 2 - 1),
                    (Math.random()),
                    (Math.random() * 2 - 1),
                ),
                
                life: life,
                start_life: life,
            });
            
            this.particles[i].velocity.normalize();
        }
    }
    
    update_geometry()
    {
        const positions = [];
        
        for(let p of this.particles)
        {
            positions.push(p.position.x, p.position.y, p.position.z);
        }
        
        this.geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        
        this.geometry.attributes.position.needsUpdate = true;
    }
    
    update_patricles(position)
    {
        for (let p of this.particles) 
        {
            p.life -= delta;
            
            const i = 1 - (p.life / p.start_life);
            
            p.position.x += p.velocity.x * delta;
            p.position.y += p.velocity.y * delta;
            p.position.z += p.velocity.z * delta;
            
            
            if(p.life < 0)
            {
                let life = Math.random() * 2;
                
                p.position.x = position.x;
                p.position.y = position.y;
                p.position.z = position.z;
                
                p.life = life;
                p.start_life = life;
            }
        }
        
        this.update_geometry();
    }
    
}

export default ParticleSystem;