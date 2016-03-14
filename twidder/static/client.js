/**
* @author antonio Jimenez (antji996) cedric Lallemand (cedla736)
* @version 0.1
*/

var minSizePassword=4; //global variable of size of password
var user_online=0;//global variable of user online for the chart
var number_likes=0;//global variable of number of likes of the user for the chart
var number_messages=0;//global variable of number of messages of the user for the chart
var connection;





function getURLbase(){

}



////////////////////////////////////////////////////////////////
/*
*LOAD VIEWS

*/
////////////////////////////////////////////////////////////////
/**
* Display the specific view when the page is reload
*/

window.onload = function(){
    displayView();
    displayData();
	open_websocket();
	page({hashbang: true});
};



/**
* Display the specific view without reload the page
*/
reloadPage = function(){
    displayView();
    displayData();	
	open_websocket();
};


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
* Display the data of the user in the tab home: messages, data profile and chart
*/
displayData = function(){
	// the code required to display a view
	if(localStorage.getItem("token") != null){
		dataProfile();
		getMessage();
		getNumberMessageAndLikes();
		showImageUser();
		showVideoUser();
	}	
};


/**
* login the user by email and password.
*The input is validate and show the error in case of problem
*/
function login(){
	var email=document.getElementById("loginEmail").value;
	var password=document.getElementById("loginPassword").value;
    if(password.length>=minSizePassword && validateEmail(email)){
		var params = "password="+password+"&email="+email;
		var url= window.location.protocol+"//"+window.location.host+"/signin";
		var xmlHttp =new XMLHttpRequest(); 
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);        
				if( output.success){
					localStorage.setItem("token", output.data);
					reloadPage();
					page("/home");
				}else{
					showErrorMessagesPage("Welcome","login",output.message,output.success);
				}           
			}
		}
		xmlHttp.open("POST", url, true );
		xmlHttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		xmlHttp.send(params);
    }else{
       showErrorMessagesPage("Welcome","login","connection failed",false);
    }
}

/**
*Signup a new  user by email, password firstname, familyname, gender, city, country
*The input is validate and show the error in case of problem
*/
function signup(){
        var gender="male";
        if(document.getElementById("signupFemale").selected==true){
            gender="female";
        }
        var user = {
          'email': document.getElementById("signupEmail").value,
          'password':document.getElementById("signupPassword").value,
		  'repeat_password':document.getElementById("signupRepeatPSW").value,
          'firstname': document.getElementById("signupFirstName").value,
          'familyname': document.getElementById("signupFamilyName").value,
          'gender': gender,
          'city': document.getElementById("signupCity").value,
          'country': document.getElementById("signupCountry").value,
        };
        if(user.firstname.length==0){showErrorMessagesPage("Welcome","signup","First name field empty",false);return;}
		if(user.familyname.length==0){showErrorMessagesPage("Welcome","signup","Last name field empty",false);return;}
		if(user.city.length==0){showErrorMessagesPage("Welcome","signup","City field empty",false);return;}
		if(user.country.length==0){showErrorMessagesPage("Welcome","signup","Country field empty",false);return;}
		if(!validateEmail(user.email)){showErrorMessagesPage("Welcome","signup","email invalid",false);return;}
		if(user.password.length<minSizePassword){showErrorMessagesPage("Welcome","signup","password as to be more than "+minSizePassword+" characters",false);return;}
		if(user.repeat_password != user.password){showErrorMessagesPage("Welcome","signup","passwords do not match",false);return}



		var url=window.location.protocol+"//"+window.location.host+"/signup";
		var xmlHttp =new XMLHttpRequest(); 
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);        
				showErrorMessagesPage("Welcome","signup",output.message,output.success);          
			}
		}
		xmlHttp.open("POST", url, true );
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		var params = "password="+user.password+"&email="+user.email+"&firstname="+user.firstname+"&familyname="+user.familyname+"&gender="+user.gender+"&city="+user.city+"&country="+user.country;
		xmlHttp.send(params);				


}
/**
* signout the user
*remove the localStorage
*/
function signout(){
    if(localStorage.getItem("token") != null){
		var url=window.location.protocol+"//"+window.location.host+"/signout/"+localStorage.getItem("token");
		var xmlHttp =new XMLHttpRequest(); 
		xmlHttp.onreadystatechange = function() { 
				if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
					//TODO when success is true
					localStorage.removeItem("token");        
				}
			}
		xmlHttp.open("GET", url, true );
		xmlHttp.send();	
    }
	deleteTokenAndCloseWebsocket();
	reloadPage();
}


