const fs = require("fs");
let dataCollection = null;
const Sequelize = require('sequelize'); 
var sequelize = new Sequelize('SenecaDB', 'SenecaDB_owner', 'sceT95iaPNtV', { 
        host: 'ep-little-dust-a5z1v5rq-pooler.us-east-2.aws.neon.tech',     
        dialect: 'postgres',
        dialectModule: require('pg'),
         port: 5432,    
         dialectOptions: { 
        ssl: { rejectUnauthorized: false } 
    }, 
    query:{ raw: true } 
}); 

sequelize
    .authenticate()
    .then(function() {
        console.log('Connection has been established successfully.');
    })
    .catch(function(err) {
        console.log('Unable to connect to the database:', err);
    });

    const Course = sequelize.define('Course', {
        courseId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        courseCode: Sequelize.STRING,
        courseDescription: Sequelize.STRING
    }, {
        timestamps: false
    });

    const Student = sequelize.define('Student', {
        studentNum: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        firstName: Sequelize.STRING,
        lastName: Sequelize.STRING,
        email: Sequelize.STRING,
        addressStreet: Sequelize.STRING,
        addressCity: Sequelize.STRING,
        addressProvince: Sequelize.STRING,
        TA: Sequelize.BOOLEAN,
        status: Sequelize.STRING,
        course: {
            type: Sequelize.INTEGER,
            references: {
                model: Course,
                key: 'courseId'
            },
            onDelete: 'SET NULL' 
        }

    }, {
        timestamps: false
    });

    

    Course.hasMany(Student, { foreignKey: 'course' });
    Student.belongsTo(Course, { foreignKey: 'course' });
    
    module.exports = {
        sequelize,
        Student,
        Course
    };



module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        sequelize.sync()
            .then(() => {
                resolve("Database synchronized successfully!");
            })
            .catch((err) => {
                reject("Unable to sync the database: " + err.message);
            });
    });
};

module.exports.getAllStudents = function () {
    return new Promise(function (resolve, reject) {
        Student.findAll()
            .then((students) => {
                if (students.length > 0) {
                    resolve(students);
                } else {
                    resolve([]);
                    reject("No results returned");
                }
            })
            .catch((err) => {
                reject("No results returned: " + err.message);
            });
    });
};

module.exports.getTAs = function () {
    return new Promise(function (resolve, reject) {reject(); 
    }); 
};

module.exports.getCourses = function () {
    return new Promise(function (resolve, reject) {
        Course.findAll()
            .then((courses) => {
                if (courses.length > 0) {
                    resolve(courses);
                } else {
                    resolve([]);
                    
                }
            })
            .catch((err) => {
                reject("No results returned: " + err.message);
            });
    });
};

module.exports.getStudentByNum = function (num) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                studentNum: num
            }
        })
        .then((students) => {
            if (students.length > 0) {
                resolve(students[0]); 
            } else {
                reject("No results returned");
            }
        })
        .catch((err) => {
            reject("No results returned: " + err.message);
        });
    });
};


module.exports.getStudentsByCourse = function (course) {
    return new Promise(function (resolve, reject) {
        Student.findAll({
            where: {
                course: course
            }
        })
        .then((students) => {
            if (students.length > 0) {
                resolve(students);
            } else {
                resolve([]);
                
            }
        })
        .catch((err) => {
            reject("No results returned: " + err.message);
        });
    });
};



module.exports.addStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        
        studentData.TA = (studentData.TA) ? true : false;

        
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }

        
        Student.create(studentData)
            .then(() => {
                resolve("Student created successfully!");
            })
            .catch((err) => {
                reject("Unable to create student: " + err.message);
            });
    });
};


module.exports.getCourseById = function (id) {
    return new Promise(function (resolve, reject) {
        Course.findAll({
            where: {
                courseId: id
            }
        })
        .then((courses) => {
            if (courses.length > 0) {
                resolve(courses[0]); 
            } else {
                reject("No results returned");
            }
        })
        .catch((err) => {
            reject("No results returned: " + err.message);
        });
    });
};

  
 
module.exports.updateStudent = function (studentData) {
    return new Promise(function (resolve, reject) {
        
        studentData.TA = (studentData.TA) ? true : false;

        
        for (let key in studentData) {
            if (studentData[key] === "") {
                studentData[key] = null;
            }
        }

        
        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then((result) => {
            if (result[0] > 0) {
                resolve("Student updated successfully!");
            } else {
                reject("No student found with the given studentNum.");
            }
        })
        .catch((err) => {
            reject("Unable to update student: " + err.message);
        });
    });
};


module.exports.addCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }

        
        Course.create(courseData)
            .then(() => {
                resolve(); 
            })
            .catch((err) => {
                reject("Unable to create course: " + err.message); 
            });
    });
};


module.exports.updateCourse = function (courseData) {
    return new Promise((resolve, reject) => {
        
        for (let key in courseData) {
            if (courseData[key] === "") {
                courseData[key] = null;
            }
        }

        
        Course.update(courseData, {
            where: { courseId: courseData.courseId }
        })
            .then(([affectedCount]) => {
                if (affectedCount > 0) {
                    resolve(); 
                } else {
                    reject("No course found with the given ID to update."); 
                }
            })
            .catch((err) => {
                reject("Unable to update course: " + err.message); 
            });
    });
};

module.exports.deleteCourseById = function (id) {
    return new Promise((resolve, reject) => {
        
        Course.destroy({
            where: { courseId: id }
        })
            .then((affectedRows) => {
                if (affectedRows > 0) {
                    resolve(); 
                } else {
                    reject("No course found with the given ID to delete."); 
                }
            })
            .catch((err) => {
                reject("Unable to delete course: " + err.message); 
            });
    });
};



module.exports.deleteStudentByNum = function (studentNum) {
    return new Promise((resolve, reject) => {
        Student.destroy({
            where: { studentNum: studentNum }
        })
            .then((affectedRows) => {
                if (affectedRows > 0) {
                    resolve(); 
                } else {
                    reject("No student found with the given number to delete."); 
                }
            })
            .catch((err) => {
                reject("Unable to delete student: " + err.message); 
            });
    });
};