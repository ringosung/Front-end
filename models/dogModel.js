const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator')

const dogSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A dog must have a name'],
        unique: true,
        trim: true,
        maxlength: [40, 'A dog name must be less or equal than 40 characters'],
        minlength: [3, 'A dog name must be greater than 3 characters'],
       // validate: [validator.isAlpha, 'Dog name must only contain characters']
    },
    slug: String,
    breeds: {
      type: String,
      required: [true, 'A dog must have a breeds']
  },
    maxGroupSize: {
        type: Number,
        default: 10
    },
    difficulty: {
        type: String,
        required: [true, 'A dog must have a size'],
        enum: {
            values: ['small', 'medium', 'large'],
            message: 'Dog Size is either: small, medium, large'
        }
    },

    // for future development use
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    age: {
        type: Number,
        required: [true, 'A dog must have a age']
    },
    price: {
      type: Number,
      default: 100,
      required: [true, 'handling fee']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
            return val < this.price;
        },
        message: 'Discount price ({VALUE}) must be below regular price'
        }
    },
    summary:{
        type: String,
        trim: true,
        required: [true, 'A dog must have a description']
    },
    descriptionDog:{
        type: String,
        default: 'testing',
        trim: true
    },
    imageCover:{
        type: String,
        default: 'defaultdog.jpg'
        // required: [true, 'A dog must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    // startDates: [Date],
    secretDog: {
        type: Boolean,
        default: false
    },
      locations: [
        {
          type: {
            type: String,
            default: 'Point',
            enum: ['Point']
          },
          coordinates: [Number],
          address: {
            type: String,
            default: 'Kowloon City'
          },
          description: {
            type: String,
            default: 'Shelter 1'
          },
          day: {
            type: Number,
            default: 1
          }
        }
      ],
guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: '5c8a1ec62f8fb814b56fa183'
    }
  ]

}, 
    
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

dogSchema.index({price: 1, ratingsAverage: -1});
dogSchema.index({slug: 1});
dogSchema.index({startLocation: '2dsphere'});

dogSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
  });

  //virtual populate
  dogSchema.virtual('reviews', {
      ref: 'Review',
      foreignField: 'dog',
      localField: '_id'
  })
  
  // DOCUMENT MIDDLEWARE: runs before .save() and .create()
  dogSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
  });
  

dogSchema.pre(/^find/, function(next) {
    this.find({ secretDog: { $ne: true } });
  
    this.start = Date.now();
    next();
  });
    
    dogSchema.pre(/^find/, function(next) {
      this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
    });
    next();
  })
  

  dogSchema.post(/^find/, function(docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds!`);
    next();
  });




const Dog = mongoose.model('Dog', dogSchema);

module.exports = Dog;