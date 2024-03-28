const base64 = require("base-64")
const bcrypt = require("bcryptjs")
const User = require('../models/userModel.js');
const Assignment = require("../models/assignmentModel.js");
const Submission = require("../models/submissionModel.js");
const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const logger = require('../../logger/log.js');
const statsd = require('../../metrics/metriclogger.js');
const publishMessageToSNS = require('../../aws-sns-publish.js');

function submissionPostValidation(submission_url) {
    if (!submission_url || typeof submission_url !== 'string') return false;
    else return true;

}

const submissionPost = async (request, response) => {
    statsd.increment('webappendpoint.submission.http.post');
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

    else if (!uuidValidate(id) || !id) {
        logger.error(`Bad Request - Invalid AssignmentId`);
        response.status(400).send({ message: "invalid Id" })
    }

    else {
        const encodedToken = request.headers.authorization.split(" ")[1];
        const { submission_url } = request.body;

        const baseToAlpha = base64.decode(encodedToken).split(":");
        let decodedUsername = baseToAlpha[0];
        let decodedPassword = baseToAlpha[1];
        // if (date_added || date_last_updated || owner_user_id){
        //     response.status(400).send({
        //         message: "Invalid entry date updated || date added || owner_user_id",
        //       })
        // }
        if (!submissionPostValidation(submission_url)) {
            logger.error(`Bad Request - Invalid Input Json`);
            response.status(400).send({
                message: "Please add all details ",
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
                        Assignment.findOne({
                            where: {
                                id: id,
                            },
                        })
                            .then(async (assignment) => {
                                console.log("the assignment " + assignment.id);
                                if (!assignment) {
                                    logger.error(`Not Found - Assignment not found`);
                                    console.log("the assignment not");
                                    response.status(404).send({
                                        message: "Assignment Not available",
                                    })
                                }
                                else {
                                    console.log("the assignment Submisssion");
                                    Submission.findOne({
                                        where: {
                                            assignment_id: id,
                                            owner_assignment_id: user.getDataValue("id"),

                                        },
                                        order: [['submission_date', 'DESC']], // Order by submission_date in descending order
                                    })
                                        .then((latestSubmission) => {
                                            let latest_attempt = 1;

                                            if (latestSubmission) {
                                                // If a submission is found, extract the submission_attempt
                                                latest_attempt = latestSubmission.submission_attempt + 1;
                                                console.log(`Latest submission attempt: ${latest_attempt}`);
                                            }

                                            const presentdate = new Date();

                                            // Check if the submission is done before the deadline
                                            if (latest_attempt <= assignment.getDataValue("num_of_attemps") && presentdate <= assignment.getDataValue("deadline")) {
                                                // Create a new submission record
                                                Submission.create({
                                                    submission_url: submission_url,
                                                    assignment_id: id,
                                                    submission_date: new Date(),
                                                    submission_updated: new Date(),
                                                    submission_attempt: latest_attempt,
                                                    owner_assignment_id: user.getDataValue("id")
                                                })
                                                    .then((feedback) => {
                                                        logger.info("Submission Request created");
                                                        const dataForSnsMessage = {
                                                            submission_url: submission_url,
                                                            user_email: user.getDataValue("email"),
                                                            assignmentID: request.params.id,
                                                            assignment_Name: assignment.getDataValue("name"),
                                                            submissionID: feedback.getDataValue("id"),
                                                            submissionCount: feedback.getDataValue("submission_attempt")
                                                        }
                                                        publishMessageToSNS(dataForSnsMessage);
                                                        logger.info("Submission request is published");
                                                        response.status(201).send({
                                                            id: feedback.getDataValue("id"),
                                                            submission_url: feedback.getDataValue("submission_url"),
                                                            assignment_id: feedback.getDataValue("assignment_id"),
                                                            submission_date: feedback.getDataValue("submission_date"),
                                                            submission_updated: feedback.getDataValue("submission_updated")
                                                        });
                                                    })
                                                    .catch(() => {
                                                        logger.error(`BadRequest - Submission is not created`);
                                                        response.status(400).send({
                                                            message: "Bad Request Submission Creation",
                                                        });
                                                    });

                                            } else {
                                                // If the latest attempt exceeds the maximum attempts or submission is after the deadline, handle accordingly
                                                if (latest_attempt > assignment.num_of_attemps) {
                                                    throw new Error('Maximum attempts');
                                                } else {
                                                    throw new Error('Submission deadline');
                                                }
                                            }
                                        })

                                        .catch(error => {
                                            console.error('Error:', error);
                                            logger.error('Error finding or creating submission:', error);
                                            if (error.message === 'Maximum attempts') {
                                                response.status(403).send({
                                                    message: 'Forbidden - Forbidden Access Maximum attempts exceeded for this assignment',
                                                });
                                            } else if (error.message === 'Submission deadline') {
                                                response.status(403).send({
                                                    message: 'Forbidden - Forbidden Access Submission after the  assignment deadline',
                                                });
                                            } else {
                                                response.status(400).send({
                                                    message: "Error finding or creating submission",
                                                });
                                            }
                                        });

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
                            message: "Unauthorised Invalid User credentials",
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
                        logger.error(`UnAuthorised - Invalid User Credentials`);
                        response.status(401).send({
                            message: "Unauthorized. Invalid User credentials",
                        });
                    }
                });

        }



    }

}
module.exports = { submissionPost }