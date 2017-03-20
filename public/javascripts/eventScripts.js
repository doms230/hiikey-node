/**
 * Created by d_innovator on 2/12/17.
 * git
 */

//signinDiv
var parse = require("parse").Parse;
parse.initialize("O9M9IE9aXxHHaKmA21FpQ1SR26EdP2rf4obYxzBF"); parse.serverURL = 'http://localhost:3000/parse';
var moment = require("moment");

var currentUser = parse.User.current();
var showShowMessageBar = false;
var didRSVP = false;
var eventId;
var eventHostId;
var eventTitle;
var isInvited = false;
var address;
var coordinates;
var invites;

//var currentUser = true;
$(function(){
   // $('#rsvpButton').hide();
    // alert(currentUser.id);

    //alert(objectId);
    /*parse.User.logOut().then(() => {
        loadEventInfo("LU31SRksFm");
    });*/

   loadEventInfo("LU31SRksFm");

    $('#rsvpButton').click(function () {
        if (currentUser){
            var NewRSVP = parse.Object.extend("RSVP");
            var rsvp = new NewRSVP();
            rsvp.set("eventId", eventId);
            rsvp.set("userId", currentUser.id);
            rsvp.set("eventHostId", eventHostId);
            rsvp.set("eventTitle", eventTitle);
            rsvp.set("isSubscribed", true);
            rsvp.set("isConfirmed", isInvited);
            rsvp.set("isRemoved", false);
            rsvp.set("isBlocked", false);
            rsvp.save(null, {
                success: function(gameScore) {
                    if (isInvited){
                        $('#rsvpButton').hide();
                        loadLocation();
                        configureMessages();
                        loadRSVPs();

                    } else {
                        $('#rsvpButton').hide();
                        $('#alertDiv').append('<div class="alert alert-info" role="alert">RSVP Pending</div>');
                        $('#alertDiv').show();
                    }
                },
                error: function(gameScore, error) {
                    // Execute any logic that should take place if the save fails.
                    // error is a Parse.Error with an error code and message.
                    alert('Failed to create new object, with error code: ' + error.message);
                }
            });

        } else {
            $("#signinDiv").show();
        }
    });

    $('#signin').click(function () {
        var username =  document.getElementById('inputUsername').value;
        var password =  document.getElementById('inputPassword').value;

        parse.User.logIn(username, password, {
            success: function(user) {
                currentUser = user;
                $('#signinDiv').hide();
                configureUser(invites);
            },
            error: function(user, error) {
                // The login failed. Check error to see why.
                alert(error);
                //console.log(error);
            }
        });
    });

    $('#sendmsg').click(function (e) {
        var message =  document.getElementById('usermsg').value;
        //TODO: send notification
        var New = parse.Object.extend("Chat");
        var newMessage = new New();
        newMessage.set("message", message);
        newMessage.set("userId", currentUser.id);
        newMessage.set("eventId", eventId);
        newMessage.save(null, {
            success: function (object) {
                // Execute any logic that should take place after the object is saved.
                document.getElementById('usermsg').value = "";
            },
            error: function (gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.

            }
        });
    });

    $('#location').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        $('#rsvpDiv').hide();
        $('#messageDiv').hide();
        $('#messageBarDiv').hide();
        $('#locationDiv').show();
    });

    $('#messages').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        $('#locationDiv').hide();
        $('#rsvpDiv').hide();
        $('#messageDiv').show();
        if (showShowMessageBar){
            $('#messageBarDiv').show();
        }
    });

    $('#rsvps').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        $('#locationDiv').hide();
        $('#messageDiv').hide();
        $('#messageBarDiv').hide();
        $('#rsvpDiv').show();
    });

    //check to se if user is logged in

});

