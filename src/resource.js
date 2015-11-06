var res = {
    HelloWorld_png : "res/HelloWorld.png",
    ButtonNormal_png : "res/buttonNormal.png",
    ButtonPressed_png : "res/buttonPressed.png",
    MainScreen_json: "res/MainScreen.json",
    MainScene_json : "res/MainScene.json",
    defeat_view_json: "res/views/defeat_view.json",
    level_selector_view_json : "res/views/level_selector_view.json",
    level_modal_json : "res/views/level_modal.json",
    map2_tmx: "res/levels/map2.tmx",
    Level1_tmx: "res/levels/Level1.tmx",
    Level2_tmx: "res/levels/Level2.tmx",
    Level4_tmx: "res/levels/Level4.tmx",
    Level3_tmx: "res/levels/Level3.tmx",
    Level6_tmx: "res/levels/Level6.tmx",
    Level7_tmx: "res/levels/Level7.tmx",
    Level9_tmx: "res/levels/Level9.tmx",
    Level10_tmx: "res/levels/Level10.tmx",
    GameFog_png: "res/GameFog.png",
    terrain_png: "res/levels/Tilesets/terrain.png",
    gameHUD_json: "res/views/gameHUD.json",
    exMark_png: "res/exMark.png",
    random_png: "res/levels/Tilesets/random.png",
    boy_up_plist:"res/boy_up.plist",
    boy_down_plist:"res/boy_down.plist",
    spritesheetNino_plist: "res/spritesheets/spritesheetNino.plist",
    monstruo_plist: "res/spritesheets/monstruo.plist"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
