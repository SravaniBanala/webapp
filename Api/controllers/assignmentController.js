const base64 = require("base-64")
const bcrypt = require("bcryptjs")
const User = require('../models/userModel.js');
const Assignment = require("../models/assignmentModel.js");
const Submission = require("../models/submissionModel.js");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const logger = require('../../logger/log.js');
const statsd = require('../../metrics/metriclogger.js');

const deadlineRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
function assignmentPostValidation(name, points, num_of_attemps, deadline) {
    if (!name || !points || !num_of_attemps || points < 0 || !Number.isInteger(points) || points > 10 ||
        num_of_attemps < 1 || !Number.isInteger(num_of_attemps) || num_of_attemps > 3 || typeof name !== 'string' || !deadlineRegex.test(deadline)) return false;
    else return true;

}

const assignmentPost = async (request, response) => {
    statsd.increment('webappendpoint.assignments.http.post');
    if (!request.body || Object.keys(request.body).length === 0) {
        logger.error(`Bad Request - Request not available`);
        // If there is no request body or it's an empty object, handle it here.
        return response.status(400).send();
    }
    const queryParams = request.query;
    if (Object.keys(queryParams).length > 0) {
        logger.error(`Bad Request - Query params not required`);

      // If request body is not empty, return HTTP 400 Bad Request
      return response.status(400).send();
    }

   
    const { name, points, num_of_attemps, deadline } = request.body;
      
 

    //validation of input
    if (assignmentPostValidation(name, points, num_of_attemps, deadline) === false) {
        logger.error(`Bad Request - Invalid Input Json`);
        response.status(400).send({
            message: " assignment cannot have empty name or less than zero points or less than zero attempts or empty deadline",
        })
    }
    // else if(date_added || date_last_updated || owner_user_id){ response.status(400).send({
    //     message:" invalid parameters date added or date updated or owner_user_id",}) }
    else {
        if (!request.headers.authorization) {
            logger.error(`UnAuthorised - Authorization header is missing`);
            response.status(401).send({
                message: "No Auth",
            });
        }
        else {
            const encodedToken = request.headers.authorization.split(" ")[1];

            const baseToAlpha = base64.decode(encodedToken).split(":");
            let decodeduUsername = baseToAlpha[0];
            let decodedPassword = baseToAlpha[1];


            User.findOne({
                where: {
                    email: decodeduUsername,
                },
            })

                .then(async (user) => {
                    if (!user) {
                        logger.error(`UnAuthorised - User not found`);
                        response.status(401).send({
                            message: "Bad Request Invalid User",
                        })
                    } else {
                        //try{
                        const valid = await bcrypt.compare(decodedPassword, user.getDataValue("password"))
                        console.log("comparing"+valid);
                        if (valid === true) {

                            Assignment.create({


                                name: name,
                                points: points,
                                num_of_attemps: num_of_attemps,
                                deadline: deadline,
                                assignment_created: new Date(),
                                assignment_updated: new Date(),
                                owner_user_id: user.getDataValue("id")
                            })
                                .then((feedback) => {
                                 logger.info("Assignment created");
                                    response.status(201).send({

                                        id: feedback.getDataValue("id"),
                                        name: feedback.getDataValue("name"),
                                        points: feedback.getDataValue("points"),
                                        num_of_attemps: feedback.getDataValue("num_of_attemps"),
                                        deadline: feedback.getDataValue("deadline"),
                                        assignment_created: feedback.getDataValue("assignment_created"),
                                        assignment_updated: feedback.getDataValue("assignment_updated"),
                                        owner_user_id: feedback.getDataValue("owner_user_id"),


                                    });


                                })
                                .catch(() => {
                                 logger.error(`BadRequest - Assignment is not created`);
                                    response.status(400).send({
                                        message: "Bad Request last catch",
                                    });
                                });
                        }
                        else {
                            logger.error(`UnAuthorised - Incorrect password`);
                            response.status(401).send({
                                message: "UnAuthorised. Incorrect password",
                            });

                        }
                    }

                })

                .catch((error) => {
                    if (error.name === 'SequelizeConnectionRefusedError') {
                        logger.error(`Bad Request - Service Unavailable`);
                        response.status(503).send({
                            message: "Service Unavailable: Database is disconnected",
                        });
                    } else {
                        logger.error(`UnAuthorised - Incorrect password`);
                        response.status(401).send({
                            message: "Unauthorized. Incorrect password",
                        });
                    }
                });
        }
    }
}

