
function cube()
{
	

    this.points = [];
    this.normals = [];
    this.indices = [];
        

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
	this.quad = function(a, b, c, d) {
     this.points.push(self.roomVertices[a]);
     this.points.push(roomVertices[b]);
     this.points.push(roomVertices[c]);

     this.points.push(roomVertices[a]);
     this.points.push(roomVertices[c]);
     this.points.push(roomVertices[d]);
}


this.populate_vertices = (function(self) {
    self.quad( 1, 0, 3, 2 );
    for(var i =0; i <6; i++)    
        self.normals.push(0,0,-1,0);
    self.quad(2, 3, 7, 6 );

    for(var i =0; i <6; i++)    
        self.normals.push(-1,0,0,0);
    self.quad( 3, 0, 4, 7 );

    for(var i =0; i <6; i++)    
        self.normals.push(0,1,0,0);
    self.quad( 6, 5, 1, 2 );

    for(var i =0; i <6; i++)    
        self.normals.push(0,-1,0,0);
    
    self.quad( 4, 5, 6, 7 );
    
    for(var i =0; i <6; i++)    
        self.normals.push(0,0,1,0);
    self.quad( 5, 4, 0, 1 );

    for(var i =0; i <6; i++)    
       self.normals.push(1,0,0,0);
    
})(this);

	

	this.init_buffers = ( function (self)
		{
			self.position_buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, self.position_buffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(self.points), gl.STATIC_DRAW);	
			
			self.true_normal_buffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, self.true_normal_buffer);
			gl.bufferData( gl.ARRAY_BUFFER, flatten(self.normals), gl.STATIC_DRAW );
			
		}
		)(this);
	
	this.update_uniforms = function(model_transform)
	{		

    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(squishMatrixLoc, false, flatten(squishMatrix));

    gl.uniform4fv( apLoc, flatten(ambientProduct) );
    gl.uniform4fv( dpLoc, flatten(diffuseProduct) );
    gl.uniform4fv( spLoc, flatten(specularProduct) );

	}


	this.draw = function(model_transform)
	{		
		this.update_uniforms(model_transform);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.position_buffer);
		gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.true_normal_buffer );
		gl.vertexAttribPointer( tNormal, 4, gl.FLOAT, false, 0, 0 );
		
		gl.drawArrays( gl.TRIANGLES, 0, this.points.length );
	}
}