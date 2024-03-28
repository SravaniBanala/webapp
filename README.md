# Assignment Sravani Banala Network Structures and Cloud computing


## Goal
<span style="background-color: #FFFF00">The main goal of this assignment is to build a APIs for an authenticated users to create,retrieve,update and delete assignments using Node.js</span>
<span style="background-color: #88FF00">Added Assignment Table and created Endpoints for that </span>
TEST

## Features
* As a developer, I am able to load a user account information from a CSV file located at /opt/user.csv at startup. It uses this information to create user accounts based on the data provided in the CSV file. If a user account already exists, no updates are performed.
    * Email Address
    * Password

Password Hashing: User passwords are securely hashed using BCrypt before being stored in the database, ensuring the security of user credentials.
   
* As a developer, I am able to get a particular resource after the user has entered his credentials by implementing basic auth


## Requirements

* Node.js
  * express.js
* Sequelize
* Base-64
* Bcrypt js
* Supertest
* Postman- Recommended for Testing
* Morgan


## Implementation
  
  ### APIs

  Available APIs in the project:
  This is built using REST API and appropriate conventions

  #### Health Check
  This endpoint is a used to check the health of the server. It's a GET request that should be sent to /healthz.

  #### Get Product
  This endpoint allows retrieving information about a product. It's a GET request that should be sent to /v1/product/:id, where :id is the product ID.This endpoint allows retrieving information about assignments only by authenticated user. It's a POST request that should be sent to /v1/assignment.

  #### Create a assignment
    This endpoint allows creating a new assignment only by authenticated user. It's a POST request that should be sent to /v1/assignment .
    
  #### Update a assignment
   This endpoint allows update an existing assignment Only the user who created the assignment can delete it. It's a PUT request that should be sent to /v1/assignments/:id, where :id is the assignment ID.

  #### Delete assignment
  This endpoint allows deleting an existing assignment Only the user who created the assignment can delete it.. It's a DELETE request that should be sent to /v1/assignments/:id, where :id is the assignment ID.


  ### How to use

    Run: Node app.js
    Test:  npm run test 


  *Non Authenticated Endpoints*:
   ```sh
    

  * Health Check *:
   
    GET /healthz


  ```
  *Authenticated Endpoints*


```sh
    
  * Update Assignments *
    
      PUT   /v1/assignments/:id

  * Create a Assignments *:
   
      POST /v1/assignments

  * Update a Assignments*:

      PUT   /v1/assignments/:id
  
  * Delete Assignments *:

      DELETE /v1/assignments/:id
    
  ```


  ## Added workflow changes

  * Added a GitHub Actions workflow to run the application integration tests for each pull request raised. A pull request can only be merged if the workflow executes successfully.


Command to Import Certificate 
aws acm import-certificate --certificate file://certificate_base64.txt --certificate-chain file://ca_bundle_base64.txt --private-key file://private_base64.txt --profile sbanalademo --region us-east-1


  
 



    

    
