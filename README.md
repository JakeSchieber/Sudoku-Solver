React client under ./client
"npm start" to start dev server

Express backend under ./server
"npm start" to start dev sever

Connection notes:
Proxy config in client package.json points all unhandled requests to dev server, this is only respected when in dev environment (ex: fetch to ./api)

What needs to be figured out:
Figuring out how production build would run. Ex: server serving prod client app: https://dev.to/loujaybee/using-create-react-app-with-express, will our proxy logic work? Do we need to enable CORs for anything?
