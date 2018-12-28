// forked from cx20's "Three.js + Oimo.js でドミノっぽくドット絵を作るテスト（サンタバージョン）" http://jsdo.it/cx20/5gmA
// forked from cx20's "Three.js + Oimo.js でドミノっぽくドット絵を作るテスト" http://jsdo.it/cx20/8ReN
// forked from cx20's "Three.js + Oimo.js でドット絵を落下させるテスト" http://jsdo.it/cx20/voHQ
// forked from Lo-Th's "oimo basic" http://jsdo.it/Lo-Th/frXo

var DOT_SIZE = 16;

// □□□■□□□□□□□□□□□□
// □■■■■■■□□■□□□■□□
// □□□■□□□□□■□■■■■■
// □□□■□□□□□■□□□■□□
// □□■■■■■□□■□□□■□□
// □■□■□■□■□■□□□■□□
// □■□□■□□■□■□□□■□□
// □□■■□□■□□■□□■□□□
// □□□□□□□□□□□□□□□□
// □□□■□□■□□□□□□□□□
// □■■■■■□■□□■□□■□□
// □□□■□□□□□□■■■■■□
// □■■■■■■□□■□■□■□■
// ■□□■□□□■□■□■□■□■
// ■□□■□□□■□■□□■□□■
// □■■□□□■□□□■■□□■□
var dataSet = [
    "赤","赤","赤","白","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤",
    "赤","白","白","白","白","白","白","赤","赤","白","赤","赤","赤","白","赤","赤",
    "赤","赤","赤","白","赤","赤","赤","赤","赤","白","赤","白","白","白","白","白",
    "赤","赤","赤","白","赤","赤","赤","赤","赤","白","赤","赤","赤","白","赤","赤",
    "赤","赤","白","白","白","白","白","赤","赤","白","赤","赤","赤","白","赤","赤",
    "赤","白","赤","白","赤","白","赤","白","赤","白","赤","赤","赤","白","赤","赤",
    "赤","白","赤","赤","白","赤","赤","白","赤","白","赤","赤","赤","白","赤","赤",
    "赤","赤","白","白","赤","赤","白","赤","赤","白","赤","赤","白","赤","赤","赤",
    "赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤","赤",
    "赤","赤","赤","白","赤","赤","白","赤","赤","赤","赤","赤","赤","赤","赤","赤",
    "赤","白","白","白","白","白","赤","白","赤","赤","白","赤","赤","白","赤","赤",
    "赤","赤","赤","白","赤","赤","赤","赤","赤","赤","白","白","白","白","白","赤",
    "赤","白","白","白","白","白","白","赤","赤","白","赤","白","赤","白","赤","白",
    "白","赤","赤","白","赤","赤","赤","白","赤","白","赤","白","赤","白","赤","白",
    "白","赤","赤","白","赤","赤","赤","白","赤","白","赤","赤","白","赤","赤","白",
    "赤","白","白","赤","赤","赤","白","赤","赤","赤","白","白","赤","赤","白","赤"
];

function getRgbColor( c )
{
    var colorHash = {
        "黒":"0xFF000000",
        "白":0xffffff,
        "肌":0xffcccc,
        "茶":0x800000,
        "赤":0xff0000,
        "黄":0xffff00,
        "緑":0x00ff00,
        "水":0x00ffff,
        "青":0x0000ff,
        "紫":0x800080
    };
    return colorHash[ c ];
}

// Three.js 用変数
var camera, scene, light, renderer, container, center;
var meshs = [];
var geoBox;

// Oimo.js 用変数
var world;
var bodys = [];

init();
animate();

function init() {
    // カメラを作成する
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 150, 300);
    center = new THREE.Vector3();
    camera.lookAt(center);

    // シーンを作成する
    scene = new THREE.Scene();

    // 物理演算の準備
    world = new OIMO.World();

    // 床を作成する
    createGround();
    
    // ドミノを作成する
    createDomino();
    
    // ドミノ碑を倒す為の立方体を配置する
    createCube();

    // ライトを作成する
    light = new THREE.DirectionalLight(0xffffff, 1.3);
    light.position.set(0.3, 1, 0.5);
    scene.add(light);

    // レンダラーを作成する
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x0000000);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // レンダラーのサイズを指定する
    renderer.setSize(window.innerWidth, window.innerHeight);

    // HTML との紐づけを行う
    container = document.getElementById("container");
    container.appendChild(renderer.domElement);
}

function createGround() {
    // 床の物理演算の設定
    var ground = new OIMO.Body({
        size: [400, 40, 400],
        pos: [0, -50, 0],
        world: world
    });
    
    // 床表示用の設定
    var material = new THREE.MeshLambertMaterial({
        color: 0x202020
    });
    var geometry = new THREE.BoxGeometry(400, 40, 400);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = -50;
    scene.add(mesh);
}

function createDomino() {
    // ドミノ碑のサイズ
    var w = DOT_SIZE * 0.2;
    var h = DOT_SIZE * 1.5;
    var d = DOT_SIZE;

    // ドミノ碑のベースとなる箱を作成する
    geoBox = new THREE.BoxGeometry(1, 1, 1);

    var color;
    var i;
    // ドミノ碑を16x16個、整列させる
    for (var x = 0; x < 16; x++) {
        for (var z = 0; z < 16; z++) {
            i = x + (z) * 16;
            y = 0;
            // 物理演算用のオブジェクトを設定
            bodys[i] = new OIMO.Body({
                type: 'box',
                size: [w, h, d],
                pos: [-120 + x * DOT_SIZE, y * DOT_SIZE, -120 + z * DOT_SIZE * 1.2],
                move: true,
                world: world
            });
            // ドミノ碑の色を設定（ドット絵になるよう色を変更）
            color = getRgbColor(dataSet[i]);
            var material = new THREE.MeshLambertMaterial({
                color: color
            });
            // 表示用のオブジェクトを設定
            meshs[i] = new THREE.Mesh(geoBox, material);
            meshs[i].scale.set(w, h, d);
            scene.add(meshs[i]);
        }
    }
}

function createCube() {
    // 立方体のサイズ
    var w = DOT_SIZE;
    var h = DOT_SIZE;
    var d = DOT_SIZE;
    // ドミノ碑を倒す為に、赤色の立方体×16個、配置する。
    var size = bodys.length;
    for (var i = 0; i < 16; i++) {
        var x = 0;
        var y = 2;
        var z = i;
        // 物理演算用のオブジェクトを設定
        bodys[size + i] = new OIMO.Body({
            type: 'box',
            size: [w, h, d],
            pos: [-125 + x * DOT_SIZE, y * DOT_SIZE, -120 + z * DOT_SIZE * 1.2],
            move: true,
            world: world
        });
        // 立方体の色を設定（赤色）
        var material = new THREE.MeshLambertMaterial({
            color: "#f00"
        });
        // 表示用のオブジェクトを設定
        meshs[size + i] = new THREE.Mesh(geoBox, material);
        meshs[size + i].scale.set(w, h, d);
        scene.add(meshs[size + i]);
    }
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    // 物理演算の世界の時間を進める
    world.step();

    var p, r, m, x, y, z;
    var mtx = new THREE.Matrix4();
    var i = bodys.length;
    var mesh;

    // ドミノ碑の物理演算を行い位置の算出を行う
    while (i--) {
        var body = bodys[i].body;
        mesh = meshs[i];
        m = body.getMatrix();
        mtx.fromArray(m);
        mesh.position.setFromMatrixPosition(mtx);
        mesh.rotation.setFromRotationMatrix(mtx);
    }

    // 表示を更新する
    renderer.render(scene, camera);
}