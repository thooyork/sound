
function rand(min, max){
    return parseInt(Math.random() * (max - min) + min);
};

function init(){

    var style = 'wave';
     
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
    //STYLE
    var stylebtn = document.getElementById('threecontainer');
    stylebtn.addEventListener('dblclick', function(e){
        if(sound.isPlaying){
            if(style === 'wave'){
                style = 'noise';
            }
            else{
                style = 'wave';
            }
        }
    });
    //STYLE

    //SOUND
    var loader = document.getElementById('loader');
    var playbtn = document.getElementById('sound');
    playbtn.addEventListener('mousedown', function(e){
        if(!sound.isPlaying){
            sound.play();
            // playbtn.innerHTML = 'pause';
            playbtn.classList.add('pause');
        }
        else{
            sound.pause();
            // playbtn.innerHTML = 'play';
            playbtn.classList.remove('pause');
        }
    });

    // create an AudioListener and add it to the camera
    var listener = new THREE.AudioListener();
    camera.add( listener );

    // create an Audio source
    var sound = new THREE.Audio( listener );

    // load a sound and set it as the Audio object's buffer
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sounds/ambient.mp3', function( buffer ) {
        sound.setBuffer( buffer );
        sound.setLoop(true);
        sound.setVolume(0.5);
        // sound.play();
        playbtn.style.opacity = 1;
        loader.style.display = 'none';
    });
   
    // create an AudioAnalyser, passing in the sound and desired fftSize
    var analyser = new THREE.AudioAnalyser( sound, 32 );

    // get the average frequency of the sound
    //var data = analyser.getAverageFrequency();

    //SOUND
	
    // var axesHelper = new THREE.AxesHelper( 50 );
    // scene.add( axesHelper );

    var planegeometry = new THREE.PlaneGeometry( 130, 130, 75, 75 );
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
    plane.rotation.set(Math.PI/180 * -90, 0, 0);
    plane.castShadow = true;
    plane.receiveShadow = true;



    var ambientlight = new THREE.AmbientLight(0xffffff, .4);
   var light = new THREE.SpotLight( 0xffffff, 1 );
    light.angle = Math.PI/10;
    light.castShadow = true;
    light.position.set(120,220,-120);
    
    camera.position.set(-45,60,70);
    //camera.lookAt(scene.position);

    scene.add(light);
    scene.add(ambientlight);
    scene.add(plane);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = .3;
    controls.maxDistance = 200;
    controls.enableZoom = false;
    controls.autoRotate = false;


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
            var scale = data/8;
            var center = new THREE.Vector2(0,0);

            if(data){
                if(style === 'noise'){
                    vertex.z = NoiseGen.noise( x / data, y / data*2 ) * scale; 
                }
                else if (style === 'wave'){
                    var dist = new THREE.Vector2(x,y).sub(center);
                    var size = scale/2;
                    var magnitude = 4.0;
                    vertex.z = Math.sin(dist.length()/(scale/2) + scale) * scale/2;
                }
            }
            else{
                vertex.z = 0;
            }
 
        }
        planegeometry.verticesNeedUpdate = true;
        // planegeometry.colorsNeedUpdate = true;
        planegeometry.computeVertexNormals();
    };

    var animate = function(){
        renderer.render( scene, camera );
        requestAnimationFrame( animate );
        var offset = Date.now() * 0.0004;
        // makeWaves(offset);

        var data = analyser.getAverageFrequency();
        //var data = analyser.getFrequencyData(); // Array of frequencies
       
       adjustMesh(offset, data);
    }

    
    animate();

    var onWindowResize = function(){
        camera.aspect = domEl.offsetWidth / domEl.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(domEl.offsetWidth, domEl.offsetHeight);
        // console.log(analyser.getFrequencyData());
    };

    window.addEventListener( 'resize', onWindowResize, false );

};

window.onload = init;
