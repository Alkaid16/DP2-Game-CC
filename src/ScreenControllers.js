var networkErrorMsg = "Error de comunicacion con el servidor. Verifique su conexion a internet."

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
                }else{
                    CharacterScreenC.loadScene(ID);
                    cc.director.runScene(CharacterScreenC.getScene());
                }
            });
        });
    }

    return pub;
})();

var TitleScreenC = (function(){
    var pub = {};
    var scene = null;

    pub.loadScene = function(){
        if(scene!=null) return;
        var root = ccs.load(res.main_view_json);
        LevelSelectionC.loadScene();
        scene = root.node;
        elementsSetup();
    }

    pub.getScene = function(){
        return scene;
    }

    var elementsSetup = function(){
        var btnStart = scene.getChildByName("btnStart");
        btnStart.addClickEventListener(function(){
            var newScene =LevelSelectionC.getScene();
            cc.director.runScene(newScene);
        });
        var btnOptions = scene.getChildByName("btnOptions");
        btnOptions.addClickEventListener(function(){
            OptionsModalC.load(scene);
            OptionsModalC.show();
        });
        var btnInstructions = scene.getChildByName("btnInstructions");
        btnInstructions.addClickEventListener(function(){
           HowToPlaySceneC.loadScene();
            cc.director.runScene(HowToPlaySceneC.getScene());
        });
    }

    return pub;
})();

