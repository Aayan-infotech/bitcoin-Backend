const Alphabet = require("../models/alphabetDetailsModel");

// Create a new alphabet entry
exports.createAlphabet = async (req, res) => {
  try {
    const { alphabet, title, description, examples, relatedTerms } = req.body;
    const image = req?.fileLocations?.[0] || ""; // Handle optional image upload

    if (!alphabet || !title || !description) {
      return res.status(400).json({
        success: false,
        message: "Alphabet, title, and description are required fields.",
      });
    }

    const newAlphabet = new Alphabet({ alphabet, title, description, image, examples, relatedTerms });
    await newAlphabet.save();

    res.status(201).json({
      success: true,
      message: "Alphabet Description Created Successfully",
      alphabet: newAlphabet,
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all alphabet entries
exports.getAllAlphabets = async (req, res) => {
  try {
    const alphabets = await Alphabet.find();
    res.json({
      success: true,
      message: "Alphabet Descriptions fetched Successfully",
      data: alphabets,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a single alphabet entry by ID
exports.getAlphabetById = async (req, res) => {
  try {
    const alphabet = await Alphabet.findById(req.params.id);
    if (!alphabet)
      return res.status(404).json({ success: false, message: "Alphabet not found" });

    res.json({
      success: true,
      message: "Alphabet Description Fetched Successfully",
      data: alphabet,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update an alphabet entry by ID
exports.updateAlphabet = async (req, res) => {
  try {
    const { alphabet, title, description, relatedTerms, examples } = req.body;
    const image = req?.fileLocations?.[0];

    const updateData = { alphabet, title, description, relatedTerms, examples };
    if (image) updateData.image = image;

    const updatedAlphabet = await Alphabet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAlphabet)
      return res.status(404).json({ success: false, message: "Alphabet not found" });

    res.json({
      success: true,
      message: "Alphabet updated successfully",
      data: updatedAlphabet,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete an alphabet entry by ID
exports.deleteAlphabet = async (req, res) => {
  try {
    const deletedAlphabet = await Alphabet.findByIdAndDelete(req.params.id);
    if (!deletedAlphabet)
      return res.status(404).json({ success: false, message: "Alphabet not found" });

    res.json({ success: true, message: "Alphabet deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
