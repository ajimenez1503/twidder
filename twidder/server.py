# -*- coding: utf-8 -*-
__author__ = 'Antonio'
from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from werkzeug.serving import run_with_reloader
from flask import app, request
from flask import Flask
from flask.ext.bcrypt import Bcrypt
import database_helper
import json
import random
import re


from flask import send_from_directory
import os
from flask import redirect, url_for
from werkzeug import secure_filename



app = Flask(__name__, static_url_path='')
bcrypt = Bcrypt(app)
app.debug = True

UPLOAD_FOLDER = '/home/antji996/Desktop/web/test/twidder/twidder/uploads'
ALLOWED_EXTENSIONS = set(['gif', 'mp4', 'png', 'jpg', 'jpeg', 'ogg'])
list_token_id={}
list_conection={}
min_size_password=4
autologKey=None




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
	Definition:	​open index page
    Keyword arguments: -
	Return: render the page
		
"""
@app.route('/')
def root():
    return app.send_static_file('client.html')
"""
	Definition:	​Authenticates the username by the provided password.
    Keyword arguments: -
	Return: the token or a message error
		
"""
@app.route('/signin', methods=['POST'])
def sign_in():
	email = request.form['email']
	password = request.form['password']
	if  validate_signin(email,password):
		result = database_helper.sign_in(email,password,bcrypt)
		if result == 'connection failed':
			return return_json(404,False,result)
		else:
			return return_json(200,True,'Successfully signed in',create_token(result))
	else:
		return return_json(400,False,'wrong inputs')
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
	if  validate_singup(email,password,firstname,familyname,gender,city,country):
		result = database_helper.sign_up(email,password,firstname,familyname,gender,city,country,bcrypt)
		if result == True:
			return return_json(200,True,'User added')
		else:	
			return return_json(400,False,'sign up fail')
	else:
		return return_json(400,False,'wrongg inputs')

"""
	Definition:	Retrieves the stored data for the user whom the passed token is issued for. The currently
signed in user can use this method to retrieve all its own information from the server.
    Keyword arguments: -
	Return: information about the user or error message
"""
@app.route('/getuserdatabytoken/<token>', methods=['GET'])
def get_user_data_by_token(token = None):  
	if token != None and list_token_id.has_key(token):
		result = database_helper.get_user_data(list_token_id.get(token))
		if result == 'user not found':
			return return_json(404,False,result)
		else:
			return return_json(200,True,'User data retrieved',result)
	else:
		return return_json(403,False,'user not connected')

"""
	Definition:	​Signs out a user from the system
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/signout/<token>', methods=['GET'])
def sign_out(token = None):
	if token != None:
		if list_token_id.has_key(token):
			list_token_id.pop(token)
			list_conection.pop(token)
			get_user_connet()
			return return_json(200,True,'user disconnected')
		else:
			return return_json(404,False,'user not found')
	else:
		return return_json(400,False,'wrong inputs')

"""
	Definition:	​Changes the password of the current user to a new one.
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/changepassword', methods=['POST'])
def change_password():
	token = request.form['token']
	if list_token_id.has_key(token):
		password = request.form['password']
		new_password = request.form['new_password']
		result = database_helper.change_password(list_token_id.get(token),password,new_password,bcrypt)
		if result == True:
			return return_json(200,True,'password change')
		else:
			return return_json(401,False,'password incorrect')
	else:
		return return_json(403,False,'user not connected')

"""
	Definition:	Retrieves the stored data for the user whom the passed token is issued for. The currently
signed in user can use this method to retrieve all its own information from the server
    Keyword arguments: -
	Return: information about the user or error message
"""
@app.route('/getuserdatabyemail/<token>/<email>', methods=['GET'])
def get_user_data_by_email(token = None, email=None):
	if token != None and email!=None and list_token_id.has_key(token):
		result = database_helper.get_user_data_by_email(email)
		if result == 'user not found':
			return return_json(404,False,result)
		else:
			return return_json(200,True,'User data retrieved',result)
	else:
		return return_json(403,False,'user not connected')

"""
	Definition:	Retrieves the stored messages for the user whom the passed token is issued for. The
currently signed in user can use this method to retrieve all its own messages from the server.
    Keyword arguments: -
	Return: the message sent to the user or an error message
"""
@app.route('/getmessagesbytoken/<token>', methods=['GET'])
def get_messages_by_token(token = None):
	if token != None and list_token_id.has_key(token):
		result = database_helper.get_messages_by_token(list_token_id.get(token))
		if result == 'wrong email':
			return return_json(404,False,result)
		else:
			return return_json(200,True,'User message retrieved',result)
	else:
		return return_json(403,False,'user not connected')

"""
	Definition:	​Retrieves the stored messages for the user specified by the passed email address.
    Keyword arguments: -
	Return: the message sent to the user or an error message
