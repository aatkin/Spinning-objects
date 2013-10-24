var camera, scene, renderer, controls, container, composer;
var earthGeometry, earthMaterial, earthMesh, cloudMesh, starfieldGeometry, starfieldMaterial, starfieldTexture, starfieldMesh, ambientLight, light,
    sunGeometry, sunMaterial, sunMesh, jupiterGeometry, jupiterMaterial, jupiterMesh, neptuneGeometry, neptuneMaterial, neptuneMesh, marsGeometry,
    marsMaterial, marsMesh, mercuryGeometry, mercuryMaterial, mercuryMesh, venusMesh, venusGeometry, venusMaterial;
var sunSize, earthSize, jupiterSize, neptuneSize, marsSize, mercurySize, venusSize;
var uniforms, delta, effectController, gui, stats;
var earthMoveSpeed = 0, earthOrbitDistance, jupiterMoveSpeed = 0, jupiterOrbitDistance, neptuneMoveSpeed = 0, neptuneOrbitDistance, marsMoveSpeed = 0, marsOrbitDistance,
    mercuryMoveSpeed = 0, mercuryOrbitDistance, venusMoveSpeed = 0, venusOrbitDistance;
var clock = new THREE.Clock();
//var windowsPath = 'C:/Users/Anssi/Desktop/koulujutut/Harjoitustyö/Space simulation/images/';
var unixPath = '../images/';

// Main function, fires up the script as soon as the entire page has loaded
// Sets up rendering context and fires up animate() -function, putting everything together
window.onload = function () {
    if ( !Detector.webgl ) Detector.addGetWebGLMessage();

    initStats();
    initializeObjects();
    setUpScene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 180000 );
    camera.position.x = 0;
    camera.position.z = 400;

    // WebGLRenderer() seems to be most efficient renderer, while lacking in portability,
    // it makes up for in speed. Use CanvasRenderer() to render on most devices capable for WebGL.
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize( window.innerWidth / 1.25, window.innerHeight / 1.25 );
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.autoClear = false;
//    renderer.shadowMapEnabled = true;
//    renderer.shadowMapSoft = true;

    controls = new THREE.OrbitControls( camera, renderer.domElement );

    container = document.getElementById( 'container' );
    container.appendChild( renderer.domElement );
    container.appendChild( stats.domElement );

    /*
     Post processing effects
     */
    var renderModel = new THREE.RenderPass( scene, camera );
    var effectBloom = new THREE.BloomPass( 0.8 );
    var effectFilm = new THREE.FilmPass( 0.09, 0.04, 1024, false );
    effectFilm.renderToScreen = true;
    composer = new THREE.EffectComposer( renderer );
    composer.addPass( renderModel );
    composer.addPass( effectBloom );
    composer.addPass( effectFilm );

    initGUI();
    animate();
}; // end of window.onload

