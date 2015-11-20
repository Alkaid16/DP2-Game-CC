function addMonsterIndicator(){

	var dn = new cc.DrawNode();
	currentGameplayScene.gameplayLayer.addChild(dn);
	dn.drawRect(cc.p(50,50), cc.p(200,300), cc.color(255,0,0,255), 3, cc.color(0,255,0,255));
}