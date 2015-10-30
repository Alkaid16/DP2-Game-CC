var MainSceneC = (function(){
    var pub = {};
    var mainScreen;
    var btnStart;
    var txtID;

    pub.loadMainScreen = function(btnAction){
        var root = ccs.load(res.MainScreen_json);
        mainScreen = root.node;
        elementsSetup(btnAction);
        return root.node;
    }

    var elementsSetup = function(btnAction){
        btnStart = mainScreen.getChildByName("btnStart");
        txtID = mainScreen.getChildByName("txtID");

        btnStart.addClickEventListener(function (event){
            var ID = txtID.getString();
            var ajax = WSHandler.getPlayerInfo(ID);
            $.when(ajax).done( function(){
                playerInfo = ajax.player;
                alert(playerInfo.childName);
                btnAction();
            });
        });
    }

    return pub;
})();
