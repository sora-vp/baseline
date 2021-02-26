const mongoose = require("mongoose");

const PaslonScheme = mongoose.Schema({
  ketua: {
    required: true,
    match: /^[a-zA-Z\s\-]+$/,
    type: String,
  },
  wakil: {
    required: true,
    match: /^[a-zA-Z\s\-]+$/,
    type: String,
  },
  img: {
    data: Buffer,
    contentType: String,
  },
  memilih: {
    type: Number,
    required: false,
    default: 0,
  },
  color: {
    type: String,
    required: false,
    default: () => getRandomColor(),
  },
  date: {
    required: false,
    type: Date,
    default: Date.now,
  },
});

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = mongoose.model("paslon", PaslonScheme);
