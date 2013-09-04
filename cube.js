var camera, scene, renderer;
var geometry, material, mesh;
var move = 0;

window.onload = function() {

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 900;

	scene = new THREE.Scene();

	geometry = new THREE.CubeGeometry( 200, 200, 200 );
	secondGeometry = new THREE.TorusGeometry( 150, 35, 24, 36 );
	thirdGeometry = new THREE.SphereGeometry( 150, 25, 25 );
	groundGeometry = new THREE.PlaneGeometry( 800, 800 );

	material = new THREE.MeshLambertMaterial( { color: 0x24D330, shading: THREE.FlatShading, overdraw: true } );	
	planeMaterial = new THREE.MeshNormalMaterial( { color: 0x00ff00 } );
	mesh = new THREE.Mesh( geometry, material );	
	secondMesh = new THREE.Mesh( secondGeometry, material );
	thirdMesh = new THREE.Mesh( thirdGeometry, material );
	groundMesh = new THREE.Mesh( groundGeometry, planeMaterial );

	scene.add( mesh );
	scene.add( secondMesh );
	scene.add( thirdMesh) ;
	scene.add( groundMesh );

	var light = new THREE.PointLight( 0xFFFF00 );
	light.position.set( 0, 0, 1000 );
	scene.add( light );

	renderer = new THREE.CanvasRenderer();
	renderer.setSize( window.innerWidth/1.5, window.innerHeight/1.5 );

	var container = document.getElementById('container');

	container.appendChild( renderer.domElement );

	secondMesh.position.x -= 50;
	thirdMesh.position.x -= 350;
	thirdMesh.position.z -= 300;
	groundMesh.position.y -= 700;
	groundMesh.rotation.x -= Math.pi;

	animate();
};

function animate() {
	move += 0.04;

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.01;
	mesh.rotation.y += 0.02;
	mesh.position.x = 400 * Math.cos(move);
	mesh.position.y = 400 * Math.sin(move);

	secondMesh.rotation.x -= 0.01;
	secondMesh.rotation.y -= 0.02;

	thirdMesh.rotation.x += 0.02;
	thirdMesh.rotation.y += 0.04;
	thirdMesh.position.x = 550 * Math.cos(move*0.75);
	thirdMesh.position.y = 550 * -Math.sin(move*0.75);

	renderer.render( scene, camera );
};
