// This code creates a mongoose schema for the platformStats collection
// The schema defines the fields that a document in this collection can have
// The schema also defines the types and default values of each field
// The default values are used if a document is created without specifying a value for a field
// The schema is then used to create a mongoose model for the platformStats collection
// The model is then exported so that it can be used in other files

const mongoose = require('../config/mongoose')

const platformStatsSchema = mongoose.Schema(
    {
        totalMeals: { type: Number, default: 0 },   // Total number of meals in the DB
        totalUsers: { type: Number, default: 0 },   // Total number of authenticated users
        totalGenerations: { type: Number, default: 0 }, // Total number of rolls
        totalMealsPresented: { type: Number, default: 0 } // Number of meals with each roll
    }
)

const PlatformStats = mongoose.model('PlatformStats', platformStatsSchema)
module.exports = PlatformStats