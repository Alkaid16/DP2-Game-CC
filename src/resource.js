var res = {
    HelloWorld_png : "res/HelloWorld.png",
    MainScene_json : "res/MainScene.json",
    map2_tmx: "res/levels/map2.tmx",
    terrain_png: "res/levels/terrain.png",
    boy_up_plist:"res/boy_up.plist",
    boy_down_plist:"res/boy_down.plist"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