// Put request for updating assignment resource
const updateAssignment = async (request, response) => {
    statsd.increment('webappendpoint.assignments.http.put');
    const id = request.params.id;
    console.log("the id " + id);
    console.log(id);
    if (!request.body || Object.keys(request.body).length === 0) {
        logger.error(`Bad Request - Request not available`);
        // If there is no request body or it's an empty object, handle it here.
        return response.status(400).send();
      }
      const queryParams = request.query;
      if (Object.keys(queryParams).length > 0) {
        logger.error(`Bad Request - Query params not required`);
        // If request body is not empty, return HTTP 400 Bad Request
        return response.status(400).send();
      }
    if (!request.headers.authorization) {
        logger.error(`Bad Request - Authorization Headers is Missing`);
        response.status(400).send({
            message: "No Auth",
        });
    }

    else if (!uuidValidate(id) || !id ) {
        logger.error(`Bad Request - Invalid AssignmentId`);
        response.status(400).send({ message: "invalid Id" })
    }

    else {
        const encodedToken = request.headers.authorization.split(" ")[1];
        const { name, points, num_of_attemps, deadline } = request.body;

        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        // if (date_added || date_last_updated || owner_user_id){
        //     response.status(400).send({
        //         message: "Invalid entry date updated || date added || owner_user_id",
        //       })
        // }
        if (!assignmentPostValidation(name, points, num_of_attemps, deadline)) {
            logger.error(`Bad Request - Invalid Input Json`);
            response.status(400).send({
                message: "Please add all details ",
            });
        }

        //    else if(name===""|| description === "" || sku === "" || manufacturer === "" || quantity === "" || typeof quantity === 'string' || quantity <=0 || quantity>100 ){
        //         response.status(400).send({
        //             message: "Invalid entry",
        //           })
        //     }
        else {
            User.findOne({
                where: {
                    email: decodedUsername,
                },
            })
                .then(
                    async (user) => {
                        const valid = await bcrypt.compare(decodedPassword, user.getDataValue("password"))
                        const comp = decodedUsername === user.getDataValue("email");
                        console.log("comaprision" + comp);
                        if (valid === true && decodedUsername === user.getDataValue("email")) {
                            Assignment.findOne({
                                where: {
                                    id: id,
                                },
                            })
                                .then(
                                    async (assignment) => {
                                        console.log("the assignment " + assignment.id);
                                        if (!assignment) {
                                            logger.error(`Not Found - Assignment not found`);
                                            console.log("the assignment not");
                                            response.status(404).send({
                                                message: "Assignment Not available",
                                            })
                                        }
                                        else if (assignment.getDataValue("owner_user_id") !== user.getDataValue("id")) {
                                            logger.error(`Forbidden - Forbidden Access for Assignmnet`);
                                            response.status(403).send({
                                                message: "Unauthorized access",
                                            })
                                        }
                                        else {
                                            console.log("the assignment2");
                                            if (assignment.getDataValue("owner_user_id") === user.getDataValue("id")) {
                                                console.log("the assignment3");
                                                Assignment.update(
                                                    {

                                                        name: name,
                                                        points: points,
                                                        num_of_attemps: num_of_attemps,
                                                        deadline: deadline,
                                                        assignment_updated: new Date()
                                                    },
                                                    {
                                                        where: { id: id } // Replace 'assignmentId' with the specific ID of the assignment you want to update
                                                    }
                                                )
                                                    .then((result) => {
                                                        logger.info(`No content - No content available for Assignment`);
                                                        response.status(204).send({
                                                        });
                                                    })
                                                    .catch((error) => {
                                                        console.log("the assignment3 error" + error);
                                                        response.status(400).send({
                                                            message: "Bad Request. Incorrect inputs for Update",

                                                        });
                                                    })
                                            }

                                            else {
                                                response.status(400).send({
                                                    message: "Invalid product Id",
                                                });
                                            }
                                        }
                                    }
                                )
                                .catch(() => {
                                    response.status(400).send({
                                        message: "Bad Request. Incorrect password123",
                                    })
                                });

                        } else {
                            response.status(401).send({
                                message: "UnAuthorised. Incorrect password",
                            });

                        }
                    }
                )
                .catch((error) => {
                    if (error.name === 'SequelizeConnectionRefusedError') {
                        logger.error(`Bad Request - Service Unavailable`);
                        response.status(503).send({
                            message: "Service Unavailable: Database is disconnected",
                        });
                    } else {
                        response.status(401).send({
                            message: "Unauthorized. Incorrect password",
                        });
                    }
                })
        }
    }

}

