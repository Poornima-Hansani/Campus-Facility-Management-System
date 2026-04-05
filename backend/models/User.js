const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ['student', 'lecturer', 'admin'],
      default: 'student'
    },

    // WE / WD (students only)
    wewd: {
      type: String,
      enum: ['WE', 'WD'],
      required: function () {
        return this.role === 'student';
      }
    },

    // Student-only fields
    faculty: {
      type: String,
      required: function () {
        return this.role === 'student';
      }
    },

    year: {
      type: Number,
      required: function () {
        return this.role === 'student';
      }
    },

    semester: {
      type: Number,
      required: function () {
        return this.role === 'student';
      }
    },

    group: {
      type: String,
      required: function () {
        return this.role === 'student';
      }
    },

    contactNumber: {
      type: String,
      trim: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

//
// HASH PASSWORD BEFORE SAVE (Mongoose v7+ correct way)
//
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

//
// PASSWORD COMPARE METHOD (for login)
//
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);