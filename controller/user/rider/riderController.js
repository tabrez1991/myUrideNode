const signupDB = require('../../../models/signup.model.js')
const backgroudCheckDB = require('../../../models/background.model.js')
// const vehicleInfosDB = require('../../models/vehicleInfo.model.js');
// const paymentMethodDB = require('../../models/paymentMethod.model.js');
const tripDB = require('../../../models/usersTrip.model.js');
const tripOfferDB = require('../../../models/tripOffer.model.js');
const profileDB = require('../../../models/profile.model.js');
const notificationDB = require('../../../models/notification.model.js');
const riderRatingDB = require('../../../models/riderRating.model.js');
const feedbackDB = require('../../../models/feedback.model.js');
//const firebases = require('firebase');
const FCM = require('fcm-node');
// const roleDB = require('../../models/memberRole.model.js');
const verifyToken = require("../../../middleware/authentication.js");
//const serverKey = require('./privatekey');
const serverKey = process.env.FIREBASE_KEY;
//const serverKey = 'AAAAsRltetY:APA91bHeac2fwRKbcTxAh6JOJHvjWhExQ56Sc9Y4tmw0j7ec3UniYl-VBSbc9g5YBXiZ8DWo6NUTkVBozamFFsLk4qIh28QT7rE_6MujcHVZBTPnN-V2PHReDQHUG4R9bJcp2wfnjbFT';
//const serverKey = 'AAAA142o9fo:APA91bH9KNp5i9pfreN1_KLInFl0VXcEuh82Mjn07P47sKeE7-kTEy8cKPe7XXZFUEsAYhGvZSMh0j5nML2EHeJEPFzkrclVN0L2bjDWI6K3-CH-hs9-HHd4m4EBSmaNV4dFaUgazZgF';