// Initializes all of the used objects and their related materials, including light objects
function initializeObjects() {
    /*
    Planet sizes, radius
     */
    sunSize = 278.4;
    earthSize = sunSize / 109.12;
    jupiterSize = sunSize / 9.735;
    neptuneSize = sunSize / 56.21;
    marsSize = sunSize / 205.04;
    mercurySize = sunSize / 285.42;
    venusSize = sunSize / 115.06;

    /*
     Initialize starfield background on a cube
     */
    starfieldGeometry = new THREE.CubeGeometry( 95000, 95000, 95000 );
    starfieldMaterial = new THREE.MeshBasicMaterial();
    starfieldTexture = THREE.ImageUtils.loadTexture( unixPath + 'starfieldbig.png' );
    starfieldTexture.wrapS = starfieldTexture.wrapT = THREE.MirroredRepeatWrapping;
    starfieldMaterial.map = starfieldTexture;
    starfieldMaterial.side = THREE.BackSide;

    starfieldMesh = new THREE.Mesh( starfieldGeometry, starfieldMaterial );

    /*
     Initialize planet Earth with texture, bump-map and specular map, and load a second sphere object with
     cloud texture transparent on top
     */
    earthGeometry = new THREE.SphereGeometry( earthSize, 64, 64 );
    earthMaterial = new THREE.MeshPhongMaterial();
    earthMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'earthmap1k.png' );
    earthMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'earthbump1k.png' );
    earthMaterial.bumpScale = 0.15;
    earthMaterial.specularMap = THREE.ImageUtils.loadTexture( unixPath + 'earthspec1k.png' );
    earthMaterial.specular = new THREE.Color( 'grey' );

    earthMesh = new THREE.Mesh( earthGeometry, earthMaterial );
    cloudMesh = createEarthCloud();
    earthMesh.add( cloudMesh );

    /*
     Initialize Sun with loads of awesome stuff.
     */
    sunGeometry = new THREE.SphereGeometry( sunSize, 128, 128 );
    uniforms = {
        fogDensity: { type: "f", value: 0.00005 },
        fogColor: { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() },
        uvScale: { type: "v2", value: new THREE.Vector2( 1.0, 2.0 ) },
        texture1: { type: "t", value: THREE.ImageUtils.loadTexture( unixPath + 'cloud.png' ) },
        texture2: { type: "t", value: THREE.ImageUtils.loadTexture( unixPath + 'lavatile.png' ) }
    };
    uniforms.texture1.value.wrapS = uniforms.texture1.value.wrapT = THREE.RepeatWrapping;
    uniforms.texture2.value.wrapS = uniforms.texture2.value.wrapT = THREE.RepeatWrapping;
    sunMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );

    sunMesh = new THREE.Mesh( sunGeometry, sunMaterial );

    /*
     Initialize Jupiter with texture and basic geometry
     */
    jupiterGeometry = new THREE.SphereGeometry( jupiterSize, 64, 64 );
    jupiterMaterial = new THREE.MeshPhongMaterial( { shininess: 5 } );
    jupiterMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'jupiter.jpg' );
    jupiterMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'jupiter_bump.jpg' );
    jupiterMaterial.bumpScale = 0.1;
    jupiterMaterial.specular = new THREE.Color( 'grey' );

    jupiterMesh = new THREE.Mesh( jupiterGeometry, jupiterMaterial );

    /*
     Initialize Neptune with texture and basic geometry
     */
    neptuneGeometry = new THREE.SphereGeometry( neptuneSize, 64, 64 );
    neptuneMaterial = new THREE.MeshPhongMaterial( { shininess: 5 } );
    neptuneMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'neptunemap.jpg' );
    neptuneMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'neptunemap_bump.jpg' );
    neptuneMaterial.bumpScale = 0.08;
    neptuneMaterial.specular = new THREE.Color( 'grey' );

    neptuneMesh = new THREE.Mesh( neptuneGeometry, neptuneMaterial );

    /*
    Initialize Mars with texture and basic geometry
     */
    marsGeometry = new THREE.SphereGeometry( marsSize, 64, 64 );
    marsMaterial = new THREE.MeshPhongMaterial( { shininess: 5 } );
    marsMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'marsmap.jpg' );
    marsMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'marsmap_bump.jpg' );
    marsMaterial.bumpScale = 0.15;
    // a hint of red specular color
    marsMaterial.specular = new THREE.Color( 0x110000 );

    marsMesh = new THREE.Mesh( marsGeometry, marsMaterial );

    /*
    Initialize Mercury with texture and basic geometry
     */
    mercuryGeometry = new THREE.SphereGeometry( marsSize, 64, 64 );
    mercuryMaterial = new THREE.MeshPhongMaterial( { shininess: 5 } );
    mercuryMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'mercurymap.jpg' );
    mercuryMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'mercurymap_bump.jpg' );
    mercuryMaterial.bumpScale = 0.10;
    // a hint of red specular color
    mercuryMaterial.specular = new THREE.Color( 0x110000 );

    mercuryMesh = new THREE.Mesh( mercuryGeometry, mercuryMaterial );

    /*
    Initialize Venus with texture and basic geometry
     */
    venusGeometry = new THREE.SphereGeometry( venusSize, 64, 64 );
    venusMaterial = new THREE.MeshPhongMaterial( { shininess: 5 } );
    venusMaterial.map = THREE.ImageUtils.loadTexture( unixPath + 'venusmap.jpg' );
    venusMaterial.bumpMap = THREE.ImageUtils.loadTexture( unixPath + 'venusmap_bump.jpg' );
    venusMaterial.bumpScale = 0.12;
    // a hint of red specular color
    venusMaterial.specular = new THREE.Color( 0x110000 );

    venusMesh = new THREE.Mesh( venusGeometry, venusMaterial );

    /*
     Initialize lights used in the simulator
     */
    ambientLight = new THREE.AmbientLight( 0x0f0f0f );
    light = new THREE.PointLight( 0xFFFFFF, 1.0, 26000 );
} // end of initializeObjects()

