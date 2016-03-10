
drop table if exists profile;
create table profile (
	id integer primary key autoincrement,
	email VARCHAR(100) not null unique,
	password CHAR(100) not null,
	firstName VARCHAR(100) not null,
 	familyName VARCHAR(100) not null,
	gender VARCHAR(100) not null,
	city VARCHAR(100) not null,
	country VARCHAR(100) not null,
	nbLike integer not null DEFAULT 0,
	image varchar(100) DEFAULT '',
	video varchar(100) DEFAULT ''
);

drop table if exists message;
create table message (
	id integer primary key autoincrement,
	fromEmail VARCHAR(100) not null,
	toEmail VARCHAR(100) not null,
	message VARCHAR(100) not null,
	FOREIGN KEY (fromEmail) REFERENCES profile(email),
	FOREIGN KEY (toEmail) REFERENCES profile(email)
);

