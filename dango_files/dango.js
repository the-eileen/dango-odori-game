// canvas and gl variables
var canvas;
var gl;

var dangoSphere;
var drawCube;

// various dango parameters
var index = 0;
var scaleFactor = 1;
var h = 0; // height of dango
var maxHeight = 5;
var minHeight = 0;
var minx = 0.5;
var squishFactors = vec2(1,1);
var miny = 0.5;
var maxx = 1;
var maxy = 1;
var cycle = 0;

var cos10 = Math.cos(radians(10));
var sin10 = Math.sin(radians(10));

// camera parameters
var aspect;
var near  = 0.1;
var far   = 100;
var fovy  = 45.0;

var yaw   = 0;
var theta = 0; // pitch

var scoot = 0; // x-position
var dist  = -5; // z-position
var jump  = 0; // y-position
var ypos = 0;

//control position of chopstick
var grab;
var grabPosition = 0;
var grabTime;
var time;
var firstMoment = true;

// holds vertices and normals and texCoords
var points  = [];
var normals = [];

var positions = [
    vec3( 1, jump, -5),
    vec3( 4, jump, -3),
    vec3(-4, jump, -4),
    vec3( 1, jump, -4),
    vec3(-2, jump, -3),
    vec3( 5, jump, -5),
    vec3(-2, jump, -2),
    vec3(-5, jump, -5),
    vec3( 1, jump, -4),
    vec3( 0, jump, -3)
];

// DANGO

var dangoToggle = [
    true,
    true,
    true,
    true,
    true
];

//color info for different colored dango
var dangoColor = [
    vec4( 0.588, 1,     0.71,  1.0 ), //green
    vec4( 0.682, 0.47,  0.776, 1.0 ), //purple
    vec4( 0.8,   0.462, 0.58,  1.0 ), //pink
    vec4( 0.423, 0.654, 0.8,   1.0 ), //blue
    vec4( 1,     1,     1,     1.0 ) //white
]

// holds color info
var colors = [
    vec4( 0.5, 0.5, 0.5, 1.0 ), // grey
    vec4( 0.9, 0.9, 0.9, 1.0 ), // almost white
    vec4( 1.0, 1.0, 1.0, 1.0 ), // white
    vec4( 0.0, 0.0, 0.0, 1.0 ), // black
    vec4( 1.0, 0.3, 0.3, 1.0 ) // red?
];

// camera parameters
var near  = 0.1;
var far   = 100;
var fovy  = 45.0;
var yaw   = 0;
var scoot = 0;
var dist  = -5;
var jump  = 0;
var aspect;


// ROOM
// cube vertices
var roomVertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// pushes cube vertices and texture coordinates
function quad(a, b, c, d) {
     points.push(roomVertices[a]);
     points.push(roomVertices[b]);
     points.push(roomVertices[c]);

     points.push(roomVertices[a]);
     points.push(roomVertices[c]);
     points.push(roomVertices[d]);
}

function colorCube() {
    quad( 1, 0, 3, 2 ); // front
    for(var i = 0; i < 6; i++)    
        normals.push(0,0,-1,0);

    quad( 2, 3, 7, 6 );
    for(var i = 0; i < 6; i++)    
        normals.push(-1,0,0,0);

    quad( 3, 0, 4, 7 );
    for(var i = 0; i < 6; i++)    
        normals.push(0,1,0,0);

    quad( 6, 5, 1, 2 );
    for(var i = 0; i < 6; i++)    
        normals.push(0,-1,0,0);
    
    quad( 4, 5, 6, 7 );
    for(var i = 0; i < 6; i++)    
        normals.push(0,0,1,0);

    quad( 5, 4, 0, 1 );
    for(var i = 0; i < 6; i++)    
        normals.push(1,0,0,0);
}

// light information
var lightPosition = vec4(0.0, 3.0, 0.0, 0.0 );
// holds information on light in this order: light ambient color, light diffuse color, and specular color
var lightArray = [
    vec4( 0.8, 0.8, 0.8, 1.0 ),
    vec4( 0.8, 0.8, 0.8, 1.0 ),
    vec4( 0.8, 0.8, 0.8, 1.0 )
];
materialShininess = 20;

