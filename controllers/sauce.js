const { updateOne } = require('../models/Sauce');
const Sauce = require('../models/Sauce');
const fs = require('fs');
const { error } = require('console');

exports.createSauce = (req, res, next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    const sauce = new Sauce({
        ...sauceObjet,// Add all sauce data
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,// Create url for picture
        likes: 0,
        dislikes: 0
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré.' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
    
};

exports.modifySauce = (req, res, next) => {
    const sauceObjet = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`// If picture in request add it and body in sauceObjet
    } : { ...req.body }// Or add just body

    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('images/')[1];
            fs.unlink(`images/${filename}`, (error => {if (error) console.log(error)}))// If picture in request delete the old picture
        })
        .catch(error => res.status(500).json({ error }));
    }
    
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObjet, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée.' }))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('images/')[1];
            fs.unlink(`images/${filename}`, () => {// Delete picture
                Sauce.deleteOne({ _id: req.params.id })
                    .then(sauce => res.status(201).json({ message: 'Sauce supprimé !' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }));
};

exports.manageLikes = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            switch (like) {
                case 1:// If like = 1 add userId in usersLiked and add +1 to likes
                    if (sauce.usersLiked.indexOf(userId) === -1) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $push: { usersLiked: userId }, $inc: { likes: +1 } }
                        )
                            .then(() => res.status(200).json({ message: 'Like ajouté.' }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    break;

                case -1:// If like = -1 add userId in usersDisliked and add +1 to dislikes
                    if (sauce.usersDisliked.indexOf(userId) === -1) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $push: { usersDisliked: userId }, $inc: { dislikes: +1 } }
                        )
                            .then(() => res.status(200).json({ message: 'Dislike ajouté.' }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    break;

                case 0:// If like = 0 search userId in usersLiked, usersDislikes and delete userId 
                    if (sauce.usersLiked.indexOf(userId) !== -1) {
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
                        )
                            .then(() => res.status(200).json({ message: 'Like supprimé.' }))
                            .catch(error => res.status(400).json({ error }));
                    }

                    if (sauce.usersDisliked.indexOf(userId) !== -1) {// Use 'if and if' case error userId present in both usersLiked and usersDisliked
                        Sauce.updateOne(
                            { _id: req.params.id },
                            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
                        )
                            .then(() => res.status(200).json({ message: 'Dislike supprimé.' }))
                            .catch(error => res.status(400).json({ error }));
                    }
                    break;
                default:
                    error;
                    break;
            }
        })
        .catch(error => console.log(error));
};