/**
* Change the pasword.
*The input is validate and show the error in case of problem
*/
function changePassword(){
	var passwordOld=document.getElementById("formChangePasswordOld").value;
	var passwordNew=document.getElementById("formChangePasswordNew").value;
	var passwordNewRepeat=document.getElementById("formChangePasswordNewRepeat").value;
	if(passwordNew==passwordNewRepeat){
		if(passwordNew.length>=minSizePassword){
			var url=window.location.protocol+"//"+window.location.host+"/changepassword";
			var xmlHttp =new XMLHttpRequest(); 
			xmlHttp.onreadystatechange = function() { 
				if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
					var output= JSON.parse(xmlHttp.responseText);        
					showErrorMessagesPage("Profile","changePassword",output.message,output.success);       
				}
			}
			xmlHttp.open("POST", url, true );
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
			var params = "password="+passwordOld+"&new_password="+passwordNew+"&token="+localStorage.getItem("token");
			xmlHttp.send(params);		
		}else{
		    showErrorMessagesPage("Profile","changePassword","error input",false);
		}
	}else{
		    showErrorMessagesPage("Profile","changePassword","passwords not identical ",false);
		}
}

/**
* show the data of the own user or the user by email
* @param {string}email. If the email is null the is own user in the opposite case we check the data of the user user
*/
function dataProfile(email){
    var view="";
    var output;
	var url;
	var xmlHttp =new XMLHttpRequest();
    if(email==null){
		url=window.location.protocol+"//"+window.location.host+"/getuserdatabytoken/"+localStorage.getItem("token"); 
    }
    else if (typeof(email) === 'string'){
        view="Browse";
		url=window.location.protocol+"//"+window.location.host+"/getuserdatabyemail/"+localStorage.getItem("token")+"/"+email; 
    }
    if(email!==null || typeof(email) === 'string'){
		xmlHttp.open("GET", url, true );
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);  
				if(output.success){
					output.data=output.data[0];
					document.getElementById("profileFirstName"+view).innerHTML=output.data.firstname;
					document.getElementById("profileFamilyName"+view).innerHTML=output.data.familyname;
					document.getElementById("profileGender"+view).innerHTML=output.data.gender;
					document.getElementById("profileCity"+view).innerHTML=output.data.city;
					document.getElementById("profileCountry"+view).innerHTML=output.data.country;
					document.getElementById("profileEmail"+view).innerHTML=output.data.email;					
				}else{
					showErrorMessagesPage("Profile","showdata",output.message,output.success);
				}  
			}
		}			
    }else{
        showErrorMessagesPage("Profile","showdata","error email",false);
    }
}