var ambientColor, diffuseColor, specularColor;

// model view and projection matrix declarations and location declarations
var modelViewMatrix, projectionMatrix, squishMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, squishMatrixLoc;

// color product locations
var apLoc, dpLoc, spLoc, shininessLoc;

// calculates height of dango wrt time
function bounceHeight(t) {
    h = maxHeight*Math.pow((Math.sin(t/1000)), 2);
    return h;
}

// calculates scaling factors of dango wrt height
function squish(t) {
    var j = maxHeight*Math.pow(Math.sin(2*t/1000), 2);
    var my = maxHeight/(maxx - minx); //-4
    var mx = -my; //4
    var x = (j*.8 +mx)/mx; 
    var y = (j+my*miny)/my;
    return vec2(x, y);
}

function detectCollision(a, b, m) {
    avgRadius = (m[0] + m[1] + 1) / 6;
    var z = a[0] +b[0];
    console.log("chopstick y is at ", b[1]);
    console.log(Math.pow(z, 2));
    if ( ( Math.pow((a[0]+b[0]),2) + Math.pow((a[1]+b[1]),2) + Math.pow((a[2]+b[2]),2) ) <= Math.pow(avgRadius,2))
        return true;
    else return false;
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    aspect = canvas.width/canvas.height;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);


//Still need to implement restart
    document.getElementById("restart").onclick = function(){;};
 

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //colorCube();
    drawCube = new cube();
   //Create sphere to draw dango body and eyes
    dangoSphere = new sphere();



    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    tNormal = gl.getAttribLocation( program, "tNormal" );
    gl.vertexAttribPointer( tNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(tNormal);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    squishMatrixLoc = gl.getUniformLocation( program, "squishMatrix" );

    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );

    apLoc = gl.getUniformLocation( program, "ambientProduct");
    dpLoc = gl.getUniformLocation( program, "diffuseProduct");
    spLoc = gl.getUniformLocation( program, "specularProduct");
    gl.uniform1f( gl.getUniformLocation( program, "shininess" ), materialShininess );

    

    // handle key commands
    document.onkeydown = handleKeyDown;

    //handle clicks
    document.getElementById("restart").onclick = function(){
        dist = -5;
        scoot = 0;
        jump = 0;
        fovy = 45;
        yaw = 0;
    }

    render();
}

function handleKeyDown(event) {
    if (event.keyCode == 37) {
        //Left Arrow Key - heading
        yaw -= 1;
    } else if (event.keyCode == 38) {
        //Up Arrow Key - position of camera along y-axis
        jump -= 0.25;
    } else if (event.keyCode == 39) {
        //Right Arrow Key - heading
        yaw += 1;
    } else if (event.keyCode == 40) {
        //Down Arrow Key - position of camera along y-axis
        jump += 0.25;
    } else if (event.keyCode == 87) {
        // W key - forward
        dist += 0.25;
        if(dist > 8)
             dist = 8;
    } else if (event.keyCode == 65) {
        // A key - left
        scoot += 0.25;
        if(scoot > 9.4)
            scoot = 9.4;
    } else if (event.keyCode == 68) {
        // D key - right
        scoot -= 0.25;
        if(scoot < -9.9)
            scoot = -9.9;
    } else if (event.keyCode == 83) {
        // S key - backward
        dist -= 0.25;
         if(dist < -10)
             dist = -9.9;
    } else if (event.keyCode == 78) {
        // n key - narrow
        fovy *= 0.9;
    } else if (event.keyCode == 87) {
        // w key - widen
        fovy *= 1.1;
    } else if (event.keyCode == 82) {
        // r key - reset view settings
        dist = -5;
        scoot = 0;
        jump = 0;
        fovy = 45;
        yaw = 0;
    }
    else if( event.keyCode == 32){
        //grab dango if press spacebar
        grab = true;
    }
}



