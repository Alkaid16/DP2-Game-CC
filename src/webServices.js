var WSHandler = (function(){
    var pub = {};
    var host = "http://200.16.7.111/afiperularavel/public/game";

    //Funcion que obtiene el objeto Player, con toda la informacion del jugador. Si la llamada falla, se retorna -1.
    pub.getPlayerInfo= function(fbID){
        var func = $.ajax({
            url: host + "/player?idFacebook=" + fbID + "",
            dataType: "json",
            crossDomain: true,
            success: function (data){
                var player = data;
                func.player = player;
            },
            error: function(xhr){
                return -1;
            }

        });
        return func;
    };

    //Funcion para registrar un nuevo jugador en la base de datos
    pub.registerPlayer = function(player){
        $.ajax({
            url: host + "/player?" + "childName=" + player.childName + "&"
            + "idFacebook=" + player.idFacebook + "&"
            + "coins=" + player.coins + "&"
            + "hairVariation=" + player.hairVariation + "&"
            + "clothesVariation=" + player.clothesVariation + "&"
            + "continues=" + player.continues,
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
            complete: function(){
                return 1;
            }
        });

        return -1;
    };

    pub.getLevelGraph= function(idPlayer){
        var func = $.ajax({
            url: host + "/level/graph?idPlayer=" + idPlayer + "",
            dataType: "json",
            crossDomain: true,
            success: function (data){
                levelGraph = data;
            },
            error: function(xhr){
                return -1;
            }
        });
        return func;
    };

    pub.registerDefeat = function(idPlayer, idLevel, defeatedPosX, defeatedPosY){

        $.ajax({
            url: host + "/level/defeat?" + "idPlayer=" + idPlayer + "&"
            + "idLevel=" + idLevel + "&"
            + "defeatPosX=" + defeatedPosX + "&"
            + "defeatPosY=" + defeatedPosY,
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
            complete: function(){
                return 1;
            }
        });

        return -1;
    };

    pub.registerPurchase = function(idPlayer, idLevel){

        var ajax = $.ajax({
            url: host + "/level/purchase?" + "idPlayer=" + idPlayer + "&"
            + "idLevel=" + idLevel,
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
        });
        return ajax;
    };

    return pub;
})();