/**
* send message to myself
*/
function sendMessagetoMe(){
    var message=document.getElementById("writeMessage").value;//read message
    if(message.length>0 && message.length<200){
		//take the profile for take the own email
		var xmlHttp =new XMLHttpRequest();
		var url=window.location.protocol+"//"+window.location.host+"/getuserdatabytoken/"+localStorage.getItem("token"); 
		xmlHttp.open("GET", url, true );
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var profile= JSON.parse(xmlHttp.responseText);  
				if(profile.success){
				    sendMessage(message,profile.data[0].email,false);
				}else{
				    showErrorMessagesPage("Profile","show message",profile.message,profile.success);
				}
			}
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
	var url;
	var xmlHttp =new XMLHttpRequest();
    if(email==null){
        father=document.getElementById("listMessage");
		url=window.location.protocol+"//"+window.location.host+"/getmessagesbytoken/"+localStorage.getItem("token"); 
    }
    else if (typeof(email) === 'string'){
        father=document.getElementById("listMessageBrowse");
        url=window.location.protocol+"//"+window.location.host+"/getmessagesbyemail/"+localStorage.getItem("token")+"/"+email;
    }
    if((email==null || typeof(email) === 'string') && father!=null){
		xmlHttp.open("GET", url, true );
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);  
				if(output.success){
					showMessages(output.data,father);
				}else{
					showErrorMessagesPage("Profile","show message",output.message,output.success);
				}
			}
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
		var url=window.location.protocol+"//"+window.location.host+"/getmessagesbyemail/"+localStorage.getItem("token")+"/"+email;
			var xmlHttp =new XMLHttpRequest(); 
			xmlHttp.onreadystatechange = function() { 
				if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
					var output= JSON.parse(xmlHttp.responseText);        
					if(output.success){
						//active button of sendMessage
						document.getElementById("SendMessageBrowse").disabled = false;
						//show div of data and message
						document.getElementById("browseDataUser").style.display="block";
						//disactive show error window
						document.getElementById("showErrorMessageProfilePage").style.display="none";
						dataProfile(email);
					   	getMessage(email);
						restar_drag_drop();
						showImageUser(email);
						showVideoUser(email);
					}else{
						showErrorMessagesPage("Profile","search profile",output.message,output.success);
						//show div of data and message
						document.getElementById("browseDataUser").style.display="none";//
					}        
				}
			}
			xmlHttp.open("GET", url, true );
			xmlHttp.send();	
    }else{
        showErrorMessagesPage("Profile","search profile","email not valid",false);
        document.getElementById("browseDataUser").style.display="none";//show div of data and message
    }

}



/**
* incrementLike on the database
*
*/
function incrementLike(){
		var email=document.getElementById("searchProfile").value;
		if(email.length>0 && email.length<200 && validateEmail(email)){
				var url=window.location.protocol+"//"+window.location.host+"/incrementLike";
				var xmlHttp =new XMLHttpRequest(); 
				xmlHttp.onreadystatechange = function() { 
					if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
						var output= JSON.parse(xmlHttp.responseText); 
						if(!output.success){
							showErrorMessagesPage("Browse","Like",output.message,output.success);
							//hide div of data and message
							document.getElementById("browseDataUser").style.display="none";
					
						}
					}
				}
				xmlHttp.open("POST", url, true );
				xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				var params = "email="+email;
				xmlHttp.send(params);		
		}else{
		    showErrorMessagesPage("Profile","search profile","email not valid",false);
		    document.getElementById("browseDataUser").style.display="none";//hide div of data and message
    	}	
}

/**
* update the like and message number and draw the chart
*/
function getNumberMessageAndLikes(){
	//get number message and visit:
		var output;
		var url=window.location.protocol+"//"+window.location.host+"/getnumbermessagesandLikesbytoken/"+localStorage.getItem("token"); 
		var xmlHttp =new XMLHttpRequest();
		xmlHttp.open("GET", url, true );
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);  
				if(output.success){
					data=JSON.parse(output.data);
					if(typeof data.number_message==='number' && typeof data.number_like==='number'){
						number_messages=data.number_message;
						number_likes=data.number_like;
						displayChart();
					}else{
						showErrorMessagesPage("Profile","Chart","wrong data",false);
					}  		
				}
			}
		}	
}



/**
* update the list of message
*/
function reloadMessage(){
    getMessage();
}

////////////////////////////////////////////////////////////////
/*
*UPLOAD and download FILES
*/
////////////////////////////////////////////////////////////////
/**
* check if the file name is valid 
* @param {string} the name and the size of the file
*@return true or false according if it is valid.
*/

function validate_file(fileName,fileSize){
	var ext = fileName.substring(fileName.lastIndexOf('.') + 1);
    if( ext=="gif" || ext=="mp4" || ext=="ogg"  || ext=="jpg" || ext=="jpeg" || ext=="png" ||ext=="ogv"  || ext=="mov" || ext=="webm"){
		if(fileSize>0 && fileSize<1000000000){//The file size can not exceed 1GB.
			 return true;
		}else{
			return false;
		}
    }
    else{
        return false;
    }

}

