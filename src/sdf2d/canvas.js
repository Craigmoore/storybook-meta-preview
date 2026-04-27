const VERT = `#version 300 es
in vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

export function sdfCanvas(fragSrc, { size = 512, animate = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    canvas.style.cssText = 'background:#f00;width:512px;height:512px';
    canvas.title = 'WebGL2 not available';
    return canvas;
  }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader error:\n' + gl.getShaderInfoLog(s));
      console.error(src);
      return null;
    }
    return s;
  };

  const vert = compile(gl.VERTEX_SHADER, VERT);
  const frag = compile(gl.FRAGMENT_SHADER, fragSrc);
  if (!vert || !frag) return canvas;

  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('Program link error:\n' + gl.getProgramInfoLog(prog));
    return canvas;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const posLoc  = gl.getAttribLocation(prog, 'a_pos');
  const resLoc  = gl.getUniformLocation(prog, 'u_res');
  const timeLoc = gl.getUniformLocation(prog, 'u_time');

  gl.useProgram(prog);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  gl.uniform2f(resLoc, size, size);

  let t0 = null;
  let raf = null;

  const draw = (ts) => {
    if (t0 === null) t0 = ts;
    gl.uniform1f(timeLoc, (ts - t0) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (animate) raf = requestAnimationFrame(draw);
  };

  if (animate) {
    raf = requestAnimationFrame(draw);
  } else {
    gl.uniform1f(timeLoc, 0.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  const obs = new MutationObserver(() => {
    if (!canvas.isConnected && raf) {
      cancelAnimationFrame(raf);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return canvas;
}