//event info
function loadEventInfo(objectId){
    var Posts = parse.Object.extend('Event');
    var query = new parse.Query(Posts);
    query.equalTo("objectId", objectId);
    query.find({
        success: function(results) {
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                eventId = object.id;

                //var startDate = new Date(object.get("startTime"));
                var startDate = moment(new Date(object.get("startTime"))).format("ddd, MMM Do YYYY, h:mm a");
                //TODO: Change this
                var endDate = moment(new Date(object.get("endTime"))).format("ddd, MMM Do YYYY, h:mm a");
                //var createJaunt = momenttz.tz(createDate, "America/Chicago").format("ddd, MMM Do YYYY, h:mm a");
                eventTitle = object.get('title');
                var image = (object.get("eventImage").name())[0].src = object.get("eventImage").url();
                var code = object.get("code");
                var description = object.get("description");
                eventHostId = object.get("userId");

                address = object.get("address");
                var eventLocation = object.get('location');
                coordinates = eventLocation.latitude + "," + eventLocation.longitude;
                invites = object.get('invites');

                loadEventUser(eventHostId,eventTitle,image,code,description,startDate,endDate);

            }
        },
        error: function(error) {
            //alert("Error: " + error.code + " " + error.message);
            //res.send("Error: " + error.code + " " + error.message);
        }
    });
}

function loadEventUser(userId, title, image, code, description, startDate, endDate ){
    var User = parse.Object.extend("_User");
    var query = new parse.Query(User);
    query.get(userId, {
        success: function(object) {
            //console.log(object);
            // The object was retrieved successfully.
            var displayName = object.get("username");
            var userImage = (object.get("Profile").name())[0].src = object.get("Profile").url();

            $('#eventInfoDiv').append(
                '<h1>' + title + '</h1>' +
               // '<h4>' + displayName + '- <small>' + description + '</small></h4>' +
                '<h4> Date - <small>' + startDate +  ' - ' +  endDate + '</small></h4>' +
                '<a href="#" class="thumbnail">' +
                '<img alt="..." src=' + image + '>' +
                '</a>' +
                '<h4>event code: <span class="label label-danger">' + code + '</span> </h4>' );

            //append event host description
            appendMessage(displayName, " ", description, userImage);

            //then configure current user stuff
            if (currentUser){
                configureUser(invites);
            } else {
                $("#signinDiv").show();
            }

        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
        }
    });
    //console.log(data);
}
//location

function loadLocation(){
    //TODO: put actual data here

    var coordinate = "//www.google.com/maps/embed/v1/place?q=" + coordinates + "&zoom=17" +
        "&key=AIzaSyAdnr849aDFzuYIJBTqyzdapF_7aR8AikI";

    $('#locationDiv').append('<div class="container-fluid">' +

        '<h4>' + address + '</h4>' +

        '<iframe src=' + coordinate + '></iframe>' +

        '</div>' );
    $('#locationDiv').show();
}

//messages

function configureMessages(){
    showShowMessageBar = true;
    //TODO: load proper event id
    var Posts = parse.Object.extend('Chat');
    var query = new parse.Query(Posts);
    query.equalTo("eventId", eventId);
    query.descending("createdAt");
    query.find({
        success: function(results) {
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                //TODO: Change this
                var createDate = moment(new Date(object.createdAt)).format("ddd, MMM Do YYYY, h:mm a");
                //var createJaunt = momenttz.tz(createDate, "America/Chicago").format("ddd, MMM Do YYYY, h:mm a");
                var message = object.get("message");
                var userId = object.get("userId");

                loadUserInfo(userId,createDate,message,true);
            }
        },
        error: function(error) {
            //alert("Error: " + error.code + " " + error.message);
            console.log("Error: " + error.code + " " + error.message);
        }
    });

   // var query = new parse.Query('Chat');
    //query.equalTo("eventId", "0mrEjZt6I7");
    var subscription = query.subscribe();

    subscription.on('create', (object) => {
        //console.log('object created: ' + object.get('message'));
        //alert('object created: ' + object.get('message'))
        var createDate = new Date(object.createdAt);
        //TODO: Change this
        //var createJaunt = momenttz.tz(createDate, "America/Chicago").format("ddd, MMM Do YYYY, h:mm a");
        var message = object.get("message");
        var userId = object.get("userId");

        loadUserInfo(userId,createDate,message,true);

    });
}

function appendMessage(name, date, message, image) {
    $('#messageDiv').append( '<div class="container-fluid">' +
        '<div class="media">' +
        '<div class="media-left">' +
        '<img class="img-circle" src=' + image + ' alt="..." width="64" height="64" >' +
        '</div>' +
        '<div class="media-body">' +
        '<h4 class="media-heading">' + name + '<small>' + date + '</small></h4>' +
        message +
        '</div>' +
        '</div>' +
        '</br>' +
        '</div>' );

}