/**
* upload 2 files vide and image
*/
function upload(){
	if(localStorage.getItem("token") != null){
		var file_image = document.getElementById("file_image");
		var file_video = document.getElementById("file_video");
		if (file_image.value==""){showErrorMessagesPage("Profile","Upload_file","Select file image",false);return;}
		if (file_video.value==""){showErrorMessagesPage("Profile","Upload_file","Select file video",false);return;} 
		file_image = file_image.files[0];
		file_video = file_video.files[0];
		if ('name' in file_image && 'size' in file_image && 'name' in file_video && 'size' in file_video ) {
			if(!validate_file(file_image.name,file_image.size)){showErrorMessagesPage("Profile","Upload_file","error validation file image",false);return;}
			if(!validate_file(file_video.name,file_video.size)){showErrorMessagesPage("Profile","Upload_file","error validation file video",false);return;}
			var formData = new FormData()
			formData.append("token", localStorage.getItem("token") );	
			formData.append("file_image", file_image);
			formData.append("file_video", file_video);
			var url=window.location.protocol+"//"+window.location.host+"/uploadfiles";
			var xmlHttp =new XMLHttpRequest(); 
			xmlHttp.onreadystatechange = function() { 
				if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
					var output= JSON.parse(xmlHttp.responseText);        
					showErrorMessagesPage("Profile","upload file",output.message,output.success);       
				}
			}
			xmlHttp.open("POST", url, true );
			xmlHttp.send(formData);	
		}else {
			showErrorMessagesPage("Profile","Upload_file","Select 2 files: image, video.",false);
		}
	}else {
			showErrorMessagesPage("Profile","Upload_file","user not connect",false);
	}
}


/**
* Dispaly the image of the user 
* @param {string} email of the user. If it is null the user is the actual
*/
function showImageUser(email){
    var view="";
    var output;
	var url;
	var xmlHttp =new XMLHttpRequest();
    if(email==null){
		url=window.location.protocol+"//"+window.location.host+"/downloadimage/"+localStorage.getItem("token"); 
    }
    else if (typeof(email) === 'string'){
        view="Browse";
		url=window.location.protocol+"//"+window.location.host+"/downloadimagebyemail/"+localStorage.getItem("token")+"/"+email; 
    }
    if(email==null || typeof(email) === 'string'){
		xmlHttp.open("GET", url, true );
		xmlHttp.responseType = 'arraybuffer';
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				if(xmlHttp.response.byteLength==0){
					//showErrorMessagesPage("Profile","show image","user without image",false);
				}
				else{
					document.getElementById("profileImg"+view).style.display="block";
					var blb = new Blob([xmlHttp.response], {type: 'image/png'});
					var url = (window.URL || window.webkitURL).createObjectURL(blb);
		            document.getElementById("profileImg"+view).src = url;
				}
			}
		}			
    }else{
        showErrorMessagesPage("Profile","showdata","error email",false);
    }
}
/**
* Dispaly the video of the user 
* @param {string} email of the user. If it is null the user is the actual
*/
function showVideoUser(email){
    var view="";
    var output;
	var url;
	var xmlHttp =new XMLHttpRequest();
    if(email==null){
		view="Home";
		url=window.location.protocol+"//"+window.location.host+"/downloadvideo/"+localStorage.getItem("token"); 
    }
    else if (typeof(email) === 'string'){
        view="Browse";
		url=window.location.protocol+"//"+window.location.host + "/downloadvideobyemail/"+localStorage.getItem("token")+"/"+email; 
    }
    if(email==null || typeof(email) === 'string'){
		xmlHttp.open("GET", url, true );
		xmlHttp.responseType = 'arraybuffer';
		xmlHttp.send();	
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				if(xmlHttp.response.byteLength==0){
					//showErrorMessagesPage("Profile","show video","user without video",false);
				}
				else{
					document.getElementById("video"+view).style.display="block";
					var blob = new Blob([xmlHttp.response], {type: 'video/ogg'});
					var url = (window.URL || window.webkitURL).createObjectURL(blob);
		            document.getElementById("videoSource"+view).src = url;
				}
			}
		}			
    }else{
        showErrorMessagesPage("Profile","showdata","error email",false);
    }
}

