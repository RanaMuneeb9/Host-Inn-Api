var mysql = require("mysql");
var util = require('util');

function REST_ROUTER(router, connection, md5) {
    var self = this;
    self.handleRoutes(router, connection, md5);
}

REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router.get("/", function (req, res) {
        res.json({
            "Message": "Hello World !"
        });
    });

    router.post("/adminLogin", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "Select admin_id,admin_name,admin_role,hostel_id From ?? Where admin_username=? AND admin_password=?";
        var table = ["hostel_admins", req.body.username, req.body.password];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Server Error!"
                });
            } else if (rows != 0) {
                res.json({
                    "Error": false,
                    "Message": "User logged in successfully !",
                    "Data": rows
                });
            } else {
                res.json({
                    "Error": true,
                    "Message": "Wrong Username/Password"
                });
            }
        });
    });
    
     router.post("/getFacilities", function (req, res) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var query = "Select * From ??";
        var table = ["facilities"];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Server Error"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Facilities Available !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Facilities Available !",
                    "Data": rows
                });

            }
        });
    });


    router.post("/hostelSignup", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "Select * From ?? Where hostel_email=? AND hostel_name=?";
        var table = ["hostels", req.body.hostel_email, req.body.hostel_name];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows != 0) {
                res.json({
                    "Error": true,
                    "Message": "Hostel With similar email OR name Already Exisits !"
                });
            } else {



                var query1 = "INSERT INTO ?? (hostel_name,hostel_lat,hostel_lang,hostel_about,hostel_email,hostel_phone,hostel_mobile,hostel_type) VALUES (?,?,?,?,?,?,?,?)";
                var table1 = ["hostels", req.body.hostel_name, req.body.hostel_lat, req.body.hostel_lang, req.body.hostel_about, req.body.hostel_email, req.body.hostel_phone, req.body.hostel_mobile, req.body.hostel_type];

                query1 = mysql.format(query1, table1);
                connection.query(query1, function (err1, rows1) {

                    if (err1) {
                        res.json({
                            "Error": true,
                            "Message": "Server Error !"
                        });
                    } else {

                        var query2 = "INSERT INTO ?? (admin_name,admin_username,admin_password,admin_role,hostel_id) VALUES (?,?,?,'Administrator',(Select hostel_id From hostels Where hostel_email=?))";
                        var table2 = ["hostel_admins", req.body.hostel_name, req.body.hostel_email, req.body.password, req.body.hostel_email];

                        query2 = mysql.format(query2, table2);
                        connection.query(query2, function (err2, rows2) {

                            if (err2) {
                                res.json({
                                    "Error": true,
                                    "Message": "Server Error !"
                                });
                            } else {

                                var arr = req.body.hostel_facilities;
                                var count = 0;

                                for (var val of arr) {

                                    var query3 = "INSERT INTO ?? (hostel_id,facility_id) VALUES ((Select hostel_id From hostels Where hostel_email=?),?)";
                                    var table3 = ["hostel_has_facilities", req.body.hostel_email, Number(val)];

                                    query3 = mysql.format(query3, table3);
                                    connection.query(query3, function (err3, rows3) {

                                        if (err3) {
                                            res.json({
                                                "Error": true,
                                                "Message": "Server Error !"
                                            });
                                        } else {
                                            count = count + 1;
                                        }

                                    });

                                }

                                res.json({
                                    "Error": false,
                                    "Message": "Hostel Signed Up Successfully!"
                                });



                            }

                        });

                    }

                });

            }
        });
    });
    
    
     router.post("/adminForgotPassword", function (req, res) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var query = "Select * From ?? where admin_username=?";
        var table = ["hostel_admins",req.body.admin_username];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Server Error"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No user found !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Email Sent Successfully !"
                });

            }
        });
    });

    //Last Edited

    router.post("/userLogin", function (req, res) {
        var query = "Select * From ?? Where email=? AND password=?";
        var table = ["users", req.body.email, md5(req.body.password)];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows != 0) {
                res.json({
                    "Error": false,
                    "Message": "Success",
                    "Users": rows
                });
            } else {
                res.json({
                    "Error": true
                });
            }
        });
    });




    router.post("/add_user", function (req, res) {
        var query = "Select * From ?? Where email=?";
        var table = ["users", req.body.email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows != 0) {
                res.json({
                    "Error": true,
                    "Message": "User Already Exisits !"
                });
            } else {
                var query1 = "INSERT INTO ?? (first_name,last_name,email,mobile_no,password,user_lat,user_lang,user_gender,user_type) VALUES (?,?,?,?,?,?,?,?,?)";
                var table1 = ["users", req.body.first_name, req.body.last_name, req.body.email, req.body.mobile_no, md5(req.body.password), req.body.user_lat, req.body.user_lang, req.body.user_gender, req.body.user_type];

                query1 = mysql.format(query1, table1);
                connection.query(query1, function (err1, rows1) {

                    if (err1) {
                        res.json({
                            "Error": true,
                            "Message": "Error executing MySQL query"
                        });
                    } else {
                        res.json({
                            "Error": false,
                            "Message": "Signed Up Successfully !"
                        });
                    }

                });

            }
        });
    });



    router.get("/get_hostels", function (req, res) {
        var query = "Select * From ??";
        var table = ["hostels"];
        var arr = [];
        var arr1 = [];
        var arr2 = [];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query0"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Hostel Available !"
                });
            } else {


                rows.forEach(function (entry, idx, array) {

                    //                      var query1 = "SELECT * FROM reviews Where Hostels_hostel_id="+entry.hostel_id ;
                    //                var handle1 = client.querySync(query1) ;
                    //                var results = handle1.fetchAllSync() ;
                    //
                    //                    console.log(JSON.stringify(results)) ; 

                    var query1 = "Select * from facilities JOIN ??  ON facility_id=Facilities_facility_id Where Hostels_hostel_id=?";
                    var table1 = ["hostel_has_facilities", entry.hostel_id];


                    query1 = mysql.format(query1, table1);
                    connection.query(query1, function (err1, rows1) {

                        if (err1) {
                            res.json({
                                "Error": true,
                                "Message": "Error executing MySQL query"
                            });
                        } else if (rows1 == 0) {
                            res.json({
                                "Error": true,
                                "Message": "Error executing MySQL query1"
                            });
                        } else {

                            entry.facilities = [];
                            entry.facilities = rows1;
                            arr.push(entry);
                        }


                        if (idx === array.length - 1) {
                            //       res.json({ "Error": true, "Message": arr });

                            arr.forEach(function (entry1, idx1, array1) {

                                //                      var query1 = "SELECT * FROM reviews Where Hostels_hostel_id="+entry.hostel_id ;
                                //                var handle1 = client.querySync(query1) ;
                                //                var results = handle1.fetchAllSync() ;
                                //
                                //                    console.log(JSON.stringify(results)) ; 

                                var query2 = "Select * from ?? Where Hostels_hostel_id=?";
                                var table2 = ["room_type_prices", entry1.hostel_id];


                                query2 = mysql.format(query2, table2);
                                connection.query(query2, function (err2, rows2) {

                                    if (err2) {
                                        res.json({
                                            "Error": true,
                                            "Message": "Error executing MySQL query"
                                        });
                                    } else if (rows2 == 0) {
                                        res.json({
                                            "Error": true,
                                            "Message": "Error executing MySQL query2"
                                        });
                                    } else {

                                        entry1.room_prices = [];
                                        entry1.room_prices = rows2;
                                        arr1.push(entry1);
                                    }


                                    if (idx1 === array1.length - 1) {
                                        //       res.json({ "Error": true, "Message": arr });


                                        arr1.forEach(function (entry2, idx2, array2) {

                                            //                      var query1 = "SELECT * FROM reviews Where Hostels_hostel_id="+entry.hostel_id ;
                                            //                var handle1 = client.querySync(query1) ;
                                            //                var results = handle1.fetchAllSync() ;
                                            //
                                            //                    console.log(JSON.stringify(results)) ; 

                                            var query3 = "Select t1.*,t2.first_name,t2.last_name from ?? t1 JOIN users t2 ON t2.user_id=t1.Users_user_id Where Hostels_hostel_id=?";
                                            var table3 = ["reviews", entry2.hostel_id];


                                            query3 = mysql.format(query3, table3);
                                            connection.query(query3, function (err3, rows3) {

                                                if (err3) {
                                                    res.json({
                                                        "Error": true,
                                                        "Message": "Error executing MySQL query"
                                                    });
                                                } else if (rows3 == 0) {
                                                    res.json({
                                                        "Error": true,
                                                        "Message": "Error executing MySQL query3"
                                                    });
                                                } else {

                                                    entry2.reviews = [];
                                                    entry2.reviews = rows3;
                                                    arr2.push(entry2);
                                                }


                                                if (idx2 === array2.length - 1) {
                                                    res.json({
                                                        "Error": false,
                                                        "Message": arr2
                                                    });
                                                }



                                            });
                                        });



                                    }



                                });
                            });




                        }



                    });
                });



            }
        });
    });


    router.post("/insertBooking", function (req, res) {
        var query = "Insert into ?? (payment_amount,payment_status,Hostels_hostel_id,Users_user_id) Values(?,?,?,?)";
        var table = ["payments", req.body.payment_amount, req.body.payment_status, req.body.hostel_id, req.body.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": false,
                    "Message": "Error executing MySQL query0"
                });
            } else if (rows != 0) {

                var query2 = "Select payment_id FROM ?? WHERE Users_user_id=? AND Hostels_hostel_id=? ORDER BY payment_paid_date DESC LIMIT 1";
                var table2 = ["payments", req.body.user_id, req.body.hostel_id];

                query2 = mysql.format(query2, table2);
                connection.query(query2, function (err2, rows2) {

                    if (err2) {
                        res.json({
                            "Error": true,
                            "Message": "Error executing MySQL query1"
                        });
                    } else if (rows2 != 0) {

                        var pay_id = rows2[0].payment_id;


                        var query1 = "INSERT INTO ?? (booking_status,Payments_payment_id,Payments_Users_user_id,Payments_Hostels_hostel_id) VALUES (?,?,?,?)";
                        var table1 = ["bookings", req.body.payment_status, pay_id, req.body.user_id, req.body.hostel_id];

                        query1 = mysql.format(query1, table1);
                        connection.query(query1, function (err1, rows1) {

                            if (err1) {
                                res.json({
                                    "Error": true,
                                    "Message": "Error executing MySQL query3"
                                });
                            } else {
                                res.json({
                                    "Error": false,
                                    "Message": "Booking Successfull !"
                                });
                            }

                        });


                    }

                });




            } else {
                res.json({
                    "Error": true
                });
            }
        });
    });



    router.post("/hostelNotifications", function (req, res) {
        var query = "Select * From ?? Where Hostels_hostel_id=? ORDER BY notification_date DESC";
        var table = ["notifications", req.body.hostel_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Notification Available !",
                    "Notifications": rows
                });

            }
        });
    });

    router.post("/getNotifications", function (req, res) {

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var query = "Select * From ?? Where Hostels_hostel_id=(Select hostel_id From hostels Where hostel_email=?)";
        var table = ["notifications", req.body.hostel_email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Notification Available !",
                    "Notifications": rows
                });

            }
        });
    });

    router.post("/AddNotification", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "INSERT into ?? (notification_title,notification_description,Hostels_hostel_id) VALUES (?,?,(Select hostel_id From hostels Where hostel_email=?))";
        var table = ["notifications", req.body.notification_title, req.body.notification_description, req.body.hostel_email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": req.body.hostel_email
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Data Available !"
                });

            }
        });
    });

    router.post("/getRooms", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "Select * From ?? Where Hostels_hostel_id=(Select hostel_id From hostels Where hostel_email=?)";
        var table = ["rooms", req.body.hostel_email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Notification Available !",
                    "Rooms": rows
                });

            }
        });
    });

    router.post("/getRoomTypes", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "Select * From ?? Where Hostels_hostel_id=(Select hostel_id From hostels Where hostel_email=?)";
        var table = ["room_type_prices", req.body.hostel_email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Data Available !",
                    "RoomTypes": rows
                });

            }
        });
    });


    router.post("/AddRoom", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "INSERT into ?? (room_number,Hostels_hostel_id,Room_types_room_type_id) VALUES (?,(Select hostel_id From hostels Where hostel_email=?),?)";
        var table = ["rooms", req.body.room_no, req.body.hostel_email, req.body.seaters];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": req.body.hostel_email
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Data Available !",
                    "RoomTypes": rows
                });

            }
        });
    });

    router.post("/AddRoomType", function (req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var query = "INSERT into ?? (base_price,price_with_mess,Room_types_room_type_id,Hostels_hostel_id) VALUES (?,?,?,(Select hostel_id From hostels Where hostel_email=?))";
        var table = ["room_type_prices", req.body.base_price, req.body.price_with_mess, req.body.seaters, req.body.hostel_email];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": req.body.hostel_email
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Data Available !",
                    "RoomTypes": rows
                });

            }
        });
    });


    router.post("/userPayments", function (req, res) {
        var query = "Select * From ?? Where Hostels_hostel_id=? AND Users_user_id=? ORDER BY payment_paid_date DESC";
        var table = ["payments", req.body.hostel_id, req.body.user_id];
        query = mysql.format(query, table);
        connection.query(query, function (err, rows) {
            if (err) {
                res.json({
                    "Error": true,
                    "Message": "Error executing MySQL query"
                });
            } else if (rows == 0) {
                res.json({
                    "Error": true,
                    "Message": "No Notification !"
                });
            } else {
                res.json({
                    "Error": false,
                    "Message": "Notification Available !",
                    "Payments": rows
                });

            }
        });
    });


}

module.exports = REST_ROUTER;