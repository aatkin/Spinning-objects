var camera, scene, renderer;
var cubeGeometry, torusGeometry, sphereGeometry, phongMaterial, vaadinMaterial, cubeMesh, torusMesh, sphereMesh, ambientLight, light;
var solidGround;
var controls;
var move = 0;

// Main function, fires up the script as soon as the entire page has loaded
// Sets up rendering context and fires up animate() -function, putting everything together
window.onload = function() {
	initializeObjects();
	setUpScene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1100;
	camera.position.y = 550;

	// WebGLRenderer() seems to be most efficient renderer, while lacking in portability,
	// it makes up for in speed. Use CanvasRenderer() to render on most devices capable for WebGL.
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );
	renderer.shadowMapEnabled = true;
	//renderer.shadowMapSoft = true;

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	animate();
};

// Initializes all of the used objects and their related materials, including light objects
function initializeObjects() {
	cubeGeometry = new THREE.CubeGeometry( 200, 200, 200 );
	torusGeometry = new THREE.TorusGeometry( 150, 35, 24, 36 );
	sphereGeometry = new THREE.SphereGeometry( 150, 25, 25 );

	phongMaterial = new THREE.MeshPhongMaterial( { shininess: 100 } );
	phongMaterial.color.setHex( 0x24D330 );
	phongMaterial.specular.setRGB( 0.5, 0.5, 0.5 );	

	// vaadinMaterial = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture("../vaadin.png") } );
	earthMaterial = new THREE.MeshPhongMaterial();
	earthMaterial.map = THREE.ImageUtils.loadTexture('../images/earthmap1k.png');
	//earthMaterial.color.setHex( 0xFFFFFF );
	earthMaterial.bumpMap = THREE.ImageUtils.loadTexture('../images/earthbump1k.png');
	earthMaterial.bumpScale = 32;
	earthMaterial.specularMap = THREE.ImageUtils.loadTexture('../images/earthspec1k.png');
	earthMaterial.specular = new THREE.Color('grey');

	cubeMesh = new THREE.Mesh( cubeGeometry, phongMaterial );	
	torusMesh = new THREE.Mesh( torusGeometry, phongMaterial );
	sphereMesh = new THREE.Mesh( sphereGeometry, earthMaterial );

	solidGround = new THREE.Mesh(
			new THREE.PlaneGeometry( 10000, 10000 ),
			new THREE.MeshPhongMaterial( { color: 0xFFFFFF,  }) );
	solidGround.position.y -= 750;
	solidGround.rotation.x = -Math.PI / 2;
	solidGround.receiveShadow = true;

	ambientLight = new THREE.AmbientLight( 0x222222 );
	light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
}

// Initializes the scene and sets up all the objects inside it, with their initial locations
function setUpScene() {
	scene = new THREE.Scene();

	light.position.set( 200, 850, 200 );
	light.castShadow = true;
	//light.shadowCameraVisible = true;
	light.shadowCameraLeft = -1100;
	light.shadowCameraRight = 1100;
	light.shadowCameraTop = 1100;
	light.shadowCameraBottom = -1100;

	cubeMesh.receiveShadow = true;
	cubeMesh.castShadow = true;

	torusMesh.receiveShadow = true;
	torusMesh.castShadow = true;

	sphereMesh.receiveShadow = true;
	sphereMesh.castShadow = true;

	scene.add( cubeMesh );
	scene.add( torusMesh );
	scene.add( sphereMesh );

	scene.add( ambientLight );
	scene.add( light );

	torusMesh.position = new THREE.Vector3( -50, 550, 0 );
	sphereMesh.position = new THREE.Vector3( 350, 550, 0 );
	sphereMesh.position = new THREE.Vector3( 0, 550, -300 );

	scene.add( solidGround );
}

// Calculates positions for all the objects per each rendered frame
function animate() {
	move += 0.025;

	requestAnimationFrame( animate );

	cubeMesh.rotation.x += 0.5 * (Math.PI / 180);
	cubeMesh.rotation.y += 0.5 * (Math.PI / 180);
	cubeMesh.position.x = 1000 * Math.cos(move);
	cubeMesh.position.y = 150 * Math.sin(move);
	cubeMesh.position.z = 750 * Math.sin(move);

	torusMesh.rotation.x -= 0.75 * (Math.PI / 180);
	torusMesh.rotation.y -= 1.5 * (Math.PI / 180);
	torusMesh.position.y = 10 * Math.sin(move);

	// sphereMesh.position.x = 400 * Math.cos(move*0.75);
	// sphereMesh.position.y = 550 * -Math.sin(move*0.75);
	 sphereMesh.rotation.x += 0.5 * (Math.PI / 180);
	 sphereMesh.rotation.y += 0.5 * (Math.PI / 180);

	renderer.render( scene, camera );
	controls.update();
}
