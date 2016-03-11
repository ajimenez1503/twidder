/**
* @author antonio Jimenez (antji996) cedric Lallemand (cedla736)
* @version 0.1
*/

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
            document.getElementById("showErrorMessage"+page+"Page").className ="alert alert-success";
        }
        else{
            document.getElementById("showErrorMessage"+page+"Page").className="alert alert-danger";
        }
        document.getElementById("errorMessage"+page+"Page").innerHTML=element+" : "+message;
		fade(document.getElementById("showErrorMessage"+page+"Page"),300);
        return true;
    }else{
        return false;
    }

}


function fade(element, speed) {
var op = 1,
        timer = setInterval(function () {
            if (op <= 0.1){
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = op;
            element.style.filter = 'alpha(opacity=' + op * 100 + ")";
            op -= op * 0.1;
        }, speed);
}


/**
* Check if the e-mail is valid
* @param {String} email
* @returns {boolean} if the e-mail is valid
*/
function validateEmail(email)  {
    if (typeof(email) === 'string'){
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if(email.match(mailformat))  {
            return true;
        }
    }else{
        return false;
    }
}

/**
* Deleta all child of a node
* @param {element} father of the element will be deleted
*/
function deleteAllChildElement(node){
		while (node.firstChild) {
    		node.removeChild(node.firstChild);
		}
}
/**
* show the message of the user in the diaplay fatehr
* @param {objet} message{ writer, content}
* @param {element} father the display where the message will be show
*/
function showMessages(messages,father){
		//delete before message
		deleteAllChildElement(father);
        for	(index = 0; index < messages.length; index++) {
            var node = document.createElement("P");
            var textnode = document.createTextNode(messages[index].fromEmail+" : "+messages[index].message);
            node.appendChild(textnode);
            father.appendChild(node);
        }
}


/**
* send message to an email and display in the elemnt father
* @param {string}message
* @param {string}email of the addressee
* @param {boolean} false if display in home or true if display un browse
*/
function sendMessage(message,email,toOther){
	var url="http://127.0.0.1:5000/postmessage";
		var xmlHttp =new XMLHttpRequest(); 
		xmlHttp.onreadystatechange = function() { 
			if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ){
				var output= JSON.parse(xmlHttp.responseText);        
				if(output.success){
					document.getElementById("writeMessageBrowse").value="";//clean input message
					document.getElementById("writeMessage").value="";//TODO arregarlo solo uno
					if(toOther) getMessage(email);//update list of message
					else getMessage();//update list of message
				}else{
					showErrorMessagesPage("Profile","send message",output.message,output.success);
				}
			}
		}
		xmlHttp.open("POST", url, true );
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		var params = "email="+email+"&message="+message+"&token="+localStorage.getItem("token");
		xmlHttp.send(params);		
}


////////////////////////////////////////////////////////////////
/**
*Implemebtation of drag and drop)
*/
////////////////////////////////////////////////////////////////
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
	console.log("I left it");
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
	incrementLike();
	drag1.draggable = "false";
}
//restar the position of the drag
function restar_drag_drop(){
	var drag1 = document.getElementById('drag1');
	drag1.draggable = "true";
	document.getElementById('Display_thumb').appendChild(drag1);
}
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
