var WSHandler = (function(){
    var pub = {};
    //Servidor de la cato 200.16.7.111
    //Servidor nube 162.243.118.33
    var host = WSHost + "/afiperularavel/public/game";

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
    pub.registerPlayer = function(childName, idFacebook, clothesVariation){

        $.ajax({
            url: host + "/player?" + "childName=" + childName + "&"
            + "idFacebook=" + idFacebook + "&"
            + "coins=" + 0 + "&"
            + "hairVariation=" + 0 + "&"
            + "clothesVariation=" + clothesVariation + "&"
            + "continues=" + 0,
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

        var ajax = $.ajax({
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

        return ajax;
    };

    pub.registerLevelClear = function(idPlayer, idLevel, score, coinsWon){

        var ajax = $.ajax({
            url: host + "/level/clear?" + "idPlayer=" + idPlayer + "&"
            + "idLevel=" + idLevel + "&"
            + "score=" + score + "&"
            + "coinsWon=" + coinsWon,
            type: "POST",
            crossDomain: true,
            contentType: "application/json"
        });

        return ajax;
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

    pub.registerContinue = function(idPlayer, idLevel){
        var ajax = $.ajax({
            url: host + "/level/continue?" + "idPlayer=" + idPlayer + "&"
            + "idLevel=" + idLevel,
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
        });
        return ajax;
    };

    pub.getFriendsScore = function(idPlayers, idLevel, numPlayers){
        var object = {
            idPlayers: idPlayers,
            idLevel: idLevel,
            numPlayers: numPlayers
        }


        var ajax = $.ajax({
            url: host + "/friends/score",
            type: "POST",
            data: JSON.stringify(object),
            crossDomain: true,
            success: function(data){
                return;
            }
        });

        return ajax;
    };

    pub.registerContinuePurchase = function(idPlayerBuying, idPlayerHelped, price){
        if(!price) price = 50;

        var ajax = $.ajax({
            url: host + "/friends/help?" + "idPlayerBuying=" + idPlayerBuying + "&"
            + "idPlayerHelped=" + idPlayerHelped + "&"
            + "price=" + price,
            type: "POST",
            crossDomain: true,
            contentType: "application/json",
        });

        return ajax;
    };

    pub.getFriendsInNeed = function(idPlayers){
        var object = {
            idPlayers: idPlayers,
        }


        var ajax = $.ajax({
            url: host + "/friends/helpNeeded",
            type: "POST",
            data: JSON.stringify(object),
            crossDomain: true,
            success: function(data){
                return;
            }
        });

        return ajax;
    };

    return pub;
})();