const {
	success,
	successWithData,
	errorResponse,
	validationError,
	notifySuccess,
	notifyError
} = require('../../../helpers/apiResponse.js')
const mongoose = require('mongoose');
const e = require('cors');
const { HttpStatusCode } = require('axios');
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
	verifyToken,

	pushNotifications: async function (req, res) {
		console.log('0');
		try {
			console.log('1');
			var fcm = new FCM(serverKey);


			console.log('fcm', fcm);
			let message = {
				// to:'faF2G3UxTYClB5LOFhJ3_E:APA91bHECR5nWb9wHuqqrpy6_NdgPoUTuDUd7UJzVuduggYCLj_V4Tbjzs3OGYqfuJy6-lBhgITDsJ_ASV__JHdfhzG7Ey6WVl064qnXneNkzJpboggdBwP0uKPezfrhT6BsMDHkkXqM',
				//to: 'd9NvTmqwQPGRznmzKFBOST:APA91bFdUPtgFGrpqpWT7FttjgmZah2kJpDkfM67p1WrUUE8kRD9FW80Lis9m1hmWpy1yrtlaP-0qeZEXI7_Da5h1UyYfBYrU-vNnJTYxrKOGHxMdTjm3Zn03mLEZ6EGTbdmfVe0EjyN',
				to: 'e7VPJ5ABQ4-d4ORyERvF7f:APA91bHdt8pRNsCzxRVsmlDWGtstu3LoLZe-0r0ggBv_xKjnuZPDMwxEbzizqwCOQipHB9u-SLlwAfgLG-IQ1cgvRGUlrMILMB_9zBXefh7Ff6gdCyqVHA1B6GxngSYt5AvuCL_lL5dT',
				notification: {
					title: "New Message",
					body: "Hi Sarah, your driver, Mark, has arrived. He's in a black sedan with the license plate XYZ789. Have a great trip!"
				},

				data: {
					title: 'ok',
					body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
				}

			};

			console.log("message", message);
			fcm.send(message, function (err, response) {
				if (err) {
					console.log('3')
					console.log(err);
					return errorResponse(res, 'err');
				} else {
					console.log('4')
					console.log(response);
				}
			})
		} catch (err) {
			//  return errorResponse(res, err);
			console.log(err);
		}
	},

	//------------------------find drivers 
	findDrivers1: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const requiredParams = [
					'trip',
					'pickup_location',
					'pickup_lat',
					'pickup_long',
					'depart_date_time',
					'amount'
				];

				var emptyArry = [];
				var formdata = req.body;
				var data = Object.keys(req.body);

				var result = requiredParams.filter(n => !data.includes(n));
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
						const newday = new Date(req.body.depart_date_time);
						const makenextday = newday.setDate(newday.getDate() + 1);
						var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
						//console.log("next day", nextday);
						if (profile_id) {
							//console.log("profile_id", profile_id)

							var data = await profileDB.aggregate([{
								$match: {
									// $and: [ 
									type: 1,
									profile_id: {
										$ne: ObjectId(profile_id)
									}

									//user_id : ObjectId(profile_id)
									//{_id: ObjectId(driver_trip_id)},

									// ]}
								}
							},
							{
								$lookup: {
									from: "usertrips",
									let: {
										id: "$profile_id",

									},
									pipeline: [{
										$match: {
											$expr: {
												$and: [{
													$eq: [
														"$$id",
														"$user_id"
													]
												},
												{
													$eq: [
														"$pickup_location",
														req.body.pickup_location
													]

												},
												{
													$eq: [
														"$type",
														1
													]

												},
												{
													$eq: [
														"$status",
														0
													]

												},

													// {
													//     $gte: [
													//         "$depart_date_time",
													//         new Date(req.body.depart_date_time)
													//     ]
													// },
													// {
													//     $lt: [
													//         "$depart_date_time",
													//         new Date(nextday)
													//     ]
													// }
													// {
													//     $lte: [
													//         "$amount",
													//         Number(req.body.amount)
													//     ]
													// }

												]
											}
										}
									}],
									as: "DriverTrip"
								},

							},
							{
								$unwind: "$DriverTrip"
							},
							])
							return successWithData(res, 'Data Found', data);
						}
					}
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	findDrivers: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			console.log('profile_id=========', profile_id)
			if (profile_id) {

				const requiredParams = [
					'trip',
					'pickup_location',
					'pickup_lat',
					'pickup_long',
					'depart_date_time',
					'amount'
				];

				var emptyArry = [];
				var formdata = req.body;
				var data = Object.keys(req.body);

				var result = requiredParams.filter(n => !data.includes(n));
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
						const newday = new Date(req.body.depart_date_time);
						const makenextday = newday.setDate(newday.getDate() + 1);
						var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
						//console.log("next day", nextday);
						if (profile_id) {
							//console.log("profile_id", profile_id)
							//   const finddriver = await tripOfferDB.find({
							//       rider_id: profile_id,
							//       rider_trip_id: req.body.rider_trip_id
							//   });
							//  console.log('finddriver----', finddriver);
							//if(finddriver.length > 0){
							// const excludedata=await tripOfferDB.find({})
							// }
							//const exclude = finddriver
							//const excluded=await tripOfferDB.find({rider_trip_id:{$ne:exclude}})
							//console.log('exclude----', exclude);
							var data = await profileDB.aggregate([{
								$match: {
									// $and: [ {
									type: 1,
									profile_id: {
										$ne: ObjectId(profile_id)
									},
									//  exclude: finddriver

									//user_id : ObjectId(profile_id)
									//{_id: ObjectId(driver_trip_id)},

									//   }  ]
								}
							},
							{
								$lookup: {
									from: "usertrips",
									let: {
										id: "$profile_id",

									},
									pipeline: [{
										$match: {
											$expr: {
												$and: [
													{

														$eq: [
															"$$id",
															"$user_id"
														]
													},
													// { $ne: ["$$id", "$user_id"] },
													{
														$eq: [
															"$pickup_location",
															req.body.pickup_location
														]

													},
													{
														$eq: [
															"$type",
															1
														]

													},
													{
														$eq: [
															"$status",
															0
														]

													},

													{
														$gte: [
															"$depart_date_time",
															new Date(req.body.depart_date_time)
														]
													},
													//  {
													//      $lt: [
													//          "$depart_date_time",
													//          new Date(nextday)
													//      ]
													//  }
													// {
													//     $lte: [
													//         "$amount",
													//         Number(req.body.amount)
													//     ]
													// }

												]
											}
										}
									}],
									as: "DriverTrip"
								}

							},
							{
								$unwind: "$DriverTrip"
							},
							])
							//console.log('data=======',data);
							return successWithData(res, 'Data Found', data);
						}
					}
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	//------------------------get driver detail by id
	getDriverDetailsByID: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_id,
					driver_trip_id
				} = req.body;
				if (!(driver_id && driver_trip_id)) {
					return errorResponse(res, "driver_id and driver_trip_id is required")
				} else {
					var data = await tripDB.aggregate([{
						$match: {
							$and: [{
								type: 1
							},
							{
								user_id: ObjectId(driver_id)
							},
							{
								_id: ObjectId(driver_trip_id)
							},

							]
						}
					},

					{
						$lookup: {
							from: 'profiles',
							localField: 'user_id',
							foreignField: 'profile_id',
							as: 'driverDetails',
						}

					},

					])
					return successWithData(res, 'Driver Details Found', data);
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	//------------------------get driver detail by id demo
	getDriverDetailsByIDDemo: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_id,
					driver_trip_id
				} = req.body;
				if (!(driver_id && driver_trip_id)) {
					return errorResponse(res, "driver_id and driver_trip_id is required")
				} else {
					var data = await tripDB.aggregate([{
						$match: {
							$and: [{
								type: 1
							},
							{
								user_id: ObjectId(driver_id)
							},
							{
								_id: ObjectId(driver_trip_id)
							},

							]
						}
					},

					// {
					//     $lookup: {
					//         from: 'profiles',
					//         localField: 'user_id',
					//         foreignField: 'profile_id',
					//         as: 'driverDetails',
					//     }

					// }, 

					{

						$lookup: {
							from: "profiles",
							// let: {
							//     profile_id: "$user_id",

							// },

							pipeline: [{
								$match: {
									$expr: {
										$and: [{
											$eq: [
												"$type",
												1
											]
										},
										{
											$eq: [
												"$user_id",
												"$profile_id"
											]
										},

										]
									}
								}
							}],
							as: "driverDetails"
						},
					},
					])
					return successWithData(res, 'Driver Details Found', data);
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	//------------------------find all rides with ride status (confirm)
	getAllRideWithStatus: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			//console.log('profile_id', profile_id);
			if (profile_id) {
				//console.log("profile_id", profile_id)
				var arr = [];
				var data = await tripDB.aggregate([{
					$match: {
						$and: [{
							type: 2
						},
						{
							user_id: ObjectId(profile_id)
						},
						{
							status: {
								$in: [0, 1]
							}
						}

						]
					}
				},
				{

					$lookup: {
						from: "tripoffers",
						let: {
							id: "$_id",

						},

						pipeline: [{
							$match: {
								$expr: {
									$and: [{
										$eq: [
											"$$id",
											"$rider_trip_id"
										]
									},

									{
										$eq: [
											"$rider_id",
											ObjectId(profile_id)
										]
									},

									{
										$gte: [
											"$rider_depart_date_time",
											"$depart_date_time"
										]
									}

										// {
										//     $gte: [
										//         "$rider_depart_date_time",
										//         new Date(today)
										//     ]
										// }


									]
								}
							}
						}],


						as: "findRideStatus"
					},



				},

				])
				await Promise.all(data.map(async (row) => {
					//console.log('row',row)

					if (row.findRideStatus.length > 0) {
						//console.log('row',row.findRideStatus)
						await Promise.all(row.findRideStatus.map(async (row1) => {

							const findtrip = await profileDB.findOne({
								profile_id: row1.driver_id
							});
							//console.log('findtrip',findtrip)

							row1.drive_fullname = findtrip.fullname;
							row1.driver_gender = findtrip.gender;

						}))
					}

					arr.push(row);

				}));
				//console.log('arr----', arr);
				return successWithData(res, 'Details found Successfully', arr);


			}
		} catch (err) {
			console.log(err);
		}
	},

	getDriverOfferByTripId: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const newday = new Date();
				var today = new Date(newday).toISOString().split('T')[0] + 'T00:00:00.000Z';
				//console.log("today", today);
				var arr = [];
				var data = await tripDB.aggregate([{
					$match: {
						//$and: [{
						// type: 1,
						// },
						// {
						user_id: ObjectId(profile_id)
					}

					//]
					//}
				},
				{

					$lookup: {
						from: "tripoffers",
						let: {
							id: "$_id",

						},

						pipeline: [{
							$match: {
								$expr: {
									$and: [{
										$eq: [
											"$$id",
											"$rider_trip_id"
										]
									},

									{
										$eq: [
											"$rider_id",
											ObjectId(profile_id)
										]
									},

									{
										$gte: [
											"$rider_depart_date_time",
											"$depart_date_time"
										]
									}

										// {
										//     $gte: [
										//         "$rider_depart_date_time",
										//         new Date(today)
										//     ]
										// }


									]
								}
							}
						}],


						as: "findOffers"
					},



				},

				])
				await Promise.all(data.map(async (row) => {
					//console.log('row',row)

					if (row.findOffers.length > 0) {
						// console.log('row',row.findUpcomingtrips)
						await Promise.all(row.findOffers.map(async (row1) => {

							const findtrip = await profileDB.findOne({
								profile_id: row1.rider_id
							});
							//console.log('findtrip',findtrip)

							row1.fullname = findtrip.fullname;
							row1.gender = findtrip.gender;

						}))
					} else {
						// return successWithData(res, 'Details found Successfully', data);
					}

					arr.push(row);

				}));
				return successWithData(res, 'Details found Successfully', arr);

			}

		} catch (err) {
			console.log(err);
		}
	},

	//-------------------- get all driver offer details of particular trip 
	getAllDriverTripOfferdetail: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					rider_trip_id
				} = req.body;
				//console.log('re.body-----', req.body);

				if (!(rider_trip_id)) {
					return validationError(res, 'rider_trip_id field is required')
				} else {
					var data = await tripOfferDB.aggregate([{
						$match: {
							'rider_trip_id': ObjectId(rider_trip_id),
							//'is_trip_accepted_by_rider':3
						}
					},
					{
						$lookup: {
							from: "profiles",
							let: {
								id: "$driver_id",

							},

							pipeline: [{
								$match: {
									$expr: {
										$and: [{
											$eq: [
												"$$id",
												// "$rider_trip_id"
												'$profile_id'
											]
										},

										{
											$eq: [

												'$type',
												1
												//ObjectId(profile_id) 
											]
										},
										]
									}
								}
							}],


							as: "driverDetails"
						},
					},



					// {
					//     $lookup: {
					//         from: 'profiles',
					//         localField: 'driver_id',
					//         foreignField: 'profile_id',
					//         as: 'driverDetails',
					//     }

					// },                        

					{
						$lookup: {
							from: 'usertrips',
							localField: 'driver_trip_id',
							foreignField: '_id',
							as: 'driverTripDetails',
						}

					},


					{
						$project: {

							'rider_id': 1,
							'rider_depart_date_time': 1,
							'rider_amount': 1,
							'rider_seat_request': 1,
							'rider_trip_id': 1,
							'is_trip_accepted_by_rider': 1, //1 : yes , 0 : no     

							'driver_trip_id': 1,
							'driver_id': 1,
							'driver_seat_available': 1,
							'is_trip_accepted_by_driver': 1, //1 : yes , 0 : no  

							'status': 1, // 0 : pending, 1: accepted, 2: cancel  
							// offer_price_sent_by_rider : {type : Number},
							'updated_date': 1,
							'updated_date': 1,
							'driverDetails': 1,
							'driverTripDetails': 1


						}
					}

					])
					if (data) {
						tripDB.find({
							_id: ObjectId(rider_trip_id)
						}, async (err, doc) => {
							if (err) {
								return errorResponse(res, " Error While updating status")
							} else {

								const newdata = {
									"OfferSendToDriver": data,
									"RiderTripDetail": doc
								}
								if (data) {
									// console.log('newdata---', newdata);
									return successWithData(res, 'Details found Successfully', newdata);
								}

							}
						})

					}

					//return successWithData(res, 'Details found Successfully', data);
				}

			}

		} catch (err) {
			console.log(err);
		}
	},
	//  },

	//---------------------- send offer to driver
	sendOfferToDriver: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_id,
					rider_trip_id,
					rider_depart_date_time,
					rider_amount,
					rider_seat_request,
					driver_seat_available,
					driver_trip_id
				} = req.body;
				//console.log("---",driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id)
				if (!(driver_id && rider_trip_id && rider_depart_date_time && rider_amount && rider_seat_request && driver_seat_available && driver_trip_id)) {
					return errorResponse(res, "driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id are required");

				} else {
					const findOfferLimitExceed = await tripOfferDB.find({
						rider_id: profile_id,
						rider_trip_id: rider_trip_id
					});
					//console.log("findOfferLimitExceed", findOfferLimitExceed.length)
					if (findOfferLimitExceed.length >= 3) {
						return errorResponse(res, "You can send offer to 3 Drivers")
					} else {

						const checkTripOffer = await tripOfferDB.findOne({
							rider_id: profile_id,
							driver_trip_id: driver_trip_id,
							driver_id: driver_id
						});
						console.log("checkTripOffer", checkTripOffer)
						if (checkTripOffer) {
							return errorResponse(res, "This offer is already sent")
						} else {
							const find_driver_trip = await tripDB.findOne({
								user_id: driver_id,
								_id: driver_trip_id,
								type: 1
							});
							//console.log("find_driver_trip", find_driver_trip)

							if (find_driver_trip.trip_accepted == 0) {
								var newvalues = {
									$set: {
										trip_accepted: 1
									}
								}
								tripDB.updateOne({
									_id: req.body.driver_trip_id
								}, newvalues, async (err, updateTripStatus) => {
									if (err) {
										return errorResponse(res, 'Error while updating status')
									} else {
										if (updateTripStatus.modifiedCount == 1) {
											let trip_offer = new tripOfferDB();

											trip_offer.rider_id = profile_id;
											trip_offer.rider_depart_date_time = rider_depart_date_time;
											trip_offer.rider_amount = rider_amount;
											trip_offer.rider_seat_request = rider_seat_request;
											trip_offer.rider_trip_id = rider_trip_id;
											trip_offer.is_trip_accepted_by_rider = 0; //offer Sent
											trip_offer.driver_id = driver_id;
											trip_offer.driver_trip_id = driver_trip_id;
											trip_offer.driver_seat_available = driver_seat_available;
											trip_offer.is_trip_accepted_by_driver = 0;
											trip_offer.is_offer_sent_by_rider = 1;
											trip_offer.status = 0;
											trip_offer.rider_offer_price = 0,
												trip_offer.driver_offer_price = 0,
												trip_offer.created_date = Date.now();


											await trip_offer.save(async (err, checkTripOffer) => {
												if (err) {
													return errorResponse(res, 'Error')
												} else {
													tripDB.findByIdAndUpdate({
														_id: rider_trip_id
													}, {
														status: 1
													}, (err, updateRiderStatus) => {
														//console.log("updateRiderStatus", updateRiderStatus)
														if (err) {
															return errorResponse(res, "network error")
														} else {
															//return success(res, "Offer successfully sent")
															signupDB.findById({ _id: driver_id }, (err, getDevicedoc) => {
																if (err) {
																	return errorResponse(res, 'Error')
																} else {
																	if (getDevicedoc) {
																		profileDB.findOne({ profile_id: profile_id }, (err, getRiderdoc) => {
																			if (err) {
																				return errorResponse(res, 'Error')
																			} else {
																				if (getRiderdoc) {
																					console.log("----------", getRiderdoc.fullname)
																					var fcm = new FCM(serverKey);
																					let message = {
																						to: getDevicedoc.device_token,
																						notification: {
																							title: "Ride Offer",
																							//body: getRiderdoc.fullname+" sent you an offer",
																							body: getRiderdoc.fullname + " sent you an offer"


																						},

																						data: {
																							title: 'ok',
																							body: getRiderdoc.fullname + " sent you an offer"
																						}

																					};

																					console.log("message", message);
																					fcm.send(message, function (err, response) {
																						if (err) {
																							return notifyError(response, 'Error')
																						} else {
																							let createNotification = new notificationDB();

																							createNotification.user_id = profile_id,
																								createNotification.type = 2,
																								createNotification.message = message,
																								createNotification.created_date = Date.now(),
																								createNotification.updated_date = Date.now(),

																								createNotification.save((async (err, basicInfo) => {
																									if (err) {
																										return errorResponse(res, 'Please Try Again')
																									} else {
																										return notifySuccess(res, 'Offer successfully sent')
																									}
																								}));


																						}
																					})
																				}
																			}
																		});

																	}
																}
															})
														}
													});

												}
											});
											//return successWithData(res, 'Data Submitted Successfully', updateRoleInfo)
										}

									}
								});
							} else {
								let trip_offers = new tripOfferDB();

								trip_offers.rider_id = profile_id;
								trip_offers.rider_depart_date_time = rider_depart_date_time;
								trip_offers.rider_amount = rider_amount;
								trip_offers.rider_seat_request = rider_seat_request;
								trip_offers.rider_trip_id = rider_trip_id;
								trip_offers.is_trip_accepted_by_rider = 0;
								trip_offers.driver_id = driver_id;
								trip_offers.driver_trip_id = driver_trip_id;
								trip_offers.driver_seat_available = driver_seat_available;
								trip_offers.is_trip_accepted_by_driver = 0;
								trip_offers.status = 0;
								trip_offers.rider_offer_price = 0,
									trip_offers.driver_offer_price = 0,
									trip_offers.created_date = Date.now();

								await trip_offers.save(async (err, checkTripOffer) => {
									if (err) {
										return errorResponse(res, 'Error')
									} else {
										tripDB.findByIdAndUpdate({
											_id: rider_trip_id
										}, {
											status: 1
										}, (err, updateRiderStatus) => {
											//console.log("updateRiderStatus", updateRiderStatus)
											if (err) {
												return errorResponse(res, "network error")
											} else {
												//return success(res, "Offer successfully sent")
												signupDB.findById({ _id: driver_id }, (err, getDevicedoc) => {
													if (err) {
														return errorResponse(res, 'Error')
													} else {
														if (getDevicedoc) {
															profileDB.findOne({ profile_id: profile_id }, (err, getRiderdoc) => {
																if (err) {
																	return errorResponse(res, 'Error')
																} else {
																	if (getRiderdoc) {
																		console.log("----------", getRiderdoc.fullname)
																		var fcm = new FCM(serverKey);
																		let message = {
																			to: getDevicedoc.device_token,
																			notification: {
																				title: "Ride Offer",
																				body: getRiderdoc.fullname + " sent you an offer",
																			},

																			data: {
																				title: 'ok',
																				body: getRiderdoc.fullname + " sent you an offer"
																			}

																		};

																		console.log("message", message);
																		fcm.send(message, function (err, response) {
																			if (err) {
																				return notifyError(response, 'Error')
																			} else {
																				let createNotification = new notificationDB();

																				createNotification.user_id = profile_id,
																					createNotification.type = 2,
																					createNotification.message = message,
																					createNotification.created_date = Date.now(),
																					createNotification.updated_date = Date.now(),

																					createNotification.save((async (err, basicInfo) => {
																						if (err) {
																							return errorResponse(res, 'Please Try Again')
																						} else {
																							return notifySuccess(res, 'Offer successfully sent')
																						}
																					}));

																			}
																		})
																	}
																}
															});

														}
													}
												})
											}
										});
									}
								});

							}
							//console.log("find_driver_trip", find_driver_trip); 
						}

					}

				}

			}

		} catch (err) {
			console.log(err);
		}
	},

	//------------------- confirm ride sent by driver
	getDriverDetailToConfirmRide: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_id,
					driver_trip_id
				} = req.body;

				if (!(driver_id && driver_trip_id)) {
					return errorResponse(res, "driver_id or driver_trip_id is required")
				} else {
					console.log('bjbhjhj')
					var data = await tripDB.aggregate([{
						$match: {
							'_id': ObjectId(driver_trip_id),
							type: 1
						}
					},
					{
						$lookup: {
							from: 'profiles',
							localField: 'user_id',
							foreignField: 'profile_id',
							as: 'driverDetails',
						}

					},

					{
						$project: {
							'_id': 1,
							'user_id': 1,
							'amount': 1,
							'number_of_riders': 1, // seat_available for driver side
							'number_of_bags': 1, // bag_allowed for driver side
							'driverDetails.fullname': 1,
							'driverDetails.profile_id': 1,
						}
					}

					])
					console.log('data', data);
					return successWithData(res, 'Details found Successfully', data);
				}

			}


		} catch (err) {
			console.log(err);
		}
	},

	//-------------------(Accept button) final confirmation of ride sent by driver
	confirmRideSentByDriver: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			console.log('profile_id', profile_id)
			if (profile_id) {
				const {
					driver_trip_id,
					price
				} = req.body;

				if (!(driver_trip_id)) {
					return errorResponse(res, "driver_trip_id is required")
				} else {
					tripOfferDB.find({
						driver_trip_id: driver_trip_id,
						rider_id: profile_id,
						status: 0,
						is_trip_accepted_by_driver: 1
					}, async (err, doc) => {
						console.log("doc", doc)
						if (err) {
							return errorResponse(res, " Error While finding data")
						} else {
							if (doc.length > 0) {
								var rider_requested_seat = doc[0].rider_seat_request;
								//console.log("deducted_seat",rider_requested_seat)
								// var newvalues = {
								//     $set: {                                   
								//         is_trip_accepted_by_rider: 1,
								//         status: 1                                           
								//     }
								// }
								tripOfferDB.updateOne({
									_id: doc[0]._id
								}, {
									is_trip_accepted_by_rider: 1,
									status: 1,
									rider_offer_price: price,
									driver_offer_price: price
								}, async (err, updateTripStatus) => {
									if (err) {
										return errorResponse(res, 'Error while updating status')
									} else {
										tripDB.updateOne({
											_id: doc[0].rider_trip_id,
											type: 2
										}, {
											status: 3
										}, async (err, updateRiderStatus) => {
											if (err) {
												return errorResponse(res, 'Error while updating status')
											} else {
												//console.log("updateTripStatus",updateTripStatus,  doc[0]._id)

												tripDB.findOne({
													_id: doc[0].driver_trip_id
												}, async (err, findTripofDriver) => {
													//console.log("findTripofDriver", findTripofDriver);
													if (err) {
														return errorResponse(res, " Error While finding data")
													} else {
														if (findTripofDriver.seat_left_need) {
															var seat_left = Number(findTripofDriver.seat_left_need) - Number(rider_requested_seat);
															//console.log("seat_left", seat_left)
															if (Number(seat_left) != 0) {
																//    var newvalues = {
																//        $set: {                                   
																//            seat_left_need: Number(seat_left),
																//            //status: 3                                           
																//        }
																//    }
																tripDB.updateOne({
																	_id: doc[0].driver_trip_id
																}, {
																	seat_left_need: Number(seat_left)
																}, async (err, updateSeatStatus) => {
																	if (err) {
																		return errorResponse(res, 'Error while updating status')
																	} else {
																		//console.log("updateSeatStatus", updateSeatStatus);
																		if (updateSeatStatus.modifiedCount === 1) {
																			// return successWithData(res, "Trip accepted by rider", updateSeatStatus)
																			signupDB.findById({
																				_id: doc[0].driver_id
																			}, (err, getDevicedoc) => {
																				if (err) {
																					return errorResponse(res, 'Error')
																				} else {
																					if (getDevicedoc) {
																						profileDB.findOne({
																							profile_id: profile_id
																						}, async (err, getRiderdoc) => {
																							if (err) {
																								return errorResponse(res, 'Error')
																							} else {
																								if (getRiderdoc) {
																									console.log("----------", getRiderdoc.fullname)
																									var fcm = new FCM(serverKey);
																									let message = {
																										to: getDevicedoc.device_token,
																										notification: {
																											title: "Trip Accepted",
																											body: "Trip accepted by " + getRiderdoc.fullname,
																										},

																										data: {
																											title: 'ok',
																											body: "Trip accepted by " + getRiderdoc.fullname
																										}

																									};

																									console.log("message", message);
																									fcm.send(message, function (err, response) {
																										if (err) {
																											return notifyError(response, 'Error')
																										} else {
																											let createNotification = new notificationDB();

																											createNotification.user_id = profile_id,
																												createNotification.type = 2,
																												createNotification.message = message,
																												createNotification.created_date = Date.now(),
																												createNotification.updated_date = Date.now(),

																												createNotification.save((async (err, basicInfo) => {
																													if (err) {
																														return errorResponse(res, 'Please Try Again')
																													} else {
																														return notifySuccess(res, 'Trip accepted by rider')
																													}
																												}));

																										}
																									})
																									//return successWithData(res, "Trip accepted by rider", updateSeatStatus)
																								}
																							}
																						});

																					}
																				}
																			})
																		}

																	}
																})
															} else {
																//    var newvalues = {
																//        $set: {                                   
																//            seat_left_need: Number(seat_left),
																//            is_trip_full:1,
																//            status: 3                                           
																//        }
																//    }
																tripDB.updateOne({
																	_id: doc[0].driver_trip_id
																}, {
																	seat_left_need: Number(seat_left),
																	is_trip_full: 1,
																	status: 3
																}, async (err, updateSeatStatus) => {
																	if (err) {
																		return errorResponse(res, 'Error while updating status')
																	} else {
																		//console.log("updateSeatStatus", updateSeatStatus);
																		if (updateSeatStatus.modifiedCount === 1) {
																			//return success(res, "Trip accepted by rider")
																			signupDB.findById({
																				_id: doc[0].driver_id
																			}, (err, getDevicedoc) => {
																				if (err) {
																					return errorResponse(res, 'Error')
																				} else {
																					if (getDevicedoc) {
																						profileDB.findOne({
																							profile_id: profile_id
																						}, (err, getRiderdoc) => {
																							if (err) {
																								return errorResponse(res, 'Error')
																							} else {
																								if (getRiderdoc) {
																									console.log("----------", getRiderdoc.fullname)
																									var fcm = new FCM(serverKey);
																									let message = {
																										to: getDevicedoc.device_token,
																										notification: {
																											title: "Trip Accepted",
																											body: "Trip accepted by " + getRiderdoc.fullname,
																										},

																										data: {
																											title: 'ok',
																											body: "Trip accepted by " + getRiderdoc.fullname
																										}

																									};

																									console.log("message", message);
																									fcm.send(message, function (err, response) {
																										if (err) {
																											return notifyError(response, 'Error')
																										} else {
																											let createNotification = new notificationDB();

																											createNotification.user_id = profile_id,
																												createNotification.type = 2,
																												createNotification.message = message,
																												createNotification.created_date = Date.now(),
																												createNotification.updated_date = Date.now(),

																												createNotification.save((async (err, basicInfo) => {
																													if (err) {
																														return errorResponse(res, 'Please Try Again')
																													} else {
																														return notifySuccess(res, 'Trip accepted by rider')
																													}
																												}));

																										}
																									})
																								}
																							}
																						});

																					}
																				}
																			})
																		}

																	}
																})
															}


														} else {
															return errorResponse(res, "Trip not found")
														}
													}
												})
											}
										})

										//---
									}
								})
							} else {
								return errorResponse(res, "Rider Offer not found")
							}
						}
					})
				}

			}


		} catch (err) {
			console.log(err);
		}
	},

	// send new offer price to driver ----send offer screen 
	sendNewOfferPriceToDriver: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const profile_id = await req.user.id;
				if (profile_id) {
					const {
						driver_trip_id,
						newprice,
						actualprice
					} = req.body;

					if (!(driver_trip_id)) {
						return errorResponse(res, "driver_trip_id is required")
					} else {
						tripOfferDB.find({
							driver_trip_id: driver_trip_id,
							rider_id: profile_id,
							status: 0,
							is_trip_accepted_by_driver: 0
						}, async (err, doc) => {
							//console.log("doc", doc)
							if (err) {
								return errorResponse(res, " Error While finding data")
							} else {
								if (doc.length > 0) {
									tripOfferDB.updateOne({
										_id: doc[0]._id
									}, {
										rider_offer_price: actualprice,
										driver_offer_price: newprice,
										status: 5
									}, async (err, updateTripStatus) => {
										if (err) {
											return errorResponse(res, 'Error while updating status')
										} else {
											//return success(res, "New Offer Price Sent To Driver")
											signupDB.findById({
												_id: doc[0].driver_id
											}, (err, getDevicedoc) => {
												if (err) {
													return errorResponse(res, 'Error')
												} else {
													if (getDevicedoc) {
														profileDB.findOne({
															profile_id: profile_id
														}, (err, getRiderdoc) => {
															if (err) {
																return errorResponse(res, 'Error')
															} else {
																if (getRiderdoc) {
																	console.log("----------", getRiderdoc.fullname)
																	var fcm = new FCM(serverKey);
																	let message = {
																		to: getDevicedoc.device_token,
																		notification: {
																			title: "New Offer Price Sent",
																			body: "New Offer Price Sent by " + getRiderdoc.fullname,
																		},

																		data: {
																			title: 'ok',
																			body: "New Offer Price Sent " + getRiderdoc.fullname
																		}

																	};

																	fcm.send(message, function (err, response) {
																		if (err) {
																			return notifyError(response, 'Error')
																		} else {
																			let createNotification = new notificationDB();

																			createNotification.user_id = profile_id,
																				createNotification.type = 2,
																				createNotification.message = message,
																				createNotification.created_date = Date.now(),
																				createNotification.updated_date = Date.now(),

																				createNotification.save((async (err, basicInfo) => {
																					if (err) {
																						return errorResponse(res, 'Please Try Again')
																					} else {
																						return notifySuccess(res, 'New Offer Price Sent by rider')
																					}
																				}));


																		}
																	})
																}
															}
														});

													}
												}
											})

										}
									})
								} else {
									return errorResponse(res, "Rider Offer not found")
								}
							}
						})
					}

				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	//---------------- cancel driver offer
	cancelDriverOffer: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					rider_trip_id,
					driver_id
				} = req.body;

				if (rider_trip_id == null || rider_trip_id == "" || rider_trip_id == undefined && driver_id == null || driver_id == "" || driver_id == undefined) {
					return errorResponse(res, "rider_trip_id or driver_id is required")
				} else {
					tripOfferDB.findOneAndUpdate({
						rider_trip_id: rider_trip_id,
						driver_id: driver_id
					}, {
						is_trip_accepted_by_rider: 2,
						status: 2
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, " Error While updating status")
						} else {
							//return success(res, "Offer Rejected!");
							signupDB.findById({
								_id: driver_id
							}, (err, getDevicedoc) => {
								if (err) {
									return errorResponse(res, 'Error')
								} else {
									if (getDevicedoc) {
										profileDB.findOne({
											profile_id: profile_id
										}, (err, getRiderdoc) => {
											if (err) {
												return errorResponse(res, 'Error')
											} else {
												if (getRiderdoc) {
													console.log("----------", getRiderdoc.fullname)
													var fcm = new FCM(serverKey);
													let message = {
														to: getDevicedoc.device_token,
														notification: {
															title: "Offer Rejected",
															body: getRiderdoc.fullname + " cancelled the ride",
														},

														data: {
															title: 'ok',
															body: getRiderdoc.fullname + " cancelled the ride"
														}

													};

													console.log("message", message);
													fcm.send(message, function (err, response) {
														if (err) {
															return notifyError(response, 'Error')
														} else {
															let createNotification = new notificationDB();

															createNotification.user_id = profile_id,
																createNotification.type = 2,
																createNotification.message = message,
																createNotification.created_date = Date.now(),
																createNotification.updated_date = Date.now(),

																createNotification.save((async (err, basicInfo) => {
																	if (err) {
																		return errorResponse(res, 'Please Try Again')
																	} else {
																		return notifySuccess(res, 'Offer Rejected!')
																	}
																}));

														}
													})
												}
											}
										});

									}
								}
							})
						}
					})
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	//----------------------------- new offer request by driver
	getNewRequest: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				//const newday = new Date();                        
				//var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
				//if(today){
				tripOfferDB.find({
					is_trip_accepted_by_driver: 1,
					rider_id: ObjectId(profile_id),
					status: {
						$in: [0, 1]
					}
				}, (err, doc) => {
					if (err) {
						return errorResponse(res, " Error While finding data")
					} else {
						if (doc.length > 0) {
							const data = {
								new_ride_offer_request: doc.length
							}
							return successWithData(res, "New Ride Offer Request By Driver Found", data);
						} else {
							const data = {
								new_ride_offer_request: 0
							}
							return successWithData(res, "New Ride Offer Request By Driver Found", data);
						}

					}
				})
				//}

			}


		} catch (err) {
			console.log(err);
		}
	},

	//--------------------get active drivers count 
	getActiveDrivers: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				//const newday = new Date();                        
				//var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
				//if(today){
				signupDB.find({
					status: 1,
					role_id: 1
				}, (err, doc) => {
					if (err) {
						return errorResponse(res, " Error While finding data")
					} else {
						//console.log("doc",doc)
						if (doc.length > 0) {
							const data = {
								active_drivers: doc.length
							}
							return successWithData(res, "Active Drivers Found", data);
						} else {
							const data = {
								active_drivers: 0
							}
							return successWithData(res, "Active Drivers Found", data);
						}

					}
				})
				// }

			}


		} catch (err) {
			console.log(err);
		}
	},

	//---------------- rate driver after ride completion
	rateDriver: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				//console.log("profile_id", profile_id)
				const {
					rider_trip_id,
					driver_id,
					rating,
					issue
				} = req.body;
				if (!(rider_trip_id && driver_id && rating && issue)) {
					return validationError(res, "rider_trip_id, driver_id,rating and issue  is required")
				} else {
					riderRatingDB.findOne({
						driver_id: driver_id,
						ride_id: rider_trip_id
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, 'Error')
						} else {
							if (doc) {
								return errorResponse(res, "Rating already submitted")
							} else {

								let issue_desc;

								if (issue == "other") {
									issue_desc = req.body.issue_desc;
								} else {
									issue_desc = ""
								}
								let driver_rating = new riderRatingDB();

								driver_rating.driver_id = driver_id;
								driver_rating.ride_id = rider_trip_id;
								driver_rating.rating = rating;
								driver_rating.issue = issue;
								driver_rating.issue_desc = issue_desc;
								driver_rating.created_date = Date.now();

								//console.log("driver_rating",driver_rating)
								await driver_rating.save(async (err, ratingdoc) => {
									if (err) {
										return errorResponse(res, 'Error')
									} else {
										//return success(res, "rating submitted")
										signupDB.findById({
											_id: driver_id
										}, (err, getDevicedoc) => {
											if (err) {
												return errorResponse(res, 'Error')
											} else {
												if (getDevicedoc) {
													profileDB.findOne({
														profile_id: profile_id
													}, (err, getRiderdoc) => {
														if (err) {
															return errorResponse(res, 'Error')
														} else {
															if (getRiderdoc) {
																console.log("----------", getRiderdoc.fullname)
																var fcm = new FCM(serverKey);
																let message = {
																	to: getDevicedoc.device_token,
																	notification: {
																		title: "Review Completed",
																		body: getRiderdoc.fullname + " gave you review.",
																	},

																	data: {
																		title: 'ok',
																		body: getRiderdoc.fullname + " gave you review."
																	}

																};

																console.log("message", message);
																fcm.send(message, function (err, response) {
																	if (err) {
																		return notifyError(response, 'Error')
																	} else {
																		let createNotification = new notificationDB();

																		createNotification.user_id = profile_id,
																			createNotification.type = 2,
																			createNotification.message = message,
																			createNotification.created_date = Date.now(),
																			createNotification.updated_date = Date.now(),

																			createNotification.save((async (err, basicInfo) => {
																				if (err) {
																					return errorResponse(res, 'Please Try Again')
																				} else {
																					return success(res, "rating submitted")
																				}
																			}));

																	}
																})
															}
														}
													});

												}
											}
										})
									}
								});
							}
						}
					});

				}


			}


		} catch (err) {
			console.log(err);
		}
	},

	shareRideDetails: async function (req, res) {
		try {
			var profile_id = req.user.id;
			if (profile_id) {
				const findride = await tripDB.findOne({
					_id: req.body.driver_trip_id
				});
				if (findride) {
					return successWithData(res, 'Ride Successfully Found', findride);
				} else {
					return errorResponse(res, 'Data Not Found');
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	requestExpiration: async function (req, res) {
		try {

			const finduser = await tripDB.find({
				$ne: [{
					status: 4
				}],
				type: 2
			});
			// console.log('finduser--------',finduser);
			if (finduser.length > 0) {
				//console.log('finduser===',finduser)
				await Promise.all(finduser.map(async (row) => {
					const newday = new Date(row.created_date);
					const departtime = new Date(row.depart_date_time);
					//console.log('todayDate', todayDate);
					console.log('newday==', newday);

					const makenextday = newday.setDate(newday.getDate() + row.request_expiration);
					console.log('makenextday==', makenextday);
					var nextday = new Date(makenextday).toISOString().split('T')[0] + 'T00:00:00.000Z';
					console.log('nextday==', nextday);
					const todayDate = new Date();
					const matchday = await tripDB.find({
						$or: [{
							$ne: [{
								status: 4
							}],
							type: 2,
							'nextday': {
								$lte: todayDate
							}
						},
						{
							$ne: [{
								status: 4
							}],
							type: 2,
							departtime: {
								$lte: todayDate
							}
						}
						]
					})

					const update = await tripDB.updateOne({
						user_id: row._id
					}, {
						$set: {
							status: 4
						}
					});

					console.log('matchday==============', matchday);
				}));
				return success(res, 'Data Updated Successfully');
			}
			// }

		} catch (err) {
			console.log(err);
		}

	},

	submitFeedback: async function (req, res) {
		try {
			const { _id, profile_id, mobile, description, rating, created_date, fullname } = req.body;
			const feedback = new feedbackDB({
				profile_id,
				mobile,
				description,
				rating,
				created_date,
				full_name: fullname
			});

			await feedback.save();
			res.status(200).json({ message: 'Feedback submitted successfully' });
		} catch (err) {
			console.log(err);
			res.status(500).json({ error: 'Internal Server Error' });
		}
	},

	getRidersList: async function(req, res) {
		try {
      const skip = (page - 1) * limit;

      const totalRiders = await profileDB.countDocuments();

      // Build the base query
      const users = await signupDB
        .find({
          role_id: 2,
          // ...(searchQuery && {
          //   $or: [
          //     { username: { $regex: new RegExp(searchQuery, 'i') } },
          //     { email: { $regex: new RegExp(searchQuery, 'i') } },
          //   ],
          // })
        })
        // .skip(skip)
        // .limit(limit)
        .sort({ created_date: -1 })
        .exec();

      // Fetch background checks, user profiles, and trips in parallel
      const [backgroundChecks, userProfiles] = await Promise.all([
        Promise.all(users.map(user => backgroudCheckDB.findOne({ driver_id: user._id }))),
        Promise.all(users.map(user => profileDB.findOne({ profile_id: user._id }))),
        // Promise.all(users.map(user => userTripsModel.find({ user_id: user._id}))),
      ]);

      const tripsDetailsPromises = userProfiles.map(({ profile_id }) => {
        return userTripsModel.find({ user_id: profile_id })
          .then(trips => trips);
      });

      const tripsProfiles = await Promise.all(tripsDetailsPromises);

      const updatedUserProfiles = users.map((user, index) => {
        const backgroundCheck = backgroundChecks[index];
        const profile = userProfiles[index];
        const trips = tripsProfiles[index];



        return {
          ...profile.toObject(),
          user,
          backgroundCheck,
          totalTrips: trips.length,
        };
      });

      // const userProfilesPromises = users.map((user) => {
      //   return profileDB.findOne({ profile_id: user._id })
      //     .then(profile => ({
      //       user,
      //       profile,
      //     }));
      // });

      // const userProfilesWithProfile = await Promise.all(userProfilesPromises);

      // const tripsDetailsPromises = userProfilesWithProfile.map(({ profile }) => {
      //   return userTripsModel.find({ user_id: profile.profile_id })
      //     .then(trips => ({
      //       profile,
      //       trips,
      //     }));
      // });

      // const tripsProfiles = await Promise.all(tripsDetailsPromises);

      // const updatedUserProfiles = tripsProfiles.map(({ profile, trips }) => {
      //   return {
      //     ...profile.toObject(),
      //     totalTrips: trips.length,
      //   };
      // });

      // return {
      //   data: updatedUserProfiles,
      //   metadata: {
      //     page,
      //     pageSize: limit,
      //     total: totalDrivers,
      //     totalPages: Math.ceil(totalDrivers / limit),
      //   },
      // };

      if (searchQuery) {
        const searchQueryLowerCase = searchQuery.toLowerCase();

        const fullNameMatches = updatedUserProfiles.filter(user => {
          // const fullName = user?.backgroundCheck?.legal_first_name + ' ' + user?.backgroundCheck?.legal_middle_name + ' ' + user?.backgroundCheck?.legal_last_name; // Assuming fullName is a property in your profile model
          const fullName = user?.fullname;
          return fullName && fullName.toLowerCase().includes(searchQueryLowerCase);
        });

        const mobileNumberMatches = updatedUserProfiles.filter(user => {
          const mobileNumber = user?.mobile_no;
          return mobileNumber && mobileNumber.toLowerCase().includes(searchQueryLowerCase);
        });

        return [...fullNameMatches, ...mobileNumberMatches];
      }

      return successWithData(res, 'Success',updatedUserProfiles);
    } catch (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }
	},

	addRider: async function(req, res) {
		try {
			const { type, profile_picture, university_name, student_id, university_address, mobile, email, password, gender, destination_contact_number, gender_preferences, rider_preference, phone_code, phone_no, legal_first_name, legal_middle_name, legal_last_name, license_number, license_state, zip_code, dob, ssn, make, model, year, upload_vehicle_registration, upload_driver_licence, upload_inssurance_card, car_model, vehicle_license_plate_number } =
      req.body;
    let user = await signupDB.findOne({ email });
    if (user) {
      throw new Error("rider already exists", HttpStatusCode.BAD_REQUEST);
    }

    const hashed = password ? await bcrypt.hash(password, 10) : user.password;

    const profilePicture = profile_picture ? profile_picture : "";

    const addSignupDetails = new signupDB({
      email: email,
      username: email,
      password: hashed,
      device_id: "",
      device_token: "",
      device_type: "",
      email_verified: 0,
      jwttoken: "",
      otp: "",
      refreshToken: "",
      role_id: 2,
      status: 1
    })

    const addProfileDetails = new profileModel({
      profile_id: addSignupDetails._id,
      fullname: legal_first_name + ' ' + legal_middle_name + ' ' + legal_last_name,
      university_name: university_name,
      student_id: student_id,
      university_address: university_address,
      mobile_no: mobile,
      gender: gender,
      car_model: car_model,
      destination_contact_number: destination_contact_number,
      type: type,
      gender_preferences: gender_preferences,
      rider_preference: rider_preference,
      phone_code: phone_code,
      phone_no: phone_no,
      profile_photo: profilePicture,
      rating: "",
      make, model, year, upload_vehicle_registration, upload_driver_licence, upload_inssurance_card, vehicle_license_plate_number
    })

    const addBackgroundChecks = new backgroundChecksModel({
      driver_id: addSignupDetails._id,
      legal_first_name: legal_first_name,
      legal_middle_name: legal_middle_name,
      legal_last_name: legal_last_name,
      university_address: university_address,
      license_number: license_number,
      license_state: license_state,
      zip_code: zip_code,
      dob: dob,
      ssn: ssn,
      status: 1
    })

    await addSignupDetails.save();
    await addProfileDetails.save();
    await addBackgroundChecks.save();

    if (addSignupDetails && addProfileDetails && addBackgroundChecks) {
      return {
        msg: "Successfully added",
        statusCode: HttpStatusCode.OK
      };
    } else {
      throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }
		} catch (error) {
			console.error(error);
		}
	}
}