var LevelSelectionC = (function(){
    var pub = {};
    var levelBtns = [];
    var scene=null;

    var startLevel = function(){
        var id = this.getTag();
        LevelModalC.show(id);
    }

    pub.loadScene = function(){
        if(scene!=null) return;
        var root = ccs.load(res.level_selector_view_json);
        scene = root.node;
        LevelModalC.load(scene);
        elementsSetup();
        pub.updateLevelStatus();
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
        var btnBack = scene.getChildByName("btnBack");
        btnBack.addClickEventListener(function(){
            cc.director.runScene(TitleScreenC.getScene());
        });

        var btnFriends = scene.getChildByName("btnHelpFriends");
        btnFriends.addClickEventListener(function(){
            fbAgent.api("/me/friends", plugin.FacebookAgent.HttpMethod.GET, function (type, response) {
                if (type == plugin.FacebookAgent.CODE_SUCCEED) {
                    var data = response["data"];
                    for(var i=0;i<data.length; i++){
                        cc.log(data[i].name + " " + "ID:" + data[i].id);
                    }
                } else {
                    cc.log("Graph API request failed, error #" + type + ": " + response);
                }
            });
        });
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

    pub.updateButtons = function(){
        var levelInfo = LevelGraphC.getLevelInfo(level);
        var canBuy = (levelInfo.cost > 0 && levelInfo.bought == 0);
        btnBuy.setTitleText("Comprar: " + levelInfo.cost + "pt.");
        btnBuy.setVisible(canBuy);
        btnBuy.setTouchEnabled(canBuy);
        btnStart.setVisible(!canBuy);
        btnCont.setVisible(!canBuy);
        btnCont.setEnabled(levelInfo.defeatPosX!=null && levelInfo.defeatPosX!="-1");
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
        lblScore = layer.getChildByName("lblScore");
        lblDefeatPos = layer.getChildByName("lblDefeatPos");

        btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
           pub.hide();
        });

        btnCont = layer.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            if(playerInfo.continues<=0 ){
                alert("No tienes puntos para continuar este nivel.")
                return;
            }
            layer.pause();
            var ajax = WSHandler.registerContinue(playerInfo.idPlayer, level);
            $.when(ajax).then(function(){
                layer.setVisible(false);
                var scene = new GameplayScene(level, true);
                cc.director.runScene(scene);
                layer.resume();
            }, function(){
                alert(networkErrorMsg);
                layer.resume();
            });

        });

        btnBuy = layer.getChildByName("btnBuy");
        btnBuy.setTouchEnabled(false);
        btnBuy.addClickEventListener(function(){
            var lvlInfo = LevelGraphC.getLevelInfo(level);
            if(parseInt(playerInfo.coins) >= parseInt(lvlInfo.cost)){
                var ajax = WSHandler.registerPurchase(playerInfo.idPlayer, level);
                layer.pause();
                $.when(ajax).then(function(){
                    lvlInfo.bought = 1;
                    LevelSelectionC.updateLevelStatus();
                    layer.resume();
                    pub.updateButtons();
                    alert("Compra exitosa");
                }, function(){
                    alert(networkErrorMsg);
                    layer.resume();
                });
            }else{
                alert("No tiene suficientes puntos para comprar el nivel.")
            }
        });

        btnStart = layer.getChildByName("btnStart");
        btnStart.addClickEventListener(function(){
            layer.setVisible(false);
            cc.audioEngine.playEffect(res.correct_wav, false);
            var scene = new GameplayScene(level);
            cc.director.runScene(scene);
        });
    };

    pub.show = function(lvlNum){
        var levelInfo = LevelGraphC.getLevelInfo(lvlNum);
        if(levelInfo == null) return;
        level = levelInfo.idLevel;

        pub.updateButtons();

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
            var lvlInfo = LevelGraphC.getCurrentLevel();
            var tileWidth = gameplayMap.getTileSize().width;
            var posX = gameplayMap.getMatrixPosX(child.getPositionX(), tileWidth);
            var posY = gameplayMap.getMatrixPosY(child.getPositionY(), tileWidth);
            var ajax = WSHandler.registerDefeat(playerInfo.idPlayer,lvlInfo.idLevel, posX, posY);
            $.when(ajax).done(function(){
                lvlInfo.defeatPosX = posX;
                lvlInfo.defeatPosY = posY;
                lvlInfo.defeated = 1;
            });
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
            "Que desea hacer?");
        }else{
            btnHelp.setVisible(true);
            lblDesc.setString(playerInfo.childName + " no tiene suficiente voluntad\npara seguir avanzando.\n" +
                "Que desea hacer?");
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

       var btnContinue = layer.getChildByName("btnContinue");
        var btnLevels = layer.getChildByName("btnReturnLevelSelector");
        var btnOptions = layer.getChildByName("btnOptions");

        OptionsModalC.load(pScene);

        btnContinue.addClickEventListener(function(){
            pub.hide();
        });

        btnLevels.addClickEventListener(function(){
            LevelModalC.hide();
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
    var cLayer;

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
        var obj =  ccs.load(res.options_json);
        pScene = parentScene;
        layer = obj.node;
        layer.setPosition(cc.p(0,0));
        layer.setVisible(false);
        pScene.addChild(layer,10);
        createCoverLayer();
        var btnBack = layer.getChildByName("btnBack");

        btnBack.addClickEventListener(function(){
            pub.hide();
        });

    };

    pub.show = function(){
        cLayer.cListener.swallowTouches = true;
        layer.setVisible(true);
        cLayer.runAction(cc.fadeTo(0.3,160));
    }

    pub.hide = function(){
        layer.setVisible(false);
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

VictoryScreenC = (function(){
    var scene;
    var txtScore;
    var txtCoins;
    var txtTime;
    var btnReturn;
    var pub = {};

    pub.loadAndRun = function(score, time, coins){
        var obj = ccs.load(res.ranking_result_view_json);
        scene = obj.node;
        var pnl = scene.getChildByName("pnlGeneral");

        txtScore = pnl.getChildByName("txtScore");
        txtScore.setString("" + score);
        txtTime = pnl.getChildByName("txtTime");
        txtTime.setString("" +time);
        txtCoins = pnl.getChildByName("txtCoins");
        txtCoins.setString("" + coins);

        btnReturn = scene.getChildByName("btnLevels");
        btnReturn.addClickEventListener(function(){
            scene = null;
            LevelModalC.hide();
            LevelSelectionC.updateLevelStatus();
            cc.director.runScene(LevelSelectionC.getScene());
        });
        btnReturn.setEnabled(false);

        cc.director.runScene(scene);

        var lvlInfo = LevelGraphC.getCurrentLevel();
        var ajax = WSHandler.registerLevelClear(playerInfo.idPlayer, lvlInfo.idLevel, score, coins);
        $.when(ajax).then(function(){
            if(score > lvlInfo.score) lvlInfo.score = score;
            LevelGraphC.clearLevel();
            btnReturn.setEnabled(true);
        }, function(){
            alert(networkErrorMsg);
            btnReturn.setEnabled(true);
        });

    }

    return pub;
})();

CharacterScreenC = (function(){
    var pub = {};
    var facebookID;
    var listener;
    var pnlGirl;
    var pnlBoy;
    var txtName;
    var sprtBoy;
    var sprtGirl;
    var scene = null;
    var male = null;

    pub.loadScene = function(facebookId){
        facebookID = facebookId;
        if(scene!=null) return;
        var root = ccs.load(res.character_view_json);
        scene = root.node;
        elementsSetup();
    }

    pub.getScene = function(){
        return scene;
    }

    var elementsSetup = function(){
        txtName = scene.getChildByName("txtName");
        var btnCont = scene.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            var name = txtName.getString();
            if(name =="" || name==null || male == null) return;

            var variation = male? 0 : 1;
            var ajax = WSHandler.registerPlayer(name, facebookID ,variation);
            $.when(ajax).done(function(){
                playerInfo={
                    childName: name,
                    facebookId:facebookID,
                    clothesVariation: variation,
                    coins: 0,
                    continues: 0,
                }

                var ajax2 = WSHandler.getLevelGraph(facebookID);
                $.when(ajax2).done(function(){
                    LevelGraphC.setLevelGraph(ajax2.responseJSON.levels);
                    TitleScreenC.loadScene();
                    cc.eventManager.removeListener(listener);
                    cc.director.runScene(TitleScreenC.getScene());
                })
            });
        });

        pnlGirl = scene.getChildByName("pnlGirl");
        pnlBoy = scene.getChildByName("pnlBoy");

        sprtGirl = scene.getChildByName("sprtGirl");
        sprtBoy = scene.getChildByName("sprtBoy");

        listener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();
                var touch = event.getTouches()[0];
                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    var name = target.getName();
                    pnlGirl.setVisible(name=="sprtGirl");
                    pnlBoy.setVisible(!(name=="sprtGirl"));
                    male = !(name=="sprtGirl");
                }
            }
        });

        cc.eventManager.addListener(listener,sprtGirl);
        cc.eventManager.addListener(listener.clone(), sprtBoy);
    }

    return pub;
})();

