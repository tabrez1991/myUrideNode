const signupDB = require('../../models/signup.model.js');
const roleDB = require('../../models/memberRole.model.js');
const profileDB = require('../../models/profile.model.js');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const path = require('path');
const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apiResponse.js');
const {
    generateotp
} = require('../../services/otp.js');
const sgmail = require('@sendgrid/mail');
sgmail.setApiKey('SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w');
const fs = require('fs');
require('dotenv').config();
var passwordValidator = require('password-validator');

module.exports = {
    signup: async function (req, res) {
        try {

            const requiredParam = [
                'email',
                'username',
                'password',
                'confirmPassword',
                'device_id',
                'device_token',
                'device_type'
            ];

            var emptyArry = [];
            var formdata = req.body;
            var data = Object.keys(req.body);

            var result = requiredParam.filter(n => !data.includes(n));
            if (result != '') {
                var responseMessageRequired = result + " " + 'fields are required.';
                return validationError(res, responseMessageRequired);
            } else {
                data.forEach(element => {
                    if (formdata[element] == '') {
                        emptyArry.push(element);
                    }
                });
                var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                if (emptyArry != '') {
                    return validationError(res, responseMessage);
                } else {
                    const {
                        email,
                        username,
                        password,
                        confirmPassword,
                        device_id,
                        device_token,
                        device_type
                    } = req.body;

                    //var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-3]+\.)+[a-zA-Z]{2,}))$/;
                    //var re=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\.edu$/;
                    const whitelist = ['cindymbierbaum@gmail.com', 'chris@myuride.com'];

                    var re = /@(.*\.edu)$/i;
                    if (email.match(re) || whitelist.includes(email)) {
                        // if (email.indexOf(".edu", email.length - ".edu".length) !== -1) {
                        const validateemail = await signupDB.findOne({
                            email: email.toLowerCase()
                        }).lean();
                        if (validateemail) {
                            return errorResponse(res, 'Email Already exist')
                        }

                        const validateuser = await signupDB.findOne({
                            username
                        }).lean();
                        if (validateuser) {
                            return errorResponse(res, 'Username Already Exist')
                        }

                        // Create a schema
                        var schema = new passwordValidator();

                        // Adding properties to it
                        schema
                            .is().min(8) // Minimum length 8
                            .is().max(25) // Maximum length 25
                            .has().uppercase() // Must have uppercase letters
                            .has().lowercase() // Must have lowercase letters
                            .has().digits(2) // Must have at least 2 digits
                            .has().not().spaces() // Should not have spaces
                            .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


                        const validatePassword = await schema.validate(password);
                        //console.log("validatePassword",validatePassword);
                        if (validatePassword == false) {
                            return errorResponse(res, 'Password must have min 8 length, max 25 length, uppercase letters, lowercase letters, at least 2 digits with no spaces ')
                        }

                        //Encrypt user password
                        if (validatePassword == true && password == confirmPassword) {
                            encryptedPassword = await bcrypt.hash(password, 10);

                            const user = await signupDB.create({
                                email: email.toLowerCase(),
                                username: username,
                                password: encryptedPassword
                            })
                            const otpGenerated = generateotp();

                            var token = jwt.sign({
                                    id: user._id
                                },
                                process.env.SECRET_KEY, {
                                    expiresIn: 86400
                                }
                            )

                            var refreshToken = jwt.sign({
                                    id: user._id
                                },
                                process.env.REFRESH_TOKEN_SECRET, {
                                    expiresIn: 2592000
                                }
                            )
                            user.jwttoken = token;
                            user.refreshToken = refreshToken;
                            user.status = 1;
                            user.role_id = 0;
                            user.otp = otpGenerated;
                            user.device_id = device_id;
                            user.device_token = device_token;
                            user.device_type = device_type;
                            user.email_verified = 0;
                            user.created_date = Date.now();
                            console.log("user",user);
                            await user.save(async (err, doc) => {
                                if (err) {
                                    return errorResponse(res, 'Error')
                                } else {
                                    if (doc) {
                                        const data = {
                                            token: doc.jwttoken,
                                            refreshToken: doc.refreshToken
                                        }
                                        // return successWithData(res, 'Data Submitted Successfully', data);
                                        const otpGenerated = generateotp();

                                        if (otpGenerated) {
                                            console.log("1")
                                            sgmail.setApiKey(process.env.SENDGRID_API_KEY);
                                            console.log("2")
                                            const message = {
                                                //to: doc.email,
                                                // to: 'chris@myuride.com',
                                                // to:'shubhlata.kumari.ucanji@gmail.com',
                                                //  to:'sachinstealth3@gmail.com',
                                                to: ['shubhlata.kumari.ucanji@gmail.com', 'chris@myuride.com','aniket.renuse9@gmail.com'],
                                                from: 'noreply@myuride.com',
                                                subject: 'Verify Your Email',
                                                html: `
                                                    <head>
                                                      <style>
                                                    .button {
                                                        background-color: #243391;
                                                        border: none;
                                                        color: #fff;
                                                        padding: 15px 32px;
                                                        text-decoration: none;
                                                        font-size: 16px;
                                                        text-align: center;
                                                        justify-content: center;
                                                      }</style>
                                                       </head>
                                                    <div
                                                    class="container"
                                                style="max-width: 90%; margin: auto; padding-top: 20px"
                                                >
                                                <h2>Welcome to myUride</h2>
                                                    
                                                    <p style="margin-bottom: 30px;">Please click on button to verify Email</p>
                                                 <a href = 'http://api.myuride.com/v1/auth/verifyEmail?otp=${doc.otp}' style="margin: 0 auto;color:#fff;" class="button">verify</a>
                                                    
                                                    <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                                                </div>
                                                `

                                            }
                                            console.log("3")
                                            console.log("message",message)
                                            //const mailSent = await sgmail.send(message)
                                            sgmail.send(message).then(() => {
                                                console.log("4")
                                                console.log('Message sent')
                                                return successWithData(res, 'Data Submitted Successfully', data);
                                            }).catch((error) => {
                                                console.log(error.response.body)
                                                // console.log(error.response.body.errors[0].message)
                                            })
                                            // console.log('email sent', mailSent);
                                            // if (mailSent) {
                                            //     return successWithData(res, 'Data Submitted Successfully', data);
                                            // }

                                        } else {
                                            console.log('error');

                                        }
                                    }



                                }
                            })
                        } else {
                            return errorResponse(res, 'Confirm Password does not match')
                        }
                        //<a href = 'http://18.222.174.91/nodeAPI/v1/auth/verifyEmail?otp=${doc.otp}'>http://18.222.174.91/nodeAPI/v1/auth/verifyEmail?otp=${doc.otp}</a>
                        //'http://18.222.174.91/nodeAPI/thankuResponse' 

                        // } else {
                        //     return await errorResponse(res, 'Only domain with .edu is acceptable')
                        // }
                    } else {
                        return await errorResponse(res, 'Only domain with .edu is acceptable.(Ex- example@example.edu)')
                    }

                }
            }

        } catch (err) {
            console.log(err);
        }
    },

    resendEmailVerification: async function (req, res) {
        try {
            const findemail = await signupDB.findOne({
                email: req.body.email
            });
            if (findemail) {
                //var otpGenerated=generateotp();
                //if(otpGenerated){
                console.log("1")
                sgmail.setApiKey(process.env.SENDGRID_API_KEY);
                console.log("2")
                const message = {
                    //to: findemail.email,
                    // to: 'chris@myuride.com',
                    //to:'sachinstealth3@gmail.com',

                    to: ['shubhlata.kumari.ucanji@gmail.com', 'chris@myuride.com','aniket.renuse9@gmail.com'],
                    from: 'noreply@myuride.com',
                    subject: 'Verify Your Email',
                    html: `
                        <head>
                          <style>
                        .button {
                            background-color: #243391;
                            border: none;
                            color: #fff;
                            padding: 15px 32px;
                            text-decoration: none;
                            font-size: 16px;
                            text-align: center;
                            justify-content: center;
                          }</style>
                           </head>
                        <div
                        class="container"
                    style="max-width: 90%; margin: auto; padding-top: 20px"
                    >
                    <h2>Welcome to myUride</h2>
                        
                        <p style="margin-bottom: 30px;">Please click on button to verify Email</p>
                     <a href = 'http://api.myuride.com/v1/auth/verifyEmail?otp=${findemail.otp}' style="margin: 0 auto;color:#fff;" class="button">verify</a>
                        
                        <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                    </div>
                    `

                }
                console.log("3")
                //const mailSent = await sgmail.send(message)
                sgmail.send(message).then(() => {
                    console.log("4")
                    console.log('Message sent')
                    return success(res, 'Mail has been send Successfully');
                }).catch((error) => {
                    console.log(error)
                    // console.log(error.response.body.errors[0].message)
                })

                //}
            }

        } catch (err) {
            console.log(err);
        }

    },

    login: async function (req, res) {
        try {
            const {
                email,
                password,
                device_id,
                device_token,
                device_type
            } = req.body
            console.log('req.body', req.body);
            if (!(email && password && device_id || device_token || device_type)) {
                return validationError(res, 'Required All fields')
            } else {

                const data = await signupDB.findOne({
                    email: email.toLowerCase()
                });
                if (!(data)) {
                    return errorResponse(res, 'You have entered wrong email');
                }
                // if(data.status==0){
                //     return errorResponse(res,'Account Deleted. Access Denied');
                // }
                if (data && (await bcrypt.compare(password, data.password))) {
                    console.log("if")
                    var token = jwt.sign({
                        id: data._id
                    }, process.env.SECRET_KEY, {
                        expiresIn: 86400
                    })

                    var refreshtoken = jwt.sign({
                            id: data._id
                        },
                        process.env.REFRESH_TOKEN_SECRET, {
                            expiresIn: 2592000
                        })
                    // data.jwttoken = token;
                    // data.refreshtoken = refreshtoken;
                    var newvalues = {
                        $set: {
                            jwttoken: token,
                            refreshToken: refreshtoken,
                            status: 1,
                            device_id: device_id,
                            device_token: device_token,
                            device_type: device_type,
                            updated_date: Date.now()
                        }
                    }
                    //console.log("newvalues", newvalues)
                    signupDB.updateOne({
                        _id: data._id
                    }, newvalues, async (err, updateInfo) => {
                        if (err) {
                            return errorResponse(res, 'Network error')
                        } else {
                            if (updateInfo) {
                                //console.log("updateInfo",updateInfo);
                                const userdata = await signupDB.findOne({
                                    _id: data._id
                                });
                                if (userdata) {
                                    const result = {
                                        token: userdata.jwttoken,
                                        refreshToken: userdata.refreshToken
                                    }
                                    //return success(res, 'Login Successfully')
                                    return successWithData(res, 'Login Successfully', result)
                                }
                                // const result ={
                                //     token: updateInfo.jwttoken, 
                                //     refreshToken: updateInfo.jwttoken
                                //  }
                                // //return success(res, 'Login Successfully')
                                // return successWithData(res, 'Login Successfully', updateInfo)
                            } else {
                                return errorResponse(res, 'Please Try Again')
                            }
                        }
                    })
                    // const update = await data.updateOne({
                    //     token,refreshtoken
                    // }, {
                    //     jwttoken: data.token,
                    //     refreshToken: data.refreshtoken
                    // })

                } else {
                    console.log("else")
                    return errorResponse(res, 'You have entered Wrong Password')
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    refreshTokenUser: async function (req, res) {
        try {
            const {
                refreshToken
            } = req.body;

            if (!refreshToken) {
                return errorResponse(res, 'No refresh token provided')
            }

            var token = await jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            // console.log('toen',token.id);

            const data = await signupDB.findOne({
                _id: token.id
            });

            // console.log('_id',data);
            // console.log('_id',toen.id);

            if (!data) {
                return success(res, 'User not found')
            } else {
                var token = jwt.sign({
                    id: data._id
                }, process.env.SECRET_KEY, {
                    expiresIn: 86400
                })

                var refreshtoken = jwt.sign({
                        id: data._id
                    },
                    process.env.REFRESH_TOKEN_SECRET, {
                        expiresIn: 2592000
                    })

                var newvalues = {
                    $set: {
                        jwttoken: token,
                        refreshToken: refreshtoken

                    }
                }
                signupDB.updateOne({
                    _id: data._id
                }, newvalues, async (err, updateInfo) => {
                    if (err) {
                        return errorResponse(res, 'Network error')
                    } else {
                        const newdata = {
                            token: data.jwttoken
                        }
                        return successWithData(res, 'Refresh Token Successful', newdata)
                    }
                });

            }


        } catch (error) {
            console.log(error);
        }
    },

    validateEmail: async function (req, res) {
        try {
            const {
                email
            } = req.body;
            // var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            const whitelist = ['cindymbierbaum@gmail.com', 'chris@myuride.com'];

            var re = /@(.*\.edu)$/i;
            //var re=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\.edu$/;
            if (email.match(re) || whitelist.includes(email)) {
                // if (re.test(email)) {
                //if (email.indexOf("@creighton.edu", email.length - "@creighton.edu".length) !== -1) {
                const validateuser = await signupDB.findOne({
                    email: email.toLowerCase()
                }).lean();
                if (validateuser) {
                    return errorResponse(res, 'Email Already exist')
                } else {
                    return success(res, 'Email Available')
                }
                // }
                // }
            } else {
                return await errorResponse(res, 'Only domain with .edu is acceptable(Ex - example@example.edu)')
            }
        } catch (err) {
            console.log(err);
        }
    },

    validateUsername: async function (req, res) {
        try {
            const {
                username
            } = req.body;
            const validateuser = await signupDB.findOne({
                username
            }).lean();
            if (validateuser) {
                return errorResponse(res, 'Username Already Exist')
            } else {
                return success(res, 'Username Available')
            }
        } catch (err) {
            console.log(err);
        }
    },

    verifyEmail: async function (req, res) {
        try {
            console.log(req.query.otp);
            const validateuser = await signupDB.findOne({
                otp: req.query.otp,
                email_verified: 0
            }).lean();
            console.log('validateUser', validateuser);
            if (validateuser) {
                var newvalues = {
                    $set: {
                        email_verified: 1
                    }
                }
                signupDB.updateOne({
                    _id: validateuser._id
                }, newvalues, (err, doc) => {
                    if (err) {
                        //return errorResponse(res, 'Email Not Activated')
                        res.redirect('http://api.myuride.com/verificationResponse')
                    } else {
                        //return successWithData(res, 'Youe Email Has Been Activated', validateuser.jwttoken);
                        //res.send("<html> <head>server Response</head><body><h1> Success</p></h1></body></html>");
                        //res.sendFile(path.join(__dirname, 'http://18.222.174.91/nodeAPI/thankuResponse'));
                        //if(res)
                        res.redirect('http://api.myuride.com/thankuResponse')
                    }

                });
                //return successWithData(res, 'Email Verified', validateuser.jwttoken)               
            } else {
                //return errorResponse(res, 'OTP does not match')
                res.redirect('http://api.myuride.com/verificationResponse')
            }
        } catch (err) {
            console.log(err);
        }
    },

    checkEmailVerificationStatus: async function (req, res) {
        try {
            const verifyuser = await signupDB.findOne({
                email: req.body.email.toLowerCase(),
                email_verified: 1
            }).lean();
            if (verifyuser) {
                return success(res, "Email Verified")
            } else {
                return errorResponse(res, 'Email not Verified')
            }
        } catch (err) {
            console.log(err);
        }
    },

    signupdemo: async function (req, res) {
        try {
            const {
                email,
                username,
                password,
                confirmPassword
            } = req.body;
            if (!(email && username && password && confirmPassword)) {
                return validationError(res, "required all fields")
            }
            // Validate if user exist in our database
            //const validateuser = await adminDB.findOne({ email, username }).lean(); 

            //Encrypt user password
            if (password == confirmPassword) {
                encryptedPassword = await bcrypt.hash(password, 10);

                const user = await signupDB.create({
                    email: email.toLowerCase(),
                    username: username,
                    password: encryptedPassword
                })

                const otpGenerated = generateotp();

                var token = jwt.sign({
                        id: user._id
                    },
                    process.env.SECRET_KEY, {
                        expiresIn: 86400
                    }
                )
                user.jwttoken = token;
                user.status = 1;
                user.role_id = 0;
                user.otp = otpGenerated;
                user.save(async (err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error')
                    } else {
                        //return successWithData(res, 'Data Submitted Successfully', doc)


                        if (doc) {
                            //const Apikey = 'SG.vNwQ4i-ySeuPYQRQesLB-w.14KBQjwAkyTsAAKYW_6weCwT6LJ-0LICm43Cv8Djb4w';
                            sgmail.setApiKey(process.env.SENDGRID_API_KEY);

                            const message = {
                                to: 'lezli04@gmail.com',
                                from: 'mohit.framero@gmail.com',
                                subject: 'Verify Your Email',
                                html: `
                            <div
                            class="container"
                           style="max-width: 90%; margin: auto; padding-top: 20px"
                          >
                           <h2>Welcome to myUride</h2>
                            
                            <p style="margin-bottom: 30px;">Please click on link to verify Email</p>
                            <a href = 'http://127.0.0.1:6000/verifyEmail/?otp=${doc.otp}' >http://127.0.0.1:6000/verifyEmail/?otp=${doc.otp}</a>
                            <p style="margin-top:50px;">If you do not request for verification please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                         </div>
                         `
                            }
                            const mailSent = await sgmail.send(message)
                            //console.log('email sent', mailSent);
                            if (mailSent) {
                                return successWithData(res, 'Data Submitted Successfully', doc.jwttoken);
                            }

                        } else {
                            console.log('error');

                        }
                    }
                })
            } else {
                return errorResponse(res, 'Confirm Password does not match')
            }


        } catch (err) {
            console.log(err);
        }
    },

    forgetPassword: async function (req, res) {
        try {
            const {
                email
            } = req.body;
            console.log('reqqq.body', req.body);
            if (!(email)) {
                return validationError(res, "email field is required")
            } else {
                signupDB.findOne({
                    email: email.toLowerCase()
                }, async (err, findEmailDoc) => {
                    if (err) {
                        return errorResponse(res, "Error while finding email")
                    } else {
                        if (findEmailDoc) {
                            console.log('findEmailDoc', findEmailDoc);
                            var token = jwt.sign({
                                id: findEmailDoc._id
                            }, process.env.SECRET_KEY, {
                                expiresIn: 86400
                            })
                            if (token) {
                                sgmail.setApiKey(process.env.SENDGRID_API_KEY);

                                const message = {
                                    //to: findEmailDoc.email,
                                    //to:'chris@myuride.com',
                                    //to:'shubhlata.kumari.ucanji@gmail.com',
                                    //to:'sachinstealth3@gmail.com',
                                    to: ['shubhlata.kumari.ucanji@gmail.com', 'chris@myuride.com','aniket.renuse9@gmail.com'],
                                    from: 'noreply@myuride.com',
                                    subject: 'Forgot Password',
                                    html: `
                                    <head>
                                    
                                            
                                                       
                                    </head>
                            <div
                            class="container"
                           style="max-width: 90%; margin: auto; padding-top: 20px"
                          >
                           <h2>Welcome to myUride</h2>
                            
                            <p style="margin-bottom: 30px;">Please click on link to to reset password</p>
                            <a href = 'http://api.myuride.com/resetPassword/?${token}' type="button" style="margin: 0 auto;background-color: #243391; border: none; color: #fff; padding: 15px 32px;
                                                        text-decoration: none;
                                                        font-size: 16px;
                                                        text-align: center;
                                                        justify-content: center;" class="button">Reset Password</a>
                            <p style="margin-top:50px;">If you do not request for forgot password please do not respond to the mail. You can in turn un subscribe to the mailing list and we will never bother you again.</p>
                         </div>
                         `
                                }
                                const mailSent = await sgmail.send(message)
                                if (mailSent) {
                                    const data = "http://api.myuride.com/resetPassword/?" + token
                                    return successWithData(res, "Email Successfully Sent", data)
                                }
                                console.log('email sent', mailSent);
                            }
                        } else {
                            return errorResponse(res, "Email not found")
                        }
                    }
                    //        <a href = 'http://18.222.174.91/nodeAPI/resetPassword/?${token}' type="button" style="margin: 0 auto;" class="button">http://18.222.174.91/resetPassword/?${token}</a>

                })
            }

        } catch (err) {
            console.log(err);
        }
    },

    createRole: async function (req, res) {
        try {
            const {
                role,
                role_id
            } = req.body;
            if (!(role && role_id)) {
                return validationError(res, "required all fields")
            }


            const createrole = await roleDB.create({
                role_id: role_id,
                role: role
            })

            createrole.save(async (err, roledoc) => {
                if (err) {
                    return errorResponse(res, 'Error')
                } else {
                    return successWithData(res, 'Data Submitted Successfully', roledoc)

                }
            })



        } catch (err) {
            console.log(err);
        }
    },




}