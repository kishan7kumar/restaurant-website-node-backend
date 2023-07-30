
const express = require('express');
const bodyParser = require('body-parser');

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());
const cors = require('./cors');
const mongoose = require('mongoose');
const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id.toString() })
            .populate('user')
            .populate('dishes')
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // FIND IF THE USER FAVORITE LIST EXISTS
        Favorites.findOne({ user: req.user._id.toString() })
            .then((favorite) => {
                // USER FAVORITE LIST ALREADY EXISTS
                if (favorite != null) {
                    for (var i = 0; i < req.body.length; i++) {
                        if (favorite.dishes.indexOf(req.body[i]._id) !== -1) {
                        } else {
                            favorite.dishes.push(req.body[i]._id);
                        }
                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
                // USER FAVORITE LIST DOES NOT EXISTS
                else {
                    var newbody = {};
                    newbody.dishes = req.body;
                    newbody.user = req.user._id;
                    Favorites.create(newbody)
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id.toString() })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        // FIND IF THE USER FAVORITE LIST EXISTS
        Favorites.findOne({ user: req.user._id.toString() })
            .then((favorite) => {
                // USER FAVORITE LIST ALREADY EXISTS
                if (favorite != null) {
                    if (favorite.dishes.indexOf(req.params.dishId) !== -1) {
                        err = new Error('Dish ' + req.params.dishId + ' already added as favorite');
                        err.status = 404;
                        return next(err);
                    }
                    else {
                        favorite.dishes.push(req.params.dishId);
                        favorite.save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    }
                }
                // USER FAVORITE LIST DOES NOT EXISTS
                else {
                    var newbody = {};
                    newbody.dishes = req.params.dishId;
                    newbody.user = req.user._id;
                    Favorites.create(newbody)
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id.toString() })
            .then((resp) => {
                if (resp.dishes.indexOf(req.params.dishId) !== -1) {
                    var updatedList = resp.dishes.filter((item) => item.toString() !== req.params.dishId);
                    resp.dishes = updatedList;
                    resp.save();
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                }
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found in your favorite list');
                    err.status = 403;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;