// Loads up the earth cloud map in a special way, making the texture invisible on non-cloud parts and semi-
// transparent on cloud parts
function createEarthCloud() {
    // create destination canvas
    var canvasResult = document.createElement( "canvas" );
    canvasResult.width = 1024;
    canvasResult.height = 512;
    var contextResult = canvasResult.getContext( "2d" );

    // load earthcloudmap
    var imageMap = new Image();
    imageMap.addEventListener( "load", function () {

        // create dataMap ImageData for earthcloudmap
        var canvasMap = document.createElement( "canvas" );
        canvasMap.width = imageMap.width;
        canvasMap.height = imageMap.height;
        var contextMap = canvasMap.getContext( "2d" );
        contextMap.drawImage( imageMap, 0, 0 );
        var dataMap = contextMap.getImageData( 0, 0, canvasMap.width, canvasMap.height );

        // load earthcloudmaptrans
        var imageTrans = new Image();
        imageTrans.addEventListener( "load", function () {
            // create dataTrans ImageData for earthcloudmaptrans
            var canvasTrans = document.createElement( "canvas" );
            canvasTrans.width = imageTrans.width;
            canvasTrans.height = imageTrans.height;
            var contextTrans = canvasTrans.getContext( "2d" );
            contextTrans.drawImage( imageTrans, 0, 0 );
            var dataTrans = contextTrans.getImageData( 0, 0, canvasTrans.width, canvasTrans.height );
            //  merge dataMap + dataTrans into dataResult
            var dataResult = contextMap.createImageData( canvasMap.width, canvasMap.height );
            for ( var y = 0, offset = 0; y < imageMap.height; y++ ) {
                for ( var x = 0; x < imageMap.width; x++, offset += 4 ) {
                    dataResult.data[offset + 0] = dataMap.data[offset + 0];
                    dataResult.data[offset + 1] = dataMap.data[offset + 1];
                    dataResult.data[offset + 2] = dataMap.data[offset + 2];
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0];
                }
            }
            // update texture with result
            contextResult.putImageData( dataResult, 0, 0 );
            material.map.needsUpdate = true;
        } );
        imageTrans.src = unixPath + "earthcloudmaptrans.png";
    }, false );
    imageMap.src = unixPath + "earthcloudmap.png";

    var geometry = new THREE.SphereGeometry( earthSize + earthSize * 0.005, 64, 64 );
    var material = new THREE.MeshPhongMaterial( {
        map: new THREE.Texture( canvasResult ),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.90
    } );
    return new THREE.Mesh( geometry, material );
} // end of createEarthCloud()

