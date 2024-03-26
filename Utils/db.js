import mysql from "mysql2";

const con = mysql.createConnection({
    host: "49.13.192.32",
    user: "inco_dasboard",
    password: "oL!0Ak9EGK%R!px38Y",
    database: "inco_dasboard"
})

con.connect(function(err){
    if(err) {
        console.log("connection error")
    }else {
        console.log("connected!")
    }
})
export default con;