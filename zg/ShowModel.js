/**
 * Created by leo on 2017/2/27.
 */
ModelLoader = function (lights) {
    var container = document.getElementById("container");
    //scene
    var scene = new THREE.Scene();
    //camera
    var camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000000);
    camera.position.set(0, 0, 10);
    //render
    var renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x575757, 1);
    container.appendChild(renderer.domElement);

    var lightParms = lights;
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    //controls.autoRotate = true;

    controls.addEventListener('start', function () {
        //controls.autoRotate = false;
    });

    controls.addEventListener('end', function () {
        // setTimeout(function () {
        //     controls.autoRotate = true;
        // }, 3000);

    });
    
    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {

        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.offsetWidth, container.offsetHeight);

    }

    render();

    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    }

    function loadModel(folder, name, position) {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                $("#progress-bar").css("width", Math.round(percentComplete, 2) + '%');
                //$("#percentage").text(Math.round(percentComplete, 2) + '%');

                console.log(Math.round(percentComplete, 2) + '% downloaded');
            }
            else
            {
                $("#progress-bar").css("width", '50%');
                //$("#percentage").text('50%');
            }
        };
        var objLoader = new THREE.OBJLoader(manager);
        var mtlLoader = new THREE.MTLLoader();
        mtlLoader.setBaseUrl(folder);
        mtlLoader.setPath(folder);
        mtlLoader.load(name + ".mtl", function (materials) {
            objLoader.setMaterials(materials);
            objLoader.load(folder + name + ".obj", function (object) {
                object.position.set(position.x, position.y, position.z);
                scene.add(object);
                fitCameraLight(object);
                $("#progress-bar").css("width", '100%');
                setTimeout(function () {
                    $("#loadingContainer").hide();
                }, 800);
            }, onProgress);

        });


    }


    function fitCameraLight(object3d) {
        var b = new THREE.Box3().setFromObject(object3d);
        var size = b.getSize();
        if (size.x == 0 && size.y == 0 && size.z == 0)
            size = new THREE.Vector3(50, 50, 50);
        var center = b.getCenter();
        var max = size.x>size.z?size.x:size.z;

        camera.position.set(center.x, center.y + max , center.z + size.z);
        camera.lookAt(center);
        controls.target.set(center.x, center.y, center.z);
        controls.update();



        var lightOffset = 2;
        var params = [
            [0, size.y * lightOffset, 0],//top
            [0, -size.y * lightOffset, 0],//bottom
            [-size.x * lightOffset, 0, 0],//left
            [size.x * lightOffset, 0, 0],//right
            [0, 0, size.z * lightOffset],//front
            [0, 0, -size.z * lightOffset]//rear
        ];

        for (var i = 0; i < params.length; i++) {
            var parm = params[i];
            var light = new THREE.DirectionalLight(lightParms[i][0], lightParms[i][1]);
            light.position.set(parm[0], parm[1], parm[2]);
            scene.add(light);
            // var lightDirectHelper = new THREE.DirectionalLightHelper(light);
            // scene.add(lightDirectHelper);
        }

        //lights
        var lightAm = new THREE.AmbientLight(lightParms[6][0], lightParms[6][1]);
        scene.add(lightAm);

    }


    this.loadModelByUrl = function  (dir, name) {
        loadModel(dir, name, {x: 0, y: 0, z: 0})
    }

    this.loadModel3d =function(objected)
    {
        scene.add(objected);
        fitCameraLight(objected);
        $("#progress-bar").css("width", '100%');
        setTimeout(function () {
            $("#loadingContainer").hide();
        }, 800);
    }


};