"""
@app.route('/getmessagesbyemail/<token>/<email>', methods=['GET'])
def get_messages_by_email(token = None,email=None):  
	if token != None and email!=None and list_token_id.has_key(token):
		result = database_helper.get_messages_by_email(email)
		if result == 'wrong email':
			return return_json(404,False,result)
		else:
			return return_json(200,True,'User message retrieved',result)
	else:
		return return_json(403,False,'user not connected')

"""
	Definition:	​Tries to post a message to the wall of the user specified by the email address.
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/postmessage', methods=['POST'])
def post_message():  
	token = request.form['token']
	if list_token_id.has_key(token):
		message = request.form['message']
		email = request.form['email']
		result = database_helper.post_message(list_token_id.get(token),message,email)
		if result == False:
			return return_json(404,False,'unknown receiver')
		else:
			updateMessages(email)
			return return_json(200,True,'message sent')
	else:
		return return_json(403,False,'user not connect')
	


"""
	Definition:	return the number of messages of the user by token
    Keyword arguments: -
	Return: estul with the json or an error message
"""
@app.route('/getnumbermessagesbytoken/<token>', methods=['GET'])
def get_number_messages_by_token(token = None):
	if token != None and list_token_id.has_key(token):
		result = database_helper.get_number_messages_by_token(list_token_id.get(token))
		return return_json(200,True,'number of message sent',result)
	else:
		return return_json(403,False,'user not connected')



"""
	Definition:	return the number of messages and likes of the user by token
    Keyword arguments: -
	Return: restul with the json or an error message
"""
@app.route('/getnumbermessagesandLikesbytoken/<token>', methods=['GET'])
def get_number_messages_and_likes_by_token(token = None):
	if token != None and list_token_id.has_key(token):
		result = {}  
		result['number_message']=database_helper.get_number_messages_by_token(list_token_id.get(token))
		result['number_like']=database_helper.get_number_likes_by_token(list_token_id.get(token))
		return return_json(200,True,'number of message sent',json.dumps(result))
	else:
		return return_json(403,False,'user not connected')


"""
	Definition:	​increment the like in the databse
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/incrementLike', methods=['POST'])
def increment_like():  
	email = request.form['email']
	result = database_helper.increment_like(email)
	if result == False:
		return return_json(404,False,'unknown receiver')
	else:
		updateLikes(email)
		return return_json(200,True,'Like sent')	


"""
	Definition:	​save a file at disk
    Keyword arguments: -
	Return: message to know if it's a success or a fail
"""
@app.route('/uploadfiles', methods=['POST'])
def upload_files():
	token = request.form['token']
	if list_token_id.has_key(token):
		file_image = request.files['file_image']
		print file_image.filename
		if file_image and allowed_file(file_image.filename):
			filename_image = secure_filename(file_image.filename)
			file_image.save(os.path.join(UPLOAD_FOLDER, filename_image))
			result = database_helper.upload_file(list_token_id.get(token),filename_image)
			if result==True:
				return return_json(200,True,' file upload')
			else:
				return return_json(401,False,'file exist already')	
		else:
			return return_json(401,False,'file not allow')
	else:
		return return_json(403,False,'user not connected')
	

"""
	Definition:	send image to the cliente
    Keyword arguments: token
	Return: message to know if it's a success or a fail
"""
@app.route('/downloadimage/<token>')
def download_image(token):
	if token != None and list_token_id.has_key(token):
		filename=database_helper.get_name_image(list_token_id.get(token))
		if filename!='' and filename!=None:
			result=send_from_directory(UPLOAD_FOLDER,filename, as_attachment=True)
			#TODO check if img exist
			return result
		else:
			return bytearray([])
	else:
		return bytearray([])


"""
	Definition:	send image to the cliente
    Keyword arguments: token
	Return: message to know if it's a success or a fail
"""
@app.route('/downloadimagebyemail/<token>/<email>')
def download_image_by_email(token,email):
	if token != None and list_token_id.has_key(token) and email != None:
		id_user=database_helper.get_id_by_email(email)
		if id_user=='wrong email':
			return bytearray([])			
		filename=database_helper.get_name_image(id_user)
		if filename!='' and filename!=None:
			result=send_from_directory(UPLOAD_FOLDER,filename, as_attachment=True)
			#TODO check if img exist
			return result
		else:
			return bytearray([])
	else:
		return bytearray([])
    

######################################################
#TODO comment
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS
"""
    Definition: send a message to the client by websocket with the mumber of messages
    Keyword arguments: -
    Return: 
