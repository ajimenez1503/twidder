/**
* @author antonio cedric
* @version 0.1
*/


/**
* Check if the e-mail is valid
* @param {String} email
* @returns {boolean} if the e-mail is valid
*/
function validateEmail(email)  {
    if (typeof(email) === 'string')
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
