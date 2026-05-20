
const express = require("express");
const studentRoutes = require("./routes/student.routes");
const semesterRoutes = require("./routes/semester.routes");
const gradesRoutes = require("./routes/grades.routes");
const firebaseRoutes = require("./routes/firebase.routes");

const PORT = 5000;
const api = express();

api.use(express.json());
api.use(express.static("public"));

api.use("/student", studentRoutes);
api.use("/semester", semesterRoutes);
api.use("/grades", gradesRoutes);
api.use("/firebase", firebaseRoutes);

api.listen(PORT, ()=>{
    console.log("Server running in http://localhost:5000")
});