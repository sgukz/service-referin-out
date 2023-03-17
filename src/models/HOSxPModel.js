class HOSxP {
    getUserLogin(user, pwd) {
        let sql = `SELECT * FROM opduser 
                WHERE loginname = '${user}'
                    AND (passweb = UPPER(MD5('${pwd}')) OR passweb = LOWER(MD5('${pwd}')))
                    AND groupname IN('X-RAY', 'ผู้ดูแลระบบ')`
        return sql;
    }

    getUserLoginAll(user, pwd) {
        let sql = `SELECT * FROM opduser 
                WHERE loginname = '${user}'
                    AND (passweb = UPPER(MD5('${pwd}')) OR passweb = LOWER(MD5('${pwd}')))`
        return sql;
    }

    // getPatientReferInByVstdate(vstdate, condition) {
    //     let sql = `SELECT
    //                     vn,
    //                     cid,
    //                     hn, 
    //                     patient_name,
    //                     CONCAT(vstDate) as vstDate,
    //                     vsttime,
    //                     i_refer_number,
    //                     hospmain,
    //                     staff,
    //                     refer_type
    //                 FROM
    //                     referin
    //                 WHERE vstDate = '${vstdate}'
    //                 ${condition}
    //                 ORDER BY vsttime DESC`
    //     return sql
    // }

    // getPatientReferOutByVstdate(vstdate, condition) {
    //     let sql = `SELECT
    //                     vn,
    //                     cid,
    //                     hn, 
    //                     patient_name,
    //                     CONCAT(vstDate) as vstDate,
    //                     vsttime,
    //                     i_refer_number,
    //                     hospmain,
    //                     staff,
    //                     refer_type
    //                 FROM
    //                     referout
    //                 WHERE vstDate = '${vstdate}'
    //                 AND refer_type IN(0, 1)
    //                 ${condition}
    //                 ORDER BY vsttime DESC`
    //     return sql
    // }

    getPatientReferInByVstdate(vstdate, condition) {
        let sql = `SELECT
                        o.vn,
                        p.cid,
                        o.hn, 
                        CONCAT(p.pname, p.fname, ' ', p.lname) as patient_name,
                        CONCAT(o.vstdate) as vstDate,
                        o.vsttime,
                        o.i_refer_number,
                        o.hospmain,
                        o.staff,
                        ovs.name as referType
                    FROM
                        ovst o
                        LEFT JOIN patient p ON o.hn = p.hn
                        LEFT JOIN ovstist ovs ON o.ovstist = ovs.ovstist
                    WHERE o.vstdate = '${vstdate}'
                        AND o.ovstist = '04'
                        ${condition}
                    ORDER BY o.vsttime DESC`
        return sql
    }

    getPatientReferOutByVstdate(vstdate, condition) {
        let sql = `SELECT
                        o.vn,
                        p.cid,
                        o.hn, 
                        CONCAT(p.pname, p.fname, ' ', p.lname) as patient_name,
                        CONCAT(o.vstdate) as vstDate,
                        o.vsttime,
                        o.i_refer_number,
                        o.hospmain,
                        o.staff,
                        r.refer_type
                    FROM
                        ovst o
                        INNER JOIN referout r ON o.vn = r.vn
                        LEFT JOIN patient p ON o.hn = p.hn
                    WHERE o.vstdate = '${vstdate}'
                    AND r.refer_type IN(0, 1)
                        ${condition}
                    ORDER BY o.vsttime DESC`
        return sql
    }

    getHistory(){
        let sql = `SELECT *, CONCAT(log_datetime) as logDatetime FROM event_log ORDER BY log_datetime DESC`
        return sql
    }

    createNew(objData, tableName, lastField) {
        let data = objData
        let keyField = Object.keys(data)
        let field = ""
        let values = ""
        let no = 1
        keyField.forEach((val) => {
            if (no !== 1) {
                field += ", "
            }
            field += val
            no++
        });
        for (let keys in data) {
            if (data.hasOwnProperty(keys)) {
                let value = data[keys];
                if (keys !== lastField) {
                    values += (value === "NOW()") ? value + ", " : "'" + value + "', ";
                } else {
                    values += (value === "NOW()") ? value : "'" + value + "'";
                }
            }
        }
        let sql = `INSERT INTO ${tableName}(${field}) VALUES(${values})`;

        return sql
    }

    UpdateData(objData, table, lastField, condition) {
        let data = objData
        let field = ""
        let conditions = condition
        for (let keys in data) {
            if (data.hasOwnProperty(keys)) {
                let value = data[keys];
                if (keys !== lastField) {
                    field += keys + " = '" + value + "', "
                } else {
                    field += keys + " = '" + value + "' "
                }
            }
        }
        let sql = `UPDATE ${table} SET ${field} WHERE ${conditions}`
        return sql
    }

    DeleteData(table, condition) {
        let sql = `DELETE FROM ${table} WHERE ${condition}`
        return sql
    }
}

exports.HOSxP = HOSxP;
exports.default = HOSxP;