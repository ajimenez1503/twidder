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
    //window.alert("Hello TDDD97!");
    //localStorage.removeItem("token");

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
        var output=serverstub.changePassword(localStorage.getItem("token"), passwordOld, passwordNew){
        window.alert(output.message);
    }else{
        window.alert("error input");
    }
}