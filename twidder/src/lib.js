/**
* @author antonio Jimenez (antji996) cedric Lallemand (cedla736)
* @version 0.1
*/


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
* Check if the property of new user are empty.
* @param {object = {'email','password','firstname','familyname','gender','city','country'}
* @returns {boolean} if any property is empty
*/
function notFieldBlank(user){
    for( var property in user ){
        if(user[property].length==0){
            return false;
        }
        return true;
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
            var textnode = document.createTextNode(messages[index].writer+" : "+messages[index].content);
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
    var output=serverstub.postMessage(localStorage.getItem("token"),message,email);
	if(output.success){
		document.getElementById("writeMessageBrowse").value="";//clean input message
		document.getElementById("writeMessage").value="";//TODO arregarlo solo uno
		if(toOther) getMessage(email);//update list of message
        else getMessage();//update list of message
	}else{
        showErrorMessagesPage("Profile","send message",output.message,output.success);
    }
}
