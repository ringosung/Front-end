const mongoose = require('mongoose');
const Dog = require('./dogModel')

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        requited: [true, 'Review can not be empty']
    },
    rating: {
        type: Number, 
        min: 1,
        max: 5
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
    dog: {
        type: mongoose.Schema.ObjectId,
        ref: 'Dog',
        required: [true, 'Review must have dog']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have user']
    }
},
{
    toJSON: { virtuals: true},
    toObject: { virtuals: true}
});

reviewSchema.index({ dog: 1, user: 1 }, {unique: true});

reviewSchema.pre(/^find/, function(next) {
//     this.populate({
//   path: 'dog',
//   select: 'name'
//   }).populate({
//     path: 'user',
//     select: 'name photo'
//   });

    this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function(dogId) {
    const stats = await this.aggregate([
        {
            $match: {dog: dogId}
        },
        {
            $group: {
                //group all the data by dog
                _id: '$dog',
                nRating: { $sum: 1},
                avgRating: {$avg: '$rating'}
            }
        }
    ]);
  

    // update dog after calculating rating
    if (stats.length > 0) {
        await Dog.findByIdAndUpdate(dogId, {
          ratingsQuantity: stats[0].nRating,
          ratingsAverage: stats[0].avgRating
        });
      } else {
        await Dog.findByIdAndUpdate(dogId, {
          ratingsQuantity: 0,
          ratingsAverage: 4.5
        });
      }
    };

// call middleware for calcAverageRatings
reviewSchema.post('save', function() {
    // this points to current review
    this.constructor.calcAverageRatings(this.dog);
})

reviewSchema.post(/^findOneAnd/, async function (docs) {
    await docs.constructor.calcAverageRatings(docs.dog);
  });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;