//rsvp

function loadRSVPs(){
    var Posts = parse.Object.extend('RSVP');
    var query = new parse.Query(Posts);
    query.equalTo("eventId", eventId);
    query.equalTo("isConfirmed", true);
    query.descending("createdAt");
    query.find({
        success: function(results) {
            // Do something with the returned Parse.Object values
            for (var i = 0; i < results.length; i++) {
                var object = results[i];

                var userId = object.get("userId");
                loadUserInfo(userId,"","",false);
            }
        },
        error: function(error) {
            //alert("Error: " + error.code + " " + error.message);
            res.send("Error: " + error.code + " " + error.message);
        }
    });


}

function appendRSVP(image, username, displayName) {
    $('#rsvpDiv').append(
        '<div class="container-fluid">' +
        '<div class="media">' +
        '<div class="media-left">' +
        '<img class="img-circle" src=' + image + ' alt="..." width="64" height="64" >' +
        '</div>' +
        '<div class="media-body">' +
        '<h4 class="media-heading">' + username + '</h4>' +
        displayName +
        '</div>' +
        '</div>' +
        '</br>' +
        '</div>');
}

//user

function loadUserInfo(userId, date, message, isChat){
    var User = parse.Object.extend("_User");
    var query = new parse.Query(User);
    query.get(userId, {
        success: function(object) {
            //console.log(object);
            // The object was retrieved successfully.
            var username = object.getUsername();
            var displayName = object.get("DisplayName");
            var image = (object.get("Profile").name())[0].src = object.get("Profile").url();

            if (isChat){
                appendMessage(username, date, message, image);

            } else {
                //appendRSVP
                appendRSVP(image,username,displayName);
            }
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
        }
    });
    //console.log(data);
}

function configureUser(invites) {
    var User = parse.Object.extend("_User");
    var query = new parse.Query(User);
    query.get(currentUser.id, {
        success: function(object) {
            //console.log(object);
            // The object was retrieved successfully.
            var username = object.getUsername();
            var displayName = object.get("DisplayName");
            var image = (object.get("Profile").name())[0].src = object.get("Profile").url();
            var number = object.get("phoneNumber");

            $('#userInfo').append(
                '<div class="media-left">' +
                '<img class="img-circle" alt="..." width="25" height="25" src=' + image + '>' +
                '</div>' +
                '<div class="media-body">' +
                '<h4 class="media-heading">' + displayName + '<small>' + username + '</small> </h4>' +

                '</div>');
            //alert(invites.length);
            for (var i = 0; i <= invites.length; i++) {
                if (invites[i] == number){
                    isInvited = true;
                }
            }

            if (eventHostId == currentUser.id){
                loadLocation();
                configureMessages();
                loadRSVPs();

            } else {
                checkRSVP();
            }
        },
        error: function(object, error) {
            // The object was not retrieved successfully.
            // error is a Parse.Error with an error code and message.
        }
    });
}

function checkRSVP(){
    var Posts = parse.Object.extend('RSVP');
    var query = new parse.Query(Posts);
    query.equalTo("eventId", eventId);
    query.equalTo("userId", currentUser.id);
    query.find({
        success: function(results) {
            // Do something with the returned Parse.Object values
            //alert(results.length);
            for (var i = 0; i <= results.length; i++) {
                var object = results[i];
                //alert(results.length);
                //
                if (results.length > 0){
                   // alert("hey");

                     if (object.get("isBlocked")){
                        //add jaunt that says user has been blocked
                        $('#alertDiv').append('<div class="alert alert-danger" role="alert">You\'re blocked from this event.</div>');
                        $('#alertDiv').show();
                    } else if (object.get("isConfirmed")){

                        loadLocation();
                        configureMessages();
                        loadRSVPs();

                    } else {
                        $('#alertDiv').append('<div class="alert alert-info" role="alert">RSVP Pending</div>');
                        $('#alertDiv').show();
                    }
                } else {

                    $('#rsvpButton').show();
                }
            }
        },
        error: function(error) {
            //alert("error");
            //alert("Error: " + error.code + " " + error.message);
            //res.send("Error: " + error.code + " " + error.message);
        }
    });
}

