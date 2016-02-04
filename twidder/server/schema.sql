drop table if exists profile;
create table profile (
	id integer primary key autoincrement,
	email VARCHAR(100) not null unique,
	password VARCHAR(100) not null,
	firstName VARCHAR(100) not null,
 	familyName VARCHAR(100) not null,
	gender VARCHAR(100) not null,
	city VARCHAR(100) not null,
	country VARCHAR(100) not null
);

drop table if exists message;
create table message (
	id integer primary key autoincrement,
	fromEmail VARCHAR(100) not null,
	toEmail VARCHAR(100) not null,
	message VARCHAR(100) not null
);

