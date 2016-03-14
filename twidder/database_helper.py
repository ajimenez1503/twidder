# -*- coding: utf-8 -*-
__author__ = 'Antonio'
import sqlite3
#import hashlib
from flask import g
from contextlib import closing
import os



DATABASE = os.getcwd() +'/twidder/twidder/database.db'

def get_db():
    db = getattr(g, DATABASE, None)
    if db is None:
        db = g._database = connect_db()
    return db

def connect_db():
	return sqlite3.connect(DATABASE)

def close_db():
    db = get_db()
    if db is not None:
        db.close()
##############################################################

"""
	Definition:	​Registers a user in the database.
    Keyword arguments: email of the user
						password of the user
	Return: Message about the succes or the fail
"""
def sign_in(email,password,bcrypt):
	db=get_db()
	#check if the pasword are the same
	result=db.execute('select password from profile where email=?',(email,))
	pw_hash=result.fetchone()
	if pw_hash is None:
		return 'connection failed'
	else:
		pw_hash=pw_hash[0]
		if bcrypt.check_password_hash(pw_hash, password):
			result=db.execute('select id from profile where email=?',(email,))
			user=result.fetchone()
			if user is None:
				return 'connection failed'
			else:
				return user[0]
		else:
			return 'connection failed'
		
"""
	Definition:	​Registers a user in the database.
    Keyword arguments: all the inforormations about the user
	Return: true if the user is add in the database, otherwise false
"""
def sign_up(email,password,firstname,familyname,gender,city,country,bcrypt):
	db=get_db()
	password=bcrypt.generate_password_hash(password)
	try:
		db.execute('insert into profile (email,password,firstname, familyname,gender,city,country) values (?,?,?,?,?,?,?)',(email,password,firstname, familyname,gender,city,country))
	except Exception as e:
		return False
	db.commit()
	return True

"""
	Definition:	Retrieves the stored data for the user with the ID in parameter
    Keyword arguments: id of the user
	Return: information about the user or error message
"""
def get_user_data(id_user):
	db=get_db()
	result=db.execute('select email,firstname,familyname,gender,city,country from profile where id=?',(id_user,))
	if result is None:
		return 'user not found'
	else:
		entries = [dict(email=row[0], firstname=row[1],familyname=row[2],gender=row[3],city=row[4],country=row[5])for row in result.fetchall()]
    	return entries

"""
	Definition:	Retrieves the stored data for the user with the email in parameter
    Keyword arguments: email of the user
	Return: information about the user or error message
"""
def get_user_data_by_email(email):
	db=get_db()
	result=db.execute('select email,firstname,familyname,gender,city,country from profile where email=?',(email,))
	if result is None:
		return 'user not found'
	else:
		entries = [dict(email=row[0], firstname=row[1],familyname=row[2],gender=row[3],city=row[4],country=row[5])for row in result.fetchall()]
    	return entries

"""
	Definition:	​Changes the password of the user wih the id given in parameter.
    Keyword arguments: id of the user
						old password of the user
						new password of the user
	Return: message to know if it's a success or a fail
"""
def change_password(id_user,password,new_password,bcrypt):
	db=get_db()

	#check if the passwords are the same
	result=db.execute('select password from profile where id=?',(id_user,))
	pw_hash=result.fetchone()
	if pw_hash is None:
		return False
	else:
		pw_hash=pw_hash[0]
		if bcrypt.check_password_hash(pw_hash, password):
			new_password=bcrypt.generate_password_hash(new_password)
			db.execute('update profile set password=? where  id=?',(new_password,id_user))
			if db.total_changes<=0:
				db.commit()
				return False
			else:
				db.commit()
				return True
		else:
			return False


"""
	Definition:	​Add the message send to the database
    Keyword arguments: id of the seeder
						message sent
						email of the receiver
	Return: true if the message is save in the database, otherwise false
"""
def post_message(id_user,message,toEmail):
	db=get_db()
	#get email from id_user
	result=db.execute('select email from profile where id=?',(id_user,))
	user=result.fetchone()
	fromEmail= user[0];
	#check if toEmail exicts
	result=db.execute('select id from profile where email=?',(toEmail,))
	user=result.fetchone()
	if user is None:
		return False
	try:
		db.execute('insert into message (fromEmail,toEmail,message) values (?,?,?)',(fromEmail,toEmail,message))
	except Exception as e:
		return False
	db.commit()
	return True

