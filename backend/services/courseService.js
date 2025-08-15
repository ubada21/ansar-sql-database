const courseModel = require('../models/courseModel');



exports.checkCourseExists = async (cid) => {
    const checkCourse = await courseModel.getCourseByCID(cid)
    return checkCourse.length > 0 
}
