import mongoose from 'mongoose';

const messMenuSchema = new mongoose.Schema({
date: {
type: Date,
required: true
},

mealType: {
type: String,
required: true,
enum: ['breakfast', 'lunch', 'dinner']
},

vegItems: {
type: [String],
default: []
},

nonVegItems: {
type: [String],
default: []
},

createdBy: {
type: mongoose.Schema.Types.ObjectId,
ref: 'User',
required: true
},

},{
    timestamps: true,
});

export const MessMenu = mongoose.model('MessMenu', messMenuSchema);
