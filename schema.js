module.exports = (mongoose) => {

  const userSchema = new mongoose.Schema({
    username: String,
    exercises: [{
      description: String,
      duration: Number,
      date: String,
    }]
  });

  return {
    User: mongoose.model('User', userSchema)
  }
};
