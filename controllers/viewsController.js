const Tour = require('../models/tourModel')
const catchAsync = require('./../utils/catchAsync')

exports.getOverview = catchAsync(async (req, res) => {

    // 1) get data from collection
    const tours = await Tour.find();
    
    // 2) build templated data

    // 3) Render templated using data from collection
    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The Forest Hiker Tour'
    })
}