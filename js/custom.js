
function rand(min, max){
    return parseInt(Math.random() * (max - min) + min);
};

function init(){
     
    var renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha:true
    });
    
    var domEl = document.getElementById('threecontainer');
    renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    domEl.appendChild(renderer.domElement);

    var camera = new THREE.PerspectiveCamera( 55, domEl.offsetWidth / domEl.offsetHeight, 1, 500 ); 
    var scene = new THREE.Scene();

    //SOUND
    var playbtn = document.getElementById('sound');
    playbtn.addEventListener('mousedown', function(e){
        if(!sound.isPlaying){
            sound.play();
            playbtn.innerHTML = 'pause';
        }
        else{
            sound.pause();
            playbtn.innerHTML = 'play';
        }
    });



    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create an Audio source
    var sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( '../sounds/ambient.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(0.5);
        // sound.play();
        playbtn.style.opacity = 1;
    });

    // create an AudioAnalyser, passing in the sound and desired fftSize
    var analyser = new THREE.AudioAnalyser( sound, 32 );

    // get the average frequency of the sound
    //var data = analyser.getAverageFrequency();

    //SOUND
	
    var axesHelper = new THREE.AxesHelper( 50 );
    scene.add( axesHelper );

    var planegeometry = new THREE.PlaneGeometry( 270, 90, 110, 45 );
    var planematerial = new THREE.MeshStandardMaterial({
        color:0xFFFFFF,
        wireframe:true,
        // vertexColors: true,
        // transparent:true,
        // opacity:1
    });

    var NoiseGen = new SimplexNoise;

    var plane = new THREE.Mesh(planegeometry, planematerial);
    plane.position.set(0,0,0);
    plane.rotation.set(Math.PI/180 * -70, 0, 0);
    plane.castShadow = true;
    plane.receiveShadow = true;



    var ambientlight = new THREE.AmbientLight(0xffffff, .3);
   var light = new THREE.SpotLight( 0xffffee, 1 );
  // light.angle = Math.PI/4;
    light.castShadow = true;
   light.position.set(0,110,0);
    
    camera.position.set(0,0,70);
    //camera.lookAt(scene.position);

    scene.add(light);
    scene.add(ambientlight);
    scene.add(plane);

    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.minDistance = .3;
    // controls.maxDistance = 200;
    // controls.enableZoom = false;
    // controls.autoRotate = false;


    var makeWaves = function(offset) {
        for (var i = 0; i < plane.geometry.vertices.length; i++) {
          var vertex = plane.geometry.vertices[i];
          var x = vertex.x / 6;
          var y = vertex.y / 18;
          //var noise = NoiseGen.noise(x, y + offset) * 1.6 + 1;
          var noise = NoiseGen.noise(x, y + offset) * 2; 
          vertex.z = noise;
        }

        planegeometry.verticesNeedUpdate = true;
        planegeometry.colorsNeedUpdate = true;
        planegeometry.computeVertexNormals();
    };

    var adjustMesh = function(offset, data){
        for (var i = 0; i < plane.geometry.vertices.length; i++) {
            var vertex = plane.geometry.vertices[i];
            var x = vertex.x;
            var y = vertex.y;
            
            var scale = data/15;
            // var noise = NoiseGen.noise(x, y) * 2; 
            // vertex.z = noise * scale;

            if(data){
                vertex.z = NoiseGen.noise( vertex.x / data, vertex.y / data*2 ) * scale; 
            }
            else{
                vertex.z = 0;
            }
        }
        planegeometry.verticesNeedUpdate = true;
        //planegeometry.colorsNeedUpdate = true;
        planegeometry.computeVertexNormals();
    };

    var animate = function(){
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
        var offset = Date.now() * 0.04;
      //  makeWaves(offset);

        var data = analyser.getAverageFrequency();
        
        adjustMesh(offset, data);
    }

    

    animate();

};

window.onload = init;
