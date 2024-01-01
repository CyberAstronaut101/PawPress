/*

Monoose Model for Meals

Initially, we are not going to have actual recipes that include ingredients,
instructions, etc.

We are just going to track the recipe name, genre, and stub out maybe a way that people can post links
to recipe links online

*/
const mongoose = require('../config/mongoose');

const { toJSON, paginate } = require('./plugins');

const mealSchema = mongoose.Schema(
    {
        mealName: { type: String, required: true, unique: true },
        verified: { type: Boolean, default: false },
        public: { type: Boolean, default: false },
        taxonomy: {
            cuisine: {
                type: String,
                enum: ['American', 'Asian', 'British', 'Caribbean', 'Central American', 'Chinese', 'Eastern European', 'French', 'German', 'Greek', 'Indian', 'Italian', 'Japanese', 'Korean', 'Latin American', 'Mediterranean', 'Mexican', 'Middle Eastern', 'Nordic', 'South American', 'South East Asian', 'Spanish', 'Thai', 'Vietnamese'],
            },
            course: {
                type: String,
                enum: ['Appetizer', 'Breakfast', 'Brunch', 'Dessert', 'Dinner', 'Lunch', 'Salad', 'Side Dish', 'Snack', 'Soup'],
            },
            type: {
                type: String,
                enum: ['Beverage', 'Bread', 'Casserole', 'Cocktail', 'Condiment', 'Dip', 'Dressing', 'Drink', 'Finger Food', 'Fruit', 'Grain', 'Main Course', 'Marinade', 'Meat', 'Milk', 'Miscellaneous', 'Nuts', 'Pasta', 'Pasta Sauce', 'Pickle', 'Pizza', 'Pork', 'Prep and Cook', 'Preserve', 'Pudding', 'Relish', 'Rice', 'Salad', 'Sandwich', 'Sauce', 'Seafood', 'Seasoning', 'Side Dish', 'Snack', 'Soup', 'Stew', 'Stir Fry', 'Syrup', 'Vegan', 'Vegetable', 'Vegetarian', 'Wine'],
            },
            diet: {
                type: String,
                enum: ['Gluten Free', 'Ketogenic', 'Vegetarian', 'Lacto-Vegetarian', 'Ovo-Vegetarian', 'Vegan', 'Pescetarian', 'Paleo', 'Primal', 'Whole30'],
            },
            cookingMethod: {
                type: String,
                enum: ['Bake', 'Boil', 'Broil', 'Fry', 'Grill', 'Microwave', 'Roast', 'Saute', 'Steam', 'Stir Fry'],
            }
        }
    }
)

mealSchema.plugin(toJSON)
mealSchema.plugin(paginate)

const Meal = mongoose.model('Meal', mealSchema)
module.exports = Meal