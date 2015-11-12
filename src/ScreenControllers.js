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
                    var ajax2 = WSHandler.getLevelGraph(playerInfo.idPlayer);
                    $.when(ajax2).done(function(){
                        LevelGraphC.setLevelGraph(ajax2.responseJSON.levels);
                        btnAction();
                    })
                }
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
        pub.updateLevelStatus();
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

    pub.updateLevelStatus =  function(){
        for(var i=1; i<16; i++){
            var btn = levelBtns[i-1];
            var levelInfo = LevelGraphC.getLevelInfo(i);
            if(levelInfo.unlocked!=null && levelInfo.unlocked == 1){
                btn.setTouchEnabled(true);
                if(btn.getChildrenCount()>0) btn.removeAllChildrenWithCleanup(true);
            }else{
                btn.setTouchEnabled(false);
                var lock = new cc.Sprite(res.lock_png);
                lock.setScale(0.5);
                lock.setAnchorPoint(0,0);
                lock.setPosition(-5,0);
                btn.addChild(lock, 5);
            }
        }
    }

    return pub;
})();


var LevelModalC = (function(){
    var pub = {};
    var btnBuy;
    var btnCont;
    var btnExit;
    var btnStart;
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

    pub.updateButtons = function(levelInfo){
        var canBuy = (levelInfo.cost > 0 && levelInfo.bought == 0);
        btnBuy.setTitleText("Comprar: " + levelInfo.cost + "pt.");
        btnBuy.setVisible(canBuy);
        btnBuy.setTouchEnabled(canBuy);
        btnStart.setVisible(!canBuy);
        btnCont.setVisible(!canBuy);
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

        btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
           pub.hide();
        });

        btnCont = layer.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            alert("TO DO");
        });

        btnBuy = layer.getChildByName("btnBuy");
        btnBuy.setTouchEnabled(false);
        btnBuy.addClickEventListener(function(){
            if(parseInt(playerInfo.coins) >= parseInt(LevelGraphC.getLevelInfo(level).cost)){
                alert("you can buy me");
            }else{
                alert("No tiene suficientes puntos para comprar el nivel.")
            }
        });

        btnStart = layer.getChildByName("btnStart");
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

        pub.updateButtons(levelInfo);

        lblLevel.setString("Nivel " + level);
        if(levelInfo.score!= null) lblScore.setString("Score: " + levelInfo.score);
        else lblScore.setString("Score: -");
        if(levelInfo.defeatPosX != null && levelInfo.defeatPosX != -1)lblDefeatPos.setString(
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

PauseModalC = (function(){
    var pub = {};
    var layer;
    var pScene;
    var btnContinue;
    var btnLevels;
    var btnOptions;
    var pScene;
    var gameplay;


    pub.load = function(parentScene,gameplayScene){
        var obj =  ccs.load(res.pause_modal_json);
        pScene = parentScene;
        gameplay = gameplayScene;
        layer = obj.node;
        layer.setPosition(cc.p(150,160));
        layer.setVisible(false);
        pScene.addChild(layer,9);

        var pnlButtons = layer.getChildByName("pnlButtons");
        var btnContinue = pnlButtons.getChildByName("btnContinue");
        var btnLevels = pnlButtons.getChildByName("btnLevels");
        var btnOptions = pnlButtons.getChildByName("btnOptions");

        OptionsModalC.load(layer);

        btnContinue.addClickEventListener(function(){
            pub.hide();
        });

        btnLevels.addClickEventListener(function(){
            cc.director.runScene(LevelSelectionC.getScene());
        });

        btnOptions.addClickEventListener(function(){
            OptionsModalC.show();
        });
    };

    pub.show = function(){
       layer.setVisible(true);
       gameplay.pause();
    }

    pub.hide = function(){
        layer.setVisible(false);
        gameplay.resume();
    }

    pub.getLayer = function(){
        return layer;
    };
    return pub;
})();

OptionsModalC = (function(){
    var pub = {};
    var layer;
    var pScene;
    var btnBack;
    var pScene;


    pub.load = function(parentScene){
        var obj =  ccs.load(res.options_json);
        pScene = parentScene;
        layer = obj.node;
        layer.setPosition(cc.p(-140,-160));
        layer.setVisible(false);
        pScene.addChild(layer,9);

        var pnlBack = layer.getChildByName("pnlBtnBack");
        var btnBack = pnlBack.getChildByName("btnBack");

        btnBack.addClickEventListener(function(){
            pub.hide();
        });


    };

    pub.show = function(){
        layer.setVisible(true);

    }

    pub.hide = function(){
        layer.setVisible(false);
    }

    pub.getLayer = function(){
        return layer;
    };

    return pub;
})();