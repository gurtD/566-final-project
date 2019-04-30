#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.
in vec4 vs_Transform0;
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;


out vec4 fs_Nor;
out vec4 fs_Col;
out vec4 fs_Pos;

void main()
{
    fs_Nor = vs_Nor;
    mat4 transform = mat4(vs_Transform0, vs_Transform1, vs_Transform2, vs_Transform3);

    mat4 translate = mat4(1.0);
    mat4 scale = mat4(1.0);
    scale[0][0] = transform[2][0];
    scale[1][1] = transform[3][0];

    translate[3][0] = transform[0][0];
    translate[3][1] = transform[1][0];
    
    vec3 uv = 0.5 * (vs_Pos.xyz + vec3(1.0));
    uv[0] = uv[0] / 88.0 + transform[1][1];
    uv[1] = 16.0 / 1104.0 - uv[1] / 69.0 + transform[2][1];
    fs_Pos = vec4(uv, 1.0);
    
    gl_Position = translate * scale * vs_Pos;
}
