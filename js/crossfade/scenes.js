function generateGeometry( objectType, numObjects ) {

	var geometry = new THREE.Geometry();

	function applyVertexColors( g, c ) {

		g.faces.forEach( function( f ) {

			var n = ( f instanceof THREE.Face3 ) ? 3 : 4;

			for ( var j = 0; j < n; j ++ ) {

				f.vertexColors[ j ] = c;

			}

		} );

	}

	for ( var i = 0; i < numObjects; i ++ ) {

		var position = new THREE.Vector3();

		position.x = Math.random() * 10000 - 5000;
		position.y = Math.random() * 6000 - 3000;
		position.z = Math.random() * 8000 - 4000;

		var rotation = new THREE.Euler();

		rotation.x = Math.random() * 2 * Math.PI;
		rotation.y = Math.random() * 2 * Math.PI;
		rotation.z = Math.random() * 2 * Math.PI;

		var scale = new THREE.Vector3();

		var geom, color = new THREE.Color();

		scale.x = Math.random() * 200 + 100;

		if ( objectType == "cube" ) {

			geom = new THREE.BoxGeometry( 1, 1, 1 );
			scale.y = Math.random() * 200 + 100;
			scale.z = Math.random() * 200 + 100;
			color.setRGB( 0, 0, Math.random() + 0.1 );

		} else if ( objectType == "sphere" ) {

			geom = new THREE.IcosahedronGeometry( 1, 1 );
			scale.y = scale.z = scale.x;
			color.setRGB( Math.random() + 0.1, 0, 0 );

		}

		// give the geom's vertices a random color, to be displayed
		applyVertexColors( geom, color );

		var mesh = new THREE.Mesh( geom );
		mesh.position.copy( position );
		mesh.rotation.copy( rotation );
		mesh.scale.copy( scale );
		mesh.updateMatrix();

		geometry.merge( mesh.geometry, mesh.matrix );

	}

	return geometry;

}

function Scene ( imgurl, cameraZ, fov, rotationSpeed, clearColor ) {
    var scope = this;
	this.clearColor = clearColor;

	this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
	this.camera.target = new THREE.Vector3(0, 0, 0);
	//this.camera.position.z = cameraZ;

	var isUserInteracting = false,
            onMouseDownMouseX = 0, onMouseDownMouseY = 0,
            lon = 0, onMouseDownLon = 0,
            lat = 0, onMouseDownLat = 0,
            phi = 0, theta = 0;

	// Setup scene
	this.scene = new THREE.Scene();
	this.scene.add( new THREE.AmbientLight( 0x555555 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	this.scene.add( light );

	var geometry = new THREE.SphereGeometry(500, 60, 40);
	geometry.scale(-1, 1, 1);

	var material = new THREE.MeshBasicMaterial({
	    map: new THREE.TextureLoader().load(imgurl)
	});
	mesh = new THREE.Mesh(geometry, material);
	this.scene.add(mesh);

	document.addEventListener('mousedown', onDocumentMouseDown, false);
	document.addEventListener('mousemove', onDocumentMouseMove, false);
	document.addEventListener('mouseup', onDocumentMouseUp, false);
	document.addEventListener('wheel', onDocumentMouseWheel, false);
    //
	document.addEventListener('touchstart', onDocumentTouchStart, false);
	document.addEventListener('touchmove', onDocumentTouchMove, false);



	function onDocumentTouchStart(event) {

	    event.preventDefault();

	    var touch = event.touches[0];

	    touchX = touch.screenX;
	    touchY = touch.screenY;

	}

	function onDocumentTouchMove(event) {

	    event.preventDefault();

	    var touch = event.touches[0];

	    lon -= (touch.screenX - touchX) * 0.1;
	    lat += (touch.screenY - touchY) * 0.1;

	    touchX = touch.screenX;
	    touchY = touch.screenY;

	}


	function onWindowResize() {
	    this.camera.aspect = window.innerWidth / window.innerHeight;
	    this.camera.updateProjectionMatrix();
	    renderer.setSize(window.innerWidth, window.innerHeight);
	}
	function onDocumentMouseDown(event) {
	    event.preventDefault();
	    isUserInteracting = true;
	    onPointerDownPointerX = event.clientX;
	    onPointerDownPointerY = event.clientY;
	    onPointerDownLon = lon;
	    onPointerDownLat = lat;
	}
	function onDocumentMouseMove(event) {
	    if (isUserInteracting === true) {
	        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
	        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
	    }
	}
	function onDocumentMouseUp(event) {
	    isUserInteracting = false;
	}
	function onDocumentMouseWheel(event) {
	    scope.camera.fov += event.deltaY * 0.05;
	    scope.camera.updateProjectionMatrix();
	}

	renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
	this.fbo = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, renderTargetParameters );

	this.render = function( delta, rtt ) {

		//this.mesh.rotation.x += delta * this.rotationSpeed.x;
		//this.mesh.rotation.y += delta * this.rotationSpeed.y;
		//this.mesh.rotation.z += delta * this.rotationSpeed.z;
        

	    lat = Math.max(-85, Math.min(85, lat));
	    phi = THREE.Math.degToRad(90 - lat);
	    theta = THREE.Math.degToRad(lon);
	    this.camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
	    this.camera.target.y = 500 * Math.cos(phi);
	    this.camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
	    this.camera.lookAt(this.camera.target);


		renderer.setClearColor( this.clearColor );

		if ( rtt )
			renderer.render( this.scene, this.camera, this.fbo, true );
		else
			renderer.render( this.scene, this.camera );

	};

}
