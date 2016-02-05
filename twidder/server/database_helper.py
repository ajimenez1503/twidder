# -*- coding: utf-8 -*-
__author__ = 'Antonio'
import sqlite3
import hashlib
from flask import g
from contextlib import closing



DATABASE = '/home/antji996/Desktop/web/test/test2/database.db'

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
def sign_in(email,password):
	db=get_db()
	sha=hashlib.sha256(password)
	hashed = sha.hexdigest()
	result=db.execute('select id from profile where email=? and password=?',(email,hashed))
	user=result.fetchone()
	if user is None:
		return 'user not found'
	else:
		return user[0]
		
"""
	Definition:	​Registers a user in the database.
    Keyword arguments: all the inforormations about the user
	Return: true if the user is add in the database, otherwise false
"""
def sign_up(email,password,firstname,familyname,gender,city,country):
	db=get_db()
	sha=hashlib.sha256(password)
	hashed = sha.hexdigest()
	try:
		db.execute('insert into profile (email,password,firstname, familyname,gender,city,country) values (?,?,?,?,?,?,?)',(email,hashed,firstname, familyname,gender,city,country))
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
def change_password(id_user,password,new_password):
	db=get_db()
	sha=hashlib.sha256(password)
	old_hashed = sha.hexdigest()
	sha=hashlib.sha256(new_password)
	new_hashed = sha.hexdigest()
	db.execute('update profile set password=? where  id=? and password=?',(new_hashed,id_user,old_hashed))
	if db.total_changes<=0:
		db.commit()
		return False
	else:
		db.commit()
		return True

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









