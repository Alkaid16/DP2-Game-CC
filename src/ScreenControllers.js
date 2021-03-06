var networkErrorMsg = "Error de comunicaci\u00f3n con el servidor. Verifique su conexi\u00f3n a internet."

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
                    ChildSM.initAnimations(playerInfo.clothesVariation);
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
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            cc.director.runScene(newScene);
        });
        var btnOptions = scene.getChildByName("btnOptions");
        btnOptions.addClickEventListener(function(){
            OptionsModalC.load(scene);
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            OptionsModalC.show();
        });
        var btnInstructions = scene.getChildByName("btnInstructions");
        btnInstructions.addClickEventListener(function(){
            HowToPlaySceneC.loadScene();
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            cc.director.runScene(HowToPlaySceneC.getScene());
        });
    }

    return pub;
})();

var LevelSelectionC = (function(){
    var pub = {};
    var levelBtns = [];
    var lblCoins = null;
    var scene=null;

    var updateCoinsLbl = function(){
        if(lblCoins==null || !playerInfo) return;
        lblCoins.setString("Cr\u00e9ditos: " + playerInfo.coins);
    }

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
        scene.schedule(updateCoinsLbl);
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
        lblCoins = scene.getChildByName("lblCoins");

        var btnBack = scene.getChildByName("btnBack");
        btnBack.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            cc.director.runScene(TitleScreenC.getScene());
        });

        var btnFriends = scene.getChildByName("btnHelpFriends");
        btnFriends.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            HelpFriendsC.show();
        });


    }

    pub.updateLevelStatus =  function(){
        updateCoinsLbl();
        for(var i=1; i<16; i++){
            var btn = levelBtns[i-1];
            var levelInfo = LevelGraphC.getLevelInfo(i);
            if(levelInfo.unlocked!=null && levelInfo.unlocked == 1){
                btn.setTouchEnabled(true);
                if(btn.getChildrenCount()>0) btn.removeAllChildrenWithCleanup(true);
            }else{
                btn.setTouchEnabled(false);
                var lock = new cc.Sprite(res.lock_png);
                lock.setScale(1);
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
    var listRanking
    var btnExit;
    var btnStart;
    var layer;
    var lblLevel; var lblDefeatPos; var lblScore; var lblDesc;
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
        btnBuy.setTitleText("Desbloquear: " + levelInfo.cost + "crd");
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

        listRanking = layer.getChildByName("Panel_3").getChildByName("listRanking");
        lblDesc = layer.getChildByName("lblDesc");
        lblLevel = layer.getChildByName("lblLevel");
        lblScore = layer.getChildByName("lblScore");
        lblDefeatPos = layer.getChildByName("lblDefeatPos");

        btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            pub.hide();
        });

        btnCont = layer.getChildByName("btnContinue");
        btnCont.addClickEventListener(function(){
            if(parseInt(playerInfo.continues)<=0 ){
                MessageModalC.show("Error", "No tienes puntos para continuar este nivel.", layer);
                return;
            }
            layer.pause();
            var ajax = WSHandler.registerContinue(playerInfo.idPlayer, level);
            $.when(ajax).then(function(){
                layer.setVisible(false);
                var scene = new GameplayScene(level, true);

                var lvlInfo = LevelGraphC.getLevelInfo(level);
                lvlInfo.defeatPosX = -1;
                lvlInfo.defeatPosY = -1;
                lvlInfo.defeated = 0;
                playerInfo.continues = parseInt(playerInfo.continues) - 1 ;
                cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
                cc.director.runScene(scene);
                layer.resume();
            }, function(){
                MessageModalC.show("Error", networkErrorMsg, layer);
                layer.resume();
            });

        });

        btnBuy = layer.getChildByName("btnBuy");
        btnBuy.setTouchEnabled(false);
        btnBuy.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            var lvlInfo = LevelGraphC.getLevelInfo(level);
            if(parseInt(playerInfo.coins) >= parseInt(lvlInfo.cost)){
                var ajax = WSHandler.registerPurchase(playerInfo.idPlayer, level);
                layer.pause();
                $.when(ajax).then(function(){
                    lvlInfo.bought = 1;
                    playerInfo.coins = parseInt(playerInfo.coins) - parseInt(lvlInfo.cost);
                    LevelSelectionC.updateLevelStatus();
                    layer.resume();
                    pub.updateButtons();
                    MessageModalC.show("Exito", "La compra se realiz\u00f3 satisfactoriamente.", layer);
                }, function(){
                    MessageModalC.show("Error", networkErrorMsg, layer);
                    layer.resume();
                });
            }else{
                MessageModalC.show("Error","No tiene suficientes cr\u00E9ditos para desbloquear el nivel.\nJuegue otros niveles para ganar cr\u00E9ditos.", layer);
            }
        });

        btnStart = layer.getChildByName("btnStart");
        btnStart.addClickEventListener(function(){
            layer.setVisible(false);
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            var scene = new GameplayScene(level);
            cc.director.runScene(scene);
        });
    };

    pub.show = function(lvlNum){
        var levelInfo = LevelGraphC.getLevelInfo(lvlNum);
        if(levelInfo == null) return;
        level = levelInfo.idLevel;

        updateRankingList(listRanking, lvlNum,12, layer);
        pub.updateButtons();
        lblDesc.setString(levelInfo.milestone.replace("*",playerInfo.childName));
        lblLevel.setString("Nivel " + level);
        if(levelInfo.score!= null) lblScore.setString("Score: " + levelInfo.score);
        else lblScore.setString("Score: -");
        if(levelInfo.defeatPosX != null && levelInfo.defeatPosX != -1)lblDefeatPos.setString(
            "Posicion:\n(" + levelInfo.defeatPosX + ","+ levelInfo.defeatPosY + ")");
        else lblDefeatPos.setString("Posicion:\n-");

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
            pub.cleanup();
            LevelModalC.hide();
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            cc.director.runScene(LevelSelectionC.getScene());
        });

        btnRetry = layer.getChildByName("btnRetry");
        btnRetry.addClickEventListener(function(){
            pub.cleanup();
            var newScene = new GameplayScene(LevelGraphC.getCurrentLevel().idLevel);
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            cc.director.runScene(newScene);
        });

        btnHelp = layer.getChildByName("btnHelp");
        btnHelp.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            FriendRequestViewC.show(layer);
        });
        setListenerState(false);
    };

    pub.executeDefeat = function(byMonster){
        if(byMonster){
            btnHelp.setVisible(false);
            lblDesc.setString("El monstruo ha alcanzado a " + playerInfo.childName + ".\n" +
            "\u00BFQu\u00e9 desea hacer?");
        }else{
            lblDesc.setString(playerInfo.childName + " no tiene suficiente voluntad\npara seguir avanzando.\n" +
                "\u00BFQu\u00e9 desea hacer?");
            var child = gameplayMap.sprite;
            var lvlInfo = LevelGraphC.getCurrentLevel();
            var tileWidth = gameplayMap.getTileSize().width;
            var posX = gameplayMap.getMatrixPosX(child.getPositionX(), tileWidth);
            var posY = gameplayMap.getMatrixPosY(child.getPositionY(), tileWidth);
            cc._canvas.style.cursor = "wait";
            var ajax = WSHandler.registerDefeat(playerInfo.idPlayer,lvlInfo.idLevel, posX, posY);
            $.when(ajax).done(function(){
               cc._canvas.style.cursor = "auto";
                lvlInfo.defeatPosX = posX;
                lvlInfo.defeatPosY = posY;
                lvlInfo.defeated = 1;
            });
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
            pub.cleanup(false);
        }
        pScene = parentScene;
        pScene.addChild(layer, 51);
        setupCoverLayer(50);
    };

    pub.cleanup = function(pSceneCleanup){
        if(typeof pSceneCleanup === undefined) pSceneCleanup = true;
        layer.removeFromParent();
        btnHelp.setVisible(true);
        layer.setOpacity(0);
        cLayer.removeFromParent();
        cLayer.setOpacity(0);
        setListenerState(false);
        if(pSceneCleanup) currentGameplayScene.customCleanup();
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
        cc.audioEngine.resumeMusic();
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
    var musicEnabled = true;
    var soundEnabled = true;

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
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            pub.hide();
        });

        var txtMusic = layer.getChildByName("txtMusic");
        txtMusic.setTouchEnabled(true);
        txtMusic.addClickEventListener(function(){
            musicEnabled = !musicEnabled;
            if(!musicEnabled) {
                txtMusic.setString("Off");
                cc.audioEngine.setMusicVolume(0);
            }
            else {
                txtMusic.setString("On");
                cc.audioEngine.setMusicVolume(1);
            }
        });

        var txtSound = layer.getChildByName("txtSound");
        txtSound.setTouchEnabled(true);
        txtSound.addClickEventListener(function(){
            soundEnabled = !soundEnabled;
            if(!soundEnabled) {
                txtSound.setString("Off");
                cc.audioEngine.setEffectsVolume(0);
            }
            else {
                txtSound.setString("On");
                cc.audioEngine.setEffectsVolume(1);
            }
        });

        if(!musicEnabled) txtMusic.setString("Off");
        else txtMusic.setString("On");
        if(!soundEnabled) txtSound.setString("Off");
        else txtSound.setString("On");

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

