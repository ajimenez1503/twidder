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
        (page="Welcome" || page="Profile")){
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
* login the user by email and password.
*The input is validate and show the error in case of problem
*/
function dataProfile(){
	var output=serverstub.getUserDataByToken(localStorage.getItem("token"));
	if(output.success){
	    document.getElementById("profileFirstName").innerHTML=output.data.firstname;
		document.getElementById("profileFamilyName").innerHTML=output.data.familyname;
		document.getElementById("profileGender").innerHTML=output.data.gender;
		document.getElementById("profileCity").innerHTML=output.data.city;;
		document.getElementById("profileCountry").innerHTML=output.data.country;
        document.getElementById("profileEmail").innerHTML=output.data.email;
	}else{
        showErrorMessagesPage("Profile","showdata",output.message,output.success);
	}
}

function deleteAllChildElement(node){
		while (node.firstChild) {
    		node.removeChild(node.firstChild);
		}
}

function getMessage(father){
    var output;
    output=serverstub.getUserMessagesByToken(localStorage.getItem("token"));
	if(output.success){
        showMessages(output.data,father);
    }else{
        showErrorMessagesPage("Profile","show message",output.message,output.success);
    }
}
function sendMessage(message,email,father){
    var output=serverstub.postMessage(localStorage.getItem("token"),message,email);
	if(output.success){
		document.getElementById("writeMessageBrowse").value="";
		document.getElementById("writeMessage").value="";//TODO arregarlo solo uno
		getMessage(father);
	}else{
        showErrorMessagesPage("Profile","send message",output.message,output.success);
    }
}
function sendMessagetoMe(){
    var message=document.getElementById("writeMessage").value;
    if(message.length>0 && message.length<200){
        var profile=serverstub.getUserDataByToken(localStorage.getItem("token"));
    	if(profile.success){
			var father=document.getElementById("listMessage");
            sendMessage(message,profile.data.email,father);
        }else{
            showErrorMessagesPage("Profile","show message",profile.message,profile.success);
        }
    }else{
        showErrorMessagesPage("Profile","send message","message empty",false);
    }
}

function sendMessagetoOther(){
    var message=document.getElementById("writeMessageBrowse").value;
    var user=document.getElementById("searchProfile").value;
    if(message.length>0 && message.length<200 && user.length>0 && user.length<200 ){
		var father=document.getElementById("listMessageBrowse");
        sendMessage(message,user,father);
    }else{
        showErrorMessagesPage("Profile","send message","message empty",false);
    }
}

function dataProfileOther(email){

	var output=serverstub.getUserDataByEmail(localStorage.getItem("token"),email);
	if(output.success){
		document.getElementById("profileFirstNameBrowse").innerHTML=output.data.firstname;
		document.getElementById("profileFamilyNameBrowse").innerHTML=output.data.familyname;
		document.getElementById("profileGenderBrowse").innerHTML=output.data.gender;
		document.getElementById("profileCityBrowse").innerHTML=output.data.city;;
		document.getElementById("profileCountryBrowse").innerHTML=output.data.country;
        document.getElementById("profileEmailBrowse").innerHTML=output.data.email;
	}else{
		showErrorMessagesPage("Profile","showdata",output.message,output.success);
	}
}

function showMessages(messages,father){
		//delete before message
		deleteAllChildElement(father);
        for	(index = 0; index < messages.length; index++) {
            var node = document.createElement("P");
            var textnode = document.createTextNode(messages[index].writer+" : "+messages[index].content);
            node.appendChild(textnode);
            father.appendChild(node);
        }
}

function getMessageOther(email){
    var output=serverstub.getUserMessagesByEmail(localStorage.getItem("token"),email);
	if(output.success){
		var father=document.getElementById("listMessageBrowse");
		showMessages(output.data,father);
    }else{
        showErrorMessagesPage("Profile","showdata",output.message,output.success);
    }
}


function searchProfile(){
    var email=document.getElementById("searchProfile").value;
    if(email.length>0 && email.length<200 && validateEmail(email)){
        var output=serverstub.getUserMessagesByEmail(localStorage.getItem("token"),email);
    	if(output.success){
            dataProfileOther(email);
           	getMessageOther(email);
            //active button of sendMessage
            document.getElementById("SendMessageBrowse").disabled = false;
        }else{
            showErrorMessagesPage("Profile","search profile",output.message,output.success);
        }
    }else{
        showErrorMessagesPage("Profile","search profile","email not valid",false);
    }

}

function changeTab(tab){
    if(typeof(tab) === 'string') {
        document.getElementById("showErrorMessageProfilePage").style.display="none";
        if(tab=="home"){
            document.getElementById("home").style.display="block";
            document.getElementById("browse").style.display="none";
            document.getElementById("account").style.display="none";
        	var father=document.getElementById("listMessage");
            dataProfile();
            getMessage(father);
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
