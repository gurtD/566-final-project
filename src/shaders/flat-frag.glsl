#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float random1( vec3 p , vec3 seed) {
  return fract(sin(dot(p + seed, vec3(987.654, 123.456, 531.975))) * 85734.3545);
}

vec2 random2( vec2 p , vec2 seed) {
  return fract(sin(vec2(dot(p + seed, vec2(311.7, 127.1)), dot(p + seed, vec2(269.5, 183.3)))) * 85734.3545);
}



float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float fbm (vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    for (int i = 0; i < 8; i++) {
        value += amplitude * noise(st);
        st *= 2.;
        amplitude *= .5;
    }
    return value;
}

vec4 checker2D(vec2 texc, vec4 color0, vec4 color1)
{
  if ((int(floor(texc.x) + floor(texc.y)) & 1) == 0)
    return color0;
  else
    return color1;
}

vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d )
{
    return a + b*cos( 6.28318*(c*t+d) );
}


void main() {
  vec2 pos = mod(gl_FragCoord.xy,vec2(100000));
  vec3 red = vec3(1.0, 0.0, 0.0);
  vec3 blue = vec3(66.0 / 255.0, 131.0 / 255.0, 244.0 / 255.0);
  vec3 orange = vec3(252.0 / 255.0, 151.0 / 255.0, 27.0 / 255.0);
  vec3 green = vec3(56.0 / 255.0, 188.0 / 255.0, 41.0 / 255.0);

  vec4 color1;
  vec4 color2;

  //float fbm1 = fbm((pos.y + 1.0) / 2.0, (pos.x+ 1.0)/ 2.0)  + 0.24;
  //float fbm2 = fbm((pos.x + 1.0) / 2.0, (pos.y+ 1.0)/ 2.0)  + 0.24;


  //float fbm1 = fbm(mod(u_Time / 70.0, 100.0), mod(u_Time / 70.0, 100.0)) - 0.1;
  //float fbm2 = fbm(mod(u_Time / 70.0, 100.0), mod(u_Time / 70.0, 100.0)) - 0.1;
  
  /*
  if (fbm1 < 0.25) {
    color1 = white;
  } else if (fbm1 < 0.5) {
    color1 = blue;
  } else if (fbm1 < 0.75) {
    color1 = orange;
  } else {
    color1 = green;
  }

  if (fbm1 < 0.25) {
    color2 = green;
  } else if (fbm2 < 0.5) {
    color2 = orange;
  } else if (fbm2 < 0.75) {
    color2 = blue;
  } else {
    color2 = white;
  }
  */

  
  
  //out_Col = checker2D(10.0 * fs_Pos, color1, color2);
  //float fbm = fbm(fs_Pos);
  //out_Col = fbm * vec4(1.0, 1.0, 1.0, 1.0);

  vec2 st = fs_Pos;
  st.x *= 400.0/1000.0;

  vec3 color = vec3(0.0);
  color += fbm(st*6.0);
  //out_Col = vec4(color,1.0);


  vec3 col = palette(sin(u_Time/ 70.0), red, blue, orange, green);


  out_Col = vec4(fbm(st*6.0) * 0.5 * col, 1.0);

}
