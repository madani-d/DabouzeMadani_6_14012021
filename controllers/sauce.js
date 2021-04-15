const Sauce = require('../models/Sauce');

exports.createSauce = (req, res, next) => {
    // delete req.body._id;
    console.log(req.body.sauce);
    test = JSON.parse(req.body.sauce)
    const sauce = new Sauce({
        ...test,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });
    console.log(sauce);
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce enregistré.' }))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    console.log(req.params.id);
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            console.log(sauce);
            res.status(200).json(sauce);
        })
        .catch(error => {
            console.log(error);
        })
};

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
    
};

exports.modifySauce = (req, res, next) => {

};

exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(sauce => res.status(201).json({ message: 'Sauce supprimé !' }))
        .catch(error => res.status(400).json({ error }))
};