var HowToPlaySceneC = (function(){
    var scene;
    var txtScore;
    var txtCoins;
    var txtTime;
    var btnReturn;
    var pub = {};
    var btnBack;

    pub.loadScene = function(){
        var obj = ccs.load(res.howtoplay_json);
        scene = obj.node;

        btnBack = scene.getChildByName("btnBack");
        btnBack.addClickEventListener(function(event){
            cc.director.runScene(TitleScreenC.getScene());
        });
    }

    pub.getScene = function(){
        return scene;
    }

    return pub;
})();

MessageModalC = (function(){
    var pub = {};
    var layer;
    var cLayer;

    function createCoverLayer(){
        cLayer = new cc.LayerColor(cc.color(0,0,0), 640,640);
        cLayer.setOpacity(0);
        cLayer.setPosition(cc.p(0,0));
        cLayer.cListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                return true;
            }
        });
        cc.eventManager.addListener(cLayer.cListener,cLayer);
    }


    pub.load = function(){
        var obj =  ccs.load("");
        layer = obj.node;
        layer.setVisible(false);
        createCoverLayer();

        var btnContinue = layer.getChildByName("btnContinue");

        btnContinue.addClickEventListener(function(){
            pub.hide();
        });
    };

    pub.show = function(pScene){
        pScene.addChild(layer, 9001);
        pScene.addChild(cLayer, 9000);
        layer.setVisible(true);
        cLayer.cListener.swallowTouches = true;
    }

    pub.hide = function(){
        cLayer.cListener.swallowTouches = false;
        layer.removeFromParentAndCleanup(false);
        cLayer.removeFromParentAndCleanup(false);
        layer.setVisible(false);
    }

    pub.getLayer = function(){
        return layer;
    };

    return pub;
})();