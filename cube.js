var camera, scene, renderer;
var cubeGeometry, torusGeometry, sphereGeometry, phongMaterial, vaadinMaterial, cubeMesh, torusMesh, sphereMesh, ambientLight, light;
var move = 0;

// Main function, fires up the script as soon as the entire page has loaded
// Sets up rendering context and fires up animate() -function, putting everything together
window.onload = function() {
	initializeObjects();
	setUpScene();

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 1100;

	// WebGLRenderer() seems to be most efficient renderer, while lacking in portability,
	// it makes up for in speed. Use CanvasRenderer() to render on most devices capable for WebGL.
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );

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

	vaadinMaterial = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture("../vaadin.png") } );

	cubeMesh = new THREE.Mesh( cubeGeometry, vaadinMaterial );	
	torusMesh = new THREE.Mesh( torusGeometry, phongMaterial );
	sphereMesh = new THREE.Mesh( sphereGeometry, phongMaterial );

	ambientLight = new THREE.AmbientLight( 0x222222 );
	light = new THREE.DirectionalLight( 0xFFFFFF, 0.7 );
};

// Initializes the scene and sets up all the objects inside it, with their initial locations
function setUpScene() {
	scene = new THREE.Scene();

	scene.add( cubeMesh );
	scene.add( torusMesh );
	scene.add( sphereMesh );

	scene.add( ambientLight );
	scene.add( light );

	torusMesh.position.x -= 50;
	sphereMesh.position.x -= 350;
	sphereMesh.position.z -= 300;

	light.position.set( 0, 0, 200 );
};

// Calculates positions for all the objects per each rendered frame
function animate() {
	move += 0.023;

	requestAnimationFrame( animate );

	cubeMesh.rotation.x += 0.5 * (Math.PI / 180);
	cubeMesh.rotation.y += 0.5 * (Math.PI / 180);
	cubeMesh.position.x = 1000 * Math.cos(move);
	cubeMesh.position.y = 150 * Math.sin(move);
	cubeMesh.position.z = 450 * Math.sin(move);

	torusMesh.rotation.x -= 0.75 * (Math.PI / 180);
	torusMesh.rotation.y -= 1.5 * (Math.PI / 180);
	torusMesh.position.y = 10 * Math.sin(move);

	sphereMesh.position.x = 400 * Math.cos(move*0.75);
	sphereMesh.position.y = 550 * -Math.sin(move*0.75);

	renderer.render( scene, camera );
};
