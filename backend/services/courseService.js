const courseModel = require('../models/courseModel');


// checkCourseExists TODO
exports.checkCourseExists = async (cid) => {
    const checkCourse = await courseModel.getCourseByCID(cid)
    return checkCourse.length > 0 
}
