var sizePasword=4;
displayView = function(){
   // the code required to display a view

};

window.onload = function(){
    if(localStorage.getItem("token") === null){
        document.getElementById("viewBase").innerHTML = document.getElementById("welcomeview").innerHTML;
    }else{
        document.getElementById("viewBase").innerHTML = document.getElementById("profileview").innerHTML;
    }
    //code that is executed as the page is loaded.
    //You shall put your own custom code here.
};



function validateEmail(email)  {
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(email.match(mailformat))  {
        return true;
    }else {
        return false;
    }
}

function login(){
	var email=document.getElementById("loginEmail").value;
	var password=document.getElementById("loginPassword").value;
    if(email.length>0 && password.length==sizePasword && validateEmail(email)){
        var output=serverstub.signIn(email, password);
        window.alert(output.message+"   "+output.data);
        localStorage.setItem("token", output.data);
    }else{
        window.alert("error input");
    }
}
function notFieldBlank(user){
    var state=true;
    if(user.email.length==0){
        state=false;
    }else if (user.password.length!=sizePasword) {
        state=false;
    }else if (user.firstname.length==0){
        state=false;
    }else if (user.firstname.length==0) {
        state=false;
    }else if (user.city.length==0) {
        state=false;
    }else if (user.country.length==0) {
        state=false;
    }
    return state;
}

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
            if(notFieldBlank(user) && validateEmail(user.email)){
                var output=serverstub.signUp(user);
                window.alert(output.message);
            }else{
                window.alert("error input email or black");
            }
    }else{
        window.alert("error input password");
    }
}

function signout(){
    if(localStorage.getItem("token") != null){
        var output=serverstub.signOut(localStorage.getItem("token"));
        window.alert(output.message);
        localStorage.removeItem("token");
    }
    location.reload();
}

function changePassword(){
	var passwordOld=document.getElementById("formChangePasswordOld").value;
	var passwordNew=document.getElementById("formChangePasswordNew").value;
    if(passwordNew.length==sizePasword){
        var output=serverstub.changePassword(localStorage.getItem("token"), passwordOld, passwordNew);
        window.alert(output.message);
    }else{
        window.alert("error input");
    }
}


function dataProfile(){
	/*var output=serverstub.getUserDataByToken(localStorage.getItem("token"));
	if(output.success){*/
	    document.getElementById("profileFirstName").innerHTML="hola";/*output.data.firstname;*/
		document.getElementById("profileFamilyName").innerHTML="hola";/*output.data.familyname;*/
		document.getElementById("profileGender").innerHTML="hola";/*output.data.gender;*/
		document.getElementById("profileCity").innerHTML="hola";/*output.data.city;*/
		document.getElementById("profileCountry").innerHTML="hola";/*output.data.country*/
        document.getElementById("profileEmail").innerHTML="hola";/*output.data.email*/
	/*}else{
		window.alert(output.message);
	}*/
}

function reloadpage(){
    location.reload();
    //dataProfile();
    //getMessage()
}

function getMessage(){
    var output;
    /*output=serverstub.getUserMessagesByToken(localStorage.getItem("token"));
	if(output.success){*/
        for	(index = 0; index < output.data.length; index++) {
            var node = document.createElement("P");
            var textnode = document.createTextNode(output.data[index].writer+" : "+output.data[index].content);
            node.appendChild(textnode);
            document.getElementById("mymessageFrame").appendChild(node);
        }
    /*}else{
        window.alert(output.message);
    }*/
}
function sendMessage(message,email){
    var output=serverstub.postMessage(localStorage.getItem("token"),message,email);
	if(!output.success){
        window.alert(output.message);
    }
}
function sendMessagetoMe(){
    var message=document.getElementById("writeMessage").value;
    if(message.length>0 && message.length<200){
        var profile=serverstub.getUserDataByToken(localStorage.getItem("token"));
    	if(profile.success){
            sendMessage(message,profile.data.email);
        }else{
            window.alert(profile.message);
        }
    }else{
        window.alert("message empty");
    }
}

function sendMessagetoOther(){
    var message=document.getElementById("writeMessage").value;
    var user=document.getElementById("searchProfile").value;
    if(message.length>0 && message.length<200 && user.length>0 && user.length<200 ){
        sendMessage(message,user);
    }else{
        window.alert("message empty");
    }
}

function dataProfileOther(email){
	/*var output=serverstub.getUserDataByToken(localStorage.getItem("token"),email);
	if(output.success){*/
	    document.getElementById("profileFirstName").innerHTML="hola";/*output.data.firstname;*/
		document.getElementById("profileFamilyName").innerHTML="hola";/*output.data.familyname;*/
		document.getElementById("profileGender").innerHTML="hola";/*output.data.gender;*/
		document.getElementById("profileCity").innerHTML="hola";/*output.data.city;*/
		document.getElementById("profileCountry").innerHTML="hola";/*output.data.country*/
        document.getElementById("profileEmail").innerHTML="hola";/*output.data.email*/
	/*}else{
		window.alert(output.message);
	}*/
}

function getMessageOther(email){
    var output;
    /*output=serverstub.getUserMessagesByToken(localStorage.getItem("token"),email);
	if(output.success){*/
        for	(index = 0; index < output.data.length; index++) {
            var node = document.createElement("P");
            var textnode = document.createTextNode(output.data[index].writer+" : "+output.data[index].content);
            node.appendChild(textnode);
            document.getElementById("mymessageFrame").appendChild(node);
        }
    /*}else{
        window.alert(output.message);
    }*/
}

function searchProfile(){
    var email=document.getElementById("searchProfile").value;
    if(email.length>0 && email.length<200){
        var output=serverstub.getUserMessagesByToken(localStorage.getItem("token"),email);
    	if(output.success){
            dataProfileOther(email);
            getMessageOther(email);
            //active button of sendMessage
            document.getElementById("SendMessage").disabled = true;
        }else{
            window.alert(output.message);
        }
    }else{
        window.alert("email empty");
    }

}





















function chanageHome(){
    //alert(document.getElementById("home").style.display);
    document.getElementById("home").style.display="block";
    document.getElementById("browse").style.display="none";
    document.getElementById("account").style.display="none";
    dataProfile();
    //getMessage();
}

function chanageBrowse(){
    document.getElementById("home").style.display="none";
    document.getElementById("browse").style.display="block";
    document.getElementById("account").style.display="none";
}

function chanageAccount(){
    document.getElementById("home").style.display="none";
    document.getElementById("browse").style.display="none";
    document.getElementById("account").style.display="block";
}
