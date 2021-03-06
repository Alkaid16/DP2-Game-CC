var ChildSM = (function(){
    var pub = {};
    var child;
    var currDir = -1;
    //0:Stopped, 1:Running
    var state = 0;
    //Arreglo con las 4 animaciones para correr
    var runAnims = [];
    var arrows = [];
    var currShownArrows = [];
    var monstAnim;

    pub.initSM = function(){
        currDir = -1;
        state = 0;
        currShownArrows=[];
        pub.hideArrows();
    }

    pub.initAnimations= function(variation){
        var prefix;
        if(variation==0) {
            prefix = "nino";
            cc.spriteFrameCache.addSpriteFrames(res.spritesheetNino_plist);
        }
        else {
            prefix = "nina";
            cc.spriteFrameCache.addSpriteFrames(res.spritesheetNina_plist);
        }
        cc.spriteFrameCache.addSpriteFrames(res.monstruo_plist);
        loadAnimation(1,8,prefix+"Frente");
        loadAnimation(1,8,prefix+"Post");
        loadAnimation(1,9,prefix+"Perf");
        loadMonsterAnimation();
        loadArrows();
    }

    function loadAnimation(ini, end, name){
        var animation;
        var animFrames = [];

        for(var i=ini;i<end+1;i++){
            var str = name+i+".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            frame.setOriginalSize(cc.size(30,30));
            animFrames.push(frame);
        }
        animation = new cc.Animation(animFrames, 0.05, 100);
        runAnims.push(cc.animate(animation));
    }

    function loadMonsterAnimation(){
        var animFrames = [];

        for(var i=1; i<9; i++){
            var str = "monstruo" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }
        var animation = new cc.Animation(animFrames, 0.1, 100);
        monstAnim = cc.repeatForever(cc.animate(animation));
    }

    function loadArrows(){
        var arrow = new cc.Sprite(res.arrow_png);
        arrow.setPosition(cc.p(15,85));
        arrow.setScale(0.25);
        arrow.setRotation(90);
        arrows.push(arrow);
        arrow = new cc.Sprite(res.arrow_png);
        arrow.setPosition(cc.p(15,55));
        arrow.setScale(0.25);
        arrow.setRotation(-90);
        arrows.push(arrow);
        arrow = new cc.Sprite(res.arrow_png);
        arrow.setPosition(cc.p(0,70));
        arrow.setScale(0.25);
        arrows.push(arrow);
        arrow = new cc.Sprite(res.arrow_png);
        arrow.setPosition(cc.p(30,70));
        arrow.setScale(0.25);
        arrow.setRotation(180);
        arrows.push(arrow);
    }

    pub.runMonsterAnimation = function(sprite){
        sprite.runAction(monstAnim);
    }

    pub.setDirection = function(direction){
        dir = direction;
    }

    pub.isStopped = function(){
        return state==0;
    }

    pub.stop = function(){
        state = 0;
    }

    pub.startRunning = function(){
        state = 1;
    }

    pub.setChild = function(childObj){
        child = childObj
    }

    pub.runAnimation= function(sprite, index){
        sprite.runAction(runAnims[index]);
    }

    pub.updateAnimation = function(sprite,dir){
        if(currDir==dir) return;
        currDir = dir;
        sprite.stopAllActions();
        switch(dir){
            case 0:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,1);
                break;
            case 1:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,0);
                break;
            case 2:
                sprite.setFlippedX(true);
                pub.runAnimation(sprite,2);
                break;
            case 3:
                sprite.setFlippedX(false);
                pub.runAnimation(sprite,2);
                break;
        }
        sprite.setScaleY(40/sprite.getTextureRect().height);
        sprite.setScaleX(0.9);
        var anchor = sprite.getAnchorPoint();
        anchor.y = 16/40;
        sprite.setAnchorPoint(anchor);
    }

    pub.showArrows = function(arr){
        for(var i= 0; i<arr.length; i++ ){
            if(i>=0 && i<4) child.addChild(arrows[arr[i]], 10);
        }
        currShownArrows = arr;
    }

    pub.hideArrows = function(){
        for(var i= 0; i<arrows.length; i++ ){
            if(arrows[i].getParent()) child.removeChild(arrows[i], false);
        }
    }

    return pub;
})();
