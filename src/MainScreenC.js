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
                if('idPlayer' in playerInfo) {
                    WSHandler.getLevelGraph(playerInfo.idPlayer);
                }
                alert(playerInfo.childName);
                btnAction();
            });
        });
    }

    return pub;
})();

var LevelModalC = (function(){
    var pub = {};
    var layer;
    var level = 1;

    pub.load = function(){
        var obj =  ccs.load(res.level_modal_json);
        layer = obj.node;
        layer.setScale(1.5);
        layer.setPosition(cc.p(80,80));
        var btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
           layer.removeFromParent();
        });

        var btnCont = layer.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            alert("TO DO");
        })
    }

    pub.getLayer = function(){
        return layer;
    }

    return pub;
})();
