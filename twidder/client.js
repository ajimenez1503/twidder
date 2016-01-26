/**
* @author antonio cedric
* @version 0.1
*/

var sizePasword=4; //global variable of size of password

/**
* Display a view according to the token of the user.
*/
displayView = function(){
   // the code required to display a view
   if(localStorage.getItem("token") === null){
       document.getElementById("viewBase").innerHTML = document.getElementById("welcomeview").innerHTML;
   }else{
       document.getElementById("viewBase").innerHTML = document.getElementById("profileview").innerHTML;
   }
};

/**
* Display the specific view when the page is reload
*/
window.onload = function(){
    displayView();
};



/**
* show the error in a div with is block in this moment
* @param {string}page of the view, 2 possibility profile or Welcome
* @param {string}the element of the error, such as: login, message, etc
* @param {message}message of error
* @returns {boolean} return true is the operation is success
*/
function showErrorMessagesPage(page,element,message,success){
    if (typeof(message) === 'string' && typeof(element) === 'string' && typeof(page) === 'string' &&
        (page=="Welcome" || page=="Profile")){
        document.getElementById("showErrorMessage"+page+"Page").style.display="block";
        if(success){
            document.getElementById("showErrorMessage"+page+"Page").style.color="black";
        }
        else{
            document.getElementById("showErrorMessage"+page+"Page").style.color="red";
        }

        document.getElementById("errorMessage"+page+"Page").innerHTML=element+" : "+message;
        return true;
    }else{
        return false;
    }

}

/**
* login the user by email and password.
*The input is validate and show the error in case of problem
*/
function login(){
	var email=document.getElementById("loginEmail").value;
	var password=document.getElementById("loginPassword").value;
    if(email.length>0 && password.length==sizePasword && validateEmail(email)){
        var output=serverstub.signIn(email, password);
		if(output.success){
		    localStorage.setItem("token", output.data);
            location.reload();
		}else{
			showErrorMessagesPage("Welcome","login",output.message,output.success);
		}
    }else{
        showErrorMessagesPage("Welcome","login","error input",false);
    }
}

/**
*Signup a new  user by email, password firstname, familyname, gender, city, country
*The input is validate and show the error in case of problem
*/
function signup(){
    if(document.getElementById("signupRepeatPSW").value==document.getElementById("signupPassword").value){
            var gender="male";
            if(document.getElementById("signupFemale").selected==true){
                gender="female";
            }
            var user = {
              'email': document.getElementById("signupEmail").value,
              'password':document.getElementById("signupPassword").value,
              'firstname': document.getElementById("signupFirstName").value,
              'familyname': document.getElementById("signupFamilyName").value,
              'gender': gender,
              'city': document.getElementById("signupCity").value,
              'country': document.getElementById("signupCountry").value,
            };
            if(notFieldBlank(user) && validateEmail(user.email) && user.password.length==sizePasword){
                var output=serverstub.signUp(user);
                showErrorMessagesPage("Welcome","signup",output.message,output.success);
            }else{
                showErrorMessagesPage("Welcome","signup","error inputs",false);
            }
    }else{
        showErrorMessagesPage("Welcome","signup","error input password different",false);
    }
}
/**
* signout he user
*remove the localStorage
*/
function signout(){
    if(localStorage.getItem("token") != null){
        var output=serverstub.signOut(localStorage.getItem("token"));
        localStorage.removeItem("token");
    }
    location.reload();
}

/**
* Change the pasword.
*The input is validate and show the error in case of problem
*/
function changePassword(){
	var passwordOld=document.getElementById("formChangePasswordOld").value;
	var passwordNew=document.getElementById("formChangePasswordNew").value;
    if(passwordNew.length==sizePasword){
        var output=serverstub.changePassword(localStorage.getItem("token"), passwordOld, passwordNew);
        showErrorMessagesPage("Profile","changePassword",output.message,output.success);
    }else{
        showErrorMessagesPage("Profile","changePassword","error input",false);
    }
}

