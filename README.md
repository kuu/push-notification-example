# push-notification-example
Server sends a push notification with the current time every 10 seconds to the subscribers.

##Install
```
$ git clone git@github.com:airoffline/push-notification-example.git
$ cd push-notification-example
$ npm install
```

###Run development server:
```
$ npm start
```
Then go http://localhost:8080

###Run production server:
```
$ mkdir tls
$ cp {your server's private key and certs} tls/
$ vi config/defalut.yaml  # Change the filenames in the tls/ dir if needed.
$ sudo npm runHTTPS
```
Then go https://flightplan.gree-dev.net