// Initializes the scene and sets up all the objects inside it, with their initial locations
function setUpScene() {
    scene = new THREE.Scene();

    light.position.set( 0, 0, 0 );
//    light.castShadow = true;

    /*
     Remember to add earth first into scene, otherwise there will be trouble...
     */
    scene.add( earthMesh );
    scene.add( sunMesh );
    scene.add( jupiterMesh );
    scene.add( neptuneMesh );
    scene.add( marsMesh );
    scene.add( mercuryMesh );
    scene.add( venusMesh );
    scene.add( starfieldMesh );

    scene.add( ambientLight );
    scene.add( light );

    /*
     Axial tilts for the planets
     */
    earthMesh.rotation.x = 23.4 * (Math.PI / 180);
    sunMesh.rotation.x = 7.25 * (Math.PI / 180);
    jupiterMesh.rotation.x = 3.13 * (Math.PI / 180);
    neptuneMesh.rotation.x = 28.32 * (Math.PI / 180);
    marsMesh.rotation.x = 1.85 * (Math.PI / 180);
    mercuryMesh.rotation.x = 0.03 * (Math.PI / 180);
    venusMesh.rotation.x = 177.36 * (Math.PI / 180);

    /*
     Orbital distances for the planets
     */
    // 1,4960 * 10^8 / 100000 (prev sunSize + 299.2)
    earthOrbitDistance = 1496;
    // 778412010 / 100000 (prev sunSize + 1556.82)
    jupiterOrbitDistance = 7784.12;
    // 4502960000 / 100000 - 25000 (otherwise it is way too far away. it only needs to be most faraway planet)
    neptuneOrbitDistance = 20209.6;
    // 227940000 / 100000
    marsOrbitDistance = 2279.4;
    // 57909000 / 100000
    mercuryOrbitDistance = 579.09;
    // 108200000 / 100000
    venusOrbitDistance = 1082;

    /*
     Test setup
     */
    jupiterMesh.position.x = sunSize + 100;
    earthMesh.position.x = sunSize + jupiterSize + 150;
    neptuneMesh.position.x = sunSize + jupiterSize + earthSize + 200;
    marsMesh.position.x = sunSize + jupiterSize + earthSize + 250;
    mercuryMesh.position.x = sunSize + jupiterSize + earthSize + marsSize + 275;
    venusMesh.position.x = sunSize + jupiterSize + earthSize + marsSize + mercurySize + 325;
} // end of setUpScene()

function initGUI() {
    effectController = {
        earth: false,
        jupiter: false,
        neptune: false,
        mars: false,
        mercury: false,
        venus: false,
        animate: false,
        postprocess: false,
        reset: function () {
            jupiterMesh.position.x = sunSize + 100;
            jupiterMesh.position.y = 0;
            jupiterMesh.position.z = 0;
            earthMesh.position.x = sunSize + jupiterSize + 150;
            earthMesh.position.y = 0;
            earthMesh.position.z = 0;
            neptuneMesh.position.x = sunSize + jupiterSize + earthSize + 200;
            neptuneMesh.position.y = 0;
            neptuneMesh.position.z = 0;
            marsMesh.position.x = sunSize + jupiterSize + earthSize + 250;
            marsMesh.position.y = 0;
            marsMesh.position.z = 0;
            mercuryMesh.position.x = sunSize + jupiterSize + earthSize + marsSize + 275;
            mercuryMesh.position.y = 0;
            mercuryMesh.position.z = 0;
            venusMesh.position.x = sunSize + jupiterSize + earthSize + marsSize + mercurySize + 325;
            venusMesh.position.y = 0;
            venusMesh.position.z = 0;
        },
        mv2earth: function () {
            camera.position.x = earthMesh.position.x + 15;
            camera.position.y = earthMesh.position.y;
            camera.position.z = earthMesh.position.z + 15;
        },
        mv2jupiter: function () {
            camera.position.x = jupiterMesh.position.x + 70;
            camera.position.y = jupiterMesh.position.y;
            camera.position.z = jupiterMesh.position.z + 70;
        },
        mv2neptune: function () {
            camera.position.x = neptuneMesh.position.x + 35;
            camera.position.y = neptuneMesh.position.y;
            camera.position.z = neptuneMesh.position.z + 35;
        },
        mv2mars: function() {
            camera.position.x = marsMesh.position.x + 10;
            camera.position.y = marsMesh.position.y;
            camera.position.z = marsMesh.position.z + 10;
        },
        mv2mercury: function() {
            camera.position.x = mercuryMesh.position.x + 5;
            camera.position.y = mercuryMesh.position.y;
            camera.position.z = mercuryMesh.position.z + 5;
        },
        mv2venus: function() {
            camera.position.x = venusMesh.position.x + 10;
            camera.position.y = venusMesh.position.y;
            camera.position.z = venusMesh.position.z + 10;
        },
        resetcam: function () {
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 400;
            controls.target.set( 0, 0, 0 );
        }
    };
    gui = new dat.GUI();
    var h = gui.addFolder( "Camera controller" );
    gui.add( effectController, "earth" ).name( "Lock on Earth" );
    gui.add( effectController, "jupiter" ).name( "Lock on Jupiter" );
    gui.add( effectController, "neptune" ).name( "Lock on Neptune" );
    gui.add( effectController, "mars" ).name( "Lock on Mars" );
    gui.add( effectController, "mercury" ).name( "Lock on Mercury" );
    gui.add( effectController, "venus" ).name( "Lock on Venus" );
    gui.add( effectController, "animate" ).name( "Animate objects" );
    gui.add( effectController, "postprocess" ).name( "Post processing" );
    gui.add( effectController, "reset" ).name( "Reset positions" );
    gui.add( effectController, "resetcam" ).name( "Reset camera" );
    gui.add( effectController, "mv2earth" ).name( "Move to earth" );
    gui.add( effectController, "mv2jupiter" ).name( "Move to jupiter" );
    gui.add( effectController, "mv2neptune" ).name( "Move to neptune" );
    gui.add( effectController, "mv2mars" ).name( "Move to mars" );
    gui.add( effectController, "mv2mercury" ).name( "Move to mercury" );
    gui.add( effectController, "mv2venus" ).name( "Move to venus" );
}