////////////////////////////////////////////////////////////////
/*
*Routing
*/
////////////////////////////////////////////////////////////////

/**
* Dispaly the Home view
*/
function displayHome(){
	if(localStorage.getItem("token") != null){
		document.getElementById("home").style.display="block";
		document.getElementById("browse").style.display="none";
		document.getElementById("account").style.display="none";
		dataProfile();
		getMessage();
		getNumberMessageAndLikes();
		showImageUser();
		showVideoUser();
	} else {
		page('/connection');
	}  
}

/**
* Dispaly the Browse view
*/
function displayBrowse(){
	if(localStorage.getItem("token") != null){
		document.getElementById("home").style.display="none";
		document.getElementById("browse").style.display="block";
		document.getElementById("account").style.display="none";
	} else {
		page('/connection');
	}

}

/**
* Dispaly the Account view
*/
function displayAccount(){
	if(localStorage.getItem("token") != null){	
		document.getElementById("home").style.display="none";
		document.getElementById("browse").style.display="none";
		document.getElementById("account").style.display="block";
	} else {
		page('/connection');
	}
}

/**
* When only the adress of the server is enter, redirection to the connection page
*/
page('/', function(){
	page('/connection');
});

/**
* This page disconnect the user when he is connected  
*/
page('/connection', function(){
 	if(localStorage.getItem("token") != null){
		signout();
	}
});

/**
* Display the Home page
*/
page('/home', function(){
 	displayHome();
});

/**
* Display the Browse page
*/
page('/browse', function(){
 	displayBrowse();
});

/**
* Display the Account page
*/
page('/account', function(){
 	displayAccount();
});

/**
* If the URL enter is wrong we redirect the user to the home page, and if the user is not connected to the connection page
*/
page('*', function(){
 	page('/home');
});

page({hashbang: true});

////////////////////////////////////////////////////////////////
/*
*WEBSOCKET
*/
////////////////////////////////////////////////////////////////
//disconect websocket  when you close or reload the page
window.onbeforeunload = function() {
    connection.onclose = function () {}; // disable onclose handler first
    if(connection!=null){
		connection.close(); 
	}
};

/**
*open websocket and define all the funtionality
*/
function open_websocket(){
	if(localStorage.getItem("token") != null){
		if(connection!=null){//Still in CONNECTING state
			connection.close();
			connection=null;
		}
       	connection = new WebSocket("ws://127.0.0.1:5000/connect");
		connection.onopen = function () {
			if(localStorage.getItem("token") != null){
		  		connection.send(localStorage.getItem("token") ); // Send the message 'Ping' to the server
	   		}
		};
		// Log errors
		connection.onerror = function (error) {
			console.log('WebSocket Error ' + error);
		};
		// Log messages from the server. Structure message: JSON (command ,JSOM(data))
		connection.onmessage = function (e) {
			var input=JSON.parse(e.data);
			if("autoLogOut" == input.command){//log out
				deleteTokenAndCloseWebsocket();
				reloadPage();
			reloadPage();
			}else if("user_connect" == input.command){
				user_online=JSON.parse(input.data)["user_connect"]
				displayChart();
			}else if("updateMessage" == input.command){
				number_messages=JSON.parse(input.data)["number_message"]
				displayChart();
			}else if("updateLike" == input.command){
				number_likes=JSON.parse(input.data)["number_like"]
				displayChart();
			}
		};
		connection.onclose = function () {
			if(connection!=null){
				connection.close();
				connection=null;
			}
		};
    		
	}
}
/*
*delete token and close socket if is existed
*/
function deleteTokenAndCloseWebsocket(){
	localStorage.removeItem("token"); //delete token and close websocket
	if(connection!=null){
		connection.close(); 
		connection=null;
	}
}


////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////
/**
* Display chart with the global variable
*/
////////////////////////////////////////////////////////////////
function displayChart(){
    var data = {
        labels: ["Online", "Likes", "Messages"],
        datasets: [
            {
                label: "Statistic",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [user_online,number_likes,number_messages]
            }
        ]
    };
    // Get the context of the canvas element we want to select
    var ctx = document.getElementById("statistics_chart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data);

};
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
