Evenements = new Mongo.Collection('evenements');

Meteor.methods({
  /**
  * Crée ou met à jour un évènement
  * @params : evenement (Object Evenement à créer ou mettre à jour)
  * @return : none
  */
  setEvenement: function(evenement){
  	var user = Meteor.user();
  	if (!(user && user.admin)) { throw new Meteor.Error(TAPi18n.__("error.privilege_user")); }
  	check(evenement, {
      _id: Match.Optional(Meteor.Collection.ObjectID),
  		eventId: String,
  		nom: String,
  		description: Match.Optional(String),
      illustrations: {big:  Match.Optional(String), normal: Match.Optional(String), small: Match.Optional(String) },
      isLancement: Boolean,
  		targetCarteIds: Match.Optional([String]),
  		targetCarteTags: Match.Optional([String]),
      deltaTps: Match.Optional(Number),
  		deltaEur: Match.Optional(Number),
      deltaNrg: Match.Optional(Number),
      deltaPds: Match.Optional(Number),
      deltaVol: Match.Optional(Number),
      deltaSci: Match.Optional(Number),
  		active: Boolean
  	}); 	
  	var result = Evenements.upsert({_id: evenement._id}, evenement);
  	if(result){
  		if(active) {
  			if(result.insertedId){
  				evenement._id = result.insertedId;
  				Meteor.call("throwNotification","EVENT-NEW", "*", {evenement: evenement});
  			} else {
  				Meteor.call("throwNotification","EVENT-UPD", "*", {evenement: evenement});
  			}
  		}
  		console.log(TAPi18n.__("message.evenement_enregistre", evenement.eventId + " " + evenement.intitule));
  	}
  },

  /**
  * Modifie le statut actif ou inactif d'un évènement.
  * @params : _eventId (ObjectId de l'évènement à modifier)
  *           active (Boolean)
  * @return : none
  */
  updActiveEvenement: function(_eventId, active){
  	var user = Meteor.user();
  	if (!(user && user.admin)) { throw new Meteor.Error(TAPi18n.__("error.privilege_user")); }
  	check(_eventId, Meteor.Collection.ObjectID);
  	check(active, Boolean);

  	var affectedRow = Evenements.update({_id: _eventId}, {$set: {active: active}});
  	if(affectedRow){
  		if(active){
  			var evenement = Evenements.findOne({_id: _eventId});
  			Meteor.call("throwNotification","EVENR-ACTIVE", "*", {evenement: evenement});
  		}
  	}
  },

  /**
  * Supprime un évènement de la base de données s'il n'est pas déjà utilisé dans une partie
  * @params : _eventId (ObjectId de l'évènement à supprimer)
  * @return : none 
  */
  removeEvenement: function(_eventId){
  	var user = Meteor.user();
  	if (!(user && user.admin)) { throw new Meteor.Error(TAPi18n.__("error.privilege_user")); }
    check(_eventId, Meteor.Collection.ObjectID);
  	if (Meteor.call("checkEvenementUtilise",_eventId)) { throw new Meteor.Error(TAPi18n.__("error.evenement_utilise")); }
  	var evenement = Evenements.findOne({_id: _eventId});
  	var affectedRow = Evenements.remove({_id: _eventId});
  	if(affectedRow){
  		Meteor.call("throwNotification","EVENT-DEL", user.userId, {evenement: evenement});
  	}
  },

  /**
  * Renvoie un évènememt actif aléatoire qui n'est pas dans les évènements en paramètres; si tous les évènements ont déjà été tirés, renvoie un évènement actif aléatoirement sans tenir compte du paramètre.
  * @params : eventIds (Tableau d'objectId d'évènements)
  * @return : un object Evenement
  */
  getRandomEvenement: function(eventIds){
    check(eventIds, Match.Optional([Meteor.Collection.ObjectID]));
    if(eventIds == null) eventIds = new Array();
    var totEvenements = Evenements.find({active: true},{_id: 1}).count() - eventIds.length;
    if(totEvenement == 0) return Evenements.find({active: true}).skip(Math.floor(Math.random() * (totEvenements))).limit(1);
    return Evenements.find({_id: {$nin: eventIds}, active: true}).skip(Math.floor(Math.random() * (totEvenements))).limit(1);
  }
});