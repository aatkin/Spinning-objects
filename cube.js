var camera, scene, renderer;
var cubeGeometry, material, cubeMesh;
var move = 0;

window.onload = function() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 900;

	scene = new THREE.Scene();

	cubeGeometry = new THREE.CubeGeometry( 200, 200, 200 );
	torusGeometry = new THREE.TorusGeometry( 150, 35, 24, 36 );
	sphereGeometry = new THREE.SphereGeometry( 150, 25, 25 );

	material = new THREE.MeshLambertMaterial( { color: 0x24D330, shading: THREE.FlatShading, overdraw: true } );	

	cubeMesh = new THREE.Mesh( cubeGeometry, material );	
	torusMesh = new THREE.Mesh( torusGeometry, material );
	sphereMesh = new THREE.Mesh( sphereGeometry, material );

	scene.add( cubeMesh );
	scene.add( torusMesh );
	scene.add( sphereMesh) ;

	var light = new THREE.PointLight( 0xFFFF00 );
	light.position.set( 0, 0, 1000 );
	scene.add( light );

	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );

	var container = document.getElementById('container');

	container.appendChild( renderer.domElement );

	torusMesh.position.x -= 50;
	sphereMesh.position.x -= 350;
	sphereMesh.position.z -= 300;

	animate();
};

function animate() {
	move += 0.04;

	requestAnimationFrame( animate );

	cubeMesh.rotation.x += 0.01;
	cubeMesh.rotation.y += 0.02;
	cubeMesh.position.x = 400 * Math.cos(move);
	cubeMesh.position.y = 400 * Math.sin(move);

	torusMesh.rotation.x -= 0.01;
	torusMesh.rotation.y -= 0.02;

	sphereMesh.rotation.x += 0.02;
	sphereMesh.rotation.y += 0.04;
	sphereMesh.position.x = 550 * Math.cos(move*0.75);
	sphereMesh.position.y = 550 * -Math.sin(move*0.75);

	renderer.render( scene, camera );
};
