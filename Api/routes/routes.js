const express = require("express");
const {assignmentPost,updateAssignment,deleteAssignment,getAssignment,getAssignments,patchAssignment,updateAssignments,deleteAssignments,patchAssignments}=require('../controllers/assignmentController.js')
const {gethealthCheck}=require('../controllers/healthCheckController.js')
const {submissionPost}=require('../controllers/submissionController.js')

const router = express.Router(); // get router object

// route for 'get' (fetch all todo's) and 'post' requests on endpoint '/todo-items' 
router.route('/demo/assignments/:id')
      .get(getAssignment)
      .put(updateAssignment)
      .delete(deleteAssignment)
      .patch(patchAssignment)

//route for 'get', 'put' and 'delete' for single instance of todo item based on request parameter 'id'
router.route('/demo/assignments')
      .post(assignmentPost)
      .get(getAssignments)
      .put(updateAssignments)
      .delete(deleteAssignments)
      .patch(patchAssignments)

router.route('/healthz')
      .get(gethealthCheck)

//route for 'post' for single instance of todo item based on request parameter 'id'
router.route('/demo/assignments/:id/submission')
.post(submissionPost)
      
module.exports=router