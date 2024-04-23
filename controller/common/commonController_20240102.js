const signupDB = require('../../models/signup.model.js')
const backgroudCheckDB = require('../../models/background.model.js')
const vehicleInfosDB = require('../../models/vehicleInfo.model.js');
const paymentMethodDB = require('../../models/paymentMethod.model');
const destinationContactDB = require('../../models/destinationcontact.model');
const tripDB = require('../../models/usersTrip.model.js');
const notificationDB = require('../../models/notification.model.js');
//const tripOfferDB = require('../../../models/tripOffer.model.js');
const profileDB = require('../../models/profile.model.js');
const csvDB = require('../../models/csv.model.js');
const roleDB = require('../../models/memberRole.model.js');
const faqDB = require('../../models/faq.model.js');
const verifyToken = require("../../middleware/authentication.js");
var passwordValidator = require('password-validator');
const paymentDB = require('../../models/payment.model.js')
const cron = require('node-cron');
const csvtojson = require("csvtojson");
const token = 'JVNGM6CUPJYDC5TONBWDA6K6PNXTIJLIEFAVK2J2GAZWK2BP';
//const privacyDB = require('../../models/privacy_policy.model.js');

const {
    parseAsync
} = require('json2csv');
const bcrypt = require("bcrypt");
//const stripe = require('stripe');
//const SECRET_KEY = 'sk_test_51IsQPvSHGcil8cZZO2zWJkmP75pqAnOzXwAUFu1es5nJdU8Bel9sgsu4FTvaqYvzwfzY4DWPKfJeheg9l7M6fz4e00KrMrAKct';

//manik secret key
// const SECRET_KEY = 'sk_test_51NJ8LhSDjVnkPYiFsgpfw4iJ4dxGiEriHf6cBN6j00vuctU4vVVyEbSsGpWCqCY8887EwSSeO2PnfodiiNjX1fAf00OnVZ0wwn'
//shub key
const SECRET_KEY = 'sk_test_51NilGQE5GTh5IDJWvClgN39Z6ntLYwvYi5IBQmgyEmvBENQGDB6a7iMVBnFlv6N6JhHkKfPBdoM5LZngPVxPzLGn00H6FBXKBT'
//const stripe = stripe('pk_test_51IsQPvSHGcil8cZZji6L5yDJKm8cYvGZJfVdDqPbApVubE8QYj6yENDLNQmdHXsvF0fSapIbA2NObJ7T9deM7Smb00CscN1ji6');
//personal

//const SECRET_KEY = 'sk_test_51IsQPvSHGcil8cZZO2zWJkmP75pqAnOzXwAUFu1es5nJdU8Bel9sgsu4FTvaqYvzwfzY4DWPKfJeheg9l7M6fz4e00KrMrAKct'
const stripe = require('stripe')(SECRET_KEY);
//const stripee = stripe('pk_test_51IsQPvSHGcil8cZZji6L5yDJKm8cYvGZJfVdDqPbApVubE8QYj6yENDLNQmdHXsvF0fSapIbA2NObJ7T9deM7Smb00CscN1ji6');

const fs = require('fs');
//const jsonData = example_2.json;

const axios = require('axios');

const apiUrl = 'https://gateway.maverickpayments.com/payment/sale';

const {
    success,
    successWithData,
    errorResponse,
    validationError
} = require('../../helpers/apiResponse.js')
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');
const {
    Console
} = require('console');
const {
    type
} = require('os');
const ObjectId = mongoose.Types.ObjectId;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './profileUploads',);
//     },
//     filename: function (req, file, cb) {
//         cb(null, file.originalname);
//     }
// });

// const uploadImg = multer({
//     storage: storage
// }).single('profile_photo');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // console.log('file', file.fieldname);
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, 'profileUploads/');

        } else if (file.fieldname === 'upload_driver_licence') {
            cb(null, 'uploadDriverlicenceUploads/');

        } else if (file.fieldname === 'upload_inssurance_card') {
            cb(null, 'uploadInssurancecardUploads/');

        } else if (file.fieldname === 'upload_vehicle_registration') {
            cb(null, 'vehicleRegistrationUploads/');

        }
    },
    filename: function (req, file, cb) {
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === 'upload_driver_licence') {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "upload_inssurance_card") {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        } else if (file.fieldname === "upload_vehicle_registration") {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }
    }
});
const uploadImg = multer({
    storage: storage,
}).fields(
    [{
        name: 'upload_profile_photo',
        maxCount: 1
    },
    {
        name: 'upload_driver_licence',
        maxCount: 1
    },
    {
        name: 'upload_inssurance_card',
        maxCount: 1
    },
    {
        name: 'upload_vehicle_registration',
        maxCount: 1
    }
    ]
);
const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('file', file.fieldname);
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, 'profileUploads/');

        }
    },
    filename: function (req, file, cb) {
        if (file.fieldname === 'upload_profile_photo') {
            cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
        }

    }


});
//console.log('filename',filename);
const uploadImg1 = multer({
    storage: storage1,
}).fields(
    [{
        name: 'upload_profile_photo',
        maxCount: 1
    }])



