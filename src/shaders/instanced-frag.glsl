#version 300 es
precision highp float;

uniform sampler2D u_NoiseTex1, u_NoiseTex2, u_FlameTex;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec4 fs_Nor;
out vec4 out_Col;

void main()
{
    vec2 uv = fs_Pos.xy;
    vec4 sampledTexture = texture(u_FlameTex, uv);
    out_Col = sampledTexture;

}
