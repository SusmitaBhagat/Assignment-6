/*********************************************************************************
*  WEB700 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: SUSMITA BHAGAT Student ID: 121361232 Date: 09-Aug-2024
*
*  Online (vercel) Link:
*# 
********************************************************************************/ 

var HTTP_PORT = process.env.PORT || 8080;
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const hbs = exphbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
      navLink: function(url, options) {
          return '<li' +
              ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
              '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function(lvalue, rvalue, options) {
          if (arguments.length < 3)
              throw new Error("Handlebars Helper equal needs 2 parameters");
          if (lvalue != rvalue) {
              return options.inverse(this);
          } else {
              return options.fn(this);
          }
      },
      eq: function(v1, v2) {
        return v1 === v2;
    }
  }
});

const path = require('path');
const collegeData = require('./modules/collegeData');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');


app.get('/', (req, res) => {
  res.render('home', { title: 'Home Page' });
});

app.get('/about', (req, res) => {
  res.render('about', { title: 'About Page' });
});

app.get('/htmlDemo', (req, res) => {
  res.render('htmlDemo', { title: 'HTML Demo Page' });
});




app.use(function(req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});



app.get('/courses/add', (req, res) => {
  res.render('addCourse'); 
});


app.post('/courses/add', (req, res) => {
  
  const courseData = req.body;

  
  for (let key in courseData) {
      if (courseData[key] === "") {
          courseData[key] = null;
      }
  }

  
  collegeData.addCourse(courseData)
      .then(() => {
          res.redirect('/courses'); 
      })
      .catch((err) => {
          res.status(500).render('addCourse', { message: "Unable to add course: " + err.message }); 
      });
});



app.post('/course/update', (req, res) => {
  
  const courseData = req.body;

  
  for (let key in courseData) {
      if (courseData[key] === "") {
          courseData[key] = null;
      }
  }

  
  collegeData.updateCourse(courseData)
      .then(() => {
          res.redirect('/courses'); 
      })
      .catch((err) => {
          res.status(500).render('updateCourse', { message: "Unable to update course: " + err.message }); 
      });
});


app.get('/course/delete/:id', (req, res) => {
  const id = req.params.id;
  collegeData.deleteCourseById(id).then(() => {
    res.redirect('/courses'); 
  }).catch((err) => {
    res.status(500).send("Unable to Remove Course / Course not found"); 
  });
});

app.get('/students', (req, res) => {
  const course = req.query.course;

  
  const renderWithMessage = (message) => {
    res.render("students", { message });
  };

  
  if (course) {
    collegeData.getStudentsByCourse(course)
      .then((data) => {
        if (data.length > 0) {
          res.render("students", { students: data });
        } else {
          
          renderWithMessage("No results");
        }
      })
      .catch((err) => {
        renderWithMessage("Error fetching students by course: " + err.message);
      });
  } else {
    
    collegeData.getAllStudents()
      .then((data) => {
        if (data.length > 0) {
          res.render("students", { students: data });
        } else {
          renderWithMessage("No results");
        }
      })
      .catch((err) => {
        renderWithMessage("Error fetching all students: " + err.message);
      });
  }
});



app.get('/students/add', (req, res) => {
  collegeData.getCourses()
    .then((data) => {
      
      res.render('addStudent', { courses: data });
    })
    .catch((err) => {
      
      res.render('addStudent', { courses: [] });
    });
});



app.post('/students/add',(req,res)=>{
  console.log(req.body);
  collegeData.addStudent(req.body)
  .then(()=>  res.redirect('/students'))
  .catch((err) => {
    console.error('Error adding student: ', err);
    res.status(500).send('Error adding student');
    });
  })

app.get("/student/:studentNum", (req, res) => { 
  
  let viewData = {};

  
  collegeData.getStudentByNum(req.params.studentNum)
      .then((data) => {
          if (data) {
              viewData.student = data; 
          } else {
              viewData.student = null; 
          }
      })
      .catch((err) => {
          viewData.student = null; 
      })
      .then(() => {
          
          return collegeData.getCourses();
      })
      .then((data) => {
          viewData.courses = data; 

          
          if (viewData.student) {
              for (let i = 0; i < viewData.courses.length; i++) { 
                  if (viewData.courses[i].courseId == viewData.student.course) { 
                      viewData.courses[i].selected = true;
                  } 
              }
          }
      })
      .catch((err) => {
          viewData.courses = []; 
      })
      .then(() => {
          if (viewData.student == null) { 
              res.status(404).send("Student Not Found");
          } else { 
              res.render("student", { viewData: viewData }); 
          }
      });
});


app.get('/student/delete/:studentNum', (req, res) => {
  const studentNum = req.params.studentNum;

  collegeData.deleteStudentByNum(studentNum)
      .then(() => {
          
          res.redirect('/students');
      })
      .catch((err) => {
          
          res.status(500).send("Unable to Remove Student / Student not found");
      });
});


app.post("/student/update", (req, res) => {
  console.log("Updating student with data:", req.body);

  collegeData.updateStudent(req.body).then(() => {
      console.log("Student updated successfully!");
      res.redirect("/students");
  }).catch((err) => {
      console.error("Error updating student:", err);
      res.status(500).send("Unable to update student: " + err);
  });
});


app.get('/courses', (req, res) => {
  
  const renderWithMessage = (message) => {
    res.render("courses", { message });
  };

  
  collegeData.getCourses()
    .then((data) => {
      if (data && data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        renderWithMessage("No results");
      }
    })
    .catch((err) => {
      console.error("Detailed error:", err);
      renderWithMessage("Error fetching courses: " + err.message);
    });
});


app.get('/course/:id', (req, res) => {
  const id = req.params.id;
  collegeData.getCourseById(id).then((data) => {
    if (data) {
      res.render('course', { course: data }); 
    } else {
      res.status(404).send("Course Not Found"); 
    }
  }).catch((err) => {
    res.status(500).send("An error occurred while fetching the course: " + err.message); 
  });
});



app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

collegeData.initialize().then(() => {
  app.listen(HTTP_PORT, () => {
    console.log("Server is running on http://localhost:" + HTTP_PORT);
  });
}).catch((err) => {
  console.log(`Failed to initialize data :${err}`);

});




