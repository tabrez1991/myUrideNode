const signupDB = require('../../../models/signup.model.js')
const backgroudCheckDB = require('../../../models/background.model.js')
const vehicleInfosDB = require('../../../models/vehicleInfo.model.js');
// const paymentMethodDB = require('../../models/paymentMethod.model.js');
const tripDB = require('../../../models/usersTrip.model.js');
const getPastTrip = require('../../common/commonController.js');
//const pasttrips=require('./commonController.js');
const FCM = require('fcm-node');
const tripOfferDB = require('../../../models/tripOffer.model.js');
const notificationDB = require('../../../models/notification.model.js');
const profileDB = require('../../../models/profile.model.js');
const driverRatingDB = require('../../../models/driverRating.model.js');

const verifyToken = require("../../../middleware/authentication.js");
const {
	success,
	successWithData,
	errorResponse,
	validationError,
	notifySuccess,
	notifyError
} = require('../../../helpers/apiResponse.js')
const path = require('path');
const mongoose = require('mongoose');
const cron = require('node-cron');
const { HttpStatusCode } = require('axios');
const ObjectId = mongoose.Types.ObjectId;
const serverKey = process.env.FIREBASE_KEY;
//const serverKey = 'AAAA142o9fo:APA91bH9KNp5i9pfreN1_KLInFl0VXcEuh82Mjn07P47sKeE7-kTEy8cKPe7XXZFUEsAYhGvZSMh0j5nML2EHeJEPFzkrclVN0L2bjDWI6K3-CH-hs9-HHd4m4EBSmaNV4dFaUgazZgF';


