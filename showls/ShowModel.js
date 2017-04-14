/**
 * Created by leo on 2017/2/27.
 */
ModelLoader = function (dir,lights) {
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


    var dateFrom;
    var dateTo;
    this.loadModel = function (modelname) {
        dateFrom = new Date();
        for(var i = scene.children.length;i>0;i--)
        {
            var obj = scene.children[i-1];
            scene.remove(obj);
            obj = null;
        }
        loadModel(dir, modelname, {x: 0, y: 0, z: 0});
    };


    this.showWireFrame = function (flag) {
        var obj =scene.getObjectByName("TargetModel");
        if(flag)
        {
            obj.children[0].material.wireframe = true;
        }
        else
            obj.children[0].material.wireframe = false;
    };



    function render() {
        requestAnimationFrame(render);
        controls.update();
        renderer.render(scene, camera);
    }

    var targetModel = null;
    function loadModel(folder, name, position) {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {
            console.log(item, loaded, total);
        };

        manager.onLoad = function () {
            dateTo =  new Date();
            var date3=dateTo.getTime() - dateFrom.getTime();  //时间差的毫秒数
            $("#loadTips").text("加载时间（毫秒）："+date3);
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
                object.name = "TargetModel";
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
        var max = size.x > size.y ? size.x : size.y;
        var offset = 0.8;
        var camera_z = (max / 2 / offset) * 3;
        // if (camera_z < 100)
        //     camera_z = 100;
        camera.position.set(0, 0, camera_z);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
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

        controls.minDistance = size.z *0.5;
        controls.maxDistance = 10 * size.z;

    }

};