// Delete Request for deleting the assignment resouce
const deleteAssignment = async (request, response) => {
    statsd.increment('webappendpoint.assignments.http.delete');
    if (Object.keys(request.body).length > 0) {
        logger.error(`Bad Request - Request Body should be empty`);
        // If there is no request body or it's an empty object, handle it here.
        return response.status(400).send();
      }
    const queryParams = request.query;
      if (Object.keys(queryParams).length > 0) {
        logger.error(`Bad Request - Query Params not required`);
        // If request body is not empty, return HTTP 400 Bad Request
        return response.status(400).send();
      }
    const id = request.params.id;
    console.log(id)
    if (!request.headers.authorization) {
        logger.error(`Bad Request - Authorization header is Missing`);
        response.status(400).send({
            message: "No Auth",
        });
    }

    else if (!uuidValidate(id) || !id ) {
        logger.error(`Bad Request - Invalid AssignmentId`);
        response.status(400).send({ message: "invalid Id" })
    }

    else {
        const encodedToken = request.headers.authorization.split(" ")[1];
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        User.findOne({
            where: {
                email: decodedUsername,
            },
        })
            .then(async (user) => {
                const valid = await bcrypt.compare(decodedPassword, user.getDataValue("password"))
                if (valid === true && decodedUsername === user.getDataValue("email")) {
                    Assignment.findOne({
                        where: {
                            id: id,
                        },
                    })
                        .then(async (assignment) => {
                            if (assignment.getDataValue("owner_user_id") !== user.getDataValue("id")) {
                                logger.error(`Forbidden - Forbidden Access for Assignmnet`);
                                response.status(403).send({
                                    message: "Forbidden access",
                                })
                            }
                            else {
                                Submission.findOne({
                                    where: {
                                        assignment_id: id,
                                    },
                                    order: [['submission_date', 'DESC']], // Order by submission_date in descending order
                                })  
                                .then((submissions) => {
                                    if (submissions) {
                                        logger.info(`Submissions Data Found`);
                                        // Map the assignments to an array of assignment data objects
                                        logger.error(`Forbidden - Forbidden Access Assignement cannot be deleted as it sent for submission`);
                                        response.status(403).send({
                                            message: "Forbidden - Forbidden Access Assignement cannot be deleted as it sent for submission",
                                        });
                                    } else {
                                        Assignment.destroy({
                                            where: {
                                                id: id,
                                            },
                                        })
                                            .then((result) => {
                                                if (result) {
                                                    logger.info(`No content - No content available for Assignment`);
                                                    response.status(204).send({})
                                                }
                                            })
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error fetching assignments:", error);
                                    response.status(500).send({
                                        message: "Internal Server Error",
                                    });
                                });                           
                            }

                        })
                        .catch((val) => {
                            console.log(val);
                            logger.error(`Not Found - Assignment Data not Found`);
                            response.status(404).send({
                                message: "Assignment Resource Not found",
                            })
                        })
                }
                else {
                    logger.error(`Unauthorised - Invalid User Credentials`);
                    response.status(401).send({
                        message: "Unauthorised Wrong credentials",
                    })
                }
            })
            .catch((error) => {
                if (error.name === 'SequelizeConnectionRefusedError') {
                    logger.error(`Bad Request - Service Unavailable`);
                    response.status(503).send({
                        message: "Service Unavailable: Database is disconnected",
                    });
                } else {
                    response.status(400).send({
                        message: "Bad Request",
                    })
                }
            });

    }

}


// Get Request for getting the assignment resouce
const getAssignment = async(request,response)=>{ 
    statsd.increment('webappendpoint.assignments.http.getById');
    const id = request.params.id;
    if (Object.keys(request.body).length > 0) {
        logger.error(`Bad Request - Request Body should be empty`);
        // If there is no request body or it's an empty object, handle it here.
        return response.status(400).send();
      }
      const queryParams = request.query;
      if (Object.keys(queryParams).length > 0) {
        logger.error(`Bad Request - Query Params not required`);
        // If request body is not empty, return HTTP 400 Bad Request
        return response.status(400).send();
      }
    console.log(id);
    if (!request.headers.authorization) {
        logger.error(`Bad Request - Authorization header is Missing`);
        response.status(400).send({
            message: "No Auth",
        });
    }

    else if (!uuidValidate(id) || !id ) {
        logger.error(`Bad Request - Invalid AssignmentId`);
        response.status(400).send({ message: "invalid Id" })
    }

    else {
        const encodedToken = request.headers.authorization.split(" ")[1];
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        User.findOne({
            where: {
                email: decodedUsername,
            },
        })
            .then(async (user) => {
                const valid = await bcrypt.compare(decodedPassword, user.getDataValue("password"))
                if (valid === true && decodedUsername === user.getDataValue("email")) {
                    Assignment.findOne({
                        where: {
                            id: id,
                        },
                    })

                    .then((assignment)=> {
                        if(assignment){
                            logger.info(`Assignment Data Found`);
                            response.status(200).send({
            
                                    id: assignment.getDataValue("id"),
                                    name: assignment.getDataValue("name"),
                                    points: assignment.getDataValue("points"),
                                    num_of_attemps: assignment.getDataValue("num_of_attemps"),
                                    deadline: assignment.getDataValue("deadline"),
                                    assignment_created: assignment.getDataValue("assignment_created"),
                                    assignment_updated: assignment.getDataValue("assignment_updated")
            
                            })
                        }
                        else
                        {
                            logger.error(`Not Found - Assignment Data not Found`);
                            response.status(404).send({
                                message:"Assignment Resource Not found"
                            })
                        }


                    })
                    .catch((val) => {
                        console.log(val);
                        logger.error(`Not found - Assignment Data not Found`);
                        response.status(404).send({
                            message: "Assignment Resource Not found",
                        })
                    })
                }
                else {
                    logger.error(`Unauthorised - Invalid User Credentials`);
                    response.status(401).send({
                        message: "Unauthorised Wrong credentials",
                    })
                }
            })
            .catch((error) => {
                if (error.name === 'SequelizeConnectionRefusedError') {
                    logger.error(`Bad Request - Service Unavailable`);
                    response.status(503).send({
                        message: "Service Unavailable: Database is disconnected",
                    });
                } else {
                    response.status(400).send({
                        message: "Bad Request",
                    })
                }
            })

    }

}

// Get Request for getting the assignment resouce
const getAssignments = async(request,response)=>{
    statsd.increment('webappendpoint.assignments.http.getAllAssignments'); 
    if (Object.keys(request.body).length > 0) {
        logger.error(`Bad Request - Request Body should be empty`);
        // If there is no request body or it's an empty object, handle it here.
        return response.status(400).send();
      }
      const queryParams = request.query;
      if (Object.keys(queryParams).length > 0) {
        logger.error(`Bad Request - Query Params not required`);
        // If request body is not empty, return HTTP 400 Bad Request
        return response.status(400).send();
      }
    if (!request.headers.authorization) {
        logger.error(`Bad Request - Authorization header is Missing`);
        response.status(400).send({
            message: "No Auth",
        });
    }

    else {
        const encodedToken = request.headers.authorization.split(" ")[1];
        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        User.findOne({
            where: {
                email: decodedUsername,
            },
        })
            .then(async (user) => {
                const valid = await bcrypt.compare(decodedPassword, user.getDataValue("password"))
                if (valid === true && decodedUsername === user.getDataValue("email")) {

                    Assignment.findAll() // Fetch all assignments
                        .then((assignments) => {
                            if (assignments.length > 0) {
                                logger.info(`Assignments Data Found`);
                                // Map the assignments to an array of assignment data objects
                                const assignmentData = assignments.map((assignment) => ({
                                    id: assignment.getDataValue("id"),
                                    name: assignment.getDataValue("name"),
                                    points: assignment.getDataValue("points"),
                                    num_of_attemps: assignment.getDataValue("num_of_attemps"),
                                    deadline: assignment.getDataValue("deadline"),
                                    assignment_created: assignment.getDataValue("assignment_created"),
                                    assignment_updated: assignment.getDataValue("assignment_updated"),
                                }));
                                 
                                response.status(200).send(assignmentData);
                            } else {
                                logger.error(`Not Found - Assignments Data Not Found`);
                                response.status(404).send({
                                    message: "No assignments found",
                                });
                            }
                        })
                        .catch((error) => {
                            console.error("Error fetching assignments:", error);
                            response.status(500).send({
                                message: "Internal Server Error",
                            });
                        });
                }
                else {
                    logger.error(`Unauthorised - Invalid Credentials`);
                    response.status(401).send({
                        message: "Unauthorised Wrong credentials",
                    })
                }
            })
            .catch((error) => {
                if (error.name === 'SequelizeConnectionRefusedError') {
                    logger.error(`Bad Request - Service Unavailable`);
                    response.status(503).send({
                        message: "Service Unavailable: Database is disconnected",
                    });
                } else {
                    logger.error(`Bad Request - User not foundd`);
                    response.status(400).send({
                        message: "Bad Request",
                    })
                }
            })

    }

}

// Patch Request for partial update the assignment resouce
const patchAssignment = async(request,response)=>{ 
    statsd.increment('webappendpoint.assignments.http.patch');
    logger.error(`Method Not Allowed - Method Not Allowed`);
    // If the database connection is successful, return HTTP 200 OK
    response.status(405).send('');
}

// Get Put for updating all the assignment resouce
const updateAssignments = async(request,response)=>{ 
    statsd.increment('webappendpoint.assignments.http.putAllAssignments');
    logger.error(`Method Not Allowed - Method Not Allowed`);
   // If the database connection is successful, return HTTP 200 OK
   response.status(405).send('');
}

// Delete Request for deleting all the assignment resouce
const deleteAssignments = async(request,response)=>{ 
    statsd.increment('webappendpoint.assignments.http.deleteAllAssignments');
    logger.error(`Method Not Allowed - Method Not Allowed`);
   // If the database connection is successful, return HTTP 200 OK
   response.status(405).send('');
}

// Patch Request for partial update all the assignment resouce
const patchAssignments = async(request,response)=>{ 
    statsd.increment('webappendpoint.assignments.http.patchAllAssignments');
    logger.error(`Method Not Allowed - Method Not Allowed`);
   // If the database connection is successful, return HTTP 200 OK
   response.status(405).send('');
}


module.exports = { assignmentPost, updateAssignment, deleteAssignment,getAssignment,getAssignments,patchAssignment,updateAssignments,deleteAssignments,patchAssignments }