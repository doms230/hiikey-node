/**
 * Created by d_innovator on 2/27/17.
 *
 * watchify public/javascripts/profileScripts.js -o public/javascripts/profileBundle.js -v
 */

var parse = require("parse").Parse;
parse.initialize("O9M9IE9aXxHHaKmA21FpQ1SR26EdP2rf4obYxzBF"); parse.serverURL = 'https://hiikey.herokuapp.com/parse';
var currentUser = parse.User.current();
var parseFile;

var facebook = "";
var verifiedNumber = "";

//event stuff
var eventId;
var eventHostId;
var eventTitle;
var invites;
var isInvited = false;

$(function(){

    if(!currentUser){
        window.location.href = "https://www.hiikey.com/logins";
    }

    $('#digits-sdk').load(function () {
        // Initialize Digits using the API key.
        Digits.init({ consumerKey: 'IeV33K1YaqjI4ompRDHiDREH3' })
            .done(function() {
                console.log('Digits initialized.');
            })
            .fail(function() {
                console.log('Digits failed to initialize.');
            });

        // Set a click event listener on the Digits button.
        $('#inputNumber').click(onLoginButtonClick);
    });


    var objectId = $("#objectId").html();

    var href = window.location.href;
    //alert(href);

    var url = window.location.toString();

    if (!href.toString().includes("?e=")){
        $('#navBar').show();

    } else {
        var ya = url.split("e=");
        //alert(ya[1]);
        loadEventInfo(ya[1]);
    }

   // $('#userInfo').append('');

    $('#userInfo').append(' <div class="alert alert-info alert-dismissible" role="alert">' +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
   ' <strong>Linking your Facebook allows hosts verify your identity before they give you access to their events.</strong></div>  <fb:login-button data-auto-logout-link="true" data-size="large" scope="public_profile,email" onlogin="checkLoginState();">' +
        '</fb:login-button>  </br> </br>  <button id="updateInfo" class="btn btn-lg btn-default btn-block" type="submit">Update Info</button>');
    
    // $('#updatePhoto').click(function () {
        $(":file").change(function () {
            if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = imageIsLoaded;
                reader.readAsDataURL(this.files[0]);
            }
        });
    //});

    $('#updateInfo').click(function () {
        var User = parse.Object.extend("_User");
        var query = new parse.Query(User);
        query.get(currentUser.id, {
            success: function(object) {
                //console.log(object);
                // The object was retrieved successfully.
               // var username = object.getUsername();
                object.set("DisplayName", document.getElementById('inputName').value);
               // var image = (object.get("Profile").name())[0].src = object.get("Profile").url();
                object.set("phoneNumber", document.getElementById('inputNumber').value);
                object.set("Profile", parseFile);
                object.set("facebook", facebook);
                object.set("phoneNumber", verifiedNumber);
                object.save();

                if (!href.toString().includes("?e=")){
                    $('#userInfo').append('<div class="alert alert-success alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        '<strong>Your profile info has been updated.</strong></div>');

                } else {
                    //TODO: RSVP for event

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
                                sendNotification(eventHostId, currentUser.username + "joined your" + eventTitle + "guest list.");

                            } else {
                                sendNotification(eventHostId, currentUser.username + "requested access to " + eventTitle + ".");
                            }

                             window.location.href = "https://www.hiikey.com/events?id=" + eventId ;
                           // window.location.href = "http://localhost:3000/events?id=" + eventId ;
                        },
                        error: function(gameScore, error) {
                            // Execute any logic that should take place if the save fails.
                            // error is a Parse.Error with an error code and message.
                            alert('Failed to create new object, with error code: ' + error.message);
                        }
                    });
                }

                //document.getElementById('image').src
            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
                $('#userInfo').append('<div class="alert alert-danger alert-dismissible" role="alert">' +
                    '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<strong>Oops!</strong>There was an issue updating your info. Check your internet connection and try again.' +
                    'Email us at help@hiikey.com if the issue persists.</div>');
            }
        });
    });

    $("#signoutButton").click(function () {
        parse.User.logOut().then(() => {
            window.location.href = "https://www.hiikey.com/logins"
        });
    });

    loadUserInfo();

});

//user info stuff
function imageIsLoaded(e) {
    $('#image').attr('src', e.target.result);
    var fileUploadControl = $("#newProfilePhoto")[0];
    if (fileUploadControl.files.length > 0) {
        var file = fileUploadControl.files[0];
        var name = "photo.jpg";

        parseFile = new parse.File(name, file);
        parseFile.save().then(function() {
            // The file has been saved to Parse.
            //alert("worked");
        }, function(error) {
            // The file either could not be read, or could not be saved to Parse.
            alert(error);
        });
    }
   // document.getElementById('image').src = e.target.result
}

