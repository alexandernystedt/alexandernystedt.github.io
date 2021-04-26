const vertex = 
`
varying vec2 vUv;

void main()
{
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const fragment = 
`
void main()
`;

export default defaultShader;