function initStats() {
    stats = new Stats();
    stats.setMode( 0 );

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.zIndex = 100;
}

// Calculates positions for all the objects per each rendered frame
function animate() {
    delta = clock.getDelta();

    requestAnimationFrame( animate );
    controls.update();


    if ( effectController.animate === true ) {
        if ( earthMoveSpeed > 360 ) earthMoveSpeed = 0;
        if ( jupiterMoveSpeed > 360 ) jupiterMoveSpeed = 0;
        if ( neptuneMoveSpeed > 360 ) neptuneMoveSpeed = 0;
        if ( marsMoveSpeed > 360 ) marsMoveSpeed = 0;
        if ( mercuryMoveSpeed > 360 ) mercuryMoveSpeed = 0;
        if ( venusMoveSpeed > 360 ) venusMoveSpeed = 0;

        earthMoveSpeed += 0.001;
        jupiterMoveSpeed += 0.000439;
        neptuneMoveSpeed += 0.000182;
        marsMoveSpeed += 0.000809;
        mercuryMoveSpeed += 0.001607;
        venusMoveSpeed += 0.001176;

        var earthCurrentX = earthMesh.position.x;
        var earthCurrentY = earthMesh.position.y;
        var earthCurrentZ = earthMesh.position.z;
        var jupiterCurrentX = jupiterMesh.position.x;
        var jupiterCurrentY = jupiterMesh.position.y;
        var jupiterCurrentZ = jupiterMesh.position.z;
        var neptuneCurrentX = neptuneMesh.position.x;
        var neptuneCurrentY = neptuneMesh.position.y;
        var neptuneCurrentZ = neptuneMesh.position.z;
        var marsCurrentX = marsMesh.position.x;
        var marsCurrentY = marsMesh.position.y;
        var marsCurrentZ = marsMesh.position.z;
        var mercuryCurrentX = mercuryMesh.position.x;
        var mercuryCurrentY = mercuryMesh.position.y;
        var mercuryCurrentZ = mercuryMesh.position.z;
        var venusCurrentX = venusMesh.position.x;
        var venusCurrentY = venusMesh.position.y;
        var venusCurrentZ = venusMesh.position.z;

        /*
        Planet movements each frame
         */
        earthMesh.position.x = earthOrbitDistance * Math.cos( earthMoveSpeed );
        earthMesh.position.y = earthOrbitDistance * Math.sin( earthMoveSpeed );
//        earthMesh.position.z = ( sunSize / 360 * 0)   * Math.sin( earthMoveSpeed );

        jupiterMesh.position.x = jupiterOrbitDistance * Math.cos( jupiterMoveSpeed );
        jupiterMesh.position.y = jupiterOrbitDistance * Math.sin( jupiterMoveSpeed );
        jupiterMesh.position.z = ( sunSize / 360 * 1.31 ) * Math.sin( jupiterMoveSpeed );

        neptuneMesh.position.x = neptuneOrbitDistance * Math.cos( neptuneMoveSpeed );
        neptuneMesh.position.y = neptuneOrbitDistance * Math.sin( neptuneMoveSpeed );
        neptuneMesh.position.z = ( sunSize / 360 * 1.77 ) * Math.sin( neptuneMoveSpeed );

        marsMesh.position.x = marsOrbitDistance * Math.cos( marsMoveSpeed );
        marsMesh.position.y = marsOrbitDistance * Math.sin( marsMoveSpeed );
        marsMesh.position.z = ( sunSize / 360 * 1.85 ) * Math.sin( marsMoveSpeed );

        mercuryMesh.position.x = mercuryOrbitDistance * Math.cos( mercuryMoveSpeed );
        mercuryMesh.position.y = mercuryOrbitDistance * Math.sin( mercuryMoveSpeed );
        mercuryMesh.position.z = ( sunSize / 360 * 7.01 ) * Math.sin( mercuryMoveSpeed );

        venusMesh.position.x = venusOrbitDistance * Math.cos( venusMoveSpeed );
        venusMesh.position.y = venusOrbitDistance * Math.sin( venusMoveSpeed );
        venusMesh.position.z = ( sunSize / 360 * 3.39 ) * Math.sin( venusMoveSpeed );

        if ( effectController.earth === true ) {
            camera.position.x += earthMesh.position.x - earthCurrentX;
            camera.position.y += earthMesh.position.y - earthCurrentY;
            camera.position.z += earthMesh.position.z - earthCurrentZ;
            controls.target.set( earthMesh.position.x, earthMesh.position.y, earthMesh.position.z );
        }
        else if ( effectController.jupiter === true ) {
            camera.position.x += jupiterMesh.position.x - jupiterCurrentX;
            camera.position.y += jupiterMesh.position.y - jupiterCurrentY;
            camera.position.z += jupiterMesh.position.z - jupiterCurrentZ;
            controls.target.set( jupiterMesh.position.x, jupiterMesh.position.y, jupiterMesh.position.z );
        }
        else if ( effectController.neptune === true ) {
            camera.position.x += neptuneMesh.position.x - neptuneCurrentX;
            camera.position.y += neptuneMesh.position.y - neptuneCurrentY;
            camera.position.z += neptuneMesh.position.z - neptuneCurrentZ;
            controls.target.set( neptuneMesh.position.x, neptuneMesh.position.y, neptuneMesh.position.z );
        }
        else if ( effectController.mars === true ) {
            camera.position.x += marsMesh.position.x - marsCurrentX;
            camera.position.y += marsMesh.position.y - marsCurrentY;
            camera.position.z += marsMesh.position.z - marsCurrentZ;
            controls.target.set( marsMesh.position.x, marsMesh.position.y, marsMesh.position.z );
        }
        else if ( effectController.mercury === true ) {
            camera.position.x += mercuryMesh.position.x - mercuryCurrentX;
            camera.position.y += mercuryMesh.position.y - mercuryCurrentY;
            camera.position.z += mercuryMesh.position.z - mercuryCurrentZ;
            controls.target.set( mercuryMesh.position.x, mercuryMesh.position.y, mercuryMesh.position.z );
        }
        else if ( effectController.venus === true ) {
            camera.position.x += venusMesh.position.x - venusCurrentX;
            camera.position.y += venusMesh.position.y - venusCurrentY;
            camera.position.z += venusMesh.position.z - venusCurrentZ;
            controls.target.set( venusMesh.position.x, venusMesh.position.y, venusMesh.position.z );
        }
    } // end of if

    /*
    Planet rotations each frame
     */
    earthMesh.rotation.y += 0.1 * (Math.PI / 180);
    cloudMesh.rotation.z += 0.075 * (Math.PI / 180);
    jupiterMesh.rotation.y += 0.243 * (Math.PI / 180);
    neptuneMesh.rotation.y += 0.149 * (Math.PI / 180);
    marsMesh.rotation.y += 0.0972 * (Math.PI / 180);
    mercuryMesh.rotation.y += 0.0017 * (Math.PI / 180);
    venusMesh.rotation.y -= 0.00041 * (Math.PI / 180);
    sunMesh.rotation.y += 0.003665 * (Math.PI / 180);

    uniforms.time.value += 0.1 * ( 20 * delta );

    if ( effectController.postprocess === true ) {
        renderer.clear();
        composer.render( delta );
    }
    else {
        renderer.clear();
        renderer.render( scene, camera );
    }
    stats.update();
} // end of animate()