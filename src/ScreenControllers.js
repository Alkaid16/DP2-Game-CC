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
        var panel = scene.getChildByName("Panel_2");
        for(var i=1; i<7; i++){
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
            var scene = new HelloWorldScene(level);
            cc.director.runScene(scene);
        });
    };

    pub.show = function(lvlNum){
        var levelInfo = LevelGraphC.getLevelInfo(lvlNum);
        if(levelInfo == null) return;
        level = levelInfo.idLevel;
        cLayer.cListener.swallowTouches = true;
        layer.setVisible(true);
        layer.runAction(cc.moveTo(0.4,visiblePos));
        cLayer.runAction(cc.fadeTo(0.4,160));
    }

    pub.hide = function(){
        layer.runAction(cc.moveTo(0.4,disabledPos));
        cLayer.runAction(cc.fadeTo(0.4,0));
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

    pub.load = function(){
        var obj =  ccs.load(res.defeat_view_json);

        layer = obj.node;
        layer.setVisible(false);
        layer.setOpacity(0);

        createCoverLayer();

        var btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
            alert("TO DO");
        });

        var btnRetry = layer.getChildByName("btnRetry");
        btnRetry.addClickEventListener(function(){
            alert("TO DO");
        });

        var btnHelp = layer.getChildByName("btnHelp");
        btnHelp.addClickEventListener(function(){
            alert("TO DO");
        });
    };

    pub.executeDefeat = function(){
        cLayer.runAction(cc.fadeIn(1.5));
        cLayer.cListener.swallowTouches = true;
        layer.runAction(cc.delayTime(1.5));
        layer.runAction(cc.fadeIn(0.5));
    };

    pub.setParentScene = function(parentScene){
        if(pScene != null){
            layer.removeFromParent();
            cLayer.removeFromParent();
        }
        pScene = parentScene;
        setupCoverLayer(50);
        pScene.addChild(layer, 51);
    };

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