"""
	Definition:	​increment the like of the user by email 
    Keyword arguments: 	email of the user
	Return: true if like was incremented, otherwise false
"""
def increment_like(email):
	db=get_db()
	db.execute('UPDATE profile SET nbLike = nbLike + 1 where email=?',(email,))
	if db.total_changes<=0:
		db.commit()
		return False
	else:
		db.commit()
		return True	


"""
	Definition:	​Retrieves the stored messages for the user specified by the passed email address.
    Keyword arguments: email adress of the user
	Return: the message sent to the user or an error message
"""
def get_messages_by_email(email):
	db=get_db()
	#check if toEmail exicts
	result=db.execute('select id from profile where email=?',(email,))
	user=result.fetchone()
	if user is None:
		return 'wrong email'
	result=db.execute('select fromEmail,message from message where toEmail=?',(email,))
	messages = [dict(fromEmail=row[0], message=row[1])for row in result.fetchall()]
	return messages

"""
	Definition:	Retrieves the stored messages for the user with the id given in parameter
    Keyword arguments: id of the user
	Return: the message sent to the user or an error message
"""
def get_messages_by_token(id_user):
	db=get_db()
	#get email from id_user
	result=db.execute('select email from profile where id=?',(id_user,))
	user=result.fetchone()
	toEmail= user[0];
	return get_messages_by_email(toEmail)


"""
	Definition:	​Retrieves the number of  messages for the user specified by the passed email address.
    Keyword arguments: email adress of the user
	Return: the number message or an error message
"""
def get_number_messages_by_token(id_user):
	db=get_db()
	#get email from id_user
	result=db.execute('select email from profile where id=?',(id_user,))
	user=result.fetchone()
	email= user[0];
	result=db.execute('select COUNT(*) from message where toEmail=?',(email,))
	number_message=result.fetchone()
	if number_message is None:
		return 0
	else:
		return number_message[0]



"""
	Definition:	​Retrieves the number of  likes for the user specified by the passed email address.
    Keyword arguments: email adress of the user
	Return: the number likes or an error message
"""
def get_number_likes_by_token(id_user):
	db=get_db()
	result=db.execute('select nbLike from profile where id=?',(id_user,))
	user=result.fetchone()
	nbLike= user[0]
	if nbLike is None:
		return 0
	else:
		return nbLike



"""
	Definition:	get the id of a user by the email
    Keyword arguments: email adress of the user
	Return: id or message error "wrong email"
"""
def get_id_by_email(email):
	db=get_db()
	result=db.execute('select id from profile where email=?',(email,))
	user=result.fetchone()
	user=user[0]
	if user is None:
		return 'wrong email'
	else:
		return user


"""
	Definition:	update the database with the file of the user
    Keyword arguments: id user, filename video and image
	Return: true or false if it is update
"""
def upload_file(id_user,filename_image,filename_video):
	db=get_db()
	db.execute('update profile set image=?,video=? where  id=?',(filename_image,filename_video,id_user))
	if db.total_changes<=0:
		db.commit()
		return False
	else:
		db.commit()
		return True

"""
	Definition:	get the name of the file image of the user by the id
    Keyword arguments: id of the user
	Return: name file or message error ""
"""
def get_name_image(id_user):
	db=get_db()
	result=db.execute('select image from profile where id=?',(id_user,))
	user=result.fetchone()
	image= user[0]
	if image is None:
		return ""
	else:
		return image

"""
	Definition:	get the name of the file video of the user by the id
    Keyword arguments: id of the user
	Return: name file or message error ""
"""
def get_name_video(id_user):
	db=get_db()
	result=db.execute('select video from profile where id=?',(id_user,))
	user=result.fetchone()
	video= user[0]
	if video is None:
		return ""
	else:
		return video