module.exports = {
    verifyToken,
    uploadImg,
    uploadImg1,
    createProfile: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    fullname,
                    university_name,
                    student_id,
                    university_address,
                    mobile_no,
                    car_model,
                    student_university_email,
                    gender,
                    destination_contact_number,
                    type,
                    gender_preferences,
                    rider_preference,
                    phone_code,
                    phone_no,
                    legal_first_name,
                    legal_middle_name,
                    legal_last_name,
                    license_number,
                    license_state,
                    zip_code,
                    dob,
                    ssn,
                    make,
                    model,
                    vehicle_plate_number,
                    year,
                    vehicle_color
                } = req.body
                console.log('req.body', req.body)

                var profile_photo;

                if (req.files.upload_profile_photo) {
                    profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
                } else {
                    profile_photo = '';
                }

                const finded = await signupDB.findOne({
                    _id: profile_id
                }).lean();
                //console.log("finded", finded)
                if (finded) {
                    const findProfile = await profileDB.findOne({
                        profile_id: profile_id,
                        type: type
                    }).lean();
                    //console.log("findProfile", findProfile)
                    if (findProfile) {
                        //return errorResponse(res, "User already exist with this type");
                        //-------------------------------------------
                        //console.log("type", type)
                        switch (type) {
                            case '1':
                                // console.log("1")
                                // console.log(req.files.upload_vehicle_registration[0].filename );
                                // console.log(req.files.upload_inssurance_card[0].filename);
                                // console.log(req.files.upload_driver_licence[0].filename);

                                //if (!(fullname && university_name && car_model && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && vehicle_color /*&& vehicle_plate_number*/ && req.files.upload_vehicle_registration[0].filename && req.files.upload_inssurance_card[0].filename /* && req.files.upload_driver_licence[0].filename*/)) {
                                // return errorResponse(res, 'Required All Fields')
                                //} else {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: fullname || '',
                                        university_name: university_name || '',
                                        student_id: student_id || '',
                                        university_address: university_address || '',
                                        mobile_no: mobile_no || '',
                                        //email: student_university_email.toLowerCase(),
                                        gender: gender || '',
                                        car_model: car_model || '',
                                        vehicle_color: vehicle_color || '',
                                        //vehicle_plate_number: vehicle_plate_number,
                                        destination_contact_number: destination_contact_number || '',
                                        type: type || '',
                                        gender_preferences: gender_preferences || '',
                                        rider_preference: rider_preference || '',
                                        phone_code: phone_code || '',
                                        phone_no: phone_no || '',
                                        profile_photo: profile_photo || '',
                                        backgroundPayStatus: 0,
                                        updated_date: Date.now()

                                    }
                                }
                                profileDB.updateOne({
                                    profile_id: profile_id,
                                    type: type
                                }, newvalues, (err, updateBasicInfo) => {

                                    if (err) {
                                        return errorResponse(res, 'Please Try Again')
                                    } else {
                                        if (updateBasicInfo) {
                                            const backgroundCheckExist = backgroudCheckDB.findOne({
                                                driver_id: profile_id
                                            }).lean();

                                            if (backgroundCheckExist) {
                                                backgroudCheckDB.deleteMany({
                                                    driver_id: profile_id
                                                }, (err, deletedDoc) => {
                                                    if (err) {
                                                        return errorResponse(res, 'Please Try Again')
                                                    } else {
                                                        if (deletedDoc) {
                                                            if (legal_middle_name) {
                                                                var middle_name = legal_middle_name;
                                                            } else {
                                                                var middle_name = "";
                                                            }
                                                            let backgroundCheck = new backgroudCheckDB();

                                                            backgroundCheck.driver_id = profile_id || '',
                                                                backgroundCheck.legal_first_name = legal_first_name || '',
                                                                backgroundCheck.legal_middle_name = middle_name || '',
                                                                backgroundCheck.legal_last_name = legal_last_name || '',
                                                                backgroundCheck.license_number = license_number || '',
                                                                backgroundCheck.license_state = license_state || '',
                                                                //backgroundCheck.vehicle_plate_number = vehicle_plate_number
                                                                backgroundCheck.zip_code = zip_code || '',
                                                                backgroundCheck.dob = dob || '',
                                                                backgroundCheck.ssn = ssn || '',
                                                                backgroundCheck.status = 1,
                                                                backgroundCheck.created_date = Date.now()

                                                            backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                if (err) {
                                                                    return errorResponse(res, 'Error')
                                                                } else {

                                                                    if (backgroundCheckDoc) {

                                                                        const vehicleInfoExist = vehicleInfosDB.findOne({
                                                                            driver_id: profile_id
                                                                        }).lean();

                                                                        if (vehicleInfoExist) {

                                                                            vehicleInfosDB.deleteMany({
                                                                                driver_id: profile_id
                                                                            }, (err, deletedDocFound) => {
                                                                                if (err) {
                                                                                    return errorResponse(res, 'Please Try Again')
                                                                                } else {
                                                                                    if (deletedDocFound) {
                                                                                        var driver_license;
                                                                                        if (req.files.upload_driver_licence[0]) {
                                                                                            driver_license = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename;
                                                                                        } else {
                                                                                            driver_license = ''
                                                                                        }
                                                                                        let vehicleInfo = new vehicleInfosDB();
                                                                                        vehicleInfo.driver_profile_id = findProfile._id || '',
                                                                                            vehicleInfo.driver_id = profile_id || '',
                                                                                            vehicleInfo.make = make || '',
                                                                                            vehicleInfo.model = model || '',
                                                                                            vehicleInfo.year = year || '',
                                                                                            vehicleInfo.vehicle_color = vehicle_color || '',
                                                                                            vehicleInfo.vehicle_plate_number = vehicle_plate_number || ''
                                                                                        vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename || '',
                                                                                            vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename || '',
                                                                                            vehicleInfo.upload_driver_licence = driver_license
                                                                                        vehicleInfo.status = 1,

                                                                                            vehicleInfo.created_date = Date.now()



                                                                                        vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                            console.log('basicInfo', vehicleInfo);
                                                                                            if (err) {
                                                                                                return errorResponse(res, 'Error')
                                                                                            } else {
                                                                                                //return success(res, 'Data Submitted Successfully')
                                                                                                if (vehicleCheckDoc) {
                                                                                                    return success(res, 'Data Updated Successfully')


                                                                                                }

                                                                                            }
                                                                                        })
                                                                                    }
                                                                                }
                                                                            });
                                                                        }


                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }

                                        }
                                        //return successWithData(res, 'Data Updated Successfully', doc);
                                    }
                                })



                                //}
                                break;
                            case '2':
                                //if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference)) {
                                //   return errorResponse(res, 'Required All Fields')
                                //} else {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: fullname,
                                        university_name: university_name,
                                        student_id: student_id,
                                        university_address: university_address,
                                        mobile_no: mobile_no,
                                        //email: student_university_email.toLowerCase(),
                                        gender: gender,
                                        destination_contact_number: destination_contact_number,
                                        type: type,
                                        gender_preferences: gender_preferences,
                                        rider_preference: rider_preference,
                                        profile_photo: profile_photo,
                                        backgroundPayStatus: 0,
                                        updated_date: Date.now()
                                    }
                                }


                                await profileDB.updateOne({
                                    profile_id: profile_id,
                                    type: type
                                }, newvalues, async (err, updateBasicInfo) => {

                                    if (err) {
                                        return errorResponse(res, 'Please Try Again')
                                    } else {
                                        if (updateBasicInfo.modifiedCount == 1) {
                                            return success(res, 'Data Updated Successfully')

                                        }
                                    }
                                })

                                // }
                                break;
                        }

                    } else {
                        if (findProfile == null) {
                            //console.log("type", type)
                            switch (type) {
                                case '1':
                                    // console.log("1")
                                    // console.log(req.files.upload_vehicle_registration[0].filename );
                                    // console.log(req.files.upload_inssurance_card[0].filename);
                                    // console.log(req.files.upload_driver_licence[0].filename);

                                    //if (!(fullname && university_name && car_model && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference && phone_code && phone_no && make && model && year && req.files.upload_vehicle_registration[0].filename && req.files.upload_inssurance_card[0].filename /*&& req.files.upload_driver_licence[0].filename*/)) {
                                    // return errorResponse(res, 'Required All Fields')
                                    //} else {

                                    let profileInf = new profileDB();

                                    profileInf.profile_id = profile_id,
                                        profileInf.fullname = fullname,
                                        profileInf.university_name = university_name,
                                        profileInf.student_id = student_id,
                                        profileInf.university_address = university_address,
                                        profileInf.mobile_no = mobile_no,
                                        //profileInfo.email = student_university_email.toLowerCase(),
                                        profileInf.gender = gender,
                                        profileInf.car_model = car_model,
                                        profileInf.vehicle_color = vehicle_color,
                                        profileInf.destination_contact_number = destination_contact_number,
                                        profileInf.type = type,
                                        profileInf.gender_preferences = gender_preferences,
                                        profileInf.rider_preference = rider_preference,
                                        profileInf.phone_code = phone_code,
                                        profileInf.phone_no = phone_no,
                                        profileInf.profile_photo = profile_photo,
                                        profileInf.rating = 0,
                                        profileInf.backgroundPayStatus = 0,
                                        profileInf.created_date = Date.now()
                                    await profileInf.save((err, basicInfo) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            if (basicInfo) {
                                                const backgroundCheckExist = backgroudCheckDB.findOne({
                                                    driver_id: profile_id
                                                }).lean();

                                                if (backgroundCheckExist) {
                                                    backgroudCheckDB.deleteMany({
                                                        driver_id: profile_id
                                                    }, (err, deletedDoc) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Please Try Again')
                                                        } else {
                                                            if (deletedDoc) {
                                                                if (legal_middle_name) {
                                                                    var middle_name = legal_middle_name;
                                                                } else {
                                                                    var middle_name = "";
                                                                }
                                                                let backgroundCheck = new backgroudCheckDB();

                                                                backgroundCheck.driver_id = profile_id,
                                                                    backgroundCheck.legal_first_name = legal_first_name,
                                                                    backgroundCheck.legal_middle_name = middle_name,
                                                                    backgroundCheck.legal_last_name = legal_last_name,
                                                                    backgroundCheck.license_number = license_number,
                                                                    backgroundCheck.license_state = license_state,
                                                                    backgroundCheck.zip_code = zip_code,
                                                                    backgroundCheck.dob = dob,
                                                                    backgroundCheck.ssn = ssn,
                                                                    backgroundCheck.status = 1,
                                                                    backgroundCheck.created_date = Date.now()

                                                                backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                    if (err) {
                                                                        return errorResponse(res, 'Error')
                                                                    } else {

                                                                        if (backgroundCheckDoc) {

                                                                            const vehicleInfoExist = vehicleInfosDB.findOne({
                                                                                driver_id: profile_id
                                                                            }).lean();

                                                                            if (vehicleInfoExist) {

                                                                                vehicleInfosDB.deleteMany({
                                                                                    driver_id: profile_id
                                                                                }, (err, deletedDocFound) => {
                                                                                    if (err) {
                                                                                        return errorResponse(res, 'Please Try Again')
                                                                                    } else {
                                                                                        if (deletedDocFound) {
                                                                                            var driver_license;
                                                                                            if (req.files.upload_driver_licence[0]) {
                                                                                                driver_license = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename;
                                                                                            } else {
                                                                                                driver_license = ''
                                                                                            }
                                                                                            let vehicleInfo = new vehicleInfosDB();

                                                                                            vehicleInfo.driver_id = profile_id,
                                                                                                vehicleInfo.make = make,
                                                                                                vehicleInfo.model = model,
                                                                                                vehicleInfo.year = year,
                                                                                                vehicleInfo.vehicle_color = vehicle_color,
                                                                                                vehicleInfo.vehicle_plate_number = vehicle_plate_number,
                                                                                                vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename,
                                                                                                vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename,
                                                                                                vehicleInfo.upload_driver_licence = driver_license,
                                                                                                vehicleInfo.status = 1,
                                                                                                vehicleInfo.created_date = Date.now()

                                                                                            vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                                if (err) {
                                                                                                    return errorResponse(res, 'Error')
                                                                                                } else {
                                                                                                    //return success(res, 'Data Submitted Successfully')
                                                                                                    if (vehicleCheckDoc) {
                                                                                                        const findCountOfProfile = await profileDB.find({
                                                                                                            profile_id: profile_id
                                                                                                        }).lean();
                                                                                                        //console.log("findCountOfProfile", findCountOfProfile.length)
                                                                                                        if (findCountOfProfile.length == 2) {
                                                                                                            var newvalues = {
                                                                                                                $set: {
                                                                                                                    role_id: 3,

                                                                                                                }
                                                                                                            }
                                                                                                            signupDB.updateOne({
                                                                                                                _id: profile_id
                                                                                                            }, newvalues, (err, updateRoleInfo) => {
                                                                                                                if (err) {
                                                                                                                    return errorResponse(res, 'Error while updating roles')
                                                                                                                } else {
                                                                                                                    return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                                                                                }
                                                                                                            })
                                                                                                        } else {
                                                                                                            var newvalues = {
                                                                                                                $set: {
                                                                                                                    role_id: type,

                                                                                                                }
                                                                                                            }
                                                                                                            signupDB.updateOne({
                                                                                                                _id: profile_id
                                                                                                            }, newvalues, (err, updateRoleInfo) => {
                                                                                                                if (err) {
                                                                                                                    return errorResponse(res, 'Error while updating roles')
                                                                                                                } else {
                                                                                                                    return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                                                                                }
                                                                                                            })
                                                                                                        }


                                                                                                    }

                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }


                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }

                                            }
                                            //return successWithData(res, 'Data Updated Successfully', doc);
                                        }
                                    })



                                    // }
                                    break;
                                case '2':
                                    // if (!(fullname && university_name && student_id && university_address && mobile_no && student_university_email && gender && destination_contact_number && type && gender_preferences && rider_preference)) {
                                    //     return errorResponse(res, 'Required All Fields')
                                    // } else {

                                    let profileInfor = new profileDB();

                                    profileInfor.profile_id = profile_id,
                                        profileInfor.fullname = fullname,
                                        profileInfor.university_name = university_name,
                                        profileInfor.student_id = student_id,
                                        profileInfor.university_address = university_address,
                                        profileInfor.mobile_no = mobile_no,
                                        //profileInfo.email = student_university_email.toLowerCase(),
                                        profileInfor.gender = gender,
                                        profileInfor.destination_contact_number = destination_contact_number,
                                        profileInfor.type = type,
                                        profileInfor.gender_preferences = gender_preferences,
                                        profileInfor.rider_preference = rider_preference,
                                        profileInfor.profile_photo = profile_photo,
                                        profileInfor.rating = 0,
                                        profileInfor.backgroundPayStatus = 0,
                                        profileInfor.created_date = Date.now()

                                    //console.log("profileInfo", profileInfo);

                                    await profileInfor.save(async (err, basicInfo) => {

                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            //return success(res, 'Data Updated Successfully');
                                            if (basicInfo) {

                                                const findCountOfProfile = await profileDB.find({
                                                    profile_id: profile_id
                                                }).lean();
                                                //console.log("findCountOfProfile", findCountOfProfile)
                                                if (findCountOfProfile.length == 2) {
                                                    var newvalues = {
                                                        $set: {
                                                            role_id: 3,

                                                        }
                                                    }
                                                    signupDB.updateOne({
                                                        _id: profile_id
                                                    }, newvalues, (err, updateRoleInfo) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Error while updating roles')
                                                        } else {
                                                            return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                        }
                                                    })
                                                } else {
                                                    var newvalues = {
                                                        $set: {
                                                            role_id: type,

                                                        }
                                                    }
                                                    signupDB.updateOne({
                                                        _id: profile_id
                                                    }, newvalues, (err, updateRoleInfo) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Error while updating roles')
                                                        } else {
                                                            if (updateRoleInfo) {
                                                                return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                            }

                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    })



                                    //}
                                    break;
                            }
                        }


                    }

                }
            }

        } catch (err) {
            console.log(err)
        }
    },

    //new api

    createProfileWithAuth: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    first_name,
                    last_name,
                    university_name,
                    student_id,
                    university_address,
                    mobile_no,
                    car_model,
                    student_university_email,
                    gender,
                    destination_contact_number,
                    type,
                    gender_preferences,
                    rider_preference,
                    phone_code,
                    phone_no,
                    legal_first_name,
                    legal_middle_name,
                    legal_last_name,
                    license_number,
                    license_state,
                    license_zipCode,
                    dob,
                    ssn,
                    car_make, 
                    vehicle_name,                   
                    vehicle_plate_number,
                    car_year,
                    car_color,                   
                    middle_name,           
                    house_number,
                    street_name,
                    address,
                    city,                    
                    state,
                    zipcode,                    
                    emergency_contact_no
                } = req.body
                console.log('req.body', req.body)

                var profile_photo;

                if (req.files.upload_profile_photo) {
                    profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
                } else {
                    profile_photo = '';
                }

                const finded = await signupDB.findOne({
                    _id: profile_id
                }).lean();
             
                if (finded) {
                    const findProfile = await profileDB.findOne({
                        profile_id: profile_id,
                        type: type
                    }).lean();
                 
                    if (findProfile) {

                        switch (type) {
                            case '1':
                                

                            if (!(student_university_email && req.files.upload_profile_photo && first_name && last_name && dob && mobile_no &&  street_name && city && state && zipcode && ssn && emergency_contact_no && gender  )) {
                                return errorResponse(res, 'Required All Fields')
                                } else {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: first_name + ' ' + last_name,
                                        first_name : first_name,
                                        last_name : last_name,
                                        student_university_email : student_university_email.toLowerCase(),
                                        university_name: university_name || findProfile.university_name,
                                        student_id: student_id || findProfile.student_id,
                                        university_address: university_address || findProfile.university_address,
                                        mobile_no: mobile_no,
                                        dob : dob,
                                        house_number : house_number || '',
                                        street_name : street_name,
                                        address : address || '',
                                        city : city,
                                        state : state,
                                        zipcode : zipcode,
                                        ssn : ssn,
                                        gender: gender ,
                                        car_model: car_model || findProfile.car_model,
                                        vehicle_color: car_color || findProfile.vehicle_color,
                                        //vehicle_plate_number: vehicle_plate_number,
                                        destination_contact_number: destination_contact_number || findProfile.destination_contact_number,
                                        type: type,
                                        gender_preferences: gender_preferences || findProfile.gender_preferences,
                                        rider_preference: rider_preference || findProfile.rider_preference,
                                        phone_code: phone_code || findProfile.phone_code,
                                        phone_no: phone_no || findProfile.phone_no,
                                        emergency_contact_no : emergency_contact_no || findProfile.emergency_contact_no,
                                        profile_photo: req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,                                       
                                        updated_date: Date.now(),


                                    }
                                }
                                profileDB.updateOne({
                                    profile_id: profile_id,
                                    type: type
                                }, newvalues, (err, updateBasicInfo) => {

                                    if (err) {
                                        return errorResponse(res, 'Please Try Again')
                                    } else {
                                        if (updateBasicInfo) {
                                            const backgroundCheckExist = backgroudCheckDB.findOne({
                                                driver_id: profile_id
                                            }).lean();

                                            if (backgroundCheckExist) {
                                                backgroudCheckDB.deleteMany({
                                                    driver_id: profile_id
                                                }, (err, deletedDoc) => {
                                                    if (err) {
                                                        return errorResponse(res, 'Please Try Again')
                                                    } else {
                                                        if (deletedDoc) {
                                                            
                                                            let backgroundCheck = new backgroudCheckDB();

                                                                backgroundCheck.driver_id = profile_id || '',
                                                                backgroundCheck.legal_first_name = legal_first_name || '',
                                                                backgroundCheck.legal_middle_name = middle_name || '',
                                                                backgroundCheck.legal_last_name = legal_last_name || '',
                                                                backgroundCheck.license_number = license_number || '',
                                                                backgroundCheck.license_state = license_state || '',
                                                                //backgroundCheck.vehicle_plate_number = vehicle_plate_number
                                                                backgroundCheck.license_zipCode = license_zipCode || '',
                                                                backgroundCheck.dob = dob ,
                                                                backgroundCheck.ssn = ssn ,
                                                                backgroundCheck.status = 1,
                                                                backgroundCheck.created_date = Date.now()

                                                            backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                if (err) {
                                                                    return errorResponse(res, 'Error')
                                                                } else {

                                                                    if (backgroundCheckDoc) {

                                                                        const vehicleInfoExist = vehicleInfosDB.findOne({
                                                                            driver_id: profile_id
                                                                        }).lean();

                                                                        if (vehicleInfoExist) {

                                                                            vehicleInfosDB.deleteMany({
                                                                                driver_id: profile_id
                                                                            }, (err, deletedDocFound) => {
                                                                                if (err) {
                                                                                    return errorResponse(res, 'Please Try Again')
                                                                                } else {
                                                                                    if (deletedDocFound) {
                                                                                        var driver_license;
                                                                                        if (!req.files.upload_driver_licence) {
                                                                                            driver_license = ''
                                                                                        } else {
                                                                                            
                                                                                            driver_license = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename;
                                                                                        }
                                                                                        let vehicleInfo = new vehicleInfosDB();
                                                                                        vehicleInfo.driver_profile_id = findProfile._id || '',
                                                                                            vehicleInfo.driver_id = profile_id || '',
                                                                                            vehicleInfo.car_make = car_make || '',
                                                                                            vehicleInfo.car_model = car_model || '',
                                                                                            vehicleInfo.car_year = car_year || '',
                                                                                            vehicleInfo.car_color = car_color || '',
                                                                                            vehicleInfo.vehicle_name = vehicle_name || '',
                                                                                            vehicleInfo.vehicle_plate_number = vehicle_plate_number || ''
                                                                                            vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration ? req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename : '',
                                                                                            vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card ? req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename : '',
                                                                                            vehicleInfo.upload_driver_licence = req.files.upload_driver_licence ? req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename : ''
                                                                                            vehicleInfo.status = 1,

                                                                                            vehicleInfo.created_date = Date.now()



                                                                                        vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                            console.log('basicInfo', vehicleInfo);
                                                                                            if (err) {
                                                                                                return errorResponse(res, 'Error')
                                                                                            } else {
                                                                                                //return success(res, 'Data Submitted Successfully')
                                                                                                if (vehicleCheckDoc) {
                                                                                                    return success(res, 'Data Updated Successfully')


                                                                                                }

                                                                                            }
                                                                                        })
                                                                                    }
                                                                                }
                                                                            });
                                                                        }


                                                                    }
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }

                                        }
                                        //return successWithData(res, 'Data Updated Successfully', doc);
                                    }
                                })

                                }
                                break;
                            case '2':
                                if (!(student_university_email && req.files.upload_profile_photo && first_name && last_name && dob && mobile_no && street_name && city && state && zipcode && ssn && emergency_contact_no && gender)) {
                                  return errorResponse(res, 'Required All Fields')
                                } else {
                                var newvalues = {
                                    $set: {
                                        profile_id: profile_id,
                                        fullname: first_name + ' ' + last_name,
                                        first_name : first_name,
                                        last_name : last_name,
                                        student_university_email : student_university_email.toLowerCase(),
                                        university_name: university_name || findProfile.university_name,
                                        student_id: student_id || findProfile.student_id,
                                        university_address: university_address || findProfile.university_address,
                                        mobile_no: mobile_no,
                                        dob : dob,
                                        house_number : house_number || '',
                                        street_name : street_name,
                                        address : address || '',
                                        city : city,
                                        state : state,
                                        zipcode : zipcode,
                                        ssn : ssn,
                                        gender: gender ,
                                        car_model: '',
                                        vehicle_color: '',
                                        //vehicle_plate_number: vehicle_plate_number,
                                        destination_contact_number: destination_contact_number || findProfile.destination_contact_number,
                                        type: type,
                                        gender_preferences: gender_preferences || findProfile.gender_preferences,
                                        rider_preference: rider_preference || findProfile.rider_preference,
                                        phone_code: phone_code || findProfile.phone_code,
                                        phone_no: phone_no || findProfile.phone_no,
                                        emergency_contact_no : emergency_contact_no || findProfile.emergency_contact_no,
                                        profile_photo: req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,                                       
                                        updated_date: Date.now(),
                                    }
                                }


                                await profileDB.updateOne({
                                    profile_id: profile_id,
                                    type: type
                                }, newvalues, async (err, updateBasicInfo) => {

                                    if (err) {
                                        return errorResponse(res, 'Please Try Again')
                                    } else {
                                        if (updateBasicInfo.modifiedCount == 1) {
                                            return success(res, 'Data Updated Successfully')

                                        }
                                    }
                                })

                                 }
                                break;
                        }

                    } else {
                        if (findProfile == null) {
                            //console.log("type", type)
                            switch (type) {
                                case '1':
                                    // console.log("1")
                                    // console.log(req.files.upload_vehicle_registration[0].filename );
                                    // console.log(req.files.upload_inssurance_card[0].filename);
                                    // console.log(req.files.upload_driver_licence[0].filename);

                                    if (!(student_university_email && req.files.upload_profile_photo && first_name && last_name && dob && mobile_no &&  street_name && city && state && zipcode && ssn && emergency_contact_no && gender )) {
                                    return errorResponse(res, 'Required All Fields')
                                    } else {

                                    let profileInf = new profileDB();

                                    profileInf.profile_id = profile_id,
                                    profileInf.fullname = first_name + ' ' + last_name,
                                    profileInf.uuid = '',
                                    profileInf.first_name  = first_name,
                                    profileInf.last_name  = last_name,
                                    profileInf.student_university_email  = student_university_email.toLowerCase(),
                                    profileInf.university_name = university_name || '',
                                    profileInf.student_id = student_id || '',
                                    profileInf.university_address = university_address || '',
                                    profileInf.mobile_no = mobile_no,
                                    profileInf.dob  = dob,
                                    profileInf.house_number  = house_number || '',
                                    profileInf.street_name  = street_name,
                                    profileInf.address  = address || '',
                                    profileInf.city  = city,
                                    profileInf.state  = state,
                                    profileInf.zipcode  = zipcode,
                                    profileInf.ssn  = ssn,
                                    profileInf.gender = gender ,
                                    profileInf.car_model = car_model || '',
                                    profileInf.vehicle_color = car_color || '',
                                    //vehicle_plate_number = vehicle_plate_number,
                                    profileInf.destination_contact_number = destination_contact_number || '',
                                    profileInf.type = type,
                                    profileInf.gender_preferences = gender_preferences || '',
                                    profileInf.rider_preference = rider_preference || '',
                                    profileInf.phone_code = phone_code || '',
                                    profileInf.phone_no = phone_no || '',
                                    profileInf.emergency_contact_no  = emergency_contact_no || '',
                                    profileInf.profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,                                       
                                    profileInf.rating = 0,
                                    profileInf.backgroundPayStatus = 0,
                                    profileInf.created_date = Date.now()
                                    profileInf.updated_date= Date.now(),

                                    await profileInf.save((err, basicInfo) => {
                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            if (basicInfo) {
                                                const backgroundCheckExist = backgroudCheckDB.findOne({
                                                    driver_id: profile_id
                                                }).lean();

                                                if (backgroundCheckExist) {
                                                    backgroudCheckDB.deleteMany({
                                                        driver_id: profile_id
                                                    }, (err, deletedDoc) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Please Try Again')
                                                        } else {
                                                            if (deletedDoc) {
                                                                if (legal_middle_name) {
                                                                    var middle_name = legal_middle_name;
                                                                } else {
                                                                    var middle_name = "";
                                                                }
                                                                let backgroundCheck = new backgroudCheckDB();

                                                                backgroundCheck.driver_id = profile_id || '',
                                                                backgroundCheck.legal_first_name = legal_first_name || '',
                                                                backgroundCheck.legal_middle_name = middle_name || '',
                                                                backgroundCheck.legal_last_name = legal_last_name || '',
                                                                backgroundCheck.license_number = license_number || '',
                                                                backgroundCheck.license_state = license_state || '',
                                                                //backgroundCheck.vehicle_plate_number = vehicle_plate_number
                                                                backgroundCheck.license_zipCode = license_zipCode || '',
                                                                backgroundCheck.dob = dob ,
                                                                backgroundCheck.ssn = ssn ,
                                                                backgroundCheck.status = 1,
                                                                backgroundCheck.created_date = Date.now()

                                                                backgroundCheck.save((err, backgroundCheckDoc) => {
                                                                    if (err) {
                                                                        return errorResponse(res, 'Error')
                                                                    } else {

                                                                        if (backgroundCheckDoc) {

                                                                            const vehicleInfoExist = vehicleInfosDB.findOne({
                                                                                driver_id: profile_id
                                                                            }).lean();

                                                                            if (vehicleInfoExist) {

                                                                                vehicleInfosDB.deleteMany({
                                                                                    driver_id: profile_id
                                                                                }, (err, deletedDocFound) => {
                                                                                    if (err) {
                                                                                        return errorResponse(res, 'Please Try Again')
                                                                                    } else {
                                                                                        if (deletedDocFound) {
                                                                                            var driver_license;
                                                                                            if (!req.files.upload_driver_licence) {
                                                                                                 driver_license = ''
                                                                                            } else {
                                                                                               
                                                                                                driver_license = req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename;
                                                                                            }
                                                                                            let vehicleInfo = new vehicleInfosDB();

                                                                                            vehicleInfo.driver_profile_id = basicInfo._id || '',
                                                                                            vehicleInfo.driver_id = profile_id || '',
                                                                                            vehicleInfo.car_make = car_make || '',
                                                                                            vehicleInfo.car_model = car_model || '',
                                                                                            vehicleInfo.car_year = car_year || '',
                                                                                            vehicleInfo.car_color = car_color || '',
                                                                                            vehicleInfo.vehicle_name = vehicle_name || '',
                                                                                            vehicleInfo.vehicle_plate_number = vehicle_plate_number || ''
                                                                                            vehicleInfo.upload_vehicle_registration = req.files.upload_vehicle_registration ? req.files.upload_vehicle_registration[0].destination + req.files.upload_vehicle_registration[0].filename : '',
                                                                                            vehicleInfo.upload_inssurance_card = req.files.upload_inssurance_card ? req.files.upload_inssurance_card[0].destination + req.files.upload_inssurance_card[0].filename : '',
                                                                                            vehicleInfo.upload_driver_licence = req.files.upload_driver_licence ? req.files.upload_driver_licence[0].destination + req.files.upload_driver_licence[0].filename : ''
                                                                        
                                                                                            vehicleInfo.status = 1,

                                                                                            vehicleInfo.created_date = Date.now()


                                                                                            vehicleInfo.save(async (err, vehicleCheckDoc) => {
                                                                                                if (err) {
                                                                                                    return errorResponse(res, 'Error')
                                                                                                } else {
                                                                                                    //return success(res, 'Data Submitted Successfully')
                                                                                                    if (vehicleCheckDoc) {
                                                                                                        const findCountOfProfile = await profileDB.find({
                                                                                                            profile_id: profile_id
                                                                                                        }).lean();
                                                                                                        //console.log("findCountOfProfile", findCountOfProfile.length)
                                                                                                        if (findCountOfProfile.length == 2) {
                                                                                                            var newvalues = {
                                                                                                                $set: {
                                                                                                                    role_id: 3,

                                                                                                                }
                                                                                                            }
                                                                                                            signupDB.updateOne({
                                                                                                                _id: profile_id
                                                                                                            }, newvalues, (err, updateRoleInfo) => {
                                                                                                                if (err) {
                                                                                                                    return errorResponse(res, 'Error while updating roles')
                                                                                                                } else {
                                                                                                                    return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                                                                                }
                                                                                                            })
                                                                                                        } else {
                                                                                                            var newvalues = {
                                                                                                                $set: {
                                                                                                                    role_id: type,

                                                                                                                }
                                                                                                            }
                                                                                                            signupDB.updateOne({
                                                                                                                _id: profile_id
                                                                                                            }, newvalues, (err, updateRoleInfo) => {
                                                                                                                if (err) {
                                                                                                                    return errorResponse(res, 'Error while updating roles')
                                                                                                                } else {
                                                                                                                    return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                                                                                }
                                                                                                            })
                                                                                                        }


                                                                                                    }

                                                                                                }
                                                                                            })
                                                                                        }
                                                                                    }
                                                                                });
                                                                            }


                                                                        }
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    })
                                                }

                                            }
                                            //return successWithData(res, 'Data Updated Successfully', doc);
                                        }
                                    })



                                     }
                                    break;
                                case '2':
                                    if (!(student_university_email && req.files.upload_profile_photo && first_name && last_name && dob && mobile_no &&  street_name && city && state && zipcode && ssn && emergency_contact_no && gender )) {
                                        return errorResponse(res, 'Required All Fields')
                                    } else {

                                    let profileInfor = new profileDB();

                                    profileInfor.profile_id = profile_id,
                                    profileInf.uuid = '',
                                    profileInfor.fullname = first_name + ' ' + last_name,
                                    profileInfor.first_name  = first_name,
                                    profileInfor.last_name  = last_name,
                                    profileInfor.student_university_email  = student_university_email.toLowerCase(),
                                    profileInfor.university_name = university_name || '',
                                    profileInfor.student_id = student_id || '',
                                    profileInfor.university_address = university_address || '',
                                    profileInfor.mobile_no = mobile_no,
                                    profileInfor.dob  = dob,
                                    profileInfor.house_number  = house_number || '',
                                    profileInfor.street_name  = street_name,
                                    profileInfor.address  = address || '',
                                    profileInfor.city  = city,
                                    profileInfor.state  = state,
                                    profileInfor.zipcode  = zipcode,
                                    profileInfor.ssn  = ssn,
                                    profileInfor.gender = gender ,
                                    profileInfor.car_model =  '',
                                    profileInfor.vehicle_color =  '',
                                    //vehicle_plate_number = vehicle_plate_number,
                                    profileInfor.destination_contact_number = destination_contact_number || '',
                                    profileInfor.type = type,
                                    profileInfor.gender_preferences = gender_preferences || '',
                                    profileInfor.rider_preference = rider_preference || '',
                                    profileInfor.phone_code = phone_code || '',
                                    profileInfor.phone_no = phone_no || '',
                                    profileInfor.emergency_contact_no  = emergency_contact_no || '',
                                    profileInfor.profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,                                       
                                    profileInfor.rating = 0,
                                    profileInfor.backgroundPayStatus = 0,
                                    profileInfor.created_date = Date.now()
                                    profileInfor.updated_date= Date.now(),


                                    //console.log("profileInfo", profileInfo);

                                    await profileInfor.save(async (err, basicInfo) => {

                                        if (err) {
                                            return errorResponse(res, 'Please Try Again')
                                        } else {
                                            //return success(res, 'Data Updated Successfully');
                                            if (basicInfo) {

                                                const findCountOfProfile = await profileDB.find({
                                                    profile_id: profile_id
                                                }).lean();
                                                //console.log("findCountOfProfile", findCountOfProfile)
                                                if (findCountOfProfile.length == 2) {
                                                    var newvalues = {
                                                        $set: {
                                                            role_id: 3,

                                                        }
                                                    }
                                                    signupDB.updateOne({
                                                        _id: profile_id
                                                    }, newvalues, (err, updateRoleInfo) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Error while updating roles')
                                                        } else {
                                                            return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)

                                                        }
                                                    })
                                                } else {
                                                    var newvalues = {
                                                        $set: {
                                                            role_id: type,

                                                        }
                                                    }
                                                    signupDB.updateOne({
                                                        _id: profile_id
                                                    }, newvalues, (err, updateRoleInfo) => {
                                                        if (err) {
                                                            return errorResponse(res, 'Error while updating roles')
                                                        } else {
                                                            if (updateRoleInfo) {
                                                                return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
                                                            }

                                                        }
                                                    })
                                                }
                                            }
                                        }
                                    })



                                    }
                                    break;
                            }
                        }


                    }

                }
            }

        } catch (err) {
            console.log(err)
        }
    },

    // createProfileWithAuth: async function (req, res) {
    //     try {
    //         const profile_id = await req.user.id;
    //         console.log('profile_id', profile_id)
    //         if (profile_id) {
    //             const {
    //                 type,
    //                 student_university_email,
    //                 first_name,
    //                 middle_name,
    //                 last_name,
    //                 dob,
    //                 mobile_number,
    //                 house_number,
    //                 street_name,
    //                 address,
    //                 city,
    //                 gender,
    //                 state,
    //                 zipcode,
    //                 ssn,
    //                 emergency_contact_no
    //             } = req.body
    //             console.log('req.body', req.body)


    //             const finded = await signupDB.findOne({
    //                 _id: profile_id
    //             }).lean();
    //             console.log("finded", finded)
    //             if (finded) {
    //                 const findProfile = await profileDB.findOne({
    //                     profile_id: profile_id,
    //                     type: type
    //                 }).lean();
    //                 //console.log("findProfile", findProfile)
    //                 if (findProfile && (!(findProfile.uuid))) {
    //                     switch (type) {
    //                         case '1':

    //                             if (!(student_university_email && req.files.upload_profile_photo && first_name && middle_name && last_name && dob && gender && mobile_number && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no)) {
    //                                 return errorResponse(res, 'Required All Fields')
    //                             } else {
    //                                 var newvalues = {
    //                                     $set: {
    //                                         fullname: first_name + middle_name + last_name,
    //                                         profile_id: profile_id,
    //                                         first_name: first_name,
    //                                         middle_name: middle_name,
    //                                         last_name: last_name,
    //                                         student_university_email: student_university_email,
    //                                         dob: dob,
    //                                         mobile_number: mobile_number,
    //                                         house_number: house_number,
    //                                         street_name: street_name,
    //                                         address: address,
    //                                         city: city,
    //                                         state: state,
    //                                         zipcode: zipcode,
    //                                         ssn: ssn,
    //                                         emergency_contact_no: emergency_contact_no,
    //                                         gender: gender,
    //                                         type: 1,
    //                                         profile_photo: req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                                         rating: 0,
    //                                         updated_date: Date.now()


    //                                     }
    //                                 }
    //                                 profileDB.updateOne({
    //                                     profile_id: profile_id,
    //                                     type: 1
    //                                 }, newvalues, async (err, updateBasicInfo) => {

    //                                     if (err) {
    //                                         return errorResponse(res, 'Please Try Again')
    //                                     } else {

    //                                         if (updateBasicInfo.nModified > 0) {
    //                                             // Update was successful
    //                                             console.log('Profile updated successfully');

    //                                             // Fetch the updated data from the database
    //                                             const basicInfo = await profileDB.findOne({
    //                                                 profile_id: profile_id,
    //                                                 type: 1
    //                                             });

    //                                             if (basicInfo) {
    //                                                 const userData = {
    //                                                     "firstName": basicInfo.first_name,
    //                                                     "middleName": basicInfo.middle_name,
    //                                                     "lastName": basicInfo.last_name,
    //                                                     "dob": basicInfo.dob,
    //                                                     "email": basicInfo.student_university_email,
    //                                                     "phone": basicInfo.mobile_number,
    //                                                     "houseNumber": basicInfo.house_number,
    //                                                     "streetName": basicInfo.street_name,
    //                                                     "address": basicInfo.address,
    //                                                     "city": basicInfo.city,
    //                                                     "state": basicInfo.state,
    //                                                     "zipCode": basicInfo.zipcode,
    //                                                     "ssn": basicInfo.ssn

    //                                                 }
    //                                                 await axios.post("https://api-v3.authenticating.com/mock/user/create", userData)
    //                                                     .then(async (response) => {
    //                                                         if (response.userAccessCode) {
    //                                                             await signupDB.findByIdAndUpdate({
    //                                                                 _id: basicInfo._id
    //                                                             }, {
    //                                                                 uuid: response.userAccessCode
    //                                                             }, { new: true }, async (err, doc) => {
    //                                                                 if (err) {
    //                                                                     return errorResponse(res, "Error whing finding data")
    //                                                                 } else {
    //                                                                     if (doc) {
    //                                                                         const data = {
    //                                                                             "userAccessCode": doc.uuid,
    //                                                                             "redirectURL": "https://www.authenticating.com",
    //                                                                         }
    //                                                                         await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                             .then(async (response) => {
    //                                                                                 if (response) {
    //                                                                                     return successWithData(res, "Data Found Successfully", data)
    //                                                                                 }
    //                                                                                 console.log('API Response:', response.userAccessCode);
    //                                                                             })
    //                                                                     }
    //                                                                 }
    //                                                             });
    //                                                         }
    //                                                         console.log('API Response:', response.userAccessCode);
    //                                                     })
    //                                                     .catch(error => {
    //                                                         console.error('Error:', error.message);
    //                                                     });
    //                                             }

    //                                             console.log('Updated Profile Data:', updatedProfile);
    //                                         } else {
    //                                             return errorResponse(res, 'Network Error While updating Data')
    //                                         }



    //                                         //return successWithData(res, 'Data Updated Successfully', doc);
    //                                     }
    //                                 })



    //                             }
    //                             break;
    //                         case '2':
    //                             if (!(student_university_email && req.files.upload_profile_photo && first_name && middle_name && last_name && dob && gender && mobile_number && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no)) {
    //                                 return errorResponse(res, 'Required All Fields')
    //                             } else {
    //                                 var newvalues = {
    //                                     $set: {
    //                                         fullname: first_name + middle_name + last_name,
    //                                         profile_id: profile_id,
    //                                         first_name: first_name,
    //                                         middle_name: middle_name,
    //                                         last_name: last_name,
    //                                         student_university_email: student_university_email,
    //                                         dob: dob,
    //                                         mobile_number: mobile_number,
    //                                         house_number: house_number,
    //                                         street_name: street_name,
    //                                         address: address,
    //                                         city: city,
    //                                         state: state,
    //                                         zipcode: zipcode,
    //                                         ssn: ssn,
    //                                         emergency_contact_no: emergency_contact_no,
    //                                         gender: gender,
    //                                         type: 2,
    //                                         profile_photo: req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                                         rating: 0,
    //                                         updated_date: Date.now()
    //                                     }
    //                                 }


    //                                 await profileDB.updateOne({
    //                                     profile_id: profile_id,
    //                                     type: 2
    //                                 }, newvalues, async (err, updateBasicInfo) => {

    //                                     if (err) {
    //                                         return errorResponse(res, 'Please Try Again')
    //                                     } else {

    //                                         if (updateBasicInfo.nModified > 0) {
    //                                             // Update was successful
    //                                             console.log('Profile updated successfully');

    //                                             // Fetch the updated data from the database
    //                                             const basicInfo = await profileDB.findOne({
    //                                                 profile_id: profile_id,
    //                                                 type: 1
    //                                             });

    //                                             if (basicInfo) {
    //                                                 const userData = {
    //                                                     "firstName": basicInfo.first_name,
    //                                                     "middleName": basicInfo.middle_name,
    //                                                     "lastName": basicInfo.last_name,
    //                                                     "dob": basicInfo.dob,
    //                                                     "email": basicInfo.student_university_email,
    //                                                     "phone": basicInfo.mobile_number,
    //                                                     "houseNumber": basicInfo.house_number,
    //                                                     "streetName": basicInfo.street_name,
    //                                                     "address": basicInfo.address,
    //                                                     "city": basicInfo.city,
    //                                                     "state": basicInfo.state,
    //                                                     "zipCode": basicInfo.zipcode,
    //                                                     "ssn": basicInfo.ssn

    //                                                 }
    //                                                 await axios.post("https://api-v3.authenticating.com/mock/user/create", userData)
    //                                                     .then(async (response) => {
    //                                                         if (response.userAccessCode) {
    //                                                             await signupDB.findByIdAndUpdate({
    //                                                                 _id: basicInfo._id
    //                                                             }, {
    //                                                                 uuid: response.userAccessCode
    //                                                             }, { new: true }, async (err, doc) => {
    //                                                                 if (err) {
    //                                                                     return errorResponse(res, "Error whing finding data")
    //                                                                 } else {
    //                                                                     if (doc) {
    //                                                                         const data = {
    //                                                                             "userAccessCode": doc.uuid,
    //                                                                             "redirectURL": "https://www.authenticating.com",
    //                                                                         }
    //                                                                         await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                             .then(async (response) => {
    //                                                                                 if (response) {
    //                                                                                     return successWithData(res, "Data Found Successfully", data)
    //                                                                                 }
    //                                                                                 console.log('API Response:', response.userAccessCode);
    //                                                                             })
    //                                                                     }
    //                                                                 }
    //                                                             });
    //                                                         }
    //                                                         console.log('API Response:', response.userAccessCode);
    //                                                     })
    //                                                     .catch(error => {
    //                                                         console.error('Error:', error.message);
    //                                                     });
    //                                             }

    //                                             console.log('Updated Profile Data:', updatedProfile);
    //                                         } else {
    //                                             return errorResponse(res, 'Network Error While updating Data')
    //                                         }
    //                                     }
    //                                 })

    //                             }
    //                             break;
    //                     }

    //                 } else {
    //                     if (findProfile == null) {
    //                         //console.log("type", type)
    //                         switch (type) {
    //                             case '1':


    //                                 if (!(student_university_email && req.files.upload_profile_photo && first_name && middle_name && last_name && dob && mobile_number && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no)) {
    //                                     return errorResponse(res, 'Required All Fields')
    //                                 } else {

    //                                     let profileInfo = new profileDB();

    //                                     profileInfo.profile_id = profile_id,
    //                                         profileInfo.fullname = first_name + middle_name + last_name,
    //                                         profileInfo.first_name = first_name,
    //                                         profileInfo.middle_name = middle_name,
    //                                         profileInfo.last_name = last_name,
    //                                         //profileInfo.university_name = university_name,
    //                                         //profileInfo.student_id = student_id,
    //                                         //profileInfo.university_address = university_address,
    //                                         profileInfo.mobile_no = mobile_number,
    //                                         profileInfo.student_university_email = student_university_email,
    //                                         profileInfo.dob = dob,
    //                                         //profileInfo.mobile_number = mobile_number,
    //                                         profileInfo.house_number = house_number,
    //                                         profileInfo.street_name = street_name,
    //                                         profileInfo.address = address,
    //                                         profileInfo.city = city,
    //                                         profileInfo.state = state,
    //                                         profileInfo.zipcode = zipcode,
    //                                         profileInfo.ssn = ssn,
    //                                         profileInfo.emergency_contact_no = emergency_contact_no,
    //                                         profileInfo.gender = gender,
    //                                         profileInfo.type = 1,
    //                                         profileInfo.profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                                         profileInfo.rating = 0,
    //                                         profileInfo.created_date = Date.now()
    //                                     await profileInfo.save(async (err, basicInfo) => {
    //                                         if (err) {
    //                                             return errorResponse(res, 'Please Try Again')
    //                                         } else {
    //                                             if (basicInfo) {
    //                                                 console.log("basicInfo", basicInfo)
    //                                                 const findCountOfProfile = await profileDB.find({
    //                                                     profile_id: profile_id
    //                                                 }).lean();
    //                                                 console.log("findCountOfProfile", findCountOfProfile.length)
    //                                                 if (findCountOfProfile.length == 2) {
    //                                                     var newvalues = {
    //                                                         $set: {
    //                                                             role_id: 3,

    //                                                         }
    //                                                     }
    //                                                     signupDB.findByIdAndUpdate({
    //                                                         _id: profile_id
    //                                                     }, newvalues, { new: true }, async (err, updateRoleInfo) => {
    //                                                         if (err) {
    //                                                             return errorResponse(res, 'Error while updating roles')
    //                                                         } else {
    //                                                             console.log("updateRoleInfo", updateRoleInfo)
    //                                                             if (updateRoleInfo) {
    //                                                                 const userData = {
    //                                                                     "firstName": basicInfo.first_name,
    //                                                                     "middleName": basicInfo.middle_name,
    //                                                                     "lastName": basicInfo.last_name,
    //                                                                     "dob": basicInfo.dob,
    //                                                                     "email": basicInfo.student_university_email,
    //                                                                     "phone": basicInfo.mobile_number,
    //                                                                     "houseNumber": Number(basicInfo.house_number),
    //                                                                     "streetName": basicInfo.street_name,
    //                                                                     "address": basicInfo.address,
    //                                                                     "city": basicInfo.city,
    //                                                                     "state": basicInfo.state,
    //                                                                     "zipCode": Number(basicInfo.zipcode),
    //                                                                     "ssn": basicInfo.ssn

    //                                                                 }
    //                                                                 const token = 'JVNGM6CUPJYDC5TONBWDA6K6PNXTIJLIEFAVK2J2GAZWK2BP';
    //                                                                 const apiUrl = 'https://api-v3.authenticating.com/user/create';
    //                                                                 // Headers
    //                                                                 const axiosConfig = {
    //                                                                     headers: {
    //                                                                       'Authorization': `Bearer ${token}`,
    //                                                                       'Content-Type': 'application/json', // Adjust the content type if necessary
    //                                                                     },
    //                                                                   };

    //                                                                   console.log("userData", userData)

    //                                                                 await axios.post(apiUrl, userData, axiosConfig)
    //                                                                     .then(async (response) => {
    //                                                                         console.log("response", response)
    //                                                                         if (response.userAccessCode) {
    //                                                                             await signupDB.findByIdAndUpdate({
    //                                                                                 _id: basicInfo._id
    //                                                                             }, {
    //                                                                                 uuid: response.userAccessCode
    //                                                                             }, { new: true }, async (err, doc) => {
    //                                                                                 if (err) {
    //                                                                                     return errorResponse(res, "Error whing finding data")
    //                                                                                 } else {
    //                                                                                     if (doc) {
    //                                                                                         console.log("doc", doc)
    //                                                                                         const data = {
    //                                                                                             "userAccessCode": doc.uuid,
    //                                                                                             "redirectURL": "https://www.authenticating.com",
    //                                                                                         }
    //                                                                                         await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                                             .then(async (response) => {
    //                                                                                                 console.log("response jwt", response)
    //                                                                                                 if (response) {
    //                                                                                                     return successWithData(res, "Data Found Successfully", data)
    //                                                                                                 }
    //                                                                                                 console.log('API Response:', response.userAccessCode);
    //                                                                                             })
    //                                                                                     }
    //                                                                                 }
    //                                                                             });
    //                                                                         }
    //                                                                         console.log('API Response:', response.userAccessCode);
    //                                                                     })
    //                                                                     .catch(error => {
    //                                                                         console.error('Error:', error.message);
    //                                                                     });
    //                                                             }

    //                                                         }
    //                                                     })
    //                                                 } else {
    //                                                     var newvalues = {
    //                                                         $set: {
    //                                                             role_id: 1,

    //                                                         }
    //                                                     }
    //                                                     signupDB.findByIdAndUpdate({
    //                                                         _id: profile_id
    //                                                     }, newvalues, { new: true }, async (err, updateRoleInfo) => {
    //                                                         if (err) {
    //                                                             return errorResponse(res, 'Error while updating roles')
    //                                                         } else {
    //                                                             if (updateRoleInfo) {
    //                                                                 const userData = {
    //                                                                     "firstName": basicInfo.first_name,
    //                                                                     "middleName": basicInfo.middle_name,
    //                                                                     "lastName": basicInfo.last_name,
    //                                                                     "dob": basicInfo.dob,
    //                                                                     "email": basicInfo.student_university_email,
    //                                                                     "phone": basicInfo.mobile_number,
    //                                                                     "houseNumber": Number(basicInfo.house_number),
    //                                                                     "streetName": basicInfo.street_name,
    //                                                                     "address": basicInfo.address,
    //                                                                     "city": basicInfo.city,
    //                                                                     "state": basicInfo.state,
    //                                                                     "zipCode": Number(basicInfo.zipcode),
    //                                                                     "ssn": basicInfo.ssn

    //                                                                 }

    //                                                                 // Headers
    //                                                                 const headers = {
    //                                                                     'Authorization': 'Bearer JVNGM6CUPJYDC5TONBWDA6K6PNXTIJLIEFAVK2J2GAZWK2BP', // Replace with your access token
    //                                                                     'Content-Type': 'application/json',
    //                                                                     'Accept' : 'application/json'
    //                                                                 };
    //                                                                 await axios.post("https://api-v3.authenticating.com/user/create", {Headers:headers},userData)
    //                                                                     .then(async (response) => {
    //                                                                         if (response.userAccessCode) {
    //                                                                             await signupDB.findByIdAndUpdate({
    //                                                                                 _id: basicInfo._id
    //                                                                             }, {
    //                                                                                 uuid: response.userAccessCode
    //                                                                             }, { new: true }, async (err, doc) => {
    //                                                                                 if (err) {
    //                                                                                     return errorResponse(res, "Error whing finding data")
    //                                                                                 } else {
    //                                                                                     if (doc) {
    //                                                                                         const data = {
    //                                                                                             "userAccessCode": doc.uuid,
    //                                                                                             "redirectURL": "https://www.authenticating.com",
    //                                                                                         }
    //                                                                                         await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                                             .then(async (response) => {
    //                                                                                                 if (response) {
    //                                                                                                     return successWithData(res, "Data Found Successfully", data)
    //                                                                                                 }
    //                                                                                                 console.log('API Response:', response.userAccessCode);
    //                                                                                             })
    //                                                                                     }
    //                                                                                 }
    //                                                                             });
    //                                                                         }
    //                                                                         console.log('API Response:', response.userAccessCode);
    //                                                                     })
    //                                                                     .catch(error => {
    //                                                                         console.error('Error:', error.message);
    //                                                                     });
    //                                                             }

    //                                                         }
    //                                                     })
    //                                                 }

    //                                             }
    //                                             //return successWithData(res, 'Data Updated Successfully', doc);
    //                                         }
    //                                     })



    //                                 }
    //                                 break;
    //                             case '2':
    //                                 if (!(student_university_email && req.files.upload_profile_photo && first_name && middle_name && last_name && dob && mobile_number && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no)) {
    //                                     return errorResponse(res, 'Required All Fields')
    //                                 } else {

    //                                     let profileInfo = new profileDB();


    //                                     profileInfo.profile_id = profile_id,
    //                                         profileInfo.fullname = first_name + middle_name + last_name,
    //                                         profileInfo.first_name = first_name,
    //                                         profileInfo.middle_name = middle_name,
    //                                         profileInfo.last_name = last_name,
    //                                         //profileInfo.university_name = university_name,
    //                                         //profileInfo.student_id = student_id,
    //                                         //profileInfo.university_address = university_address,
    //                                         profileInfo.mobile_no = mobile_number,
    //                                         profileInfo.student_university_email = student_university_email,
    //                                         profileInfo.dob = dob,
    //                                         //profileInfo.mobile_number = mobile_number,
    //                                         profileInfo.house_number = house_number,
    //                                         profileInfo.street_name = street_name,
    //                                         profileInfo.address = address,
    //                                         profileInfo.city = city,
    //                                         profileInfo.state = state,
    //                                         profileInfo.zipcode = zipcode,
    //                                         profileInfo.ssn = ssn,
    //                                         profileInfo.emergency_contact_no = emergency_contact_no,
    //                                         profileInfo.gender = gender,
    //                                         profileInfo.type = 2,
    //                                         profileInfo.profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                                         profileInfo.rating = 0,
    //                                         profileInfo.created_date = Date.now()
    //                                     //console.log("profileInfo", profileInfo);

    //                                     await profileInfo.save(async (err, basicInfo) => {

    //                                         if (err) {
    //                                             return errorResponse(res, 'Please Try Again')
    //                                         } else {
    //                                             //return success(res, 'Data Updated Successfully');
    //                                             if (basicInfo) {

    //                                                 const findCountOfProfile = await profileDB.find({
    //                                                     profile_id: profile_id
    //                                                 }).lean();
    //                                                 //console.log("findCountOfProfile", findCountOfProfile)
    //                                                 if (findCountOfProfile.length == 2) {
    //                                                     var newvalues = {
    //                                                         $set: {
    //                                                             role_id: 3,

    //                                                         }
    //                                                     }
    //                                                     signupDB.findByIdAndUpdate({
    //                                                         _id: profile_id
    //                                                     }, newvalues, { new: true }, async (err, updateRoleInfo) => {
    //                                                         if (err) {
    //                                                             return errorResponse(res, 'Error while updating roles')
    //                                                         } else {
    //                                                             if (updateRoleInfo) {
    //                                                                 const userData = {
    //                                                                     "firstName": basicInfo.first_name,
    //                                                                     "middleName": basicInfo.middle_name,
    //                                                                     "lastName": basicInfo.last_name,
    //                                                                     "dob": basicInfo.dob,
    //                                                                     "email": basicInfo.student_university_email,
    //                                                                     "phone": basicInfo.mobile_number,
    //                                                                     "houseNumber": Number(basicInfo.house_number),
    //                                                                     "streetName": basicInfo.street_name,
    //                                                                     "address": basicInfo.address,
    //                                                                     "city": basicInfo.city,
    //                                                                     "state": basicInfo.state,
    //                                                                     "zipCode": Number(basicInfo.zipcode),
    //                                                                     "ssn": basicInfo.ssn

    //                                                                 }
    //                                                                 await axios.post("https://api-v3.authenticating.com/user/create", userData)
    //                                                                     .then(async (response) => {
    //                                                                         if (response.userAccessCode) {
    //                                                                             await signupDB.findByIdAndUpdate({
    //                                                                                 _id: basicInfo._id
    //                                                                             }, {
    //                                                                                 uuid: response.userAccessCode
    //                                                                             }, { new: true }, async (err, doc) => {
    //                                                                                 if (err) {
    //                                                                                     return errorResponse(res, "Error whing finding data")
    //                                                                                 } else {
    //                                                                                     if (doc) {
    //                                                                                         const data = {
    //                                                                                             "userAccessCode": doc.uuid,
    //                                                                                             "redirectURL": "https://www.authenticating.com",
    //                                                                                         }
    //                                                                                         await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                                             .then(async (response) => {
    //                                                                                                 if (response) {
    //                                                                                                     return successWithData(res, "Data Found Successfully", data)
    //                                                                                                 }
    //                                                                                                 console.log('API Response:', response.userAccessCode);
    //                                                                                             })
    //                                                                                     }
    //                                                                                 }
    //                                                                             });
    //                                                                         }
    //                                                                         console.log('API Response:', response.userAccessCode);
    //                                                                     })
    //                                                                     .catch(error => {
    //                                                                         console.error('Error:', error.message);
    //                                                                     });
    //                                                             }

    //                                                         }
    //                                                     })
    //                                                 } else {
    //                                                     var newvalues = {
    //                                                         $set: {
    //                                                             role_id: type,

    //                                                         }
    //                                                     }
    //                                                     signupDB.findByIdAndUpdate({
    //                                                         _id: profile_id
    //                                                     }, newvalues, { new: true }, async (err, updateRoleInfo) => {
    //                                                         if (err) {
    //                                                             return errorResponse(res, 'Error while updating roles')
    //                                                         } else {
    //                                                             if (updateRoleInfo) {
    //                                                                 if (updateRoleInfo) {
    //                                                                     const userData = {
    //                                                                         "firstName": basicInfo.first_name,
    //                                                                         "middleName": basicInfo.middle_name,
    //                                                                         "lastName": basicInfo.last_name,
    //                                                                         "dob": basicInfo.dob,
    //                                                                         "email": basicInfo.student_university_email,
    //                                                                         "phone": basicInfo.mobile_number,
    //                                                                         "houseNumber": Number(basicInfo.house_number),
    //                                                                         "streetName": basicInfo.street_name,
    //                                                                         "address": basicInfo.address,
    //                                                                         "city": basicInfo.city,
    //                                                                         "state": basicInfo.state,
    //                                                                         "zipCode": Number(basicInfo.zipcode),
    //                                                                         "ssn": basicInfo.ssn


    //                                                                     }
    //                                                                     await axios.post("https://api-v3.authenticating.com/user/create", userData)
    //                                                                         .then(async (response) => {
    //                                                                             if (response.userAccessCode) {
    //                                                                                 await signupDB.findByIdAndUpdate({
    //                                                                                     _id: basicInfo._id
    //                                                                                 }, {
    //                                                                                     uuid: response.userAccessCode
    //                                                                                 }, { new: true }, async (err, doc) => {
    //                                                                                     if (err) {
    //                                                                                         return errorResponse(res, "Error whing finding data")
    //                                                                                     } else {
    //                                                                                         if (doc) {
    //                                                                                             const data = {
    //                                                                                                 "userAccessCode": doc.uuid,
    //                                                                                                 "redirectURL": "https://www.authenticating.com",
    //                                                                                             }
    //                                                                                             await axios.post(" https://api-v3.authenticating.com/user/jwt", data)
    //                                                                                                 .then(async (response) => {
    //                                                                                                     if (response) {
    //                                                                                                         return successWithData(res, "Data Found Successfully", data)
    //                                                                                                     }
    //                                                                                                     console.log('API Response:', response.userAccessCode);
    //                                                                                                 })
    //                                                                                         }
    //                                                                                     }
    //                                                                                 });
    //                                                                             }
    //                                                                             console.log('API Response:', response.userAccessCode);
    //                                                                         })
    //                                                                         .catch(error => {
    //                                                                             console.error('Error:', error.message);
    //                                                                         });
    //                                                                 }
    //                                                             }

    //                                                         }
    //                                                     })
    //                                                 }
    //                                             }
    //                                         }
    //                                     })



    //                                 }
    //                                 break;
    //                         }
    //                     }


    //                 }

    //             }
    //         }

    //     } catch (err) {
    //         console.log(err)
    //     }
    // },

    // createProfileWithAuth: async function (req, res) {
    //     try {
    //         const profile_id = await req.user.id;
    //         console.log('profile_id', profile_id)
    //         if (profile_id) {
    //             const {
    //                 type,
    //                 student_university_email,
    //                 first_name,
    //                 middle_name,
    //                 last_name,
    //                 dob,
    //                 mobile_number,
    //                 house_number,
    //                 street_name,
    //                 address,
    //                 city,
    //                 gender,
    //                 state,
    //                 zipcode,
    //                 ssn,
    //                 emergency_contact_no
    //             } = req.body
    //             console.log('req.body', req.body)

    //             //find user if exist    
    //             const finded = await signupDB.findOne({ _id: profile_id }).lean();
    //             console.log("finded", finded)
    //             if (finded) {
    //                 const findProfile = await profileDB.findOne({ profile_id: profile_id, type: type }).lean();
    //                 console.log("findProfile", findProfile)
    //                 if (findProfile == null) {

    //                     if (!(student_university_email && req.files.upload_profile_photo && first_name && last_name && dob && mobile_no && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no && gender)) {
    //                         return errorResponse(res, 'Required All Fields')
    //                     } else {

    //                         let profileInfo = new profileDB();

    //                         profileInfo.profile_id = profile_id,
    //                             profileInfo.fullname = first_name + " " + middle_name + " " + last_name,
    //                             profileInfo.first_name = first_name,
    //                             profileInfo.middle_name = middle_name,
    //                             profileInfo.last_name = last_name,
    //                             profileInfo.mobile_no = mobile_number,
    //                             profileInfo.student_university_email = student_university_email,
    //                             profileInfo.dob = dob,
    //                             profileInfo.house_number = house_number,
    //                             profileInfo.street_name = street_name,
    //                             profileInfo.address = address,
    //                             profileInfo.city = city,
    //                             profileInfo.state = state,
    //                             profileInfo.zipcode = zipcode,
    //                             profileInfo.ssn = ssn,
    //                             profileInfo.vehicle_color = vehicle_color,
    //                             profileInfo.emergency_contact_no = emergency_contact_no,
    //                             profileInfo.gender = gender,
    //                             profileInfo.uuid = "",
    //                             profileInfo.type = type,
    //                             profileInfo.profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                             profileInfo.rating = 0,
    //                             profileInfo.created_date = Date.now()
    //                         console.log("profileInfo", profileInfo)
    //                         await profileInfo.save(async (err, basicInfo) => {
    //                             if (err) {
    //                                 return errorResponse(res, 'Please Try Again')
    //                             } else {
    //                                 if (basicInfo) {
    //                                     console.log("basicInfo", basicInfo)
    //                                     const findCountOfProfile = await profileDB.find({
    //                                         profile_id: profile_id
    //                                     }).lean();
    //                                     console.log("findCountOfProfile", findCountOfProfile.length)

    //                                     if (findCountOfProfile.length == 2) {
    //                                         const updatedUser = await signupDB.findByIdAndUpdate(
    //                                             { _id: profile_id },
    //                                             { $set: { role_id: 3 } },
    //                                             { new: true }
    //                                         );

    //                                         if (!updatedUser) {
    //                                             return errorResponse(res, 'User not found');
    //                                         } else {
    //                                             return successWithData(res, 'Profile Created Successfully', updatedUser);
    //                                         }

    //                                     } else {
    //                                         // length is 1/0                                                                
    //                                         // Update the user's role
    //                                         const updatedUser = await signupDB.findByIdAndUpdate(
    //                                             { _id: profile_id },
    //                                             { $set: { role_id: type } },
    //                                             { new: true }
    //                                         );

    //                                         if (!updatedUser) {
    //                                             return errorResponse(res, 'User not found');
    //                                         } else {
    //                                             return successWithData(res, 'Profile Created Successfully', updatedUser);
    //                                         }

    //                                     }


    //                                 }
    //                             }
    //                         })


    //                     }
    //                 } else {
    //                     // if findProfile is not null  

    //                     if (!(student_university_email && req.files.upload_profile_photo && first_name && middle_name && last_name && dob && mobile_number && house_number && street_name && address && city && state && zipcode && ssn && emergency_contact_no)) {
    //                         return errorResponse(res, 'Required All Fields')
    //                     } else {

    //                         const newvalues = {

    //                             fullname: first_name + " " + middle_name + " " + last_name,
    //                             first_name: first_name,
    //                             middle_name: middle_name,
    //                             last_name: last_name,
    //                             mobile_no: mobile_number,
    //                             student_university_email: student_university_email,
    //                             dob: dob,
    //                             house_number: house_number,
    //                             street_name: street_name,
    //                             address: address,
    //                             city: city,
    //                             state: state,
    //                             zipcode: zipcode,
    //                             ssn: ssn,
    //                             emergency_contact_no: emergency_contact_no,
    //                             gender: gender,
    //                             profile_photo: req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename,
    //                             updated_date: Date.now()

    //                         }

    //                         const updateData = await profileDB.findByIdAndUpdate({ _id: findProfile._id }, newvalues, { new: true })

    //                         if (updateData) {
    //                             return successWithData(res, 'Profile Updated Successfully', updateData);
    //                         }

    //                     }
    //                 }

    //             }
    //         }

    //         // const profile_id = await req.user.id;
    //         // console.log('profile_id', profile_id)
    //         // const token = 'JVNGM6CUPJYDC5TONBWDA6K6PNXTIJLIEFAVK2J2GAZWK2BP';
    //         // const apiUrl = 'https://api-v3.authenticating.com/user/create';


    //         // const userData = {
    //         //     "firstName": "erw",
    //         //     "middleName": "R",
    //         //     "lastName": "rtery",
    //         //     "dob": "16-05-1991",
    //         //     "email": "lezli04@lezli.edu",
    //         //     "phone": "+919096856546",
    //         //     "houseNumber": 500,
    //         //     "streetName": "170, 9th ST",
    //         //     "address": "170, 9th ST, APT 12111",
    //         //     "city": "Santa Monica",
    //         //     "state": "CA",
    //         //     "zipCode": 90411,
    //         //     "ssn": "123457799"
    //         //   }
    //         // // Headers
    //         // const axiosConfig = {
    //         //     headers: {
    //         //         'Authorization': `Bearer ${token}`,
    //         //         'Content-Type': 'application/json', // Adjust the content type if necessary
    //         //     },
    //         //     };

    //         //     console.log("userData", userData)

    //         // await axios.post(apiUrl, {
    //         //     "firstName": "erw",
    //         //     "middleName": "R",
    //         //     "lastName": "rtery",
    //         //     "dob": "16-05-1991",
    //         //     "email": "lezli04@lezli.edu",
    //         //     "phone": "+919096856546",
    //         //     "houseNumber": 500,
    //         //     "streetName": "170, 9th ST",
    //         //     "address": "170, 9th ST, APT 12111",
    //         //     "city": "Santa Monica",
    //         //     "state": "CA",
    //         //     "zipCode": 90411,
    //         //     "ssn": "123457799"
    //         //   }, axiosConfig)
    //         //     .then(async (response) => { 
    //         //         console.log("response", response)
    //         //     })

    //     } catch (err) {
    //         console.log(err)
    //     }
    // },
    getUserSummary: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            console.log('profile_id', profile_id)
            if (profile_id) {
                const { type } = req.body;
                if (!(type)) {
                    return errorResponse(res, 'Required All Fields')
                } else {
                    const findUuid = await profileDB.findOne({ profile_id: profile_id, type: type })

                    console.log("findUuid", findUuid)

                    if (!(findUuid.uuid)) {
                        return errorResponse(res, 'userAccessCode is empty.Background verification is incomplete.')
                    }

                    const axiosConfig = {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    };

                    const data = {
                        userAccessCode: findUuid.uuid
                    }
                    // Sending the POST request
                    axios.post("https://api-v3.authenticating.com/user/summary", data, axiosConfig)
                        .then(response => {
                            return successWithData(res, "Data found successfully", response.data)
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }

            }



        } catch (err) {
            console.log(err);
        }
    },


    createPayment: async function (req, res) {
        try {
            // Payment data to send in the request
            const { type, card_number, expiration_month, expiration_year, cvv, payment_type, payment_method, final_price } = req.body;

            switch (payment_type) {
                case 'authPayment':
                    if (!(type && card_number && expiration_month && expiration_year && cvv && payment_method)) {
                        return errorResponse(res, 'Required All Fields')
                    } else {
                        const paymentData = {
                            source: {
                                method: 'card',
                                card: {
                                    number: '4111111111111111',
                                    expiration_month: '12',
                                    expiration_year: '2023',
                                    cvv: '123',
                                },
                            },
                            amount: 100.00,
                            currency: 'USD',
                            // ...other payment data
                        };

                        // Headers
                        const headers = {
                            'Authorization': 'Bearer bA0.zvjMcnDmuQbQIF70JqQVMzuOpYxYAug3', // Replace with your access token
                            'Content-Type': 'application/json',
                        };

                        // Sending the POST request
                        axios.post(apiUrl, paymentData, { headers })
                            .then(response => {
                                console.log('Payment created successfully:', response);
                            })
                            .catch(error => {
                                console.error('Error creating payment:', error);
                            });
                    }
                    break;

                case 'finalPayment':
                    if (!(type && card_number && expiration_month && expiration_year && cvv && final_price && payment_method)) {
                        return errorResponse(res, 'Required All Fields')
                    } else {
                        const paymentData = {
                            source: {
                                method: payment_method,
                                card: {
                                    number: card_number,
                                    expiration_month: expiration_month,
                                    expiration_year: expiration_year,
                                    cvv: cvv,
                                },
                            },
                            amount: final_price,
                            currency: 'USD',
                            // ...other payment data
                        };

                        // Headers
                        const headers = {
                            'Authorization': 'Bearer bA0.zvjMcnDmuQbQIF70JqQVMzuOpYxYAug3', // Replace with your access token
                            'Content-Type': 'application/json',
                        };

                        // Sending the POST request
                        axios.post(apiUrl, paymentData, { headers })
                            .then(response => {
                                console.log('Payment created successfully:', response);
                            })
                            .catch(error => {
                                console.error('Error creating payment:', error);
                            });
                    }
                    break;

            }


        } catch (err) {
            console.log(err);
        }
    },
    savePaymentMethod: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    payment_type,
                    card_no,
                    name_on_card,
                    expiration_date,
                    cvv
                } = req.body

                switch (payment_type) {
                    case 'mastercard':
                        if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                            return errorResponse(res, 'Required All Fields')
                        } else {
                            let paymentMethod = new paymentMethodDB();

                            paymentMethod.user_id = profile_id,
                                paymentMethod.payment_type = payment_type,
                                paymentMethod.card_no = card_no,
                                paymentMethod.name_on_card = name_on_card,
                                paymentMethod.expiration_date = expiration_date,
                                paymentMethod.cvv = cvv,
                                paymentMethod.status = 1

                            paymentMethod.save((err, paymentmethodDoc) => {
                                if (err) {
                                    return errorResponse(res, 'Error')
                                } else {
                                    return success(res, 'Payment Method Added Successfully');
                                }

                            });
                        }
                        break;

                    case 'visa':
                        if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                            return errorResponse(res, 'Required All Fields')
                        } else {
                            let paymentMethod = new paymentMethodDB();

                            paymentMethod.user_id = profile_id,
                                paymentMethod.payment_type = payment_type,
                                paymentMethod.card_no = card_no,
                                paymentMethod.name_on_card = name_on_card,
                                paymentMethod.expiration_date = expiration_date,
                                paymentMethod.cvv = cvv,
                                paymentMethod.status = 1

                            paymentMethod.save((err, paymentmethodDoc) => {
                                if (err) {
                                    return errorResponse(res, 'Error')
                                } else {
                                    return success(res, 'Payment Method Added Successfully');
                                }

                            });
                        }
                        break;

                }



            }
        } catch (err) {
            console.log(err);
        }
    },


    savePaymentMethod1234: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const {
                    payment_type,
                    card_no,
                    name_on_card,
                    expiration_date,
                    cvv
                } = req.body

                switch (payment_type) {
                    case 'mastercard':
                        if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                            return errorResponse(res, 'Required All Fields')
                        } else {
                            //var paymentMethod = new paymentMethodDB();
                            const card_token = await stripe.paymentMethodDB.create({

                                user_id: profile_id,
                                payment_type: payment_type,
                                card_no: card_no,
                                name_on_card: name_on_card,
                                expiration_date: expiration_date,
                                cvv: cvv,
                                status: 1


                            })
                            const card = await stripe.profiles.createSource(user_id, {
                                source: `${card_token.id}`
                            })
                            res.status(200).send({
                                card: card.id
                            });

                            // paymentMethod.save((err, paymentmethodDoc) => {
                            //     if (err) {
                            //         return errorResponse(res, 'Error')
                            //     } else {
                            //         return success(res, 'Payment Method Added Successfully');
                            //     }

                            // });
                        }
                        break;

                    case 'visa':
                        if (!(payment_type && card_no && name_on_card && expiration_date && cvv)) {
                            return errorResponse(res, 'Required All Fields')
                        } else {
                            let paymentMethod = new paymentMethodDB();

                            paymentMethod.user_id = profile_id,
                                paymentMethod.payment_type = payment_type,
                                paymentMethod.card_no = card_no,
                                paymentMethod.name_on_card = name_on_card,
                                paymentMethod.expiration_date = expiration_date,
                                paymentMethod.cvv = cvv,
                                paymentMethod.status = 1

                            paymentMethod.save((err, paymentmethodDoc) => {
                                if (err) {
                                    return errorResponse(res, 'Error')
                                } else {
                                    return success(res, 'Payment Method Added Successfully');
                                }

                            });
                        }
                        break;

                }



            }
        } catch (err) {
            console.log(err);
        }
    },

    createStripePayment: async function (req, res) {

        try {
            const profile_id = await req.user.id;
            console.log('profile_id', profile_id)
            if (profile_id) {
                try {
                    const { payment_type, type, amount, currency, source } = req.body;

                    if (!(payment_type)) {
                        return errorResponse(res, "payment_type Field is Required")
                    } else {
                        if (payment_type == 'auth_payment') {

                            if (!(type) && !(amount) && !(currency) && !(source)) {
                                return errorResponse(res, "type, amount, currency, source Fields are Required")
                            } else {
                                // Create a payment intent with the Stripe API
                                const paymentIntent = await stripe.paymentIntents.create({
                                    amount: amount,
                                    currency: currency,
                                    payment_method_types: ['card'],
                                    payment_method: source,
                                });

                                // Confirm the payment intent
                                const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id);


                                // Handle the payment confirmation
                                if (confirmedPayment.status === 'succeeded') {
                                    const findUser = await profileDB.findOne({ profile_id: profile_id, type: type })

                                    const userData = {
                                        "firstName": findUser.first_name,
                                        "middleName": findUser.middle_name,
                                        "lastName": findUser.last_name,
                                        "dob": findUser.dob,
                                        "email": findUser.student_university_email,
                                        "phone": findUser.mobile_no,
                                        "houseNumber": Number(findUser.house_number),
                                        "streetName": findUser.street_name,
                                        "address": findUser.address,
                                        "city": findUser.city,
                                        "state": findUser.state,
                                        "zipCode": Number(findUser.zipcode),
                                        "ssn": findUser.ssn

                                    }

                                    const axiosConfig = {
                                        headers: {
                                            'Authorization': `Bearer ${token}`,
                                            'Content-Type': 'application/json',
                                        },
                                    };

                                    const response1 = await axios.post('https://api-v3.authenticating.com/user/create', userData, axiosConfig);
                                    console.log("response1", response1)

                                    const updatedUuid = profileDB.findByIdAndUpdate(
                                        { _id: findUser._id },
                                        {
                                            $set: {
                                                uuid: response1.data.userAccessCode,
                                                backgroundPayStatus: 1
                                            }
                                        },
                                        { new: true }
                                    );

                                    if (updatedUuid) {

                                        const response2 = await axios.post('https://api-v3.authenticating.com/user/jwt', {
                                            userAccessCode: response1.data.userAccessCode,
                                            redirectURL: 'https://www.authenticating.com',
                                        }, axiosConfig);

                                        const data = {
                                            token: response2.data.token,
                                            jwt: response2.data.jwt,
                                            redirectURL: 'https://www.authenticating.com',
                                            payment: confirmedPayment.status
                                        }

                                        return successWithData(res, 'Data Found Successfully', data);

                                    }
                                } else {
                                    return errorResponse(res, "Payment failed!")

                                }
                            }

                        } else {
                            if (!(type) && !(amount) && !(currency) && !(source)) {
                                return errorResponse(res, "type, amount, currency, source Fields are Required")
                            } else {
                                const finalPaymentIntent = await stripe.paymentIntents.create({
                                    amount: amount,
                                    currency: currency,
                                    payment_method_types: ['card'],
                                    payment_method: source,
                                });

                                // Confirm the payment intent
                                const finalConfirmedPayment = await stripe.paymentIntents.confirm(finalPaymentIntent.id);


                                // Handle the payment confirmation
                                if (finalConfirmedPayment.status === 'succeeded') {

                                    const data = {
                                        payment: finalConfirmedPayment.status
                                    }

                                    return successWithData(res, 'Data Found Successfully', data);


                                } else {
                                    return errorResponse(res, "Payment failed!")

                                }
                            }
                        }

                        //res.json({ message: 'Payment successful', intent: confirmedPaymentIntent });
                    }

                } catch (error) {
                    console.error(error);
                    res.status(500).json({ error: 'Payment failed' });
                }

            }
        } catch (err) {
            console.log(err);
        }



    },

    // getUserProfileData: async function (req, res) {
    //         try {
    //             const profile_id = await req.user.id;
    //             if (profile_id) {
    //                 var data = await signupDB.aggregate([{
    //                     $match: {
    //                         '_id': ObjectId(profile_id)                                                     
    //                     }
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'profiles',
    //                         localField: '_id',
    //                         foreignField: 'profile_id',
    //                         as: 'profileDetails',
    //                     },

    //                 },
    //                 {
    //                     $lookup: {
    //                         from: 'backgroundchecks',
    //                         localField: '_id',
    //                         foreignField: 'driver_id',
    //                         as: 'backgroundcheckDetails',
    //                     }

    //                 },

    //                 {
    //                     $lookup: {
    //                         from: 'paymentmethods',
    //                         localField: '_id',
    //                         foreignField: 'user_id',
    //                         as: 'paymentmethodDetails'
    //                     }
    //                 },

    //                 {
    //                     $lookup: {
    //                         from: 'vehicleinfos',
    //                         localField: '_id',
    //                         foreignField: 'driver_id',
    //                         as: 'vehicleinfoDetails',
    //                     },
    //                 },

    //                 {
    //                     $lookup: {
    //                         from: 'usertrips',
    //                         localField: '_id',
    //                         foreignField: 'user_id',
    //                         as: 'usertripDetails',
    //                     },
    //                 },

    //                 {
    //                     $project: {
    //                         'email': 1,
    //                         'username': 1,                            
    //                         'profileDetails': 1,                            
    //                         'backgroundcheckDetails': 1,
    //                         'paymentmethodDetails': 1,
    //                         'vehicleinfoDetails': 1,
    //                         'usertripDetails' : 1

    //                     }
    //                 }

    //                 ])
    //                 return successWithData(res, 'Details found Successfully', data);
    //             }
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     },

    getUserProfileData: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                //Check if the userid is present in the payment table
                paymentData = await paymentDB.findOne({ user_id: profile_id });
                var paymentMessage;
                if (paymentData) {
                    if (paymentData.status == "success") {
                        paymentMessage = "Payment Done";
                    } else {
                        paymentMessage = "Payment Not Done";
                    }
                } else {
                    paymentMessage = "Payment Not Done";
                }
                const {
                    type
                } = req.body;

                if (!(type)) {
                    return validationError(res, "type is required")
                } else {

                    // var role_id =parseInt(req.body.type) ;
                    if (type == 1) {
                        var data = await signupDB.aggregate([{
                            $match: {
                                '_id': ObjectId(profile_id)
                            }
                        },
                        {
                            $lookup: {
                                from: 'profiles',
                                let: {
                                    id: "$_id",

                                },
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: [{
                                                $eq: [
                                                    "$$id",
                                                    "$profile_id"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$type",
                                                    1
                                                ]
                                            }

                                            ]
                                        }
                                    }
                                }],
                                as: 'profileDetails'
                            },

                        },
                        {
                            $lookup: {
                                from: 'backgroundchecks',
                                localField: '_id',
                                foreignField: 'driver_id',
                                as: 'backgroundcheckDetails',
                            }

                        },

                        {
                            $lookup: {
                                from: 'paymentmethods',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'paymentmethodDetails'
                            }
                        },

                        {
                            $lookup: {
                                from: 'vehicleinfos',
                                localField: '_id',
                                foreignField: 'driver_id',
                                as: 'vehicleinfoDetails',
                            },
                        },

                        // {
                        //     $lookup: {
                        //         from: 'usertrips',
                        //         localField: '_id',
                        //         foreignField: 'user_id',
                        //         as: 'usertripDetails',
                        //     },
                        // },

                        {
                            $project: {
                                'email': 1,
                                'username': 1,
                                'profileDetails': 1,
                                'backgroundcheckDetails': 1,
                                'paymentmethodDetails': 1,
                                'vehicleinfoDetails': 1,
                                'paymentMessage':paymentMessage
                                //'usertripDetails': 1

                            }
                        }

                        ])
                        return successWithData(res, 'Details found Successfully', data);
                    } else {
                        var data = await signupDB.aggregate([{
                            $match: {
                                '_id': ObjectId(profile_id)
                            }
                        },
                        {
                            $lookup: {
                                from: 'profiles',
                                let: {
                                    id: "$_id",

                                },
                                pipeline: [{
                                    $match: {
                                        $expr: {
                                            $and: [{
                                                $eq: [
                                                    "$$id",
                                                    "$profile_id"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$type",
                                                    2
                                                ]
                                            }

                                            ]
                                        }
                                    }
                                }],
                                as: 'profileDetails'
                            },

                        },

                        {
                            $lookup: {
                                from: 'paymentmethods',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'paymentmethodDetails'
                            }
                        },


                        {
                            $lookup: {
                                from: 'usertrips',
                                localField: '_id',
                                foreignField: 'user_id',
                                as: 'usertripDetails',
                            },
                        },

                        {
                            $project: {
                                'email': 1,
                                'username': 1,
                                'profileDetails': 1,
                                'paymentmethodDetails': 1,
                                'paymentMessage':paymentMessage
                                //'usertripDetails': 1

                            }
                        }

                        ])
                        return successWithData(res, 'Details found Successfully', data);
                    }


                }
            }
        } catch (err) {
            console.log(err);
        }
    },


    createTrip: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                //console.log(profile_id)

                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const finded = await signupDB.findOne({
                        _id: profile_id
                    }).lean();
                    if (finded) {
                        console.log('req.body=======', req.body);
                        switch (req.body.type) {
                            case '1':

                                const requiredParam = [
                                    'actionType',
                                    'pickup_location',
                                    'pickup_lat',
                                    'pickup_long',
                                    'destination_location',
                                    'destination_lat',
                                    'destination_long',
                                    'trip_distance',
                                    'trip_time',
                                    'trip',
                                    'depart_date_time',
                                    //'depart_time',
                                    'amount',
                                    //'payment',
                                    'number_of_riders',
                                    'number_of_bags',
                                    //'special_request'
                                ];

                                var emptyArry = [];
                                var formdata = req.body;
                                var data = Object.keys(req.body);

                                let excludeFields = ['return_date_time', 'request_expiration', 'special_request'];
                                data = data.filter(item => !excludeFields.includes(item))

                                var result = requiredParam.filter(n => !data.includes(n));
                                if (result != '') {
                                    var responseMessageRequired = result + " " + 'fields are required.';
                                    return validationError(res, responseMessageRequired);
                                }
                                data.forEach(element => {
                                    if (formdata[element] == '') {
                                        emptyArry.push(element);
                                    }
                                });
                                var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                if (emptyArry != '') {
                                    return validationError(res, responseMessage);
                                } else {
                                    var returnDateTime;
                                    //var returnTime;
                                    if (req.body.trip == 'roundtrip') {
                                        console.log('roundddd', req.body.special_request)
                                        if ((!(req.body.return_date_time == '' || req.body.return_date_time == undefined))) {
                                            returnDateTime = new Date(req.body.return_date_time);
                                            //returnTime = req.body.return_time;
                                            console.log('returnDateTime', returnDateTime);
                                        } else {
                                            return validationError(res, "return_date_time field are required")
                                        }
                                    } else {
                                        returnDateTime = "0000-01-01T00:00:00.000Z";
                                        //returnTime = "NA";
                                    }

                                    if (returnDateTime) {
                                        var special_request;

                                        if (req.body.special_request != undefined || req.body.special_request != '' || req.body.special_request != null) {
                                            special_request = req.body.special_request
                                        } else {
                                            special_request = 'NA'
                                        }
                                        console.log("returnDateTime", returnDateTime)
                                        let userTrip = await new tripDB();

                                        userTrip.user_id = profile_id,
                                            userTrip.type = req.body.type,
                                            userTrip.actionType = req.body.actionType,
                                            userTrip.pickup_location = req.body.pickup_location;
                                        userTrip.pickup_lat = req.body.pickup_lat;
                                        userTrip.pickup_long = req.body.pickup_long;
                                        userTrip.destination_location = req.body.destination_location;
                                        userTrip.destination_lat = req.body.destination_lat;
                                        userTrip.destination_long = req.body.destination_long;
                                        userTrip.trip_distance = req.body.trip_distance;
                                        userTrip.trip_time = req.body.trip_time;
                                        userTrip.trip = req.body.trip;
                                        userTrip.depart_date_time = req.body.depart_date_time;
                                        //userTrip.depart_time = req.body.depart_time;
                                        userTrip.return_date_time = returnDateTime;
                                        //userTrip.return_time = returnTime;
                                        userTrip.amount = req.body.amount;
                                        userTrip.payment = "";
                                        userTrip.request_expiration = "";
                                        userTrip.number_of_riders = req.body.number_of_riders;
                                        userTrip.number_of_bags = req.body.number_of_bags;
                                        userTrip.special_request = special_request;
                                        userTrip.status = 0;
                                        userTrip.trip_accepted = 0;
                                        userTrip.seat_left_need = req.body.number_of_riders;
                                        userTrip.is_trip_full = 0;
                                        userTrip.received_offer = 0;
                                        userTrip.created_date = Date.now();
                                        userTrip.updated_date = Date.now();
                                        //console.log("userTrip", userTrip)

                                        await userTrip.save((err, tripDoc) => {
                                            if (err) {
                                                //console.log("err",err)
                                                return errorResponse(res, 'Issue while submitting data')
                                                //return err;
                                            } else {
                                                if (tripDoc) {
                                                    return success(res, 'Trip Added Successfully');
                                                }
                                            }

                                        });
                                    }
                                }

                                break;

                            case '2':

                                if (req.body.actionType == 'ride') {
                                    const requiredParams = [
                                        //'actionType',
                                        'pickup_location',
                                        'pickup_lat',
                                        'pickup_long',
                                        'destination_location',
                                        'destination_lat',
                                        'destination_long',
                                        'trip_distance',
                                        'trip_time',
                                        'trip',
                                        'depart_date_time',
                                        //'depart_time',
                                        'amount',
                                        'payment',
                                        'number_of_riders',
                                        'number_of_bags',
                                        //'special_request',
                                        'request_expiration'
                                    ]

                                    var emptyArry = [];
                                    var formdata = req.body;
                                    var data = Object.keys(req.body);
                                    let excludeField = ['return_date_time', 'special_request'];
                                    data = data.filter(item => !excludeField.includes(item))

                                    var result = requiredParams.filter(n => !data.includes(n));
                                    if (result != '') {
                                        var responseMessageRequired = result + " " + 'fields are required.';
                                        return validationError(res, responseMessageRequired);
                                    }
                                    data.forEach(element => {
                                        if (formdata[element] == '') {
                                            emptyArry.push(element);
                                        }
                                    });
                                    var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                    if (emptyArry != '') {
                                        return validationError(res, responseMessage);
                                    } else {
                                        console.log('123456789');
                                        var returnDateTime;
                                        //var returnTime;                                    
                                        if (req.body.trip == 'roundtrip') {
                                            console.log('roundddd', req.body.special_request)
                                            if ((!(req.body.return_date_time == '' || req.body.return_date_time == undefined))) {
                                                returnDateTime = req.body.return_date_time;
                                                //returnTime = req.body.return_time;
                                                console.log('returnDateTime=======================================================================================', returnDateTime)
                                            } else {
                                                return validationError(res, "return_date or return_time fields are required")
                                            }
                                        } else {
                                            returnDateTime = "0000-01-01T00:00:00.000Z";
                                            //returnTime = "NA";
                                        }
                                        if (returnDateTime) {
                                            if (req.body.special_request != undefined || req.body.special_request != '' || req.body.special_request != null) {
                                                special_request = req.body.special_request
                                            } else {
                                                special_request = 'NA'
                                            }
                                            let riderTrip = new tripDB();

                                            riderTrip.user_id = profile_id,
                                                riderTrip.type = req.body.type,
                                                riderTrip.actionType = 'ride',
                                                riderTrip.pickup_location = req.body.pickup_location;
                                            riderTrip.pickup_lat = req.body.pickup_lat;
                                            riderTrip.pickup_long = req.body.pickup_long;
                                            riderTrip.destination_location = req.body.destination_location;
                                            riderTrip.destination_lat = req.body.destination_lat;
                                            riderTrip.destination_long = req.body.destination_long;
                                            riderTrip.trip_distance = req.body.trip_distance;
                                            riderTrip.trip_time = req.body.trip_time;
                                            riderTrip.trip = req.body.trip;
                                            riderTrip.depart_date_time = req.body.depart_date_time;
                                            //riderTrip.depart_time = req.body.depart_time;
                                            riderTrip.return_date_time = returnDateTime;
                                            //riderTrip.return_time = returnTime;
                                            riderTrip.amount = req.body.amount;
                                            riderTrip.payment = req.body.payment;
                                            riderTrip.request_expiration = req.body.request_expiration;
                                            riderTrip.number_of_riders = req.body.number_of_riders;
                                            riderTrip.number_of_bags = req.body.number_of_bags;
                                            riderTrip.special_request = special_request;
                                            riderTrip.status = 0;
                                            riderTrip.trip_accepted = 0;
                                            riderTrip.seat_left_need = req.body.number_of_riders;
                                            riderTrip.is_trip_full = 0;
                                            riderTrip.received_offer = 0;
                                            riderTrip.created_date = Date.now();
                                            riderTrip.updated_date = Date.now();
                                            await riderTrip.save((err, tripDoc) => {
                                                if (err) {
                                                    console.log("err", err)
                                                    return errorResponse(res, 'Issue while submitting data')
                                                } else {
                                                    if (tripDoc) {
                                                        return success(res, 'Trip Added Successfully');
                                                    }

                                                }

                                            });
                                        }
                                    }




                                } else {

                                    const requiredParams = [
                                        //'actionType',
                                        'pickup_location',
                                        'pickup_lat',
                                        'pickup_long',
                                        'destination_location',
                                        'destination_lat',
                                        'destination_long',
                                        'trip_distance',
                                        'trip_time',
                                        'trip',
                                        'depart_date_time',
                                        //'depart_time',
                                        'amount',
                                        'payment',
                                        //'number_of_riders',
                                        'number_of_bags',
                                        //'special_request',
                                        'request_expiration'
                                    ];

                                    var emptyArry = [];
                                    var formdata = req.body;
                                    var data = Object.keys(req.body);
                                    //let excludeField = ['return_date_time'];                                    
                                    //data = data.filter(item => !excludeField.includes(item))
                                    let excludeField = ['special_request'];
                                    data = data.filter(item => !excludeField.includes(item))

                                    var result = requiredParams.filter(n => !data.includes(n));
                                    if (result != '') {
                                        var responseMessageRequired = result + " " + 'fields are required.';
                                        return validationError(res, responseMessageRequired);
                                    }
                                    data.forEach(element => {
                                        if (formdata[element] == '') {
                                            emptyArry.push(element);
                                        }
                                    });
                                    var responseMessage = emptyArry + ". " + "Data can't be empty.    ";
                                    if (emptyArry != '') {
                                        return validationError(res, responseMessage);
                                    } else {
                                        let riderTrip = new tripDB();

                                        riderTrip.user_id = profile_id,
                                            riderTrip.type = req.body.type,
                                            riderTrip.actionType = 'delivery',
                                            riderTrip.pickup_location = req.body.pickup_location;
                                        riderTrip.pickup_lat = req.body.pickup_lat;
                                        riderTrip.pickup_long = req.body.pickup_long;
                                        riderTrip.destination_location = req.body.destination_location;
                                        riderTrip.destination_lat = req.body.destination_lat;
                                        riderTrip.destination_long = req.body.destination_long;
                                        riderTrip.trip_distance = req.body.trip_distance;
                                        riderTrip.trip_time = req.body.trip_time;
                                        riderTrip.trip = req.body.trip;
                                        riderTrip.depart_date_time = req.body.depart_date_time;
                                        //riderTrip.depart_time = req.body.depart_time;
                                        riderTrip.return_date_time = returnDateTime;
                                        //riderTrip.return_time = returnTime;
                                        riderTrip.amount = req.body.amount;
                                        riderTrip.payment = req.body.payment;
                                        riderTrip.request_expiration = req.body.request_expiration;
                                        riderTrip.number_of_riders = 0;
                                        riderTrip.number_of_bags = req.body.number_of_bags;
                                        riderTrip.special_request = 'NA';
                                        riderTrip.status = 0;
                                        riderTrip.trip_accepted = 0;
                                        riderTrip.seat_left_need = 0;
                                        riderTrip.is_trip_full = 0;
                                        riderTrip.received_offer = 0;
                                        riderTrip.created_date = Date.now();
                                        riderTrip.updated_date = Date.now();
                                        await riderTrip.save((err, tripDoc) => {
                                            if (err) {
                                                //console.log("err",err)
                                                return errorResponse(res, 'Issue while submitting data')
                                            } else {
                                                if (tripDoc) {
                                                    return success(res, 'Trip Added Successfully');
                                                }

                                            }

                                        });
                                    }


                                }

                                //if (actionType) {  

                                // }

                                break;
                        }


                    } else {
                        return errorResponse(res, 'User is not active')
                    }
                }

            }
        } catch (err) {
            console.log(err);
        }
    },

    getAllTrip: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const Trip = await tripDB.find({
                        user_id: profile_id,
                        type: req.body.type
                    });
                    //console.log("Trip", Trip);
                    if (Trip.length > 0) {
                        return successWithData(res, 'Trip Found', Trip);

                    } else {
                        return success(res, 'Trip Not Found');
                    }
                }

            }

        } catch (err) {
            console.log(err);
        }
    },

    getTripLocations: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const Trip = await userTrip.find({
                        user_id: profile_id,
                        type: req.body.type
                    });
                    //console.log("Trip", Trip);
                    if (Trip.length > 0) {
                        return successWithData(res, 'Trips Found', Trip);

                    } else {
                        return success(res, 'Trips Not Found');
                    }
                }

            }

        } catch (err) {
            console.log(err);
        }
    },



    //get all notifications

    getAllNotification: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const getNotification = await notificationDB.find({
                        user_id: profile_id,
                        type: req.body.type
                    });

                    if (getNotification.length > 0) {
                        return successWithData(res, 'Notification Found', getNotification);

                    } else {
                        return success(res, 'Notification Not Found');
                    }
                }

            }

        } catch (err) {
            console.log(err);
        }
    },
    checkUserProfileExist: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const userProfile = await profileDB.find({
                        profile_id: profile_id,
                        type: req.body.type
                    });
                    console.log("userProfile", userProfile)
                    paymentData = await paymentDB.findOne({ user_id: profile_id });
                    var paymentMessage;
                    if (paymentData) {
                        if (paymentData.status == "success") {
                            if (userProfile.length <= 0) {
                                return successWithData(res, "Profile is incomplete yet")
                            } else if (userProfile.backgroundPayStatus == 0) {
                                return successWithData(res, "Background Payment is incomplete yet")
                            } else if (userProfile.uuid == '' || userProfile.uuid == null || userProfile.uuid == undefined) {
                                return success(res, "Background Verification is incomplete yet")
                            } else {
                                return success(res, "Profile, Background verification, payment is done successfully")
                            }
                        } else {
                            return success(res, "Payment Not Done")
                        }
                    } else {
                        return success(res, "Payment Not Done")
                    }
                    

                }

            }

        } catch (err) {
            console.log(err);
        }
    },

    //check if background verification is done

    checkBackgroundAuthExist: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                if (req.body.type == '' || req.body.type == null || req.body.type == undefined) {
                    return validationError(res, 'type Field is required')
                } else {
                    const userProfile = await profileDB.findOne({
                        profile_id: profile_id,
                        type: req.body.type
                    });
                    //console.log("userProfile", userProfile)
                    if (userProfile.backgroundPayStatus == 0) {
                        return successWithData(res, "Payment is not done yet")
                    } else if (userProfile.uuid == '' || userProfile.uuid == null || userProfile.uuid == undefined) {
                        return successWithData(res, "Background Verification done successfully", userProfile)
                    } else {
                        return success(res, "Profile, Background verification, payment is done successfully")
                    }
                }

            }

        } catch (err) {
            console.log(err);
        }
    },
    logout: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                await signupDB.findByIdAndUpdate({
                    _id: profile_id
                }, {
                    status: 0
                }, async (err, doc) => {
                    if (err) {
                        return errorResponse(res, "Error whing finding data")
                    } else {
                        return success(res, "User Logged out")
                    }
                });

            }

        } catch (err) {
            console.log(err);
        }
    },
    createFaq: async function (req, res) {
        try {
            let faq = new faqDB();

            faq.title = req.body.title,
                faq.desc = req.body.desc,
                faq.created_date = Date.now()
            faq.updated_date = Date.now()
            faq.save((err, faqdoc) => {
                if (err) {
                    return errorResponse(res, 'Error')
                } else {
                    return success(res, "Faq Created")
                }
            });
        } catch (err) {
            console.log(err);
        }
    },
    getFaqs: async function (req, res) {
        try {
            const data = await faqDB.find();
            if (data.length > 0) {
                return successWithData(res, "Faqs Found", data)
            } else {
                return success(res, "No Faqs Found")
            }

        } catch (err) {
            console.log(err);
        }
    },

    editProfile: async function (req, res) {
        try {
            const profile_id = req.user.id;
            console.log('profile_id', profile_id)
            if (profile_id) {
                console.log('2')
                const {
                    fullname,
                    university_name,
                    student_id,
                    university_address,
                    mobile_no,
                    student_university_email,
                    gender,
                    type,
                    //payment_info,
                    //profile_photo
                } = req.body;
                var profile_photo;

                if (req.files.upload_profile_photo) {
                    profile_photo = req.files.upload_profile_photo[0].destination + req.files.upload_profile_photo[0].filename
                } else {
                    profile_photo = '';
                }
                //const upload_profile_photo = req.file;
                console.log('req.body', req.body);
                console.log('profiles---', profile_photo);
                if (!(fullname, university_name, student_id, university_address, mobile_no, student_university_email, gender /*payment_info upload_profile_photo*/)) {
                    return errorResponse(res, 'All fields are required');
                } else {
                    const update1 = await profileDB.findOne({
                        profile_id: profile_id,
                        type: type
                    });
                    console.log('update1--', update1);
                    if (update1) {
                        const update = await profileDB.updateOne({
                            profile_id: profile_id,
                            type: type
                        }, {
                            fullname: fullname,
                            university_name: university_name,
                            student_id: student_id,
                            university_address: university_address,
                            mobile_no: mobile_no,
                            student_university_email: student_university_email,
                            gender: gender,
                            profile_photo: profile_photo
                        }, {
                            new: true
                        }); //async (err, doc) => {
                        if (update) {
                            return successWithData(res, "Profile Updated", update);
                        } else {
                            return errorResponse(res, "Error while finding data")
                        }
                    } else {
                        return errorResponse(res, 'Data  Not Found');
                    }


                    // });
                }
            }

        } catch (err) {
            console.log(err);
        }
    },

    resetPassword: async function (req, res) {
        try {
            console.log(req.body)
            const {
                password
            } = req.body;
            const profile_id = await req.user.id;
            console.log('profile_id---', profile_id);
            if (profile_id) {

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
                console.log("validatePassword", validatePassword);
                if (validatePassword == false) {
                    return errorResponse(res, 'Password must have min 8 length, max 25 length, uppercase letters, lowercase letters, at least 2 digits with no spaces ')
                } else {

                    signupDB.findById({
                        _id: profile_id
                    }, async (err, userFound) => {
                        if (err) {
                            return errorResponse(res, "Error while updating data")
                        } else {
                            if (userFound) {
                                console.log("user found", userFound)
                                encryptedPassword = await bcrypt.hash(password, 10);
                                console.log("encryptedPassword", encryptedPassword)
                                var newvalues = {
                                    $set: {
                                        password: encryptedPassword

                                    }
                                }
                                signupDB.updateOne({
                                    _id: profile_id
                                }, newvalues, (err, doc) => {
                                    if (err) {
                                        return errorResponse(res, "Error while updating data")
                                    } else {
                                        if (doc.modifiedCount == 1) {
                                            return success(res, "Password successfully reset.")
                                        } else {
                                            return errorResponse(res, "Error while updating data")
                                        }

                                    }
                                })
                            } else {
                                return errorResponse(res, "User not Found")
                            }
                        }

                    });
                }


            }
        } catch (err) {
            console.log(err);
        }
    },

    changePassword: async function (req, res) {
        try {
            const profile_id = await req.user.id;
            if (profile_id) {
                const requiredParam = [
                    'old_password',
                    'new_password',
                    'confirm_password'

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
                            old_password,
                            new_password,
                            confirm_password
                        } = req.body;
                        if (new_password == confirm_password) {
                            const data = await signupDB.findById({
                                _id: profile_id
                            });
                            if (data && (await bcrypt.compare(old_password, data.password))) {
                                encryptedPassword = await bcrypt.hash(new_password, 10);
                                signupDB.findByIdAndUpdate({
                                    _id: profile_id
                                }, {
                                    password: encryptedPassword
                                }, async (err, doc) => {
                                    if (err) {
                                        return errorResponse(res, "Error whing finding data")
                                    } else {
                                        return success(res, "New Password Updated")
                                    }
                                });
                            } else {
                                return errorResponse(res, 'Old Password does not match')
                            }
                        } else {
                            return errorResponse(res, 'Confirm Password does not match')
                        }

                    }
                }

            }

        } catch (err) {
            console.log(err);
        }
    },

    createDestinationContact: async function (req, res) {
        try {
            var profile_id = req.user.id;
            if (profile_id) {
                const {
                    name,
                    phone_no
                } = req.body;
                const user = await destinationContactDB.create({
                    user_id: profile_id,
                    name: name,
                    phone_no: phone_no
                })
                user.status = 1;
                await user.save((err, doc) => {
                    if (err) {
                        return errorResponse(res, 'Error While Saving Contact')
                    } else {
                        return successWithData(res, 'Contact Saved Successfully', doc);
                    }
                })

            } else {
                return errorResponse(res, 'Data Not Found');
            }
        } catch (err) {
            console.log(err);
        }
    },

    deleteAccount: async function (req, res) {
        try {
            var profile_id = req.user.id;
            if (profile_id) {
                const type = req.body.type;
                const finduser = await signupDB.findOne({
                    //$and: [{
                    _id: profile_id,
                    //role_id: type
                    // }]
                });
                console.log('finduser----', finduser);
                // if (!(type)) {
                //     return errorResponse(res, 'Type field is required');
                // }
                if (finduser) {
                    const updatestatus = await signupDB.updateOne({
                        _id: profile_id
                    }, {
                        status: 0
                    });
                    if (updatestatus) {
                        return successWithData(res, 'Successfully Deleted', updatestatus);
                    } else {
                        return errorResponse(res, 'Data Not Found');
                    }
                } else {
                    return errorResponse(res, 'Data Not Found');
                }
            }
        } catch (err) {
            console.log(err);
        }
    },

    getPastTrip: async function (req, res) {
        try {
            const newday = new Date();
            var arr = [];
            console.log('newday===', newday);
            // cron.schedule('1 * * * *', async () => {
            const matchtime = await tripDB.find({
                'depart_date_time': {
                    $lte: newday
                }
            }).lean();
            // console.log('matchtime cronejob', matchtime);
            // for (const {
            //         _id
            //     } of matchtime) {
            //     await tripDB.updateOne({
            //         _id: _id
            //     }, {
            //         $set: {
            //             status: 4
            //         }
            //     });
            // }
            return success(res, 'Data Updated Successfully');
            // });
        } catch (err) {
            console.log(err);
        }
    },

    addVehicles: async function (req, res) {

        csvtojson().fromFile("CQA_Basic.csv").then(csvData => {
            // console.log(csvData);
            csvDB.insertMany(csvData).then(function () {
                //console.log("success");
                return success(res, "Csv data inserted successfully")
            }).catch(function (err) {
                console.log(err)
            })
        })

    },


    findvehiclemakeid: async function (req, res) {
        try {
            const columnName = 'model_make_id';
            csvDB.distinct(columnName, (err, uniqueValues) => {
                if (err) {
                    return errorResponse(res, 'Data Not Found');
                } else {
                    // console.log(uniqueValues);
                    return successWithData(res, 'Data Found', uniqueValues);
                }
            })

        } catch (err) {
            console.log(err);
        }
    },

    findvechilemodel: async function (req, res) {
        try {
            const vechileMake = req.body.vechileModel;
            const findvechileMake = await csvDB.find({
                model_make_id: vechileMake
            }).select('model_make_id + model_name + model_trim');
            // .select("model_name model_trim model_year");
            console.log('findvechileMake', findvechileMake);
            return successWithData(res, 'Data Found', findvechileMake)
            // var arr = [];
            // var arr1 = [];
            // if (findvechileMake) {
            //     var data = await Promise.all(findvechileMake.map(async (row) => {
            //         console.log('data', row.model_name);
            //         //console.log('data12', row.model_year);
            //         //arr.push(row.model_name + row.model_trim);
            //         arr.push(`${row.model_name}`+ `${row.model_trim}`);

            //         //arr1.push(row.model_year);
            //     }))
            //     //const modelyear=await csvDB.find({})
            //     res.send({
            //         code: 200,
            //         message: 'Data Successfully Found',
            //         model_name: arr,
            //         //model_year: arr1
            //     })
            // }

        } catch (err) {
            console.log(err);
        }
    },

    findvechilemodelyear: async function (req, res) {
        try {
            const {
                vechileid
            } = req.body
            const vechilemodelyear = await csvDB.find({
                _id: req.body.vechileid
            });

            if (vechilemodelyear) {
                return successWithData(res, 'Model Year Found', vechilemodelyear);
            } else {
                return errorResponse(res, 'No data Found');
            }


        } catch (err) {
            console.log(err);
        }
    },

    demo: async function (req, res) {
        try {
            // var profile_id=req.user.id;
            // if(profile_id){
            // Moreover you can take more details from user
            // like Address, Name, etc from form
            stripe.customers.create({
                email: req.body.stripeEmail,
                source: req.body.stripeToken,

                //name_on_card:req.body.name_on_card,
                // pin:req.body.pin,
                name: req.body.name,
                address: {
                    line1: req.body.line1,
                    postal_code: req.body.postal_code,
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                },
                //payment_Method:'Cards'
            })
                .then((customer) => {

                    const paymentIntent = stripe.paymentIntents.create({
                        amount: req.body.amount, // Charging Rs 25
                        description: req.body.description,
                        currency: 'USD',
                        customer: customer.id,
                        //card_no:req.body.card_no,
                        //cvv:req.body.cvv,
                        //Payment_Method: Cards,
                        automatic_payment_methods: {
                            enabled: true,
                        },
                        //payment_method_types: ['card']
                        //payment_method:`{{PAYMENT_METHOD_ID}}`,
                    });
                })
                .then((paymentIntent) => {
                    //return res.json({clientSecret:paymentIntent.clientSecret})
                    console.log('success');
                    return successWithData(res, 'Success', paymentIntent)
                    //res.send("Success") // If no error occurs
                })
                .catch((err) => {
                    res.send(err) // If some error occurs
                });
            // }else{
            //     return errorResponse(res,'Data Not Found');
            // }
        } catch (err) {
            console.log(err);
        }


    },

    chargePayment: async function (req, res) {
        try {
            const profile_id = await req.user.id
            console.log('profile_id=======', profile_id)
            if (profile_id) {
                const createcustmor = await stripe.customers.create({
                    email: req.body.stripeEmail,
                    source: req.body.stripeToken,
                    name: req.body.name,
                    address: {
                        line1: req.body.line1,
                        postal_code: req.body.postal_code,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                    },

                })
                console.log('createcustmor',createcustmor);
                const {
                    paymentMethodType,
                    currency,
                    amount,
                    description
                } = req.body;
                console.log("paymentMethodType,currency,amount,description",paymentMethodType,currency,amount,description);
                const serviceTaxPercentage = 0.05;
                //const commissionAmount = 20;
                const serviceTax = amount * serviceTaxPercentage;
                console.log('serviceTax', serviceTax);
                const adjustedAmount = amount - serviceTax;
                console.log('adjustedAmount', adjustedAmount);
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: Math.round(adjustedAmount),
                    currency: currency,
                    description: description,
                    customer: createcustmor.id,
                    // name: createcustmor.name,
                    confirmation_method: 'manual',
                    confirm: true,
                    off_session: false,
                    payment_method_types: [paymentMethodType]
                })
                console.log('success');
                //return res.json({clientsecret:paymentIntent.client_secret})
                //return successWithData(res, 'Success', paymentIntent)
                if (paymentIntent) {
                    console.log('paymentIntent',paymentIntent);
                    const payinfo = await paymentMethodDB();
                    //console.log('doc',doc)
                    payinfo.user_id = profile_id,
                        payinfo.payment_id = paymentIntent.id,
                        payinfo.payable_amount = paymentIntent.amount,
                        payinfo.name_on_card = paymentIntent.name,
                        payinfo.payment_status = paymentIntent.status,
                        payinfo.customer_id = paymentIntent.customer,
                        //payinfo.payment_type=paymentIntent.payment_method_types

                        payinfo.save((err, doc) => {
                            if (err) {
                                console.log('err', err)
                                return errorResponse(res, 'Data Not Found');
                            } else {
                                return successWithData(res, 'PaymentIntent Created Successfully', doc);
                            }
                        })



                } else {
                    return errorResponse(res, 'Data Not Found');
                }
            } else {
                return errorResponse(res, 'Data Not Found');
            }

        } catch (err) {
            console.log(err);
        }
    },

    getTransactionDetails: async function (req, res) {
        try {
            var profile_id = req.user.id;
            if (profile_id) {
                const find = await paymentMethodDB.find({
                    user_id: profile_id
                });
                if (find) {
                    return successWithData(res, 'Transaction Details Successfully Found', find);
                } else {
                    return errorResponse(res, 'Data Not Found');
                }
            }

        } catch (err) {
            console.log(err);
        }
    }

}