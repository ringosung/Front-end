const multer = require('multer');
const sharp = require('sharp');
const Dog = require('../models/dogModel');
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')
const AppError = require('../utils/appError')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadDogImages = upload.fields([
    {name: 'imageCover', maxCount:1},
    {name: 'images', maxCount:3}
]);

// upload.single('image')
// upload.array('images', 5)

exports.resizeDogImages = catchAsync(async (req, res, next) => {
    if (!req.files.imageCover || !req.files.images) return next();
  
    // 1) Cover image
    req.body.imageCover = `dog-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/dogs/${req.body.imageCover}`);
  
    // 2) Images
    req.body.images = [];
  
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `dog-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
  
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/dogs/${filename}`);
  
        req.body.images.push(filename);
      })
    );
  
    next();
  });
  

exports.aliasTopDogs = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,age';
    req.query.fields = 'name,age,ratingsAverage,summary,difficulty';
    next();
}


exports.getAllDogs = factory.getAll(Dog);
exports.getDog = factory.getOne(Dog, {path: 'reviews'});
exports.createDog = factory.createOne(Dog);
exports.updateDog = factory.updateOne(Dog);
exports.deleteDog = factory.deleteOne(Dog);

exports.getDogStats = catchAsync(async (req, res, next) => {
    
    const stats = await Dog.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5}}
            },
            {
                $group: {
                    _id: { $toUpper: '$difficulty'}, 
                    numDogs: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage'},
                    avgPrice: { $avg: '$age'},
                    minPrice: { $min: '$age'},
                    maxPrice: { $max: '$age'}
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match: { _id: {$ne: 'EASY'}}
            // }
            
        ]);

        res.status(200).json({
            status: 'success', 
            data: {
                stats
            }
        });

    
});

exports.getMontylyPlan = catchAsync(async (req, res, next) => {
    
        const year = req.params.year * 1;

        const plan = await Dog.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: { 
                    startDates: { 
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: { 
                    _id: { $month: '$startDates'},
                    numDogStarts: { $sum: 1},
                    dogs: { $push: '$name'}
                }
            },
            {
                $addFields: { month: '$_id' }
            },
            {
                $project: { 
                    _id: 0
                }
            },
            {
                $sort: {numDogStarts: -1}
            },
            {
                $limit: 12
            }
            
        ]);

        res.status(200).json({
            status: 'success', 
            data: {
                plan
            }
        });
})

exports.getDogsWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if(!lat || !lng) {
        next(AppError('Please provide a lat and lng', 400))
    }
    
    const dogs = await Dog.find({startLocation: {$geoWithin: { $centerSphere: [[lng, lat], radius]}}
    });

    res.status(200).json({
        status: 'success',
        results: dogs.length,
        data:{
            data:dogs
        }
    })
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371: 0.001;
    
    if(!lat || !lng) {
        next(AppError('Please provide a lat and lng', 400))
    }
    
    const distances = await Dog.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [lng * 1, lat * 1]
            },
            distanceField: 'distance',
            distanceMultiplier: multiplier
          }
        },
        {
          $project: {
            distance: 1,
            name: 1
          }
        }
      ]);
    
      res.status(200).json({
        status: 'success',
        data: {
          data: distances
        }
      });
    });
    