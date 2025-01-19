# User Management System API - Assigment Task by FirstBench

## Description
    - This is an collection of APIs written in NodeJS + Typescript for User Managment System.
    - You can create account, login, update data, deactivate account as User/Admin.
    - Admins can fetch all the existing users.
    - Key nodejs libraries used - prisma, zod, jsonwebtoken, bcrypt, express.

## Requirements to run the project
    - NodeJS
    - Postman
    - Docker
    - MongoDB Compass

## Steps to setup the project
    1. Setting up database first!
        - Make sure you have docker installed, using docker, start a port mapped mongo container with MONGO_INITDB_DATABASE environment variable and initialize a replica set inside the container. If you dont know how to do it, just paste and execute these commands one by one in the terminal.
        ```bash 
            1. docker run -d -v userDatabase:/data/db --name UserDatabaseContainer -e MONGO_INITDB_DATABASE=userDatabase -p 27017:27017 mongo --replSet rs0
            2. docker exec -it UserDatabaseContainer mongosh
            3. rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]});
        ```
        - Keep the terminal open while running the project.

    2. Environment Variables
        - Then afterwards, open our project code in a code editor, then in the root directory of our project create '.env' file and create a Environment var 'DATABASE_URL' inside it.Assign it the connection string for your mongo database. If you executed the commands from step 1, just paste the below line in .env file. 
            ```bash
                DATABASE_URL="mongodb://localhost:27017/userDatabase?replicaSet=rs0"
            ```
        - Also you can optionally specify 'PORT' and 'JWT_SECRET' environment vars in your .env file.
    
    3. Open terminal in the code editor in the root directory of our project, execute 'npm run build'. This command will automatically install all dependencies and setup database client. To run the project, execute 'npm run dev'.

    4. Optionally, if you want to see the database using mongodb compass, paste the following connection string in your mongodb compass.
        ```bash
            mongodb://localhost:27017
        ```
## Codebase Overview
    - 'database' contains the prisma schema for the user table.
    - Since we are using TypeScript, all the code for our project is in 'src' directory.
        - 'controllers' contains database operations & business logic for each request.
        - 'middlewares' contains middleware functions to check and authenticate users.
        - 'validators' contains schema for ensuring the user data is matched with given constraints. Its written using zod library.
        - 'config.ts' contains basic configuration for environment path, exporting prisma client, port and jwtSecret
        - 'index.ts' is the main file, its where our main express app runs, and all the routes are specified in this file.
    - You can checkout 'scripts' in package.json for more details on how project is built and executed 
