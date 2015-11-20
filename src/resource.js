var res = {
    
    invitation_view_json: "res/views/invitation_view.json",
    btnContinue_png : "res/views/btnContinue.png",
    btnInvitation_png : "res/views/btnInvitation.png",

    ButtonNormal_png : "res/views/buttonNormal.png",
    ButtonPressed_png : "res/views/buttonPressed.png",
    MainScreen_json: "res/views/MainScreen.json",
    defeat_view_json: "res/views/defeat_view.json",
    level_selector_view_json : "res/views/level_selector_view.json",
    level_modal_json : "res/views/level_modal.json",
    ranking_result_view_json : "res/views/ranking_result_view.json",
    main_view_json : "res/views/main_view.json",
    character_view_json: "res/views/character_view.json",
    alert_view_json: "res/views/alert_view.json",
    Level1_tmx: "res/levels/Level1.tmx",
    Level2_tmx: "res/levels/Level2.tmx",
    Level3_tmx: "res/levels/Level3.tmx",
    Level4_tmx: "res/levels/Level4.tmx",
    Level5_tmx: "res/levels/Level5.tmx",
    Level6_tmx: "res/levels/Level6.tmx",
    Level7_tmx: "res/levels/Level7.tmx",
    Level8_tmx: "res/levels/Level8.tmx",
    Level9_tmx: "res/levels/Level9.tmx",
    Level10_tmx: "res/levels/Level10.tmx",
    Level11_tmx: "res/levels/Level11.tmx",
    Level12_tmx: "res/levels/Level12.tmx",
    Level13_tmx: "res/levels/Level13.tmx",
    Level14_tmx: "res/levels/Level14.tmx",
    Level15_tmx: "res/levels/Level15.tmx",
    GameFog_png: "res/views/GameFog.png",
    terrain_png: "res/levels/Tilesets/terrain.png",
    gameHUD_json: "res/views/gameHUD.json",
    exMark_png: "res/views/exMark.png",
    arrow_png: "res/views/arrow.png",
    lock_png: "res/views/lock.png",
    integrado_png:"res/levels/Tilesets/integrado.png",
    random_png: "res/levels/Tilesets/random.png",
    spritesheetNino_plist: "res/spritesheets/spritesheetNino.plist",
    monstruo_plist: "res/spritesheets/monstruo.plist",
    pause_modal_json: "res/views/pause_modal.json",
    options_json: "res/views/options_modal.json",
    howtoplay_json: "res/views/howtoplay_view.json",
    correct_wav: "res/correct.wav",
    MINION_ttf: {type: "font", name: "THE MINION", srcs: ["res/views/THE MINION.ttf"]}
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}
