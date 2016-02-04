__author__ = 'Antonio'
from flask import app, request
from flask import Flask
import database_helper
import json
import random

app = Flask(__name__)
app.debug = True

list_token={}


"""
	Definition:	
		connecte to the database before any request
    Keyword arguments:
	Return:
"""
@app.before_request
def before_request():
    database_helper.connect_db()

"""
	Definition:	
		disconnecte to the database in case of problem
    Keyword arguments:
	Return:
"""
@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()


"""
	Definition:	​Authenticates the username by the provided password.
    Keyword arguments: -
	Return: the token or a message error
		
"""
@app.route('/signin', methods=['POST'])
def sign_in():
	email = request.form['email']
	password = request.form['password']
	result = database_helper.sign_in(email,password)
	if result == 'user not found':
		return 'user not found', 404
	else:
		return create_token(result), 200

	
"""
	Definition:	​Registers a user in the database.
    Keyword arguments: -
	Return: Message about the succes or the fail
"""
@app.route('/signup', methods=['POST'])
def sign_up():
	firstname = request.form['firstname']
	familyname = request.form['familyname']
	email = request.form['email']
	password =request.form['password']
	gender =request.form['gender']
	city =request.form['city']
	country =request.form['country']
	result = database_helper.sign_up(email,password,firstname,familyname,gender,city,country)
	if result == True:
		return 'contact added', 200
	else:
		return 'could not add the system', 501

"""
	Definition:	Retrieves the stored data for the user whom the passed token is issued for. The currently
signed in user can use this method to retrieve all its own information from the server.
    Keyword arguments: -
	Return: information about the user or error message
"""
@app.route('/getuserdatabytoken/<token>', methods=['GET'])
def get_user_data_by_token(token = None):
	if token != None and list_token.has_key(token):
		result = database_helper.get_user_data(list_token.get(token))
		if result == 'user not found':
			return 'user not found', 404
		else:
			return json.dumps(result), 200
	else:
		return "user not connect", 404

"""
	Definition:	​Signs out a user from the system
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/signout/<token>', methods=['DELETE'])
def sign_out(token = None):
	if token != None:
		if list_token.has_key(token):
			list_token.pop(token)
			return 'user disconnect', 200
		else:
			return 'user not found', 404
	else:
		return "", 404

"""
	Definition:	​Changes the password of the current user to a new one.
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/changepassword', methods=['POST'])
def change_password():
	token = request.form['token']
	if list_token.has_key(token):
		password = request.form['password']
		new_password = request.form['new_password']
		result = database_helper.change_password(list_token.get(token),password,new_password)
		if result == True:
			return 'password change', 200
		else:
			return 'password incorrect', 501
	else:
		return 'user not connect', 404

"""
	Definition:	Retrieves the stored data for the user whom the passed token is issued for. The currently
signed in user can use this method to retrieve all its own information from the server
    Keyword arguments: -
	Return: information about the user or error message
"""
@app.route('/getuserdatabyemail/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token = None, email=None):
	if token != None and email!=None and list_token.has_key(token):
		result = database_helper.get_user_data_by_email(email)
		if result == 'user not found':
			return 'user not found', 404
		else:
			return json.dumps(result), 200
	else:
		return "user not found", 404

"""
	Definition:	Retrieves the stored messages for the user whom the passed token is issued for. The
currently signed in user can use this method to retrieve all its own messages from the server.
    Keyword arguments: -
	Return: the message sent to the user or an error message
"""
@app.route('/getmessagesbytoken/<token>', methods=['GET'])
def get_messages_by_token(token = None):
	if token != None and list_token.has_key(token):
		result = database_helper.get_messages_by_token(list_token.get(token))
		if result == 'email is wrong':
			return 'email is wrong', 404
		else:
			return json.dumps(result), 200
	else:
		return "user not connect", 404

"""
	Definition:	​Retrieves the stored messages for the user specified by the passed email address.
    Keyword arguments: -
	Return: the message sent to the user or an error message
"""
@app.route('/getmessagesbyemail/<token>/<email>', methods=['GET'])
def get_messages_by_email(token = None,email=None):
	if token != None and email!=None and list_token.has_key(token):
		result = database_helper.get_messages_by_email(email)
		if result == 'email is wrong':
			return 'email is wrong', 404
		else:
			return json.dumps(result), 200
	else:
		return "user not connect", 404

"""
	Definition:	​Tries to post a message to the wall of the user specified by the email address.
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/postmessage', methods=['POST'])
def post_message():
	token = request.form['token']
	if list_token.has_key(token):
		message = request.form['message']
		email = request.form['email']
		result = database_helper.post_message(list_token.get(token),message,email)
		if result == False:
			return 'unknown receiver', 501
		else:s
			return 'email sent', 200
	else:
		return 'user not connect', 404
	
	
	

######################################################

"""
	Definition:	Create a token for the user with the id given in parameter
    Keyword arguments: id of the user
	Return: the token generated for the user
"""
def create_token(id_user):
	letters = 'abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
	token = "";
	for i in range(0,36):
		token += letters[random.randint(0, len(letters)-1)];
	global list_token
	list_token[token]=id_user
	return token

if __name__ == '__main__':
    app.run()
