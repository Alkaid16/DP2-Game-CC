var res = {
    HelloWorld_png : "res/HelloWorld.png",
    ButtonNormal_png : "res/ButtonNormal.png",
    ButtonPressed_png : "res/ButtonPressed.png",
    MainScreen_json: "res/MainScreen.json",
    MainScene_json : "res/MainScene.json",
    map2_tmx: "res/levels/map2.tmx",
    Level4_tmx: "res/levels/Level4.tmx",
    GameFog_png: "res/GameFog.png",
    terrain_png: "res/levels/terrain.png",
    random_png: "res/levels/Tilesets/random.png",
    boy_up_plist:"res/boy_up.plist",
    boy_down_plist:"res/boy_down.plist"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
