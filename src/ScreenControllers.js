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
                    LevelGraphC.load(playerInfo.idPlayer);
                }
                alert(playerInfo.childName);
                btnAction();
            });
        });
    }

    return pub;
})();

var LevelSelectionC = (function(){
    var pub = {};
    var levelBtns = [];
    var scene;
    var btnStart;
    var txtID;

    var startLevel = function(){
        var id = this.getTag();
        LevelModalC.show(id);
    }

    pub.loadScene = function(){
        var root = ccs.load(res.level_selector_view_json);
        scene = root.node;
        LevelModalC.load(scene);
        elementsSetup();
        return root.node;
    }

    pub.getScene = function(){
        return scene;
    }

    var elementsSetup = function(){
        var panel = scene.getChildByName("pnlMap");
        for(var i=1; i<16; i++){
            levelBtns[i-1] = panel.getChildByTag(i);
            levelBtns[i-1].addClickEventListener(startLevel);
            levelBtns[i-1].setTouchEnabled(true);
        }
    }

    return pub;
})();


var LevelModalC = (function(){
    var pub = {};
    var layer;
    var lblLevel; var lblDefeatPos; var lblScore;
    var cLayer;
    var pScene;
    var visiblePos = cc.p(80,80);
    var disabledPos = cc.p(650, 80);
    var level = 1;

    function createCoverLayer(){
        cLayer = new cc.LayerColor(cc.color(0,0,0), 640,640);
        cLayer.setOpacity(0);
        cLayer.setPosition(cc.p(0,0));
        pScene.addChild(cLayer,9);
        cLayer.cListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                return true;
            }
        });
        cc.eventManager.addListener(cLayer.cListener,cLayer);
    }

    pub.load = function(parentScene){
        var obj =  ccs.load(res.level_modal_json);
        pScene = parentScene;

        layer = obj.node;
        layer.setVisible(false);
        layer.setScale(1.5);
        layer.setPosition(disabledPos);
        pScene.addChild(layer,10);
        createCoverLayer();

        lblLevel = layer.getChildByName("lblLevel");
        lblScore = layer.getChildByName("lvlScore");
        lblDefeatPos = layer.getChildByName("lblDefeatPos");

        var btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
           pub.hide();
        });

        var btnCont = layer.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            alert("TO DO");
        });

        var btnStart = layer.getChildByName("btnStart");
        btnStart.addClickEventListener(function(){
            layer.setVisible(false);
            var scene = new GameplayScene(level);
            cc.director.runScene(scene);
        });
    };

    pub.show = function(lvlNum){
        var levelInfo = LevelGraphC.getLevelInfo(lvlNum);
        if(levelInfo == null) return;
        level = levelInfo.idLevel;

        lblLevel.setString("Nivel " + level);
        if(levelInfo.score!= null) lblScore.setString("Score: " + levelInfo.score);
        else lblScore.setString("Score: -");
        if(levelInfo.defeatPosX != null || levelInfo.defeatPosX != -1)lblDefeatPos.setString(
            "Posicion: (" + levelInfo.defeatPosX + ","+ levelInfo.defeatPosY + ")");
        else lblDefeatPos.setString("Posicion: -");

        cLayer.cListener.swallowTouches = true;
        layer.setVisible(true);
        layer.runAction(cc.moveTo(0.3,visiblePos));
        cLayer.runAction(cc.fadeTo(0.3,160));
    }

    pub.hide = function(){
        layer.runAction(cc.moveTo(0.3,disabledPos));
        cLayer.runAction(cc.fadeTo(0.3,0));
        setTimeout(function(){
            layer.setVisible(false);
            cLayer.cListener.swallowTouches = false;
        },400);
    }

    pub.getLayer = function(){
        return layer;
    };

    return pub;
})();

var DefeatModalC = (function(){
    var pub = {};
    var layer;
    var pScene;
    var cLayer;
    var btnExit;
    var btnRetry;
    var btnHelp;
    var lblDesc;

    function setListenerState(bool){
        btnExit.setTouchEnabled(bool);
        btnRetry.setTouchEnabled(bool);
        btnHelp.setTouchEnabled(bool);
    }

    pub.load = function(){
        var obj =  ccs.load(res.defeat_view_json);

        layer = obj.node;
        layer.setPosition(cc.p(80,80));
        layer.setVisible(false);
        layer.setOpacity(0);

        createCoverLayer();

        lblDesc = layer.getChildByName("lblDescription");
        btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
            currentGameplayScene.customCleanup();
            LevelModalC.hide();
            cc.director.runScene(LevelSelectionC.getScene());
        });

        btnRetry = layer.getChildByName("btnRetry");
        btnRetry.addClickEventListener(function(){
            currentGameplayScene.customCleanup();
            var newScene = new GameplayScene(LevelGraphC.getCurrentLevel().idLevel);
            cc.director.runScene(newScene);
        });

        btnHelp = layer.getChildByName("btnHelp");
        btnHelp.addClickEventListener(function(){
            var child = gameplayMap.sprite;
            var tileWidth = gameplayMap.getTileSize().width;
            var posX = gameplayMap.getMatrixPosX(child.getPositionX(), tileWidth);
            var posY = gameplayMap.getMatrixPosY(child.getPositionY(), tileWidth);
            WSHandler.registerDefeat(playerInfo.idPlayer, LevelGraphC.getCurrentLevel().idLevel, posX, posY);
            currentGameplayScene.customCleanup();
            LevelModalC.hide();
            cc.director.runScene(LevelSelectionC.getScene());
        });
        setListenerState(false);
    };

    pub.executeDefeat = function(byMonster){
        if(byMonster){
            btnHelp.setVisible(false);
            lblDesc.setString("El monstruo ha alcanzado a " + playerInfo.childName + ".\n" +
            "?Que desea hacer?");
        }else{
            btnHelp.setVisible(true);
            lblDesc.setString(playerInfo.childName + " no tiene suficiente voluntad para seguir avanzando.\n" +
                "?Que desea hacer?");
        }
        layer.setVisible(true);
        cLayer.runAction(cc.fadeIn(1.5));
        cLayer.cListener.swallowTouches = true;
        var seq = cc.sequence(new Array(cc.delayTime(1.5),cc.fadeIn(0.5)));
        layer.runAction(seq);
        setListenerState(true);
    };

    pub.setParentScene = function(parentScene){
        if(pScene != null){
            pub.cleanup();
        }
        pScene = parentScene;
        pScene.addChild(layer, 51);
        setupCoverLayer(50);
    };

    pub.cleanup = function(){
        layer.removeFromParent();
        layer.setOpacity(0);
        cLayer.removeFromParent();
        cLayer.setOpacity(0);
        setListenerState(false);
    }

    function createCoverLayer(){
        cLayer = new cc.LayerColor(cc.color(0,0,0), 640,640);
        cLayer.setOpacity(0);
        cLayer.setPosition(cc.p(0,0));
    }

    function setupCoverLayer(zOrder){
        pScene.addChild(cLayer, zOrder);
        if(!("cListener" in cLayer)) {
            cLayer.cListener = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,
                onTouchBegan: function (touch, event) {
                    return true;
                }
            });
            cc.eventManager.addListener(cLayer.cListener, cLayer);
        }else{
            cLayer.cListener.swallowTouches = false;
        }
    }

    return pub;
})();