function render(t) {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // build projection matrix
    projectionMatrix = perspective(fovy, aspect, near, far);
    projectionMatrix = mult(projectionMatrix, rotate(yaw, [0,1,0]));
    projectionMatrix = mult(projectionMatrix, translate(scoot, -2, dist));
    projectionMatrix = mult(projectionMatrix, rotate(theta, [1,0,0]));
    // send projection matrix to html file
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );

    //all the dangos will be bouncing at the same time in the same motion.
    jump = bounceHeight(t);
    squishFactors = squish(t);
    squishMatrix = scale(squishFactors[0], squishFactors[1], 1);
    gl.uniformMatrix4fv(squishMatrixLoc, false, flatten(squishMatrix));
    modelViewMatrix = mult(translate(0,jump,0), mat4());

currentPos = vec3(scoot - grabPosition*sin10, 0, dist + grabPosition*cos10 + 3.9);


//draw the dango bodies
for(var i = cycle; i < cycle + 1; i++){
    //set the model view matrix
    if (dangoToggle[i]) {
        //positions[i] = positions[i] + vec3(0, jump, 0);
       var dangoPos = mult(modelViewMatrix,translate(positions[i]));
        if (detectCollision(currentPos, positions[i], squishFactors)){
            dangoColor[i] = vec4(Math.random(), Math.random(), Math.random(), 1);
            //dangoToggle[i] = false;


        }
    } else {
        //positions[i+5] = positions[i+5] + vec3(0, jump, 0);
        var dangoPos = mult(modelViewMatrix,translate(positions[i+5]));
        if (detectCollision(currentPos, positions[i+5], squishMatrix))
            dangoToggle[i] = true;
}

    // set colors
    ambientProduct  = mult(lightArray[0], dangoColor[i]);
    diffuseProduct  = mult(lightArray[1], colors[2]);
    specularProduct = vec4(0,0,0,0);


    dangoSphere.draw(dangoPos);
 
    }

   // set colors of eyes to black
    ambientProduct  = mult(lightArray[0], colors[3]);
    diffuseProduct  = mult(lightArray[1], colors[3]);

       //draw eyes of the dangos
    for(var k = 0; k < 1; k++){
        //set the location of the eyes 
        var eyePos;
        if(dangoToggle[k]) {
            eyePos = mult(translate(positions[k]), modelViewMatrix);
        }
        else {
            eyePos = mult(translate(positions[k+5]), modelViewMatrix);
        }
    
    
        var eye1 = eyePos;
        eye1 = mult(eye1, translate(-.1, 0, .5));
        eye1 = mult(eye1, scale(0.04, 0.3, .6));
        dangoSphere.draw(eye1);

        var eye2 = eyePos;
        eye2 = mult(eye2, translate(.1, 0, 0.5));
        eye2 = mult(eye2, scale(0.04, 0.3, .6));
        dangoSphere.draw(eye2);
    }

  // set colors of room
    ambientProduct  = mult(lightArray[0], colors[0]);
    diffuseProduct  = mult(lightArray[1], colors[2]);
    specularProduct = vec4(0,0,0,0);

    squishMatrix = mat4();
    squishMatrix = mult(squishMatrix, scale(20, 10, 20));
  // build model view matrix
    modelViewMatrix = translate(0, 4.5,0);
    drawCube.draw(modelViewMatrix);


    // CHOPSTICKS
     // set colors 
    ambientProduct  = mult(lightArray[0], colors[3]);
    diffuseProduct  = mult(lightArray[1], colors[3]);
    specularProduct = vec4(0, 0, 0, 0);

    if(grab == true)
    {
        if (firstMoment) {
            grabTime = t;
            firstMoment = false;
            time = 0;
        } else
            time = t - grabTime;

        if (time < 500)
            grabPosition += 0.05;
        else if (time > 500)
            grabPosition -= 0.05;
    }
    squishMatrix = scale(0.05, 0.05, 4);
    if( time != 0 && grabPosition <= 0)
    {
        grab = false;
        firstMoment = true;
        grabPosition = 0;
    }
    projectionMatrix = perspective(fovy, aspect, near, far);

    modelViewMatrix = mult(rotate(-10, [0, 1, 0]),translate(-0.5, 0, 0.5 - grabPosition));
    drawCube.draw(modelViewMatrix);  

    modelViewMatrix = mult(translate(0, -0.1, 0), modelViewMatrix);
    drawCube.draw(modelViewMatrix);

    window.requestAnimFrame(render);
}