"""
def updateMessages(email):
	id_user = database_helper.get_id_by_email(email)
	if id_user != 'wrong email':
		if id_user in list_token_id.values():
			for token in list_token_id:
				if id_user==list_token_id.get(token) and token in list_conection:
						result = {}  
						result['number_message']=database_helper.get_number_messages_by_token(id_user)
						list_conection.get(token).send(create_message("updateMessage",json.dumps(result)))
						break	

"""
    Definition: send a message to the client by websocket with the mumber of likes
    Keyword arguments: -
    Return: 
"""
def updateLikes(email):
	id_user = database_helper.get_id_by_email(email)
	if id_user != 'wrong email':
		if id_user in list_token_id.values():
			for token in list_token_id:
				if id_user==list_token_id.get(token) and token in list_conection:
						result = {}  
						result['number_like']=database_helper.get_number_likes_by_token(id_user)
						list_conection.get(token).send(create_message("updateLike",json.dumps(result)))
						break	
"""
    Definition: get user connet on the system
    Keyword arguments: -
    Return: data: user conenect send to clien by websocket
"""
def get_user_connet():  
    user_connect=len(list_token_id);
    result = {}  
    result['user_connect']=user_connect;
    for ws in list_conection.values():
        ws.send(create_message("user_connect",json.dumps(result)))


"""
	Definition:	return a json object with code http,success (bool),message (string), data (json object)
    Keyword arguments: 
		code http,success (bool),message (string), data (json object)
	Return: the json object
"""
def return_json(code,success,message,data=None):
	output = {}  
	output['success']=success
	output['message']=message
	output['data']=data	
	output['code']=code	
	return json.dumps(output)

"""
	Definition:	return a json object with command data (json object)
    Keyword arguments: 
		command, data (json object)
	Return: the json object
"""
def create_message(command,data=None):
	output = {}  
	output['command']=command
	output['data']=data	
	return json.dumps(output)


"""
	Definition:	connet the websocket, client and server. We store a dict with token and connection. 
	We receive the token from the client size.
    Keyword arguments: 
"""
@app.route('/connect')
def connect():
	#send message to client witht the token
	if request.environ.get('wsgi.websocket'):
		ws = request.environ['wsgi.websocket']
		while True:
			message_token = ws.receive()
			if message_token!=None:			
				global list_conection
				list_conection[message_token]=ws
				get_user_connet()


"""
	Definition:	auto-logOut. In the case the there are two time the same id on the server, 
	the first clien have to disconect. Then we send a message to this l
    Keyword arguments: id of the user
"""
def autologOut(id_user):
	if id_user in list_token_id.values():
		for key in list_token_id:
			if id_user==list_token_id.get(key):		
				#send message to client witht the token and delete on the list
				if key in list_conection:
					list_conection.pop(key).send(create_message("autoLogOut"))#delete
					list_token_id.pop(key)
				break	


"""
	Definition:	Create a token for the user with the id given in parameter
    Keyword arguments: id of the user
	Return: the token generated for the user
"""
def create_token(id_user):
	autologOut(id_user)
	letters = 'abcdefghiklmnopqrstuvwwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
	token = "";
	for i in range(0,36):
		token += letters[random.randint(0, len(letters)-1)];
	global list_token_id
	list_token_id[token]=id_user
	return token

"""
	Definition:	Check if the e-mail is valid
    Keyword arguments: {String} email
	Return: {boolean} if the e-mail is valid
"""
def validateEmail(email):	
	if len(email) >= 5:
		if re.match("^.+\\@(\\[?)[a-zA-Z0-9\\-\\.]+\\.([a-zA-Z]{1,3}|[0-9]{1,3})(\\]?)$", email) != None:
		    return True
	return False


"""
	Definition:	Check if the e-mail and password are valid
    Keyword arguments: {String} email and password
	Return: {boolean} if the e-mail and password are valid
"""
def validate_signin(email,password):
	result=validateEmail(email)
	if len(password)<min_size_password:
		result=False
	return result

"""
	Definition:	Check if the date for signup is valid
    Keyword arguments: {String} email,password,firstname,familyname,gender,city,country
	Return: {boolean} if the date for signup is valid
"""
def validate_singup(email,password,firstname,familyname,gender,city,country):
	result=validate_signin(email,password)
	if len(firstname)<=0 or len(familyname)<=0 or len(city)<=0 or len(country)<=0:
		result=False
	if gender!="female" and gender!="male":
		result=False
	return result

"""
	Definition:	run the server
    Keyword arguments: 
	Return: 
"""
@run_with_reloader
def run_server():	
	http_server = WSGIServer(('',5000), app, handler_class=WebSocketHandler)
	http_server.serve_forever()

	
if __name__ == '__main__':
    run_server()
