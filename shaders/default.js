const vertex = 
`
varying vec2 v_uv;
varying vec3 v_normal;

void main()
{
    v_normal = normalMatrix * normal;
    v_uv = uv;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
`;

const fragment = 
`
varying vec2 v_uv;
varying vec3 v_normal;

uniform vec3 color;
uniform sampler2D color_texutre;

void main()
{
    vec3 col = texture2D(color_texutre, v_uv).rgb * color;
    
    float ramp = dot(v_normal, vec3(0, .75, .25));
    ramp = step(0., ramp);
    
    vec3 ambient_color = col * vec3(.8, .87, .93);
     
    gl_FragColor = vec4(col * ramp + ambient_color * (1. - ramp), 1.);
}
`;

function get_material(_texture)
{
    const uniforms = 
    {
        color_texutre: 
        {
            value: _texture
        },
        color:
        {
            value: new THREE.Color(0x7F7F7F)
        }
    }
    
    return new THREE.ShaderMaterial
    ({
        uniforms: uniforms,
        vertexShader: vertex,
        fragmentShader: fragment,
        blending: THREE.NormalBlending,
        depthTest: true,
        depthWrite: true,
        transparent: false,
        vertexColors: true
    });
}

export { get_material };
