require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser");
const app = express()
const mysql = require("mysql2")
const cors = require("cors")
app.use(express.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors())
const HOSxPModel = require("./src/models/HOSxPModel")
const HOSxP = new HOSxPModel.HOSxP()


const { config } = require('./src/_config')

const port = config.port
const KEY_API = config.secretKey
// const connectionMain = mysql.createConnection(db.configDB.configMain)
// const connectionHos = mysql.createConnection(db.configDB.configSecond)
// connectionMain.query("SET NAMES UTF8")
// connectionHos.query("SET NAMES UTF8")
const connectionMain = mysql.createPool(config.db_primary)
const connectionHos = mysql.createPool(config.db_hos)

connectionMain.getConnection(function (err, conn) {
    if (err) {
        console.log(`Error connention >>> ${err}`)
    } else {
        console.log(`Database connected : ${config.db_primary.database}`);
        conn.query("SET NAMES utf8");
    }
});

connectionHos.getConnection(function (err, conn) {
    if (err) {
        console.log(`Error connention >>> ${err}`)
    } else {
        console.log(`Database connected : ${config.db_hos.database}`);
        conn.query("SET NAMES utf8");
    }
});



app.get("/", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token !== KEY_API) {
            return res.status(200).json({ status_code: 200, msg: "Verify your identity successfully" });
        } else {
            return res.status(502).json({ status_code: 502, msg: "Unauthorized, Access Denied - Invalid Token!!!", });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Auth [authorization]!!!", });
    }
})

app.post("/login", cors(), (req, res) => {
    const userLogin = req.body
    let userName = userLogin.userName
    let userPass = userLogin.userPass
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            connectionHos.getConnection(function (err, conn) {
                conn.query(HOSxP.getUserLogin(userName, userPass), function (err, result) {
                    if (!err) {
                        if (result.length > 0) {
                            return res.status(200).json({
                                status_code: 200, msg: "Logged in successfully", data: [{ userLogin: userLogin.userName, userFullName: result[0].name, userGroup: result[0].groupname }], type: "success", style: "success"
                            });
                        } else {
                            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Can't find accouct incorrect!", data: [], type: "error", style: "danger", sql: HOSxP.getUserLogin(userLogin.userName, userLogin.userPass) });
                        }

                    } else {
                        return res.status(502).json({ status_code: 502, msg: "Unauthorized, Access Denied - Password is incorrect!", data: [], type: "error", style: "danger" });
                    }
                })
                connectionHos.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], type: "error", style: "danger" });
    }
})

app.post("/verify-login", cors(), (req, res) => {
    const userLogin = req.body
    let userName = userLogin.userName
    let userPass = userLogin.userPass
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            connectionHos.getConnection(function (err, conn) {
                conn.query(HOSxP.getUserLogin(userName, userPass), function (err, result) {
                    if (!err) {
                        if (result.length > 0) {
                            return res.status(200).json({
                                status_code: 200, msg: "Logged in successfully", data: [{ userLogin: userLogin.userName, userFullName: result[0].name, userGroup: result[0].groupname }], type: "success", style: "success"
                            });
                        } else {
                            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Can't find accouct incorrect!", data: [], type: "error", style: "danger", sql: HOSxP.getUserLogin(userLogin.userName, userLogin.userPass) });
                        }

                    } else {
                        return res.status(502).json({ status_code: 502, msg: "Unauthorized, Access Denied - Password is incorrect!", data: [], type: "error", style: "danger" });
                    }
                })
                connectionHos.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], type: "error", style: "danger" });
    }
})

app.get("/getPatientReferInByVstdate/:vstdate", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            let vstdate = req.params.vstdate
            let sql = "SELECT vn FROM event_log WHERE action_section = 'referin'"
            let condition = ""
            connectionMain.getConnection(function (err, conn) {
                conn.query(sql, (err, result) => {
                    if (!err) {
                        let vnArr = ""
                        if (result.length > 0) {
                            let arrayData = []
                            result.map(val => {
                                arrayData.push(val.vn)
                            })
                            vnArr = arrayData
                        }
                        if (vnArr.length > 0) {
                            let no = 1
                            let vn = ""
                            vnArr.map(val => {
                                if (no !== 1) vn += ", "
                                vn += `'${val}'`
                                no++
                            })
                            condition = `AND o.vn NOT IN(${vn})`
                        }
                        connectionHos.getConnection(function (err, connHos) {
                            connHos.query(HOSxP.getPatientReferInByVstdate(vstdate, condition), (err, result) => {
                                if (!err) {
                                    if (result.length > 0) {
                                        return res.status(200).json({ status_code: 200, msg: "fetch data success", data: result, vstdate: vstdate, type: "success", sql: HOSxP.getPatientReferOutByVstdate(vstdate, condition) });
                                    } else {
                                        return res.status(401).json({ status_code: 401, msg: "fetch data not found!!!", data: [], vstdate: vstdate, type: "error" });
                                    }
                                } else {
                                    return res.status(502).json({ status_code: 502, msg: err, data: [], vstdate: vstdate, type: "error", });
                                }
                            })
                            connectionHos.releaseConnection(connHos);
                        })
                    } else {
                        return res.json({ status_code: 400, msg: err, data: [], vstdate: vstdate, type: "error", });
                    }
                })
                connectionMain.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], vstdate: vstdate, type: "error", style: "danger" });
    }
})