function loadUserInfo(){
    //if (currentUser){
        var User = parse.Object.extend("_User");
        var query = new parse.Query(User);
        query.get(currentUser.id, {
            success: function(object) {
                //console.log(object);
                // The object was retrieved successfully.
                var username = object.getUsername();
                var displayName = object.get("DisplayName");
                if(object.get("Profile") != null){
                    var image = (object.get("Profile").name())[0].src = object.get("Profile").url();
                }
                var number = object.get("phoneNumber");
                verifiedNumber = number;

                facebook = object.get("facebook");

                $("#username").html("@" + username);
                document.getElementById('inputName').value = displayName;

                if (number != ""){
                    document.getElementById('inputNumber').value = number;
                }

                if (image != null){
                    document.getElementById('image').src = image;
                }
            },
            error: function(object, error) {
                // The object was not retrieved successfully.
                // error is a Parse.Error with an error code and message.
            }
        });
    //}
}

//phone number stuff
/**
 * Launch the Digits login flow.
 */
function onLoginButtonClick(event) {
    console.log('Digits login started.');
    Digits.logIn().done(onLogin).fail(onLoginFailure);
}

/**
 * Handle the login once the user has completed the sign in with Digits.
 * We must POST these headers to the server to safely invoke the Digits API
 * and get the logged-in user's data.
 */
function onLogin(loginResponse) {
    console.log('Digits login succeeded.');
    //alert(loginResponse);
   var oAuthHeaders = parseOAuthHeaders(loginResponse.oauth_echo_headers);

    //setDigitsButton('Signing In…');
    $.ajax({
        type: 'POST',
        url: 'https://www.hiikey.com/digits/digits',
        data: oAuthHeaders,
        success: onDigitsSuccess
    });
}

/**
 * Handle the login failure.
 */
function onLoginFailure(loginResponse) {
    console.log('Digits login failed.');
    alert(loginResponse);
    document.getElementById('inputNumber').value = " ";
    verifiedNumber = " ";
}

/**
 * Handle the login once the user has completed the sign in with Digits.
 * We must POST these headers to the server to safely invoke the Digits API
 * and get the logged-in user's data.
 */
function onDigitsSuccess(response) {
    console.log('Digits phone number retrieved.');
    //setDigitsNumber(response.phoneNumber);
    verifiedNumber = response.phoneNumber;
    document.getElementById('inputNumber').value = response.phoneNumber;

    //TODO: Test this
    for (var o = 0; o < invites.length; o++){
        if (invites[o] == verifiedNumber){
            isInvited = true;
        }
    }
}

/**
 * Parse OAuth Echo Headers:
 * 'X-Verify-Credentials-Authorization'
 * 'X-Auth-Service-Provider'
 */
function parseOAuthHeaders(oAuthEchoHeaders) {
    var credentials = oAuthEchoHeaders['X-Verify-Credentials-Authorization'];
    var apiUrl = oAuthEchoHeaders['X-Auth-Service-Provider'];

    return {
        apiUrl: apiUrl,
        credentials: credentials
    };
}

//facebook stuff
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        //alert(response.userID);
        testAPI();
    } else {
        // The person is not logged into your app or we are unable to tell.
        facebook = " ";
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this app.' + facebook;
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId      : '178018185913116',
        cookie     : true,  // enable cookies to allow the server to access
                            // the session
        xfbml      : true,  // parse social plugins on this page
        version    : 'v2.8' // use graph api version 2.8
    });

    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

function testAPI() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        //alert(response.name);
        facebook = response.id;
        console.log('Successful login for: ' + response.name);
        document.getElementById('status').innerHTML =
            'Thanks for logging in, ' + facebook + '!';
    });
}

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
                eventTitle = object.get('title');
                eventHostId = object.get("userId");
                invites = object.get("invites");
            }
        },
        error: function(error) {
            //alert("Error: " + error.code + " " + error.message);
            //res.send("Error: " + error.code + " " + error.message);
        }
    });
}

function sendNotification(userId, message){
    $.ajax({
        url : "https://hiikey.herokuapp.com/notifications",
        type : 'GET',
        data : {
            userId: userId,
            message : message
        },
        async : false,
        success : function(result) {

            try {
                //position.lat = result.results[0].geometry.location.lat;
                //position.lng = result.results[0].geometry.location.lng;
                //alert(result.results[0].geometry.location.lat);

            } catch(err) {
                alert(err);
            }
        }
    });
}