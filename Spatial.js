getUserLanguage = function () {
  // Put here the logic for determining the user language
  return "fr";
};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
   // var last = Meteor.users.aggregate([{$group:{_id:null, maxU:{$max: "$username"}}}]);
    //  last.forEach(function(m){ console.log(m.maxU); });
  });
  
  Meteor.publish("users", function(){
    return Meteor.users.find();
  });
}

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault('counter', 0);
  Meteor.subscribe("users");

  Template.hello.helpers({
    counter: function () {
      return Session.get('counter');
    },
    teste: function(){
      
      var nbr = -1;
      var str = '{"$or":[{"username":"admin"}, {"username":"u200846"}]}';
      try {
        var con  = JSON.parse(str);
        nbr = Meteor.users.find(con).count();
      } catch(e){
        console.error(TAPi18n.__("error.syntaxe_carte_regles", "T1"), e);
      } 
      if(nbr > -1) return "OK";
      return "ERREUR";
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set('counter', Session.get('counter') + 1);
     // var condition = "{username:\"admin\", admin: true}";
     // var carteTest = {"carteId": "T1", "nom": "Carte Test"};
     // Meteor.call("throwNotification","CARTE-NEW", "*", {carte: carteTest});

     
    }
  });
}
