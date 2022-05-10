const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Favorites = require('../models/favorites');

const authenticate = require('../authenticate');

const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
  
    Favorites.find({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then(favorite=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(favorite);
    }, err=> next(err))
    .catch(err=> next(err));
})


.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=> {

        Favorites.find({user:req.user._id})
        .then(favorite => {
            if(favorite.length === 0 ){
                Favorite.create({
                    user : req.user._id,
                    dishes:[...req.body]
                })
                .then(fav=>{
                    res.statusCode = 201;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                    return;
                },err=>next(err))
                .catch(err=>next(err));
            }

            var uniqueElements = req.body.filter(item => !favorite[0].dishes.includes(item._id));
                console.log(favorite[0].dishes)
                console.log(req.body)
                    console.log('pushed')
                    console.log(uniqueElements)
                    const mapping = uniqueElements.map(ele => ele._id);
                    if(uniqueElements.length !== 0){
                        favorite[0].dishes.push(...mapping);
                        favorite[0].save()
                        .then(fav => {
                            res.statusCode = 201;
                            res.setHeader('Content-Type','application/json');
                            res.send(fav);
                        }, err=>next(err))
                        .catch(err=>next(err));
                    }else{
                        res.statusCode = 409;
                        res.setHeader('Content-Type','application/json');
                        res.send('Already exist');
                    }


        }, err=>next(err))
        .catch(err=>next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=> {
    res.statusCode = 403;
    res.end('PUT operation not supported on leaders');
})


.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    Favorites.findOneAndRemove({user:req.user._id})
    .then(resp=>{
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    }, err=> next(err))
    .catch(err=> next(err));
})


favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, (req,res,next) => {
    res.statusCode = 403;
    res.end('GET operation not supported on favorites/' + req.params.dishId);
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=> {
    Favorites.find({user:req.user._id})
    .then(favorite => {
        if(favorite[0] === undefined){
            console.log('created')
            console.log(favorite)
            Favorites.create({
                user : req.user._id,
                dishes:[req.params.dishId]
            })
            .then(fav=>{
                res.statusCode = 201;
                res.setHeader('Content-Type','application/json');
                res.json(fav);
            },err=>next(err))
            .catch(err=>next(err));
        }
        else{
            console.log('pushed')
            if(favorite[0].dishes.indexOf(req.params.dishId) == -1){
                favorite[0].dishes.push(req.params.dishId);
                favorite[0].save()
                .then(fav => {
                    res.statusCode = 201;
                    res.setHeader('Content-Type','application/json');
                    res.json(fav);
                }, err=>next(err))
                .catch(err=>next(err));
            } else{
                res.statusCode = 409;
                res.setHeader('Content-Type','application/json');
                res.send('Already exist')
            }
            
        }
    },err=>next(err))
    .catch(err=>next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=> {
    res.statusCode = 403;
    res.end('POST operation not supported on favorites/' + req.params.dishId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next) => {
    Favorites.findOneAndUpdate({user: req.user._id},{$pull:{dishes: req.params.dishId}})
    .then(resp=>{
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, err=> next(err))
    .catch(err=>{
        next(err);
    })
});


module.exports = favoriteRouter; 