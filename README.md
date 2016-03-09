# Twidder
minimal social-networking web application called Twidder, where the user can:
  * Show the data profile and media 
  * Write and read messages
  * Change password
  * Search other user 
  * CLick like in other user
  * Check how many user on the system


## Requirement:
### Functional
  * The user shall be able to sign up, sign in and sign out.
  * The user shall be able to view his/her own personal information provided during sign­up,
everything excluding the password, once signed in.
  * The user shall own a message wall which other users and himself/herself can post messages on
it.
  * The user shall be able to refresh his/her own wall to check for any newly posted messages,
without refreshing the rest of content. In other words, the browser’s refresh button shall not be
used.
  * The user shall be able to view another user’s personal information, everything excluding their
password, and message wall by providing his/her email address.
  * The user shall be able to post a message on another user’s message wall.
  * The user shall be able to refresh another user’s message wall to see the newly posted messages,
without refreshing the rest of the content.
  * The user shall be able to change his/her password while being signed­in.
  * All the server functions specified in the lab instructions shall work exactly as specified.
  * There can only be one valid session at a time. It means once the user is logged in, the other
possible session shall automatically be expired. In case of the application being opened on that
expired session, in some other browser or environment, the welcome view shall be
automatically displayed.


### Non Functional
  * The server shall use an SQLite database to store all user data.
  * The server shall use appropriate HTTP methods for all routes.
  * All the server­side methods will return the result in JSON.
  * The server and client shall communicate asynchronously.
  * HTTP and WebSocket requests are used for implementing one way and two way communication between the client and server
  * JSON shall be used as data exchange format
  * Once the application is opened for the first time, it will not require to refresh itself during its
lifetime. Such applications are called Single Page Applications or SPAs. For more information
please check out section 4: Application Structure.
  * Using “window.alert()” or similar types of window based inputs/outputs is not allowed.

##Tool
  * Python Flask
  * JavaScript
  * AJAX
  * JSON
  * WSGI Server
  * WebSocket
  * ChartJS
  * Drag and Drop
  * History API 
  * BCrypt
  * Bootstrap
  * SQL
  * CSS
  * HTML
  * Jquery
