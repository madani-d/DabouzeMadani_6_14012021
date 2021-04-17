const { updateOne } = require('../models/Sauce');
const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObjet = JSON.parse(req.body.sauce);
    delete sauceObjet._id;
    const sauce = new Sauce({
        ...sauceObjet,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
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
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body }

    if (req.file) {
        Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('images/')[1];
            fs.unlink(`images/${filename}`, (error => {if (error) console.log(error)}))
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
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(sauce => res.status(201).json({ message: 'Sauce supprimé !' }))
                    .catch(error => res.status(400).json({ error }))
            })
        })
        .catch(error => res.status(500).json({ error }));
};

let nbTest = 0;

exports.manageLikes = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            nbTest++;
            if (like === 1) {
                if (sauce.usersLiked.indexOf(userId) === -1) {
                    sauce.usersLiked.push(userId);
                    sauce.likes = sauce.usersLiked.length;
                }
            }
            if (like === -1) {
                if (sauce.usersDisliked.indexOf(userId) === -1) {
                    sauce.usersDisliked.push(userId);
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            }
            if (like === 0) {
                if (sauce.usersLiked.indexOf(userId) !== -1) {
                    const deleteUserId = sauce.usersLiked.indexOf(userId);
                    sauce.usersLiked.splice(deleteUserId, 1);
                    sauce.likes = sauce.usersLiked.length;
                }
                if (sauce.usersDisliked.indexOf(userId) !== -1) {
                    const deleteUserId = sauce.usersDisliked.indexOf(userId);
                    sauce.usersDisliked.splice(deleteUserId, 1);
                    sauce.dislikes = sauce.usersDisliked.length;
                }
            }
            Sauce.updateOne({ _id: req.params.id }, {
                usersDisliked: sauce.usersDisliked,
                usersLiked: sauce.usersLiked,
                likes: sauce.likes,
                dislikes: sauce.dislikes,
                _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Like, Dislike ajouté.' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => console.log(error));
};