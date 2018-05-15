const express = require('express');
const bodyParser = require('body-parser');

const Favorites = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    const { user } = req;
    Favorites.findOne({ user : user._id })
        .populate(['user', 'dishes'])
        .then(favorites => {
            res.status(200).json(favorites);
        }, (err) => next(err))
        .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { user, body } = req;
    Favorites.findOne({ user : user._id })
    .then(favorites => {
        if(!favorites){
            newFavorite = new Favorites({ user : user._id });
            newFavorite.dishes = body.map(dish => dish._id);
            newFavorite.save()
            .then((favorite) => {
                res.status(200).json(favorite);             
            }, (err) => next(err));
        } else {
            body.forEach(dish => {
                if(favorites.dishes.indexOf(dish._id) === -1) {
                    favorites.dishes.push(dish._id);
                }
            })
            favorites.save()
                .then((resp) => {
                    res.status(200).json(resp);             
                }, (err) => next(err));
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { user } = req;
    Favorites.findOneAndRemove({ user : user._id })
    .then((resp) => {
        res.status(200).json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

// route for favorites/:dishId
favoritesRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { user } = req;
    const { dishId } = req.params;
    Favorites.findOne({ user : user._id })
    .then(favorites => {
        if(!favorites){
            newFavorite = new Favorites({ user : user._id });
            newFavorite.dishes.push(dishId);
            newFavorite.save()
            .then((resp) => {
                res.status(200).json(resp);             
            }, (err) => next(err));
        } else {
            if(favorites.dishes.indexOf(dishId) === -1) {
                favorites.dishes.push(dish._id);
                favorites.save()
                .then((resp) => {
                    res.status(200).json(resp);             
                }, (err) => next(err));
            } else {
                res.status(200).json(favorites);
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err)); 
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    const { user } = req;
    const { dishId } = req.params;
    Favorites.findOneAndUpdate(
        { user : user._id },
        { $pull: { dishes: dishId } },
        { new: true })
    .then(favorites => {
        res.status(200).json(favorites);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = favoritesRouter;