VictoryScreenC2 = (function(){
    var scene;
    var btnReturn;
    var pub = {};
    var count=1;

    pub.loadAndRun = function(score, time, coins){
        count++;

        if(count==2)
        {
            count=0;
            var obj = ccs.load(res.invitation_view_json);
            scene = obj.node;
            var pnl = scene.getChildByName("pnlGeneral");
            var lblDescription = scene.getChildByName("lblDescription");
            lblDescription.setString(lblDescription.getString().replace("*", playerInfo.childName));

            btnReturn = scene.getChildByName("btnContinue");
            btnReturn.addClickEventListener(function(){
                scene = null;
                cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
                VictoryScreenC.loadAndRun(score, time, coins);
            });

            var btnInvitation = scene.getChildByName("btnInvitation");
            btnInvitation.addClickEventListener(function(){
                cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
                var win = window.open(WSHost + "/afiperudrupal/voluntarios", '_blank');
                win.focus();
            });

            cc.director.runScene(scene);

        }else{            
            VictoryScreenC.loadAndRun(score, time, coins);
        }
        
    }

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
        updateRankingList(scene.getChildByName("pnlRanking").getChildByName("listRanking"), lvlInfo.idLevel,14,scene);

        var ajax = WSHandler.registerLevelClear(playerInfo.idPlayer, lvlInfo.idLevel, score, coins);
        $.when(ajax).then(function(){
            if(score > lvlInfo.score) lvlInfo.score = score;
            playerInfo.coins= parseInt(playerInfo.coins) + coins;
            LevelGraphC.clearLevel();
            btnReturn.setEnabled(true);
        }, function(){
            MessageModalC.show("Error", networkErrorMsg, scene);
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
            if(name =="" || name==null || male == null){
                if(name=="" || name == null)
                    MessageModalC.show("Error", "Escriba un nombre para el ni\u00f1o",scene);
                else{
                    MessageModalC.show("Error", "Elija el g\u00e9nero del personaje.", scene);
                }
                return;
            }

            var regex = /^[a-zA-Z0-9]+$/;
            if(!regex.test(name)){
                MessageModalC.show("Error", "El nombre solo puede contener\nletras y n\u00fameros.", scene);
                return;
            };

            var variation = male? 0 : 1;
            var ajax = WSHandler.registerPlayer(name, facebookID ,variation);
            cc.audioEngine.playEffect(res.btnSoundAccept_mp3, false);
            cc._canvas.style.cursor = "wait";
            $.when(ajax).done(function(){
                playerInfo={
                    idPlayer: ajax.responseJSON.idPlayer,
                    childName: name,
                    idFacebook:facebookID,
                    clothesVariation: variation,
                    coins: 0,
                    continues: 0,
                }
                ChildSM.initAnimations(variation);

                var ajax2 = WSHandler.getLevelGraph(playerInfo.idPlayer);
                $.when(ajax2).done(function(){
                    cc._canvas.style.cursor = "auto";
                    LevelGraphC.setLevelGraph(ajax2.responseJSON.levels);
                    TitleScreenC.loadScene();
                    LevelSelectionC.updateLevelStatus();
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
    var scrollView;

    pub.loadScene = function(){
        var obj = ccs.load(res.howtoplay_json);
        scene = obj.node;
        scrollView = scene.getChildByName("scrollView")
        btnBack = scrollView.getChildByName("btnBack");
        btnBack.addClickEventListener(function(event){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
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
    var lblTitle;
    var lblDesc;
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
        var obj =  ccs.load(res.alert_view_json);
        layer = obj.node;
        layer.setAnchorPoint(cc.p(0.5,0.5));
        layer.setVisible(false);
        createCoverLayer();

        lblTitle = layer.getChildByName("lblTitle");
        lblDesc = layer.getChildByName("lblDesc");
        var btnContinue = layer.getChildByName("btnAccept");

        btnContinue.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            pub.hide();
        });
    };

    pub.show = function(title, desc, pScene){
        lblTitle.setString(title);
        lblDesc.setString(desc);
        layer.setPosition(cc.p(pScene.width/2, pScene.height/2));
        layer.setScale(1/pScene.getScale());
        pScene.addChild(layer, 9001);
        pScene.addChild(cLayer, 9000);
        layer.setVisible(true);
        cLayer.cListener.swallowTouches = true;
    }

    pub.hide = function(){
        cLayer.cListener.swallowTouches = false;
        layer.removeFromParent(false);
        cLayer.removeFromParent(false);
        layer.setVisible(false);
    }

    pub.getLayer = function(){
        return layer;
    };

    return pub;
})();

FriendRequestViewC = (function(){
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
        var obj =  ccs.load(res.friend_request_view_json);
        layer = obj.node;
        layer.setAnchorPoint(cc.p(0.5,0.5));
        layer.setVisible(false);
        createCoverLayer();

        var btnExit = layer.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            pub.hide();
        });

        var btnInvite = layer.getChildByName("btnInvite");
        btnInvite.addClickEventListener(function(){
            inviteFriends();
        });

        var btnHelp = layer.getChildByName("btnHelp");
        btnHelp.addClickEventListener(function(){
            requestHelp();
        });

    };

    pub.show = function(pScene){
        layer.setPosition(cc.p(pScene.width/2, pScene.height/2));
        layer.setScale(1/pScene.getScale());
        pScene.addChild(layer, 9001);
        pScene.addChild(cLayer, 9000);
        layer.setVisible(true);
        cLayer.cListener.swallowTouches = true;
    }

    pub.hide = function(){
        cLayer.cListener.swallowTouches = false;
        layer.removeFromParent(false);
        cLayer.removeFromParent(false);
        layer.setVisible(false);
    }

    pub.getLayer = function(){
        return layer;
    };

    return pub;
})();

HelpFriendsC = (function(){
    var HELP_COST = 50;
    var pub = {};
    var checkboxes = [];
    var scene = null;
    var listFriends;

    pub.loadScene = function(){
        if(scene!=null) return;
        var root = ccs.load(res.help_friends_view_json);
        scene = root.node;
        elementsSetup();
    }

    pub.show = function(){
        updateFriendsList();
        cc.director.runScene(scene);
    }

    function elementsSetup(){
        listFriends = scene.getChildByName("listFriends");
        var btnHelp = scene.getChildByName("btnHelp");
        btnHelp.addClickEventListener(function(){
            var count = 0;
            var ids = [];
            var fbIds = [];

            for(var i=0; i<checkboxes.length; i++){
                if(checkboxes[i].isSelected() ){
                    ids.push(checkboxes[i].idPlayer);
                    fbIds.push(checkboxes[i].idFacebook);
                    count++;
                }
            }

            if(count*HELP_COST > parseInt(playerInfo.coins)){
                MessageModalC.show("Error", "No tienes suficientes cr\u00e9ditos para ayudar a todos los amigos seleccionados." +
                    "\nActualmente tienes " + playerInfo.coins + ", pero necesitas " + count*HELP_COST + ".", scene);
                return;
            }

            executeHelp(ids, fbIds);
        });

        var btnExit = scene.getChildByName("btnExit");
        btnExit.addClickEventListener(function(){
            cc.audioEngine.playEffect(res.btnSoundBack_mp3, false);
            LevelModalC.hide();
            cc.director.runScene(LevelSelectionC.getScene());
        });
    }

    function updateFriendsList(){
        cc._canvas.style.cursor = "wait";
        fbAgent.api("/me/friends", plugin.FacebookAgent.HttpMethod.GET,
            function(type,response){
                if (type == plugin.FacebookAgent.CODE_SUCCEED) {
                    var fbIds = response["data"];
                    var printedFbIds = [];
                    var arr = [];

                    for (var i = 0; i < fbIds.length; i++) {
                        arr[i] = fbIds[i].id;
                    }

                    var ajax = WSHandler.getFriendsInNeed(arr);
                    $.when(ajax).done(function () {
                        var ids = ajax.responseJSON.friends;
                        for (var i = 0; i < fbIds.length; i++) {
                            for (var j = 0; j < ids.length; j++) {
                                if (ids[j].idFacebook == fbIds[i].id) {
                                    fbIds[i].idPlayer = ids[j].idPlayer;
                                    printedFbIds.push(fbIds[i]);
                                    break;
                                }
                            }
                        }
                        cc._canvas.style.cursor = "auto";
                        buildPanel(printedFbIds);
                    });
                }else{
                    cc._canvas.style.cursor = "auto";
                }
            });
    }

    function buildPanel(fbIds){
        checkboxes = [];
        listFriends.removeAllChildren();

        for(var i=0; i<fbIds.length; i++){
            var panel = new ccui.Layout();
            panel.setSizeType(ccui.Widget.SIZE_PERCENT);
            panel.setSizePercent(cc.p(1,0.1));
            panel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            if(i % 2 == 0) panel.setBackGroundColor(cc.color(150,50,150));
            else panel.setBackGroundColor(cc.color(75,10,50));
            panel.setBackGroundColorOpacity(30);

            var checkBox = new ccui.CheckBox("res/views/checkboxUnchecked.png",
                "res/views/checkboxUnchecked.png", "res/views/checkboxCheck.png",
                "res/views/checkboxUnchecked.png", "res/views/checkboxUnchecked.png");
            checkBox.setPositionType(ccui.Widget.POSITION_PERCENT);
            checkBox.setPositionPercent(cc.p(0.9,0.5));
            checkBox.setSizeType(ccui.Widget.SIZE_PERCENT);
            checkBox.setSizePercent(cc.p(0.08, 0.9));
            checkBox.setScale(0.9);
            checkBox.idPlayer = fbIds[i].idPlayer;
            checkBox.idFacebook = fbIds[i].id;
            checkboxes.push(checkBox);

            var label = new ccui.Text()
            label.setPositionType(ccui.Widget.POSITION_PERCENT);
            label.setString(fbIds[i].name);
            label.setFontName("THE MINION");
            label.setContentSize(cc.size(250,40));
            label.setAnchorPoint(cc.p(0,0.5));
            label.setPositionPercent(cc.p(0.05,0.3));

            panel.addChild(label);
            panel.addChild(checkBox);
            listFriends.addChild(panel);
        }
    }

    function executeHelp(ids, fbIds){
        var info = {
            "to": fbIds,
            "title":"Notificar sobre ayuda",
            "message": "Te he ayudado a continuar en un laberinto de tu elección. ¡Aprovecha la oportunidad!"
        };

        if(ids.length == 0) return;

        fbAgent.appRequest(info, function (code, response) {
            var recievers = response.to;
            if(recievers){
                ids.forEach(function(element, i, array){
                    WSHandler.registerContinuePurchase(playerInfo.idPlayer,element, HELP_COST);
                    playerInfo.coins = parseInt(playerInfo.coins) - HELP_COST;
                });
                updateFriendsList();
            }
        });
    }

    return pub;
})();

function updateRankingList(listRanking, lvlNum, fontSize, parent){
    listRanking.removeAllChildren(true);
    cc._canvas.style.cursor = "wait";
    fbAgent.api("/me/friends", plugin.FacebookAgent.HttpMethod.GET, function (type, response) {
        if (type == plugin.FacebookAgent.CODE_SUCCEED) {
            var facebookIds = response["data"];;

            var ids = [];
            for(var i=0;i<facebookIds.length; i++) {
                ids[i] = facebookIds[i].id;
            }

            var ajax = WSHandler.getFriendsScore(ids, lvlNum, 5);
            $.when(ajax).done(function(){
                var rank = ajax.responseJSON.scores;
                for(var i=0; i<rank.length; i++){
                    var name;
                    for(var j=0;j<facebookIds.length; j++){
                        if(rank[i].idFacebook == facebookIds[j].id) {
                            name = facebookIds[j].name;
                            break;
                        }
                    }
                    cc.log("Nombre de amigo en ranking: " + name + " " + rank[i].score);
                    var lbl = new ccui.Text(name + " " + rank[i].score, "THE MINION", fontSize);
                    lbl.setColor(cc.color(0,0,0));
                    listRanking.addChild(lbl);
                }
                cc._canvas.style.cursor = "auto";
            });
        }else{
            cc._canvas.style.cursor = "auto";
            MessageModalC.show("Error", networkErrorMsg, parent);
        }
    });
}

function inviteFriends(){
    cc._canvas.style.cursor = "wait";
    fbAgent.api("/me/friends?fields=id", plugin.FacebookAgent.HttpMethod.GET,
    function(type,response){
        cc._canvas.style.cursor = "auto";
        if (type == plugin.FacebookAgent.CODE_SUCCEED) {
            var fbIds = response["data"];
            var arr=[];
            for (var i=0;i<fbIds.length; i++){
                arr[i] = fbIds[i].id;
            }

            var info = {
                "method": "apprequests",
                "message": "Ayuda a un ni\u00f1o o ni\u00f1a a ganar confianza y superar sus problemas en Confimaze.",
                "exclude_ids": arr
            };

            FB.ui(info, function (response2) {
                var recievers = response2.to;
                if(recievers && recievers.length>=2){
                    cc._canvas.style.cursor = "wait";
                    var ajax2 = WSHandler.registerContinuePurchase(0,playerInfo.idPlayer, 0);
                    $.when(ajax2).then(function(){
                        var ajax = WSHandler.registerContinue(playerInfo.idPlayer,
                        LevelGraphC.getCurrentLevel().idLevel);
                        $.when(ajax).then(function(){
                            cc._canvas.style.cursor = "auto";
                            var scene = new GameplayScene(LevelGraphC.getCurrentLevel().idLevel, true);
                            DefeatModalC.cleanup();

                            var lvlInfo = LevelGraphC.getCurrentLevel();
                            lvlInfo.defeatPosX = -1;
                            lvlInfo.defeatPosY = -1;
                            lvlInfo.defeated = 0;
                            cc.director.runScene(scene);
                        }, function(){
                            MessageModalC.show("Error", networkErrorMsg,  FriendRequestViewC.getLayer());
                            cc._canvas.style.cursor = "auto";
                        });
                    });
                }
                else{
                    MessageModalC.show("Aviso", "Debes invitar a m\u00CDnimo dos amigos para poder continuar el laberinto.",
                    FriendRequestViewC.getLayer());
                }
            });
        }
    });
}

function requestHelp(){
    cc._canvas.style.cursor = "wait";
    fbAgent.api("/me/friends?fields=id", plugin.FacebookAgent.HttpMethod.GET, function(type,response){
        cc._canvas.style.cursor = "auto";
        if (type == plugin.FacebookAgent.CODE_SUCCEED) {
            var fbIds = response["data"];
            var arr=[];
            for (var i=0;i<fbIds.length; i++){
                arr[i] = fbIds[i].id;
            }
            var info = {
                "method": "apprequests",
                "filters": ["app_users"],
                "message": playerInfo.childName + " se ha quedado atrapado en un laberinto y necesita tu ayuda para continuar!",
            };

            fbAgent.appRequest(info, function (code, response2) {
                var recievers = response2.to;
                if(recievers){
                    DefeatModalC.cleanup();
                    LevelModalC.hide();
                    cc.director.runScene(LevelSelectionC.getScene());
                }
            });
        }
    });
}