/**
* show the data of the own user or the user by email
* @param {string}email. If the email is null the is own user in the opposite case we check the data of the user user
*/
function dataProfile(email){
    var view="";
    var output;
    if(email==null){
        output=serverstub.getUserDataByToken(localStorage.getItem("token"));
    }
    else if (typeof(email) === 'string'){
        view="Browse";
        output=serverstub.getUserDataByEmail(localStorage.getItem("token"),email);
    }
    if(output!=null){
    	if(output.success){
    		document.getElementById("profileFirstName"+view).innerHTML=output.data.firstname;
    		document.getElementById("profileFamilyName"+view).innerHTML=output.data.familyname;
    		document.getElementById("profileGender"+view).innerHTML=output.data.gender;
    		document.getElementById("profileCity"+view).innerHTML=output.data.city;;
    		document.getElementById("profileCountry"+view).innerHTML=output.data.country;
            document.getElementById("profileEmail"+view).innerHTML=output.data.email;
    	}else{
    		showErrorMessagesPage("Profile","showdata",output.message,output.success);
    	}
    }else{
        showErrorMessagesPage("Profile","showdata","error eamil",false);
    }
}

/**
* send message to myself
*/
function sendMessagetoMe(){
    var message=document.getElementById("writeMessage").value;//read message
    //TODO validate message without javascript
    if(message.length>0 && message.length<200){
        var profile=serverstub.getUserDataByToken(localStorage.getItem("token"));//take the profile for take the own email
    	if(profile.success){
            sendMessage(message,profile.data.email,false);
        }else{
            showErrorMessagesPage("Profile","show message",profile.message,profile.success);
        }
    }else{
        showErrorMessagesPage("Profile","send message","message empty",false);
    }
}
/**
* send message other user by email
*/
function sendMessagetoOther(){
    var message=document.getElementById("writeMessageBrowse").value;//read message
    var email=document.getElementById("searchProfile").value;//read email
    if(message.length>0 && message.length<200 && validateEmail(email)  ){
        sendMessage(message,email,true);
    }else{
        showErrorMessagesPage("Profile","send message","message empty or problem email",false);
    }
}
/**
* get the messages of a user: own user or new user by email
* @param {string}email. If the email is null the is own user in the opposite case we check the data of the user user
*/
function getMessage(email){
    var output;
    var father;//element to display messages
    if(email==null){
        father=document.getElementById("listMessage");
        output=serverstub.getUserMessagesByToken(localStorage.getItem("token"));
    }
    else if (typeof(email) === 'string'){
        father=document.getElementById("listMessageBrowse");
        output=serverstub.getUserMessagesByEmail(localStorage.getItem("token"),email);
    }
    if(output!=null && father!=null){
        if(output.success){
            showMessages(output.data,father);
        }else{
            showErrorMessagesPage("Profile","show message",output.message,output.success);
        }
    }else{
        showErrorMessagesPage("Profile","show message","error email",false);
    }
}

/**
* read the email write by the user and then look for  the profile of the new user ( data an messages)
* Now the user has the possibility of send message to the new user.
*/
function searchProfile(){
    var email=document.getElementById("searchProfile").value;
    if(email.length>0 && email.length<200 && validateEmail(email)){
        var output=serverstub.getUserMessagesByEmail(localStorage.getItem("token"),email);
    	if(output.success){
            dataProfile(email);
           	getMessage(email);
            //active button of sendMessage
            document.getElementById("SendMessageBrowse").disabled = false;
        }else{
            showErrorMessagesPage("Profile","search profile",output.message,output.success);
        }
    }else{
        showErrorMessagesPage("Profile","search profile","email not valid",false);
    }

}

/**
* update the list of message
*/
function reloadMessage(){
    getMessage();
}


/**
* On the view profle there are 3 tab: home account browse. The argument tab will be display.
*The block for show erro will hidden
* @param {string} the name of the tab
*/
function changeTab(tab){
    if(typeof(tab) === 'string') {
        document.getElementById("showErrorMessageProfilePage").style.display="none";
        if(tab=="home"){
            document.getElementById("home").style.display="block";
            document.getElementById("browse").style.display="none";
            document.getElementById("account").style.display="none";
            dataProfile();
            getMessage();
        }else if(tab=="browse"){
            document.getElementById("home").style.display="none";
            document.getElementById("browse").style.display="block";
            document.getElementById("account").style.display="none";
        }else if(tab=="account"){
            document.getElementById("home").style.display="none";
            document.getElementById("browse").style.display="none";
            document.getElementById("account").style.display="block";
        }
    }
}