module.exports = {
	verifyToken,

	//----------------- delete whole trip created by driver
	deleteTrip: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id
				} = req.body;
				if (driver_trip_id == "" || driver_trip_id == null || driver_trip_id == undefined) {
					return validationError(res, "driver_trip_id is required")
				} else {
					const findtrip = await tripDB.findById({
						_id: driver_trip_id
					});
					//console.log("findtrip", findtrip)
					if (findtrip) {
						tripDB.findByIdAndUpdate({
							_id: driver_trip_id
						}, {
							status: 4
						}, (err, doc) => {
							//console.log("doc", doc)
							if (err) {
								return errorResponse(res, "network error")
							} else {

								tripOfferDB.find({ driver_trip_id: driver_trip_id, status: 1 }, async (err, offerByRiderDoc) => {
									if (offerByRiderDoc.length > 0) {
										await Promise.all(offerByRiderDoc.map(async (row) => {
											await signupDB.findById({ _id: row.rider_id }, async (err, getRiderDeviceTokenDoc) => {
												if (err) {
													return errorResponse(res, "issue while finding")
												} else {
													if (getRiderDeviceTokenDoc) {
														profileDB.findOne({ profile_id: profile_id }, async (err, getDriverNameDoc) => {
															if (err) {
																return errorResponse(res, "issue while finding")
															} else {
																if (getDriverNameDoc) {
																	console.log("----------", getDriverNameDoc.fullname)
																	tripOfferDB.updateOne({ driver_trip_id: row.driver_trip_id }, { status: 3 }, async (err, updateOfferStatus) => {
																		if (err) {
																			return errorResponse(res, "issue while updating")
																		} else {
																			var fcm = new FCM(serverKey);
																			let message = {
																				to: getRiderDeviceTokenDoc.device_token,
																				notification: {
																					title: "Trip Deleted",
																					body: getDriverNameDoc.fullname + " deleted the trip",
																				},

																				data: {
																					title: 'ok',
																					body: getDriverNameDoc.fullname + " deleted the trip"
																				}

																			};

																			console.log("message", message);
																			fcm.send(message, function (err, response) {
																				if (err) {
																					return notifyError(response, 'Error')
																				} else {
																					let createNotification = new notificationDB();

																					createNotification.user_id = getRiderDeviceTokenDoc._id,
																						createNotification.type = 2,
																						createNotification.message = message,
																						createNotification.created_date = Date.now(),
																						createNotification.updated_date = Date.now(),

																						createNotification.save((async (err, basicInfo) => {
																							if (err) {
																								return errorResponse(res, 'Please Try Again')
																							} else {
																								return notifySuccess(res, 'Trip successfully deleted')
																							}
																						}));


																				}
																			})
																		}
																	})

																}
															}
														})
													}
												}
											});



										}));
									} else {
										return success(res, "Trip is cancelled/deleted")
									}
								})

								// tripOfferDB.deleteMany({
								//     driver_trip_id: ObjectId(driver_trip_id)
								// }, (err, doc1) => {
								//     //console.log("doc1", doc1)
								//     if (err) {
								//         return errorResponse(res, "Issue While deleting trips")
								//     } else {
								//         return success(res, "Trip is cancelled/deleted")
								//     }
								// })


							}
						})
					} else {
						return errorResponse(res, "trip not found")
					}
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	// find riders
	findRiders: async function (req, res) {
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
									type: 2,
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
															2
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
									as: "RiderTrip"
								}

							},
							{
								$unwind: "$RiderTrip"
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

	//---------------------- send offer to rider
	sendOfferToRider: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					rider_id,
					driver_trip_id,
					driver_depart_date_time,
					driver_amount,
					driver_seat_request,
					rider_seat_available,
					rider_trip_id
				} = req.body;
				//console.log("---",driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id)
				if (!(rider_id && driver_trip_id && driver_depart_date_time && driver_amount && driver_seat_request && rider_seat_available && rider_trip_id)) {
					return errorResponse(res, "driver_id, rider_trip_id, rider_depart_date_time, rider_amount,rider_seat_request, driver_seat_available, driver_trip_id are required");

				} else {
					const findOfferLimitExceed = await tripOfferDB.find({
						driver_id: profile_id,
						driver_trip_id: driver_trip_id
					});
					//console.log("findOfferLimitExceed", findOfferLimitExceed.length)
					if (findOfferLimitExceed.length >= 3) {
						return errorResponse(res, "You can send offer to 3 Drivers")
					} else {

						const checkTripOffer = await tripOfferDB.findOne({
							driver_id: profile_id,
							rider_trip_id: rider_trip_id,
							rider_id: rider_id
						});
						console.log("checkTripOffer", checkTripOffer)
						if (checkTripOffer) {
							return errorResponse(res, "This offer is already sent")
						} else {
							const find_rider_trip = await tripDB.findOne({
								user_id: rider_id,
								_id: rider_trip_id,
								type: 1
							});
							//console.log("find_driver_trip", find_driver_trip)

							if (find_rider_trip.trip_accepted == 0) {
								var newvalues = {
									$set: {
										trip_accepted: 1
									}
								}
								tripDB.updateOne({
									_id: req.body.rider_trip_id
								}, newvalues, async (err, updateTripStatus) => {
									if (err) {
										return errorResponse(res, 'Error while updating status')
									} else {
										if (updateTripStatus.modifiedCount == 1) {
											let trip_offer = new tripOfferDB();

											trip_offer.driver_id = profile_id;
											trip_offer.driver_depart_date_time = driver_depart_date_time;
											trip_offer.driver_amount = driver_amount;
											trip_offer.driver_seat_request = driver_seat_request;
											trip_offer.driver_trip_id = driver_trip_id;
											trip_offer.is_trip_accepted_by_driver = 0; //offer Sent
											trip_offer.driver_id = driver_id;
											trip_offer.driver_trip_id = driver_trip_id;
											trip_offer.driver_seat_available = driver_seat_available;
											trip_offer.is_trip_accepted_by_rider = 0;
											trip_offer.is_offer_sent_by_driver = 1;
											trip_offer.status = 0;
											trip_offer.driver_offer_price = 0,
												trip_offer.rider_offer_price = 0,
												trip_offer.created_date = Date.now();


											await trip_offer.save(async (err, checkTripOffer) => {
												if (err) {
													return errorResponse(res, 'Error')
												} else {
													tripDB.findByIdAndUpdate({
														_id: driver_trip_id
													}, {
														status: 1
													}, (err, updateDriverStatus) => {
														//console.log("updateRiderStatus", updateRiderStatus)
														if (err) {
															return errorResponse(res, "network error")
														} else {
															//return success(res, "Offer successfully sent")
															signupDB.findById({ _id: rider_id }, (err, getDevicedoc) => {
																if (err) {
																	return errorResponse(res, 'Error')
																} else {
																	if (getDevicedoc) {
																		profileDB.findOne({ profile_id: profile_id }, (err, getDriverdoc) => {
																			if (err) {
																				return errorResponse(res, 'Error')
																			} else {
																				if (getDriverdoc) {
																					console.log("----------", getDriverdoc.fullname)
																					var fcm = new FCM(serverKey);
																					let message = {
																						to: getDevicedoc.device_token,
																						notification: {
																							title: "Ride Offer",
																							//body: getRiderdoc.fullname+" sent you an offer",
																							body: getDriverdoc.fullname + " sent you an offer"


																						},

																						data: {
																							title: 'ok',
																							body: getDriverdoc.fullname + " sent you an offer"
																						}

																					};

																					console.log("message", message);
																					fcm.send(message, function (err, response) {
																						if (err) {
																							return notifyError(response, 'Error')
																						} else {
																							let createNotification = new notificationDB();

																							createNotification.user_id = profile_id,
																								createNotification.type = 1,
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

	//------------ get all trips with their offers by riders
	getRiderOfferByTripId: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			console.log('profile_id', profile_id);
			if (profile_id) {
				const findtype = await signupDB.findOne({
					_id: profile_id
				});

				const newday = new Date();
				var today = new Date(newday).toISOString().split('T')[0] + 'T00:00:00.000Z';
				//console.log("today", today);
				var arr = [];
				var data = await tripDB.aggregate([{
					$match: {
						$and: [{
							type: 1
						},
						{
							user_id: ObjectId(profile_id)
						},
						{
							status: {
								$in: [0, 1, 2, 3, 5]
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
											"$driver_trip_id"
										]
									},

									{
										$eq: [
											"$driver_id",
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
				console.log('data', data)
				await Promise.all(data.map(async (row) => {
					console.log('row', row)

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
				// if(findtype.role_id=='3'){
				//     const excludedValue= findtype;
				// console.log('exclude',excludedValue);
				// const filteredData = data.filter((item) => item !== excludedValue);
				//  console.log(filteredData); // Output: [1, 2, 4, 5]


				return successWithData(res, 'Details found Successfully', arr);
				//}

			}

		} catch (err) {
			console.log(err);
		}
	},

	//------------ get all upcoming trips 
	getUpcomingTrips: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const newday = new Date();
				var today = new Date(newday).toISOString().split('T')[0] + 'T00:00:00.000Z';
				//console.log("today", today);
				var arr = [];

				var data = await tripDB.aggregate([{
					$match: {
						$and: [{
							type: 1
						},
						{
							user_id: ObjectId(profile_id)
						},
						{
							// status: {$in:[0,1]} 
							status: 0
						},


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
											"$driver_trip_id"
										]
									},

									{
										$eq: [
											"$driver_id",
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
					console.log('row', row)

					if (row.findUpcomingtrips > 0) {
						// console.log('row',row.findUpcomingtrips)
						await Promise.all(row.findUpcomingtrips.map(async (row1) => {

							const findtrip = await profileDB.findOne({
								profile_id: row1.rider_id
							});
							//console.log('findtrip',findtrip)

							row1.fullname = findtrip.fullname;
							row1.gender = findtrip.gender;

						}))
					}

					arr.push(row);

				}));
				return successWithData(res, 'Details found Successfully', arr);

			}

		} catch (err) {
			console.log(err);
		}
	},

	//-------------------- get all rider offer details of particular trip 
	getAllRiderTripOfferdetail: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id
				} = req.body;

				if (!(driver_trip_id)) {
					return validationError(res, 'driver_trip_id field is required')
				} else {
					var data = await tripOfferDB.aggregate([{
						$match: {
							'driver_trip_id': ObjectId(driver_trip_id)
						}
					},
					{
						$lookup: {
							from: "profiles",
							let: {
								id: "$rider_id",

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
												2
												//ObjectId(profile_id) 
											]
										},
										]
									}
								}
							}],


							as: "riderDetails"
						},
					},
					// {
					//     $lookup: {
					//         from: 'profiles',
					//         localField: 'rider_id',
					//         foreignField: 'profile_id',
					//         as: 'riderDetails',
					//     }

					// },                        

					{
						$lookup: {
							from: 'usertrips',
							localField: 'rider_trip_id',
							foreignField: '_id',
							as: 'riderTripDetails',
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
							'riderDetails': 1,
							'riderTripDetails': 1


						}
					}

					])
					if (data) {
						tripDB.find({
							_id: ObjectId(driver_trip_id)
						}, async (err, doc) => {
							if (err) {
								return errorResponse(res, " Error While updating status")
							} else {

								const newdata = {
									"offerByRider": data,
									"DriverTripDetail": doc
								}
								if (data) {
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

	//-------------------- get single rider offer details of particular trip 
	getSingleRiderTripOfferdetail: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id,
					rider_id
				} = req.body;

				if (!(driver_trip_id && rider_id)) {
					return validationError(res, 'driver_trip_id or rider_id field is required')
				} else {
					var data = await tripOfferDB.aggregate([{
						$match: {

						}
					},
					{
						$match: {
							$and: [{
								driver_trip_id: ObjectId(driver_trip_id)
							},
							{
								rider_id: ObjectId(rider_id)
							}

							]
						}
					},
					{
						$lookup: {
							from: 'profiles',
							localField: 'rider_id',
							foreignField: 'profile_id',
							as: 'riderDetails',
						}

					},

					{
						$lookup: {
							from: 'usertrips',
							localField: 'rider_trip_id',
							foreignField: '_id',
							as: 'riderTripDetails',
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
							'riderDetails': 1,
							'riderTripDetails': 1


						}
					}

					])

					return successWithData(res, 'Details found Successfully', data);
				}

			}

		} catch (err) {
			console.log(err);
		}
	},

	//-------------------- get particular rider details of offer 
	getSingleRiderTripdetail: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					rider_id,
					rider_trip_id
				} = req.body;

				if (!(rider_id && rider_trip_id)) {
					return validationError(res, 'rider_id or rider_trip_id fields are required')
				} else {
					var data = await tripDB.aggregate([{
						$match: {
							$and: [{
								_id: ObjectId(rider_trip_id)
							},
							{
								user_id: ObjectId(rider_id)
							},


							]
						}
					},
					{
						$lookup: {
							from: 'profiles',
							localField: 'user_id',
							foreignField: 'profile_id',
							as: 'riderDetails',
						}

					},

					{
						$project: {
							'pickup_lat': 1,
							'pickup_location': 1,
							'pickup_long': 1,
							'destination_location': 1,
							'destination_lat': 1,
							'destination_long': 1,
							'trip': 1,
							'depart_date_time': 1,
							'return_date_time': 1,
							'request_expiration': 1,
							'number_of_riders': 1, // seat_available for driver side
							'number_of_bags': 1, // bag_allowed for driver side
							'special_request': 1,
							'offerDetail': 1,
							'riderDetails': 1,


						}
					}

					])
					return successWithData(res, 'Details found Successfully', data);
				}

			}

		} catch (err) {
			console.log(err);
		}
	},

	//---------------- get new ride rquest in your(driver) area
	getNewRiderRequestInArea: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id
				} = req.body;

				if (!(driver_trip_id)) {
					return errorResponse(res, "driver_trip_id is required")
				} else {
					tripOfferDB.find({
						driver_trip_id: driver_trip_id,
						status: 0
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, " Error While updating status")
						} else {
							if (doc.length > 0) {
								const data = {
									new_ride_request_in_area: doc.length
								}
								return successWithData(res, "New Request Found In Your Area", data);
							} else {
								const data = {
									new_ride_request_in_area: 0
								}
								return successWithData(res, "New Request Found In Your Area", data);
							}


						}
					})
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	//---------------- get ride total distance
	getRideTotalDistance: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id
				} = req.body;

				if (!(driver_trip_id)) {
					return errorResponse(res, "driver_trip_id is required")
				} else {
					tripDB.findOne({
						driver_trip_id: driver_trip_id
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, " Error While updating status")
						} else {
							if (doc) {
								const get_distance = (Number(doc.trip_distance) * 0.62137119223793).toFixed(2);
								const data = {
									total_distance: get_distance
								}
								return successWithData(res, "Total distance in miles", data);
							}


						}
					})
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	//---------------- accept rider offer
	acceptRiderOffer: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id,
					rider_id
				} = req.body;

				if (!(driver_trip_id && rider_id)) {
					return errorResponse(res, "driver_trip_id or rider_id is required")
				} else {
					//console.log("")
					tripOfferDB.findOneAndUpdate({
						driver_trip_id: driver_trip_id,
						rider_id: rider_id
					}, {
						is_trip_accepted_by_driver: 1,
						//  is_offer_sent_by_driver:1
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, " Error While updating status")
						} else {
							if (doc) {
								console.log('doc==', doc)
								tripDB.findOneAndUpdate({
									_id: doc.rider_trip_id,
									user_id: rider_id
								}, {
									trip_accepted: 1
								}, async (err, updateRiderTripStatus) => {
									if (err) {
										return errorResponse(res, " Error While updating status")
									} else {
										// return success(res, "Rider Offer Accepted By Driver")
										signupDB.findById({ _id: doc.rider_id }, (err, getDevicedoc) => {
											if (err) {
												return errorResponse(res, 'Error')
											} else {
												if (getDevicedoc) {
													profileDB.findOne({ profile_id: profile_id }, (err, getDriverdoc) => {
														if (err) {
															return errorResponse(res, 'Error')
														} else {
															if (getDriverdoc) {
																console.log("----------", getDriverdoc.fullname)
																var fcm = new FCM(serverKey);
																let message = {
																	to: getDevicedoc.device_token,
																	notification: {
																		title: "Offer Accepted",
																		body: getDriverdoc.fullname + " accepted your offer.",
																	},

																	data: {
																		title: 'ok',
																		body: getDriverdoc.fullname + " accepted your offer."
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
																					return notifySuccess(res, 'Rider Offer Accepted')
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
					})
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	//---------------- cancel rider offer
	rejectRiderOffer: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id,
					rider_id
				} = req.body;

				if (driver_trip_id == null || driver_trip_id == "" || driver_trip_id == undefined && rider_id == null || rider_id == "" || rider_id == undefined) {
					return errorResponse(res, "driver_trip_id or rider_id is required")
				} else {
					tripOfferDB.findOneAndUpdate({
						driver_trip_id: driver_trip_id,
						rider_id: rider_id
					}, {
						is_trip_accepted_by_driver: 2,
						status: 2
					}, async (err, doc) => {
						if (err) {
							return errorResponse(res, " Error While updating status")
						} else {
							// return success(res, "Offer Rejected!");
							signupDB.findById({ _id: doc.rider_id }, (err, getDevicedoc) => {
								if (err) {
									return errorResponse(res, 'Error')
								} else {
									if (getDevicedoc) {
										profileDB.findOne({ profile_id: profile_id }, (err, getDriverdoc) => {
											if (err) {
												return errorResponse(res, 'Error')
											} else {
												if (getDriverdoc) {
													console.log("----------", getDriverdoc.fullname)
													var fcm = new FCM(serverKey);
													let message = {
														to: getDevicedoc.device_token,
														notification: {
															title: "Offer Cancellation",
															body: getDriverdoc.fullname + " cancelled your offer.",
														},

														data: {
															title: 'ok',
															body: getDriverdoc.fullname + " cancelled your offer."
														}

													};

													console.log("message", message);
													fcm.send(message, function (err, response) {
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
																	return notifySuccess(res, 'Rider Offer Cancelled')
																}
															}));


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

	//---------------- get new ride requests count
	getNewRideRequest: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				//const newday = new Date();                        
				//var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
				//if(today){
				tripOfferDB.find({
					status: 0,
					driver_id: profile_id
				}, (err, doc) => {
					if (err) {
						return errorResponse(res, " Error While finding data")
					} else {
						if (doc.length > 0) {
							const data = {
								new_ride_request: doc.length
							}
							return successWithData(res, "New Ride Request Found", data);
						} else {
							const data = {
								new_ride_request: 0
							}
							return successWithData(res, "New Ride Request Found", data);
						}

					}
				})
				//}

			}


		} catch (err) {
			console.log(err);
		}
	},

	//---------------- get active riders count
	getActiveRiders: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				//const newday = new Date();                        
				//var today = new Date(newday).toISOString().split('T')[0]+'T00:00:00.000Z';
				//if(today){
				signupDB.find({
					status: 1,
					role_id: {
						$in: [2, 3]
					}
				}, (err, doc) => {
					if (err) {
						return errorResponse(res, " Error While finding data")
					} else {
						//console.log("doc",doc)
						if (doc.length > 0) {
							const data = {
								active_riders: doc.length
							}
							return successWithData(res, "Active Riders Found", data);
						} else {
							const data = {
								active_riders: 0
							}
							return successWithData(res, "Active Riders Found", data);
						}

					}
				})
				// }

			}


		} catch (err) {
			console.log(err);
		}
	},

	//------------------ start trip-----------------------
	startTrip: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {

				const {
					driver_trip_id
				} = req.body;
				console.log("profile_db", profile_id)
				console.log("driver_trip_id", driver_trip_id)
				if (!(driver_trip_id)) {
					return validationError(res, "driver_trip_id is required")
				} else {
					tripDB.findByIdAndUpdate({
						_id: driver_trip_id
					}, {
						status: 5
					}, async (err, doc) => {
						console.log("doc", doc);
						if (err) {
							return errorResponse(res, " Error While updating start trip status")
						} else {
							if (doc) {
								var arr = [];
								var newarr = [];
								var data = await tripDB.aggregate([
									{
										$match: {
											$and: [
												{ _id: ObjectId(driver_trip_id) },
												{ user_id: ObjectId(profile_id) }
											]
										}
									},
									{
										$lookup: {
											from: "tripoffers",
											let: {
												driver_trip_id: "$_id",
												driver_id: "$user_id"
											},
											pipeline: [
												{
													$match: {
														$expr: {
															$and: [
																{ $eq: ["$driver_trip_id", "$$driver_trip_id"] },
																{ $eq: ["$driver_id", "$$driver_id"] },
																{ $eq: ["$status", 1] }
															]
														}
													}
												}
											],
											as: "findRiderInfo"
										}
									}
								]);



								console.log("data", data)
								await Promise.all(data.map(async (row) => {
									//console.log('row',row)

									if (row.findRiderInfo.length > 0) {
										console.log('row data', row.findRiderInfo)
										await Promise.all(row.findRiderInfo.map(async (row1) => {

											const findtrip = await profileDB.findOne({
												profile_id: row1.rider_id
											});
											//console.log('findtrip',findtrip)

											row1.rider_fullname = findtrip.fullname;
											row1.rider_gender = findtrip.gender;
											row1.rider_profile_photo = findtrip.profile_photo;
											row1.rider_destination_contact_no = findtrip.destination_contact_number;
											row1.rider_mobile_no = findtrip.mobile_no;
											row1.rider_type = findtrip.type;

										}))
									}

									arr.push(row);


								}));
								console.log("arr", arr)
								await Promise.all(arr.map(async (row) => {
									//console.log('row',row)

									if (row.findRiderInfo.length > 0) {
										//console.log('row',row.findRiderInfo)
										await Promise.all(row.findRiderInfo.map(async (row1) => {

											const findtrip1 = await tripDB.findOne({
												_id: row1.driver_trip_id
											});
											//console.log('findtrip1',findtrip1)

											row1.rider_pickup_location = findtrip1.pickup_location;
											row1.riderpickup_lat = findtrip1.pickup_lat;
											row1.rider_pickup_long = findtrip1.pickup_long;
											row1.rider_destination_location = findtrip1.destination_location;
											row1.rider_destination_lat = findtrip1.destination_lat;
											row1.rider_actionType = findtrip1.actionType;
											row1.rider_trip_type = findtrip1.trip;
											if (findtrip1.trip == "rounded") {
												row1.rider_return_date_time = findtrip1.return_date_time;
											}


										}))
									}

									newarr.push(row);


								}));

								console.log("newarr", newarr)
								// return successWithData(res, 'Details found Successfully', newarr);
								if (newarr.length > 0) {
									await Promise.all(newarr.map(async (row) => {
										console.log("rowwww", row)
										await Promise.all(row.findRiderInfo.map(async (row2) => {
											console.log("row2", row2)
											signupDB.findById({ _id: row2.rider_id }, (err, getRiderDeviceTokenDoc) => {
												if (err) {
													return errorResponse(res, "issue while finding")
												} else {
													if (getRiderDeviceTokenDoc) {
														console.log("getRiderDeviceTokenDoc", getRiderDeviceTokenDoc)
														profileDB.findOne({ profile_id: profile_id }, async (err, getDriverNameDoc) => {
															if (err) {
																return errorResponse(res, "issue while finding")
															} else {
																if (getDriverNameDoc) {
																	console.log("----------", getDriverNameDoc.fullname)
																	tripOfferDB.updateOne({ driver_trip_id: row2.driver_trip_id }, { status: 3 }, async (err, updateOfferStatus) => {
																		if (err) {
																			return errorResponse(res, "issue while updating")
																		} else {
																			var fcm = new FCM(serverKey);
																			let message = {
																				to: getRiderDeviceTokenDoc.device_token,
																				notification: {
																					title: "Trip Started",
																					body: getDriverNameDoc.fullname + " started the trip",
																				},

																				data: {
																					title: 'ok',
																					body: getDriverNameDoc.fullname + " started the trip"
																				}

																			};

																			console.log("message", message);
																			fcm.send(message, function (err, response) {
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
																				//return notifySuccess(res, 'Rider Offer Cancelled') 

																			})
																		}
																	})

																}
															}
														})
													}
												}
											});
										}))

									}));
									return successWithData(res, 'Trip Started Successfully', newarr);
								}

							}



						}
					})
				}



			}


		} catch (err) {
			console.log(err);
		}
	},

	//---------------- finish ride
	finishRide: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id
				} = req.body;
				if (!(driver_trip_id)) {
					return validationError(res, "driver_trip_id is required")
				} else {
					tripDB.findByIdAndUpdate({
						_id: driver_trip_id
					}, {
						status: 6
					}, (err, doc) => {
						console.log("doc", doc)
						if (err) {
							return errorResponse(res, " Error While finding data")
						} else {
							tripOfferDB.find({
								driver_trip_id: driver_trip_id,
								status: 1
							}, async (err, getRiders) => {
								console.log("getRiders", getRiders)
								if (err) {
									return errorResponse(res, " Error While finding data")
								} else {
									if (getRiders.length > 0) {
										await Promise.all(getRiders.map(async (row) => {
											//console.log('row',row)        
											await tripDB.findByIdAndUpdate({
												_id: row.rider_trip_id
											}, {
												status: 6
											});
											await signupDB.findById({ _id: row.rider_id }, async (err, getRiderDeviceTokenDoc) => {
												if (err) {
													return errorResponse(res, "issue while finding")
												} else {
													if (getRiderDeviceTokenDoc) {
														console.log("getRiderDeviceTokenDoc", getRiderDeviceTokenDoc)
														profileDB.findOne({ profile_id: profile_id }, async (err, getDriverNameDoc) => {
															if (err) {
																return errorResponse(res, "issue while finding")
															} else {
																if (getDriverNameDoc) {
																	console.log("----------", getDriverNameDoc.fullname)
																	tripOfferDB.updateOne({ driver_trip_id: row.driver_trip_id }, { status: 3 }, async (err, updateOfferStatus) => {
																		if (err) {
																			return errorResponse(res, "issue while updating")
																		} else {
																			var fcm = new FCM(serverKey);
																			let message = {
																				to: getRiderDeviceTokenDoc.device_token,
																				notification: {
																					title: "Trip Completed",
																					body: getDriverNameDoc.fullname + " finished the trip",
																				},

																				data: {
																					title: 'ok',
																					body: getDriverNameDoc.fullname + " finished the trip"
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
																								// return success(res, "rating submitted")
																							}
																						}));
																					//return notifySuccess(res, 'Trip Completed') 

																					// tripOfferDB.updateMany({driver_trip_id: driver_trip_id, status: 1},{status: 4}, (err,updateFinalStatus)=>{
																					//     if(err){
																					//         return errorResponse(res," Error While finding data")
																					//     }else{
																					//         //console.log("updateFinalStatus", updateFinalStatus);
																					//         tripOfferDB.deleteMany({driver_trip_id: driver_trip_id, status: 0}, (err,deleteRemaining)=>{
																					//             if(err){
																					//                 return errorResponse(res," Error While finding data")
																					//             }else{
																					//                 return success(res,"Trip Completed")

																					//             }
																					//          }) 
																					//     }
																					// })
																				}
																			})
																		}
																	})

																}
															}
														})
													}
												}
											});

										}));

										tripOfferDB.updateMany({
											driver_trip_id: driver_trip_id,
											status: 1
										}, {
											status: 4
										}, (err, updateFinalStatus) => {
											if (err) {
												return errorResponse(res, " Error While finding data")
											} else {
												//console.log("updateFinalStatus", updateFinalStatus);
												tripOfferDB.deleteMany({
													driver_trip_id: driver_trip_id,
													status: 0
												}, (err, deleteRemaining) => {
													if (err) {
														return errorResponse(res, " Error While finding data")
													} else {
														return success(res, "Trip Completed")
													}
												})
											}
										})

									} else {
										return success(res, "No riders Founds with trip")
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

	//---------------- rate riders after trip completion
	rateRiders: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			if (profile_id) {
				const {
					driver_trip_id,
					rider_id,
					rating,
					issue
				} = req.body;
				if (!(driver_trip_id && rider_id && rating && issue)) {
					return validationError(res, "driver_trip_id, rider_id, rating and issue  is required")
				} else {
					driverRatingDB.findOne({
						rider_id: rider_id,
						trip_id: driver_trip_id
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
								let rider_rating = new driverRatingDB();

								rider_rating.rider_id = rider_id;
								rider_rating.trip_id = driver_trip_id;
								rider_rating.rating = rating;
								rider_rating.issue = issue;
								rider_rating.issue_desc = issue_desc;
								rider_rating.created_date = Date.now();


								await rider_rating.save(async (err, ratingdoc) => {
									if (err) {
										return errorResponse(res, 'Error')
									} else {
										//return success(res, "rating submitted")
										signupDB.findById({ _id: rider_id }, (err, getDevicedoc) => {
											if (err) {
												return errorResponse(res, 'Error')
											} else {
												if (getDevicedoc) {
													profileDB.findOne({ profile_id: profile_id }, (err, getDriverdoc) => {
														if (err) {
															return errorResponse(res, 'Error')
														} else {
															if (getDriverdoc) {
																console.log("----------", getDriverdoc.fullname)
																var fcm = new FCM(serverKey);
																let message = {
																	to: getDevicedoc.device_token,
																	notification: {
																		title: "Review Completed",
																		body: getDriverdoc.fullname + " gave you review.",
																	},

																	data: {
																		title: 'ok',
																		body: getDriverdoc.fullname + " gave you review."
																	}

																};

																console.log("message", message);
																fcm.send(message, function (err, response) {

																	createNotification.user_id = profile_id,
																		createNotification.type = 1,
																		createNotification.message = message,
																		createNotification.created_date = Date.now(),
																		createNotification.updated_date = Date.now(),


																		createNotification.save((async (err, basicInfo) => {
																			if (err) {
																				return errorResponse(res, 'Please Try Again')
																			} else {
																				// return success(res, "rating submitted")
																			}
																		}));
																	//return success(res, "rating submitted") ;                                                         

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
					})
				}
			}
		} catch (err) {
			console.log(err);
		}
	},

	getCarDetails: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			console.log('profile------', profile_id)
			if (profile_id) {
				const driverProfileId = await profileDB.findOne({
					$and: [{
						profile_id: profile_id,
						type: 1
					}]
				});
				console.log('driverProfileId', driverProfileId)
				if (driverProfileId) {
					console.log('driverProfileId===', driverProfileId);
					var data = await profileDB.aggregate([{
						$match: {
							profile_id: driverProfileId.profile_id,
							type: 1
						}
					},
					{
						$lookup: {
							from: 'vehicleinfos',
							localField: 'profile_id',
							foreignField: 'driver_id',
							as: 'CarDetails',
						}

					},

					{
						$project: {
							'profile_id': 1,
							'fullname': 1,
							'car_model': 1,
							'type': 1,
							'CarDetails': 1
						}
					}

					])
					return successWithData(res, 'Details found Successfully', data);

				} else {
					errorResponse(res, 'No Data Found');
				}
				// console.log('data',data);
			}

		} catch (err) {
			console.log(err);
		}
	},

	getActiveTripStatus: async function (req, res) {
		try {
			const profile_id = await req.user.id;
			console.log('profile------', profile_id)
			if (profile_id) {
				if (req.body.driver_trip_id && req.body.driver_id) {
					const activeTrips = await tripDB.findOne({ _id: req.body.driver_trip_id, user_id: req.body.driver_id, status: 5 });
					if (activeTrips) {
						return successWithData(res, 'Active Trip found Successfully', activeTrips);
					} else {
						errorResponse(res, 'No Trip Found In Progress');
					}
				} else {
					const allActiveTrips = await tripDB.find({ user_id: req.body.driver_id, status: 5 });
					if (allActiveTrips.length > 0) {
						return successWithData(res, 'Active Trips found Successfully', allActiveTrips);
					} else {
						errorResponse(res, 'No Trips Found In Progress');
					}
				}
			}

		} catch (err) {
			console.log(err);
		}
	},

	getDriversList: async function (req, res) {
		try {
			const { page = 1, limit = 10, searchQuery } = req.query;

			const skip = (page - 1) * limit;

			// Count total drivers with role_id = 2
			const totalDrivers = await signupDB.countDocuments({ role_id: 1 });

			// Build the base query for users with role_id = 1
			const query = signupDB.find({ role_id: 1 });

			// if (searchQuery) {
			// 	query.or([
			// 		{ username: { $regex: new RegExp(searchQuery, 'i') } },
			// 		{ email: { $regex: new RegExp(searchQuery, 'i') } },
			// 	]);
			// }

			const users = await query
				.skip(skip)
				.limit(limit)
				.sort({ created_date: -1 })
				.exec();

			// Fetch background checks, user profiles, and trips in parallel
			const [backgroundChecks, userProfiles] = await Promise.all([
				Promise.all(users.map(user => backgroudCheckDB.findOne({ driver_id: user._id }))),
				Promise.all(users.map(user => profileDB.findOne({ profile_id: user._id }))),
				// Promise.all(users.map(user => userTripsModel.find({ user_id: user._id}))),
			]);

			const tripsDetailsPromises = userProfiles.map(({ profile_id }) => {
				return tripDB.find({ user_id: profile_id })
					.then(trips => trips);
			});

			const tripsProfiles = await Promise.all(tripsDetailsPromises);

			// Combine user data with background checks, user profiles, and trips
			let updatedUserProfiles = users.map((user, index) => {
				const backgroundCheck = backgroundChecks[index];
				const profile = userProfiles[index];
				const trips = tripsProfiles[index];



				return {
					...profile.toObject(),
					user,
					backgroundCheck,
					totalTrips: trips.length,
					totalTripAmount: trips.reduce((total, trip) => total + trip.amount, 0),
				};
			});

			// console.log(updatedUserProfiles);
			if (searchQuery) {
				const searchQueryLowerCase = searchQuery.toLowerCase();

				const fullNameMatches = updatedUserProfiles.filter(user => {
					// const fullName = user?.fullName
					// const fullName = user?.backgroundCheck?.legal_first_name + ' ' + user?.backgroundCheck?.legal_middle_name + ' ' + user?.backgroundCheck?.legal_last_name; // Assuming fullName is a property in your profile model
					// console.log(user?.fullname);
					return user?.fullname && user?.fullname.toLowerCase().includes(searchQueryLowerCase);
				});

				// console.log(fullNameMatches);

				const mobileNumberMatches = updatedUserProfiles.filter(user => {
					const mobileNumber = user?.mobile_no;
					return mobileNumber && mobileNumber.toLowerCase().includes(searchQueryLowerCase);
				});

				// console.log(mobileNumberMatches);

				// console.log([...fullNameMatches, ...mobileNumberMatches]);

				updatedUserProfiles = [...fullNameMatches, ...mobileNumberMatches];
			}

			console.log(updatedUserProfiles)
			// Return the result with pagination metadata
			return successWithData(res, 'Success', {
				data: updatedUserProfiles,
				metadata: {
					page,
					pageSize: limit,
					total: totalDrivers,
					totalPages: Math.ceil(totalDrivers / limit),
				},
			});
			// return updatedUserProfiles;
		} catch (error) {
			throw new Error(`Error counting users: ${error.message}`);
		}
	},

	addDriver: async function (req, res) {
		try {
			const { type, profile_picture, university_name, student_id, university_address, mobile, email, password, gender, destination_contact_number, gender_preferences, rider_preference, phone_code, phone_no, legal_first_name, legal_middle_name, legal_last_name, license_number, license_state, zip_code, dob, ssn, make, model, year, upload_vehicle_registration, upload_driver_licence, upload_inssurance_card, car_model, vehicle_license_plate_number } =
				req.body;
			let user = await signupDB.findOne({ email });
			if (user) {
				throw new Error("driver already exists", HttpStatusCode.BAD_REQUEST);
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
				role_id: 1,
				status: 1
			})

			const addProfileDetails = new profileDB({
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
				make: make,
				model: car_model,
				year: year,
				upload_vehicle_registration: upload_vehicle_registration,
				upload_driver_licence: upload_driver_licence,
				upload_inssurance_card: upload_inssurance_card,
				vehicle_license_plate_number: vehicle_license_plate_number
			})

			const addBackgroundChecks = new backgroudCheckDB({
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
				return successWithData(res, 'Success', {
					msg: "Successfully added",
					statusCode: HttpStatusCode.OK
				});
			} else {
				throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			console.error(error)
		}
	},

	updateDriver: async function (req, res) {
		try {
			const { email, name, middleName, lastName, mobile, password, profile_picture, roles } =
				req.body;
			let user = await signupDB.findOne({ email });
			if (!user) {
				throw new Error("driver doesn't exists", HttpStatusCode.BAD_REQUEST);
			}

			const profile = await profileDB.findOne({ profile_id: user._id })

			const hashed = password ? await bcrypt.hash(password, 10) : user.password;

			const profilePicture = profile_picture ? profile_picture : profile.profile_photo;

			const updateSignUpDetails = await signupDB.updateOne(
				{ email: user.email },
				{
					email: email,
					password: hashed,
					role_id: Number(roles),
				},
			);

			const updateProfileDetails = await profileDB.updateOne(
				{ profile_id: user._id },
				{
					fullname: name + " " + (middleName ? middleName + " " : "" + lastName ? lastName : ""),
					mobile_no: mobile,
					profile_photo: profilePicture,
					type: roles,
				},
			);

			const updateBackgroundDetails = await backgroudCheckDB.updateOne(
				{ driver_id: user._id },
				{
					legal_first_name: name,
					legal_middle_name: middleName,
					legal_last_name: lastName,
				},
			);
			if (updateSignUpDetails && updateProfileDetails && updateBackgroundDetails) {
				return successWithData(res, 'Success', {
					msg: "Successfully updated",
					statusCode: HttpStatusCode.OK
				});
			} else {
				throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			console.error(error);
		}
	},

	deleteDriver: async function (req, res) {
		try {
			const { email } = req.body;
			let user = await signupDB.findOne({ email });
			if (!user) {
				throw new Error('Driver doesnt exists', HttpStatusCode.BAD_REQUEST);
			}
			const updateSignUpDetails = await signupDB.updateOne(
				{ email: user.email },
				{
					status: 0,
				},
			);
			if (updateSignUpDetails) {
				return successWithData(res, 'Succcess', {
					msg: "Successfully Deactivated",
					statusCode: HttpStatusCode.OK,
				});
			} else {
				throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			console.error(error);
		}
	},

	activateDriver: async function (req, res) {
		try {
			const { email } = req.body;
			let user = await signupDB.findOne({ email });
			if (!user) {
				throw new Error('Driver doesnt exists', HttpStatusCode.BAD_REQUEST);
			}

			const updateSignUpDetails = await signupDB.updateOne(
				{ email: user.email },
				{
					status: 1,
				},
			);
			if (updateSignUpDetails) {
				return successWithData(res, 'Successs', {
					msg: "Successfully Activated",
					statusCode: HttpStatusCode.OK
				})
					;
			} else {
				throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			console.error(error);
		}
	},

	completeBackgroundCheck: async function (req, res) {
		try {
			const { id } = req.body;
			let user = await backgroudCheckDB.findOne({ driver_id: id });
			if (!user) {
				throw new Error('Driver doesnt exists', HttpStatusCode.BAD_REQUEST);
			}

			const updateSignUpDetails = await backgroudCheckDB.updateOne(
				{ driver_id: user.driver_id },
				{
					status: 1,
				},
			);
			if (updateSignUpDetails) {
				return successWithData(res, 'Success', {
					msg: "Successfully Completed",
					statusCode: HttpStatusCode.OK
				});
			} else {
				throw new Error('Something went wrong', HttpStatusCode.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			throw new Error(error.response, HttpStatusCode.BAD_REQUEST);
		}
	}
}