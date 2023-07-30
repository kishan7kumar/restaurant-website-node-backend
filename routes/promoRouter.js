const express = require('express');
const bodyParser = require('body-parser');

const promoRouter = express.Router();
promoRouter.use(bodyParser.json());
var authenticate = require('../authenticate');
const mongoose = require('mongoose');
const Promotions = require('../models/promotions');
const cors = require('./cors');
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get(cors.cors, (req, res, next) => {
		Promotions.find({})
			.then((promotions) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotions);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
		Promotions.create(req.body)
			.then((promotion) => {
				console.log('Promotion Created ', promotion);
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotion);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
		res.statusCode = 403;
		res.end('PUT operation not supported on /promotion');
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
		Promotions.remove({})
			.then((resp) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(resp);
			}, (err) => next(err))
			.catch((err) => next(err));
	});


promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .all((req, res, next) => {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'text/plain');
		next();
	})
	.get(cors.cors, (req, res, next) => {
		Promotions.findById(req.params.promoId)
			.then((promotion) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotion);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
		res.statusCode = 403;
		res.end('POST operation not supported on /promoID/' + req.params.promotionId);
	})
	.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) => {
		Promotion.findByIdAndUpdate(req.params.promoId, {
			$set: req.body
		}, { new: true })
			.then((promotion) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(promotion);
			}, (err) => next(err))
			.catch((err) => next(err));
	})
	.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
		Promotions.findByIdAndRemove(req.params.promoId)
			.then((resp) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(resp);
			}, (err) => next(err))
			.catch((err) => next(err));
	});

module.exports = promoRouter;