app.get("/getPatientReferOutByVstdate/:vstdate", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            let vstdate = req.params.vstdate
            let sql = "SELECT vn FROM event_log WHERE action_section = 'referout'"
            let condition = ""
            connectionHos.getConnection(function (err, connHos) {
                connHos.query(HOSxP.getPatientReferInByVstdate(vstdate, condition), (err, result) => {
                    if (!err) {
                        if (result.length > 0) {
                            return res.status(200).json({ status_code: 200, msg: "fetch data success", data: result, vstdate: vstdate, type: "success", sql: HOSxP.getPatientReferOutByVstdate(vstdate, condition) });
                        } else {
                            return res.status(401).json({ status_code: 401, msg: "fetch data not found!!!", data: [], vstdate: vstdate, type: "error" });
                        }
                    } else {
                        return res.status(502).json({ status_code: 502, msg: err, data: [], vstdate: vstdate, type: "error", });
                    }
                })
                connectionHos.releaseConnection(connHos);
            })
            connectionMain.getConnection(function (err, conn) {
                conn.query(sql, (err, result) => {
                    if (!err) {
                        let vnArr = ""
                        if (result.length > 0) {
                            let arrayData = []
                            result.map(val => {
                                arrayData.push(val.vn)
                            })
                            vnArr = arrayData
                        }
                        if (vnArr.length > 0) {
                            let no = 1
                            let vn = ""
                            vnArr.map(val => {
                                if (no !== 1) vn += ", "
                                vn += `'${val}'`
                                no++
                            })
                            condition = `AND o.vn NOT IN(${vn})`
                        }
                        connectionHos.getConnection(function (err, connHos) {
                            connHos.query(HOSxP.getPatientReferOutByVstdate(vstdate, condition), (err, result) => {
                                if (!err) {
                                    if (result.length > 0) {
                                        return res.status(200).json({ status_code: 200, msg: "fetch data success", data: result, vstdate: vstdate, type: "success", sql: HOSxP.getPatientReferOutByVstdate(vstdate, condition) });
                                    } else {
                                        return res.status(401).json({ status_code: 401, msg: "fetch data not found!!!", data: [], vstdate: vstdate, type: "error" });
                                    }
                                } else {
                                    return res.status(502).json({ status_code: 502, msg: err, data: [], vstdate: vstdate, type: "error", });
                                }
                            })
                            connectionHos.releaseConnection(connHos);
                        })
                    } else {
                        return res.status(502).json({ status_code: 502, msg: err, data: [], vstdate: vstdate, type: "error", });
                    }
                })
                connectionMain.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], vstdate: vstdate, type: "error", style: "danger" });
    }
})

app.post("/actionApprov", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            let action = req.body
            let subArrEvent = action.event.split("_")
            let jsonLog = {
                action_event: subArrEvent[1],
                action_section: subArrEvent[0],
                vn: subArrEvent[2],
                hn: subArrEvent[3],
                loginname: action.loginname,
                log_datetime: "NOW()",
            }
            let tableName = "event_log"
            let sql = HOSxP.createNew(jsonLog, tableName, "log_datetime");
            connectionMain.getConnection(function (err, conn) {
                conn.query(sql, function (err, result) {
                    if (!err) {
                        return res.status(200).json({ status_code: 200, msg: `${subArrEvent[1]} success`, data: [], type: "success", style: "success" });
                    } else {
                        return res.status(502).json({ status_code: 400, msg: err, data: [], type: "error", style: "danger" });
                    }
                })
                connectionMain.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], vstdate: vstdate, type: "error", style: "danger" });
    }
})

app.get("/getHistory", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            connectionMain.getConnection(function (err, conn) {
                conn.query(HOSxP.getHistory(), (err, result) => {
                    if (!err) {
                        return res.status(200).json({ status_code: 200, msg: "fetch data success", data: result, type: "success", style: "success" });
                    } else {
                        return res.status(502).json({ status_code: 502, msg: err, data: [], type: "error", style: "danger" });
                    }
                })
                connectionMain.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], vstdate: vstdate, type: "error", style: "danger" });
    }
})

app.delete("/deleteHistory", cors(), (req, res) => {
    const authHeader = req.headers["authorization"]
    if (authHeader !== undefined) {
        const token = authHeader.split(" ")[1]
        if (token === KEY_API) {
            let tableName = "event_log"
            let condition = `log_id = ${req.body.log_id}`

            connectionMain.getConnection(function (err, conn) {
                conn.query(HOSxP.DeleteData(tableName, condition), function (err, result) {
                    if (!err) {
                        return res.status(200).json({ status_code: 200, msg: 'delete data success', data: [], type: "success", style: "success" });
                    } else {
                        return res.status(502).json({ status_code: 400, msg: err, data: [], type: "error", style: "danger" });
                    }
                })
                connectionMain.releaseConnection(conn);
            })
        } else {
            return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Token", data: [], type: "error", style: "danger" });
        }
    } else {
        return res.status(401).json({ status_code: 401, msg: "Unauthorized, Access Denied - Invalid Http Headers [authorization]!!!", data: [], vstdate: vstdate, type: "error", style: "danger" });
    }
})

app.listen(port, () => {
    console.log(`Server running on ${port} ...`);
})